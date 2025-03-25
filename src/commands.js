import schema from './schema.js';

export function documentAttribute({ commands, attributeName }) {
  const command = commands.find((command) => command.name == 'document');
  if (command && command.attributes[attributeName] !== undefined) {
    return command.attributes[attributeName];
  }
  return schema.document.attributes[attributeName].default;
}

export function addFinalCommands(commands) {
  const finalCommands = [];

  const bottomMargin = documentAttribute({ commands, attributeName: 'bottomMargin' });
  if (bottomMargin > 0) {
    finalCommands.push({ name: 'newline', value: bottomMargin });
  }

  const cut = documentAttribute({ commands, attributeName: 'cut' });
  if (cut !== 'none') {
    finalCommands.push({ name: 'cut', value: cut });
  }

  return [...commands, ...finalCommands];
}
