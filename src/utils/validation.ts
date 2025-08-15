/**
 * Validaciones para formularios
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message: string;
}

export interface ValidationRules {
  [field: string]: ValidationRule[];
}

export interface ValidationErrors {
  [field: string]: string;
}

/**
 * Valida un objeto contra reglas de validación
 */
export function validateForm(data: Record<string, any>, rules: ValidationRules): ValidationErrors {
  const errors: ValidationErrors = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];

    for (const rule of fieldRules) {
      // Required
      if (rule.required && (!value || value.toString().trim() === '')) {
        errors[field] = rule.message;
        break;
      }

      // Skip other validations if value is empty and not required
      if (!value) continue;

      // Min length
      if (rule.minLength && value.toString().length < rule.minLength) {
        errors[field] = rule.message;
        break;
      }

      // Max length
      if (rule.maxLength && value.toString().length > rule.maxLength) {
        errors[field] = rule.message;
        break;
      }

      // Pattern
      if (rule.pattern && !rule.pattern.test(value.toString())) {
        errors[field] = rule.message;
        break;
      }

      // Custom validation
      if (rule.custom && !rule.custom(value)) {
        errors[field] = rule.message;
        break;
      }
    }
  }

  return errors;
}

/**
 * Reglas de validación comunes
 */
export const commonValidationRules = {
  required: (message: string = 'Este campo es obligatorio'): ValidationRule => ({
    required: true,
    message
  }),

  email: (message: string = 'Introduce un email válido'): ValidationRule => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message
  }),

  minLength: (length: number, message?: string): ValidationRule => ({
    minLength: length,
    message: message || `Debe tener al menos ${length} caracteres`
  }),

  maxLength: (length: number, message?: string): ValidationRule => ({
    maxLength: length,
    message: message || `No puede tener más de ${length} caracteres`
  }),

  phone: (message: string = 'Introduce un teléfono válido'): ValidationRule => ({
    pattern: /^(\+34|0034|34)?[6-9]\d{8}$/,
    message
  }),

  postalCode: (message: string = 'Introduce un código postal válido'): ValidationRule => ({
    pattern: /^\d{5}$/,
    message
  })
};

/**
 * Valida campos específicos del contacto
 */
export const contactValidationRules: ValidationRules = {
  name: [
    commonValidationRules.required('El nombre es obligatorio'),
    commonValidationRules.minLength(2, 'El nombre debe tener al menos 2 caracteres'),
    commonValidationRules.maxLength(50, 'El nombre no puede tener más de 50 caracteres')
  ],
  email: [
    commonValidationRules.required('El email es obligatorio'),
    commonValidationRules.email()
  ],
  subject: [
    commonValidationRules.required('El asunto es obligatorio'),
    commonValidationRules.minLength(5, 'El asunto debe tener al menos 5 caracteres'),
    commonValidationRules.maxLength(100, 'El asunto no puede tener más de 100 caracteres')
  ],
  message: [
    commonValidationRules.required('El mensaje es obligatorio'),
    commonValidationRules.minLength(10, 'El mensaje debe tener al menos 10 caracteres'),
    commonValidationRules.maxLength(1000, 'El mensaje no puede tener más de 1000 caracteres')
  ]
};

/**
 * Valida dirección de envío
 */
export const shippingValidationRules: ValidationRules = {
  first_name: [
    commonValidationRules.required('El nombre es obligatorio'),
    commonValidationRules.minLength(2)
  ],
  last_name: [
    commonValidationRules.required('Los apellidos son obligatorios'),
    commonValidationRules.minLength(2)
  ],
  address1: [
    commonValidationRules.required('La dirección es obligatoria'),
    commonValidationRules.minLength(5)
  ],
  city: [
    commonValidationRules.required('La ciudad es obligatoria'),
    commonValidationRules.minLength(2)
  ],
  zip: [
    commonValidationRules.required('El código postal es obligatorio'),
    commonValidationRules.postalCode()
  ],
  email: [
    commonValidationRules.required('El email es obligatorio'),
    commonValidationRules.email()
  ],
  phone: [
    commonValidationRules.phone('Introduce un teléfono español válido')
  ]
};

