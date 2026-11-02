import { createHash, timingSafeEqual } from 'node:crypto';

export const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex');

export const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};