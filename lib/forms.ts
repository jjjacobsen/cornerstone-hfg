import type { ResponseStatus } from "./db";

function stringValue(formData: FormData, name: string) {
  const value = formData.get(name);

  if (typeof value !== "string") {
    throw new Error(`${name} must be a string`);
  }

  return value.trim();
}

function assertLength(name: string, value: string, maxLength: number) {
  if (value.length > maxLength) {
    throw new Error(`${name} must be ${maxLength} characters or fewer`);
  }
}

export function parseRequiredString(formData: FormData, name: string, maxLength = 200) {
  const value = stringValue(formData, name);

  if (value.length === 0) {
    throw new Error(`${name} is required`);
  }

  assertLength(name, value, maxLength);
  return value;
}

export function parseOptionalString(formData: FormData, name: string, maxLength = 2_000) {
  const entry = formData.get(name);

  if (entry === null) {
    return "";
  }

  if (typeof entry !== "string") {
    throw new Error(`${name} must be a string`);
  }

  const value = entry.trim();
  assertLength(name, value, maxLength);
  return value;
}

export function parsePositiveInteger(formData: FormData, name: string) {
  const value = stringValue(formData, name);

  if (!/^[1-9]\d*$/.test(value)) {
    throw new Error(`${name} must be a positive integer`);
  }

  const integer = Number(value);

  if (!Number.isSafeInteger(integer)) {
    throw new Error(`${name} must be a positive integer`);
  }

  return integer;
}

export function parseOptionalPositiveInteger(formData: FormData, name: string) {
  const entry = formData.get(name);

  if (entry === null) {
    return null;
  }

  if (typeof entry !== "string") {
    throw new Error(`${name} must be a string`);
  }

  if (entry.trim() === "") {
    return null;
  }

  return parsePositiveInteger(formData, name);
}

export function parseStatus(formData: FormData, name = "status"): ResponseStatus {
  const value = stringValue(formData, name);

  if (value !== "yes" && value !== "no" && value !== "maybe") {
    throw new Error(`${name} must be yes, no, or maybe`);
  }

  return value;
}

export function parseDate(formData: FormData, name: string) {
  const value = stringValue(formData, name);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (match === null) {
    throw new Error(`${name} must use YYYY-MM-DD format`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (year === 0 || month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) {
    throw new Error(`${name} must be a valid date`);
  }

  return value;
}

export function parseTime(formData: FormData, name: string) {
  const value = stringValue(formData, name);

  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new Error(`${name} must use HH:MM format`);
  }

  return value;
}

export function parseOptionalTime(formData: FormData, name: string) {
  const entry = formData.get(name);

  if (entry === null || entry === "") {
    return "";
  }

  if (typeof entry !== "string") {
    throw new Error(`${name} must be a string`);
  }

  const value = entry.trim();

  if (value === "") {
    return "";
  }

  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new Error(`${name} must use HH:MM format`);
  }

  return value;
}
