import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  name: string;
  specialization: string;
  experience: number;
  fee: number;
  bio: string;
  image: string;
  location: string;
  rating: number;
  education: string;
  languages: string[];
  availability: {
    days: string[];
    startTime: string;
    endTime: string;
    slotDuration: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    experience: { type: Number, required: true },
    fee: { type: Number, required: true },
    bio: { type: String, default: '' },
    image: { type: String, default: '' },
    location: { type: String, default: 'Central Clinic, NY' },
    rating: { type: Number, default: 4.9 },
    education: { type: String, default: 'Harvard Medical School' },
    languages: [{ type: String, default: ['English'] }],
    availability: {
      days: [{ type: String }],
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      slotDuration: { type: Number, required: true },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IDoctor>('Doctor', DoctorSchema);
