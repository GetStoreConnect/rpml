import defaultSchema from './schema.js';

export function parse(markup) {
  const commands = [];

  let regex =
    /(?:\s*(?<!\\)(?:\\\\)*{\s*(?<key>\w+)[\s\n]*(?<attrs>(?:[^}]|\\})*)(?<!\\)(?:\\\\)*})|(?<comment>\s*{#[^}]+\s*})|(?<line>[^\n]+)/gim;

  let matches = [...markup.matchAll(regex)];

  for (const match of matches) {
    if (match.groups.comment) continue;

    let command = parseCommand(match, defaultSchema);
    if (command) commands.push(command);
  }

  return commands;
}

export function parseCommand(match, schema) {
  let command;

  if (match.groups.key) {
    let key = camelize(match.groups.key);
    if (schema[key]) {
      if (schema[key].attributes) {
        command = commandWithAttributes(key, match, schema);
      } else if (schema[key].param) {
        command = commandWithParam(key, match, schema);
      } else {
        command = { name: key };
      }
    } else {
      let toggleName = key.substring(3);

      if (key.startsWith('end') && schema[toggleName] && schema[toggleName].toggle) {
        command = endCommand(toggleName);
      } else {
        command = unknownCommand(match);
      }
    }
  } else if (match.groups.line) {
    command = lineCommand(match);
  }

  return command;
}

export function commandWithAttributes(key, match, schema) {
  let command = {
    name: key,
  };

  let attributes = parseAttributes(match.groups.attrs, schema[key]);
  if (attributes) command.attributes = attributes;

  return command;
}

export function commandWithParam(key, match, schema) {
  return {
    name: key,
    value: castValue(match.groups.attrs, schema[key].param) || schema[key].param.default,
  };
}

export function endCommand(name) {
  return {
    name: name,
    off: true,
  };
}

export function lineCommand(match) {
  return {
    name: 'line',
    value: match.groups.line.trim(),
  };
}

export function unknownCommand(match) {
  return {
    name: 'unknown',
    key: match.groups.key,
    attributes: match.groups.attrs,
  };
}

export function parseAttributes(input, schema) {
  const attributes = {};
  let regex =
    /\s*(?<key>[^=\s]+)\s*=\s*(?:(?<number>[\d]+)|(?<keyword>[\w\-]+)|(["'])(?<string>.*?(?<!\\))\4|\[(?<array>.*(?<!\\))\])/gi;
  let matches = [...input.matchAll(regex)];

  for (const match of matches) {
    let key = camelize(match.groups.key);

    if (!schema.attributes[key]) continue;

    let rawValue =
      match.groups.number || match.groups.keyword || match.groups.string || match.groups.array;
    let value = castValue(rawValue, schema.attributes[key]);

    if (value === null) continue;

    if (schema.attributes[key].multiple) {
      key = schema.attributes[key].key || key;
      if (!attributes[key]) attributes[key] = [];
      attributes[key].push(value);
    } else {
      attributes[key] = value;
    }
  }

  // check for default values
  for (const key in schema.attributes) {
    if (schema.attributes[key].default !== undefined && attributes[key] === undefined)
      attributes[key] = schema.attributes[key].default;
  }

  return attributes;
}

export function castValue(value, schema) {
  if (!value) return '';
  // replace all escaped characters with the original
  value = value.replace(/\\(.)/g, (m, chr) => chr);

  if (schema.split) {
    // split on commas, but only if they're not inside quotes
    return value.match(/(['"].*?['"]|[^"',\s]+)(?=\s*,|\s*$)/g).map((bit) => {
      return cast(bit, schema.type, schema.options);
    });
  } else {
    return cast(value, schema.type, schema.options);
  }
}

export function cast(value, type, options) {
  switch (camelize(type)) {
    case 'number':
      if (value === '*') return value;

      if (!options) return Number(value);

      return options.includes(Number(value)) ? Number(value) : null;
    case 'boolean':
      return value === 'true';
    case 'keyword':
      if (!options) return value;

      return options.includes(value.toLowerCase()) ? value.toLowerCase() : null;
    case 'string':
      return value.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
  }
}

export function camelize(str) {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}
