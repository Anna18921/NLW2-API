export default function convertHouToMinutes(time: string) {
  //08:00
  const [hour, minutes] = time.split(":").map(Number);

  const timerInMinutes = hour * 60 + minutes;

  return timerInMinutes;
}
