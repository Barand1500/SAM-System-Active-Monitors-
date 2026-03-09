/**
 * Form Validation Utilities
 * Tüm form doğrulama fonksiyonları
 */

/**
 * Email formatını kontrol eder
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email adresi gereklidir' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Geçerli bir email adresi giriniz' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Telefon numarası formatını kontrol eder (Türkiye)
 * Formatlar: 0555 555 55 55, 05555555555, +905555555555
 */
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Telefon numarası gereklidir' };
  }
  
  // Sadece rakamları al
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Türk telefon numarası kontrolü
  if (digitsOnly.startsWith('90')) {
    // +90 ile başlıyorsa
    if (digitsOnly.length !== 12) {
      return { isValid: false, error: 'Telefon numarası 12 haneli olmalı (+90XXXXXXXXXX)' };
    }
  } else if (digitsOnly.startsWith('0')) {
    // 0 ile başlıyorsa
    if (digitsOnly.length !== 11) {
      return { isValid: false, error: 'Telefon numarası 11 haneli olmalı (0XXXXXXXXXX)' };
    }
  } else {
    return { isValid: false, error: 'Telefon numarası 0 veya +90 ile başlamalı' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Vergi numarası formatını kontrol eder (10 veya 11 haneli)
 */
export const validateTaxNumber = (taxNumber) => {
  if (!taxNumber || !taxNumber.trim()) {
    return { isValid: false, error: 'Vergi numarası gereklidir' };
  }
  
  const digitsOnly = taxNumber.replace(/\D/g, '');
  
  if (digitsOnly.length !== 10 && digitsOnly.length !== 11) {
    return { isValid: false, error: 'Vergi numarası 10 veya 11 haneli olmalı' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Mersis numarası formatını kontrol eder (16 haneli)
 */
export const validateMersisNumber = (mersisNo) => {
  if (!mersisNo || !mersisNo.trim()) {
    return { isValid: false, error: 'Mersis numarası gereklidir' };
  }
  
  const digitsOnly = mersisNo.replace(/\D/g, '');
  
  if (digitsOnly.length !== 16) {
    return { isValid: false, error: 'Mersis numarası 16 haneli olmalı' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Ticaret sicil numarası formatını kontrol eder
 */
export const validateTradeRegistryNumber = (tradeRegNo) => {
  if (!tradeRegNo || !tradeRegNo.trim()) {
    return { isValid: false, error: 'Ticaret sicil numarası gereklidir' };
  }
  
  const digitsOnly = tradeRegNo.replace(/\D/g, '');
  
  if (digitsOnly.length < 5 || digitsOnly.length > 15) {
    return { isValid: false, error: 'Ticaret sicil numarası 5-15 haneli olmalı' };
  }
  
  return { isValid: true, error: null };
};

/**
 * URL formatını kontrol eder
 */
export const validateURL = (url) => {
  if (!url || !url.trim()) {
    return { isValid: false, error: 'Website adresi gereklidir' };
  }
  
  try {
    const urlObj = new URL(url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'Geçerli bir website adresi giriniz' };
    }
    return { isValid: true, error: null };
  } catch (e) {
    return { isValid: false, error: 'Geçerli bir website adresi giriniz' };
  }
};

/**
 * Zorunlu alan kontrolü
 */
export const validateRequired = (value, fieldName = 'Alan') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { isValid: false, error: `${fieldName} gereklidir` };
  }
  
  return { isValid: true, error: null };
};

/**
 * Minimum uzunluk kontrolü
 */
export const validateMinLength = (value, minLength, fieldName = 'Alan') => {
  if (!value || value.length < minLength) {
    return { isValid: false, error: `${fieldName} en az ${minLength} karakter olmalı` };
  }
  
  return { isValid: true, error: null };
};

/**
 * Maximum uzunluk kontrolü
 */
export const validateMaxLength = (value, maxLength, fieldName = 'Alan') => {
  if (value && value.length > maxLength) {
    return { isValid: false, error: `${fieldName} en fazla ${maxLength} karakter olmalı` };
  }
  
  return { isValid: true, error: null };
};

/**
 * Sayı kontrolü
 */
export const validateNumber = (value, fieldName = 'Alan') => {
  if (value && isNaN(Number(value))) {
    return { isValid: false, error: `${fieldName} sayı olmalı` };
  }
  
  return { isValid: true, error: null };
};

/**
 * Tarih kontrolü (gelecek tarihe izin vermeme)
 */
export const validatePastDate = (date, fieldName = 'Tarih') => {
  if (!date) {
    return { isValid: false, error: `${fieldName} gereklidir` };
  }
  
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Bugün sonu
  
  if (inputDate > today) {
    return { isValid: false, error: `${fieldName} gelecek bir tarih olamaz` };
  }
  
  return { isValid: true, error: null };
};

/**
 * Tarih kontrolü (geçmiş tarihe izin vermeme)
 */
export const validateFutureDate = (date, fieldName = 'Tarih') => {
  if (!date) {
    return { isValid: false, error: `${fieldName} gereklidir` };
  }
  
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Bugün başlangıcı
  
  if (inputDate < today) {
    return { isValid: false, error: `${fieldName} geçmiş bir tarih olamaz` };
  }
  
  return { isValid: true, error: null };
};
