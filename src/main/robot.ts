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

  const parsedKey = key.length > 1 ? key.toLowerCase() : key;

  robot.keyTap(parsedKey, modifiers);
}

export { click, typeString };
