// Tarih formatlama yardımcıları

function formatDate(date) {
  return new Date(date).toISOString().split("T")[0];
}

function formatDateTime(date) {
  return new Date(date).toISOString().replace("T", " ").substring(0, 19);
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function diffInDays(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
}

function diffInMinutes(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.round((d2 - d1) / (1000 * 60));
}

module.exports = { formatDate, formatDateTime, today, diffInDays, diffInMinutes };
