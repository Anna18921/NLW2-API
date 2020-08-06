import express, { request, response } from "express";
import routes from "./routes";
import cors from "cors";
import ClassesController from "./controllers/ClassesController";
import ConnectionsController from "./controllers/ConnectionsController";
const app = express();

app.use(cors());

app.use(express.json());

const classesControllers = new ClassesController();
const connectionController = new ConnectionsController();
app.get("/classes", classesControllers.index);

app.post("/classes", classesControllers.create);

app.get("/connections", connectionController.index);

app.post("/connections", connectionController.create);

app.use(routes);

app.listen(3333, () => console.log("Api Started"));
