export function ensureEnvString(variable: string) {
  const value = process.env[variable];
  if (value === undefined) throw new Error(`Missing env variable ${variable}`);
  return value;
}

export function ensureEnvInt(variable: string) {
  const rawValue = ensureEnvString(variable);
  const value = parseInt(rawValue);
  if (isNaN(value))
    throw new Error(`Invalid env variable ${variable} type. Should be Int`);
  return value;
}

export function ensureEnvFloat(variable: string) {
  const rawValue = ensureEnvString(variable);
  const value = parseFloat(rawValue);
  if (isNaN(value))
    throw new Error(`Invalid env variable ${variable} type. Should be Float`);
  return value;
}

export function ensureEnvBool(variable: string) {
  const value = ensureEnvString(variable);
  if (value === "true" || value === "false") return value === "true";
  throw new Error(`Invalid env variable ${variable} type. Should be Bool`);
}

export function ensureEnvUrl(variable: string) {
  const value = ensureEnvString(variable);
  try {
    return new URL(value);
  } catch (err) {
    throw new Error(
      `Invalid env variable ${variable} type. Should be a valid URL`
    );
  }
}
