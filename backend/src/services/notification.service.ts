import Appointment from '../models/Appointment';

export const sendBookingConfirmation = async (appointment: any) => {
  // In a real world, this would use Nodemailer, SendGrid, or AWS SES
  console.log(`
    [NOTIFICATION SERVICE]
    To: Patient
    Subject: Appointment Confirmed - ${appointment.date}
    Message: Your appointment with the doctor has been confirmed for ${appointment.date} at ${appointment.startTime}.
    Reason: ${appointment.reason}
  `);

  console.log(`
    [NOTIFICATION SERVICE]
    To: Doctor
    Subject: New Appointment Scheduled
    Message: You have a new appointment on ${appointment.date} at ${appointment.startTime}.
    Patient ID: ${appointment.patientId}
  `);
};

export const sendReminder = async (appointment: any) => {
  // Logic to send a reminder 24 hours before
  console.log(`[NOTIFICATION SERVICE] Reminder scheduled for appointment ${appointment._id}`);
};
