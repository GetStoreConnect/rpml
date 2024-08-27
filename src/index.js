import tpmlConfig from './tpmlConfig.js';

export function parseTPML(input) {
  const commands = [];

  let regex = /(?:\s*(?<!\\)(?:\\\\)*{\s*(?<key>\w+)[\s\n]*(?<attrs>(?:[^}]|\\})*)(?<!\\)(?:\\\\)*})|(?<comment>\s*{#[^}]+\s*})|(?<line>[^\n]+)/gmi;

  let matches = [...input.matchAll(regex)];

  for (const match of matches) {
    if (match.groups.comment)
      continue;

    let command = parseCommand(match, tpmlConfig);
    if (command)
      commands.push(command);
  }

  return commands;
}

function parseCommand(match, config) {
  let command;

  if (match.groups.key) {
    let key = camelize(match.groups.key);
    if (config[key]) {
      if (config[key].attributes) {
        command = commandWithAttributes(key, match, config);
      } else if (config[key].param) {
        command = commandWithParam(key, match, config);
      } else {
        command = { name: key };
      }
    } else {
      let toggleName = key.substring(3);

      if (key.startsWith("end") && config[toggleName] && config[toggleName].toggle) {
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

function commandWithAttributes(key, match, config) {
  let command = {
    name: key,
  }

  let attributes = parseAttributes(match.groups.attrs, config[key])
  if (attributes)
    command.attributes = attributes;

  return command;
}

function commandWithParam(key, match, config) {
  return {
    name: key,
    value: castValue(match.groups.attrs, config[key].param) || config[key].param.default,
  }
}

function endCommand(name) {
  return {
    name: name,
    off: true,
  }
}

function lineCommand(match) {
  return {
    name: "line",
    value: match.groups.line,
  }
}

function unknownCommand(match) {
  return {
    name: "unknown",
    key: match.groups.key,
    attributes: match.groups.attrs
  }
}

function parseAttributes(input, config) {
  const attributes = {};
  let regex = /\s*(?<key>[^=\s]+)\s*=\s*(?:(?<number>[\d]+)|(?<keyword>[\w\-]+)|(["'])(?<string>.*?(?<!\\))\4|\[(?<array>.*(?<!\\))\])/gi;
  let matches = [...input.matchAll(regex)];

  for (const match of matches) {
    let key = camelize(match.groups.key);

    if (!config.attributes[key])
      continue;

    let rawValue = match.groups.number || match.groups.keyword || match.groups.string || match.groups.array;
    let value = castValue(rawValue, config.attributes[key]);

    if (value === null)
      continue;

    if (config.attributes[key].multiple) {
      key = config.attributes[key].key || key;
      if (!attributes[key])
        attributes[key] = []
      attributes[key].push(value)
    } else {
      attributes[key] = value;
    }
  }

  // check for default values
  for (const key in config.attributes) {
    if (config.attributes[key].default !== undefined && attributes[key] === undefined)
      attributes[key] = config.attributes[key].default;
  }

  return attributes;
}

function castValue(value, config) {
  if (!value) return "";
  // replace all escaped characters with the original
  value = value.replace(/\\(.)/g, (m, chr) => chr);

  if (config.split) {
    // split on commas, but only if they're not inside quotes
    return value.match(/(['"].*?['"]|[^"',\s]+)(?=\s*,|\s*$)/g).map(
      bit => {
        return cast(bit, config.type, config.options)
      }
    )
  } else {
    return cast(value, config.type, config.options)
  }
}

function cast(value, type, options) {
  switch (camelize(type)) {
    case "number":
      if (value === "*")
        return value

      if (!options)
        return Number(value);

      return options.includes(Number(value)) ? Number(value) : null;
    case "boolean":
      return value === "true";
    case "keyword":
      if (!options)
        return value;

      return options.includes(value.toLowerCase()) ? value.toLowerCase() : null;
    case "string":
      return value.trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "");
  }
}

function camelize(str) {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}
