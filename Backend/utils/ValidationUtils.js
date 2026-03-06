// Genel doğrulama yardımcıları

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPhone(value) {
  return /^\+?[0-9]{10,15}$/.test(value);
}

function isPositiveInt(value) {
  return Number.isInteger(value) && value > 0;
}

function isNotEmpty(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function isInEnum(value, allowed) {
  return allowed.includes(value);
}

module.exports = { isEmail, isPhone, isPositiveInt, isNotEmpty, isInEnum };
