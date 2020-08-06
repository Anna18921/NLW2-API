import { Response, Request } from "express";
import convertHouToMinutes from "../utils/convertHourToMinutes";
import db from "../database/connection";

interface scheduleItem {
  week_day: number;
  from: string;
  to: string;
}

export default class ClassesController {
  async index(request: Request, response: Response) {
    const { time, week_day, subject } = request.query;

    if (!week_day || !subject || !time) {
      return response.status(400).json({
        error: "Missing filters to search classes",
      });
    }

    const timeInMinutes = convertHouToMinutes(time as string);

    const classes = await db("classes")
      .whereExists(function () {
        this.select("class_schedule.*")
          .from("class_schedule")
          .whereRaw("`class_schedule`.`class_id` = `classes`.`id`")
          .whereRaw("`class_schedule`.`week_day` = ??", [Number(week_day)])
          .whereRaw("`class_schedule`.`from` <= ??", [timeInMinutes])
          .whereRaw("`class_schedule`.`to` > ??", [timeInMinutes]);
      })
      .where("classes.subject", "=", subject as string)
      .join("users", "classes.user_id", "=", "user_id")
      .select(["classes.*", "users.*"]);

    return response.json(classes);
  }

  async create(request: Request, response: Response) {
    const {
      name,
      avatar,
      bio,
      subject,
      whatsapp,
      cost,
      schedule,
    } = request.body;

    const transaction = await db.transaction();

    const insertedUserId = await transaction("users").insert({
      name,
      avatar,
      bio,
      whatsapp,
    });
    const user_id = insertedUserId[0];

    try {
      const inserterdClassesId = await transaction("classes").insert({
        user_id,
        subject,
        cost,
      });

      const class_id = inserterdClassesId[0];

      const classSchedule = schedule.map((scheduleItem: scheduleItem) => {
        return {
          class_id,
          week_day: scheduleItem.week_day,
          from: convertHouToMinutes(scheduleItem.from),
          to: convertHouToMinutes(scheduleItem.to),
        };
      });

      await transaction("class_schedule").insert(classSchedule);

      await transaction.commit();

      return response.status(201).json({
        ok: true,
        message: "Success create Users ",
      });
    } catch (error) {
      await transaction.rollback();

      return response.status(400).json({
        ok: false,
        error: "Unexpected error while creating new class",
      });
    }
  }
}
