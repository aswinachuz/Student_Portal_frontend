export function getId(value) {
  if (!value) return null;
  return typeof value === "object" ? value._id : value;
}
