export function formatDate(dateString, format = "dd-MM-yyyy") {
  const date = new Date(dateString);
  if (isNaN(date)) return "-";

  const map = {
    dd: String(date.getDate()).padStart(2, "0"), // day 01-31
    d: date.getDate(), // day without leading 0
    MM: String(date.getMonth() + 1).padStart(2, "0"), // month 01-12
    M: date.getMonth() + 1, // month without leading 0
    MMM: date.toLocaleString("default", { month: "short" }), // Jan, Feb, Mar...
    MMMM: date.toLocaleString("default", { month: "long" }), // January, February...
    yyyy: date.getFullYear(), // full year 2026
    yy: String(date.getFullYear()).slice(-2), // short year 26
    HH: String(date.getHours()).padStart(2, "0"), // hours 00-23
    mm: String(date.getMinutes()).padStart(2, "0"), // minutes 00-59
    ss: String(date.getSeconds()).padStart(2, "0"), // seconds 00-59
  };

  return format.replace(
    /(dd|d|MMMM|MMM|MM|M|yyyy|yy|HH|mm|ss)/g,
    (matched) => map[matched] ?? matched
  );
}