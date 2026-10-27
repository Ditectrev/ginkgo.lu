const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+0-9().\s-]{6,40}$/;

export function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\r/g, "").trim().slice(0, max);
}

export function validEmail(value: string): boolean {
  return EMAIL.test(value) && value.length <= 200;
}

export function validPhone(value: string): boolean {
  return PHONE.test(value);
}

export const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "pdf"]);
export const MAX_TOTAL_BYTES = 10 * 1024 * 1024;
export const MAX_FILES = 8;

export function fileExtension(name: string): string {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() || "" : "";
}
