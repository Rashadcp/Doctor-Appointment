import Joi from 'joi';

// ---------------------------------------------------------------------------
// Doctor Profile Validation (Admin creates/updates a doctor)
// ---------------------------------------------------------------------------

export const createDoctorSchema = Joi.object({
  name: Joi.string().required().min(2).max(100).messages({
    'string.empty': 'Doctor name is required',
    'string.min': 'Doctor name must be at least 2 characters',
    'any.required': 'Doctor name is required',
  }),
  specialization: Joi.string().required().messages({
    'string.empty': 'Specialization is required',
    'any.required': 'Specialization is required',
  }),
  experience: Joi.number().integer().min(0).required().messages({
    'number.base': 'Experience must be a number',
    'number.min': 'Experience cannot be negative',
    'any.required': 'Experience is required',
  }),
  fee: Joi.number().min(0).required().messages({
    'number.base': 'Consultation fee must be a number',
    'number.min': 'Consultation fee cannot be negative',
    'any.required': 'Consultation fee is required',
  }),
  bio: Joi.string().optional().allow(''),
  image: Joi.string().optional().allow(''),
  location: Joi.string().optional().allow(''),
  education: Joi.string().optional().allow(''),
  languages: Joi.array().items(Joi.string()).optional(),
  availability: Joi.object({
    days: Joi.array().items(Joi.string()).required().messages({
      'any.required': 'Available days are required',
    }),
    startTime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        'string.pattern.base': 'Start time must be in HH:mm format',
        'any.required': 'Start time is required',
      }),
    endTime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        'string.pattern.base': 'End time must be in HH:mm format',
        'any.required': 'End time is required',
      }),
    slotDuration: Joi.number().integer().min(5).max(120).required().messages({
      'number.base': 'Slot duration must be a number',
      'number.min': 'Slot duration must be at least 5 minutes',
      'number.max': 'Slot duration cannot exceed 120 minutes',
      'any.required': 'Slot duration is required',
    }),
  })
    .required()
    .messages({
      'any.required': 'Availability schedule is required',
    }),
  isActive: Joi.boolean().optional(),
});

export const updateDoctorSchema = createDoctorSchema.fork(
  ['name', 'specialization', 'experience', 'fee', 'availability'],
  (schema) => schema.optional()
);

// ---------------------------------------------------------------------------
// Appointment Status Update (Admin updates appointment status)
// ---------------------------------------------------------------------------

export const updateAppointmentStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'confirmed', 'completed', 'cancelled')
    .required()
    .messages({
      'any.only': 'Status must be one of: pending, confirmed, completed, cancelled',
      'any.required': 'Status is required',
    }),
});

// ---------------------------------------------------------------------------
// Specialization Validation
// ---------------------------------------------------------------------------

export const createSpecializationSchema = Joi.object({
  name: Joi.string().required().min(2).max(50).messages({
    'string.empty': 'Specialization name is required',
    'string.min': 'Specialization name must be at least 2 characters',
    'any.required': 'Specialization name is required',
  }),
});

export const updateSpecializationSchema = Joi.object({
  oldName: Joi.string().required().messages({
    'string.empty': 'Current specialization name is required',
    'any.required': 'Current specialization name is required',
  }),
  newName: Joi.string().required().min(2).max(50).messages({
    'string.empty': 'New specialization name is required',
    'string.min': 'New specialization name must be at least 2 characters',
    'any.required': 'New specialization name is required',
  }),
});
