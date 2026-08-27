const blockedPatterns = [
  /поджог/i,
  /поджиг/i,
  /сжиган.{0,8}ус/i,
  /террор/i,
  /наркот/i,
  /оруж/i,
  /убий/i,
  /насил/i,
];

export function isPublicContentSafe(...values: Array<string | null | undefined>) {
  const text = values.filter(Boolean).join(" ");
  return !blockedPatterns.some((pattern) => pattern.test(text));
}
