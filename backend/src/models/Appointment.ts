import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reason?: string;
  meetingLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'confirmed',
    },
    reason: { type: String },
    meetingLink: { type: String },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// Unique compound index: Prevents double-booking the same doctor+date+slot.
// The partialFilterExpression ensures cancelled slots can be re-booked.
// ---------------------------------------------------------------------------
AppointmentSchema.index(
  { doctorId: 1, date: 1, startTime: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { status: { $ne: 'cancelled' } }
  }
);

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
