import Appointment from '../models/Appointment';

export const sendBookingConfirmation = async (appointment: any) => {
  // In a real world, this would use Nodemailer, SendGrid, or AWS SES
  console.log(`
    [NOTIFICATION SERVICE]
    To: Patient
    Subject: Appointment Request Received - ${appointment.date}
    Message: Your appointment request for ${appointment.date} at ${appointment.startTime} is pending admin confirmation.
    Reason: ${appointment.reason}
  `);

  console.log(`
    [NOTIFICATION SERVICE]
    To: Doctor
    Subject: New Appointment Request
    Message: A patient requested an appointment on ${appointment.date} at ${appointment.startTime}.
    Patient ID: ${appointment.patientId}
  `);
};

export const sendReminder = async (appointment: any) => {
  // Logic to send a reminder 24 hours before
  console.log(`[NOTIFICATION SERVICE] Reminder scheduled for appointment ${appointment._id}`);
};
