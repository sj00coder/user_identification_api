import { isEmail } from 'class-validator';

export function isEmailOrNull(email: unknown): boolean {
  if (email === null || isEmail(email)) return true;
  return false;
}

export function isStringOrNull(arg: unknown): boolean {
  if (arg === null || typeof arg === 'string') return true;
  return false;
}
