import robot from 'robotjs';

function click(data) {
  const { clientX, clientY, button } = data;
  robot.moveMouse(clientX, clientY);
  const type = button === 0 ? 'left' : 'right';
  robot.mouseClick(type);
}

function typeString(data) {
  const { key, shiftKey, metaKey, altKey, ctrlKey } = data;
  const modifiers = [];
  if (shiftKey) {
    modifiers.push('shift');
  }
  if (metaKey) {
    modifiers.push('meta');
  }
  if (altKey) {
    modifiers.push('alt');
  }
  if (ctrlKey) {
    modifiers.push('ctrl');
  }
  robot.keyTap(key, modifiers);
}

export { click, typeString };
