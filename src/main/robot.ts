import robot from 'robotjs';

function click(x: number, y: number) {
  robot.moveMouse(x, y);
}

function typeString(text: string) {
  robot.typeString(text);
}

export { click, typeString };
