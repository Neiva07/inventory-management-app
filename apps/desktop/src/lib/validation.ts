/**
 * Validation library for common Brazilian document and contact formats
 */

/**
 * Validates if a string is a valid email address
 * @param email - The email string to validate
 * @returns true if the email is valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates CEP (Brazilian postal code)
 * @param cep - The CEP string to validate
 * @returns Error message if invalid, empty string if valid
 */
export const validateCEP = (cep: string): string => {
  const cleanCEP = cep.replace(/\D/g, '');
  if (cleanCEP.length !== 8) {
    return 'CEP deve ter 8 dígitos';
  }
  return '';
};

/**
 * Validates Brazilian phone number
 * @param phone - The phone string to validate
 * @returns Error message if invalid, empty string if valid
 */
export const validatePhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length !== 11) {
    return 'Telefone deve ter 11 dígitos (DDD + número)';
  }
  return '';
};

/**
 * Validates CNPJ (Brazilian company registration)
 * @param cnpj - The CNPJ string to validate
 * @returns Error message if invalid, empty string if valid
 */
export const validateCNPJ = (cnpj: string): string => {
  // Remove non-digits
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  if (cleanCNPJ.length !== 14) {
    return 'CNPJ deve ter 14 dígitos';
  }
  
  // Basic CNPJ validation (simplified)
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
    return 'CNPJ inválido';
  }
  
  return '';
};

/**
 * Validates IE (Inscrição Estadual)
 * @param ie - The IE string to validate
 * @returns Error message if invalid, empty string if valid
 */
export const validateIE = (ie: string): string => {
  // Remove non-digits
  const cleanIE = ie.replace(/\D/g, '');
  
  if (cleanIE.length < 8 || cleanIE.length > 12) {
    return 'IE deve ter entre 8 e 12 dígitos';
  }
  
  return '';
};

/**
 * Formats CEP with mask (00000-000)
 * @param value - The CEP value to format
 * @returns Formatted CEP string
 */
export const formatCEP = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length <= 8) {
    return cleanValue.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  return value;
};

/**
 * Formats phone number with mask ((00) 00000-0000)
 * @param value - The phone value to format
 * @returns Formatted phone string
 */
export const formatPhone = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length <= 11) {
    return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return value;
};

/**
 * Formats CNPJ with mask (00.000.000/0000-00)
 * @param value - The CNPJ value to format
 * @returns Formatted CNPJ string
 */
export const formatCNPJ = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length <= 14) {
    return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return value;
};

/**
 * Formats IE with mask (000.000.000.000)
 * @param value - The IE value to format
 * @returns Formatted IE string
 */
export const formatIE = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length <= 12) {
    return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1.$2.$3.$4');
  }
  return value;
}; 