export function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDate(dateString) {
  if (!dateString) {
    return "-";
  }

  // If the dateString is like YYYY-MM-DD, adding T00:00:00 ensures it's parsed as local time.
  // If it's a full ISO string, appending T00:00:00 might make it an invalid date, 
  // so we should check its format.
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  const dateStr = isDateOnly ? `${dateString}T00:00:00` : dateString;
  const date = new Date(dateStr);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateString) {
  if (!dateString) {
    return "";
  }

  return new Date(dateString).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
