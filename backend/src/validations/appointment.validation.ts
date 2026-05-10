import Joi from 'joi';

export const bookAppointmentSchema = Joi.object({
  doctorId: Joi.string().required().messages({
    'string.empty': 'Doctor ID is required',
    'any.required': 'Doctor ID is required',
  }),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    'string.pattern.base': 'Date must be in YYYY-MM-DD format',
    'string.empty': 'Date is required',
    'any.required': 'Date is required',
  }),
  startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
    'string.pattern.base': 'Start time must be in HH:mm format',
    'string.empty': 'Start time is required',
    'any.required': 'Start time is required',
  }),
  endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
    'string.pattern.base': 'End time must be in HH:mm format',
    'string.empty': 'End time is required',
    'any.required': 'End time is required',
  }),
  reason: Joi.string().optional().allow(''),
});
