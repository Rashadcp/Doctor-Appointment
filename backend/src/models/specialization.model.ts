import mongoose, { Schema, Document } from 'mongoose';

export interface ISpecialization extends Document {
  name: string;
}

const SpecializationSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true, uppercase: true }
}, { timestamps: true });

export default mongoose.model<ISpecialization>('Specialization', SpecializationSchema);
