import robot from 'robotjs';

function moveMouse(data) {
  const { pageX, pageY, button } = data;
  robot.moveMouse(pageX, pageY);
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

  const parsedKey = key.length > 1 ? key.toLowerCase() : key;

  robot.keyTap(parsedKey, modifiers);
}

export { moveMouse, typeString };
