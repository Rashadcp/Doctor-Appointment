export const createCalendarEvent = async (appointment: any) => {
  // In a real world, this would use Google Calendar API or Outlook API
  // You would use the Google OAuth tokens stored for the user/doctor
  console.log(`
    [CALENDAR SERVICE]
    Event: Consultation
    Date: ${appointment.date}
    Time: ${appointment.startTime} - ${appointment.endTime}
    Description: ${appointment.reason}
    Status: SYNCED TO GOOGLE CALENDAR
  `);

  return {
    calendarEventId: `mock_event_${Math.random().toString(36).substr(2, 9)}`
  };
};
