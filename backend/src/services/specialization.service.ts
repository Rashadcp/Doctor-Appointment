import Specialization from '../models/specialization.model';
import Doctor from '../models/Doctor';

export const getSpecializations = async (): Promise<string[]> => {
  const specializations = await Specialization.find().sort({ name: 1 });
  return specializations.map((s) => s.name);
};

export const createSpecialization = async (name: string) => {
  const normalized = name.toUpperCase();

  const existing = await Specialization.findOne({ name: normalized });
  if (existing) {
    throw { status: 400, message: 'Specialization already exists' };
  }

  return Specialization.create({ name: normalized });
};

export const updateSpecialization = async (
  oldName: string,
  newName: string
): Promise<void> => {
  const normalizedNew = newName.toUpperCase();

  await Specialization.findOneAndUpdate(
    { name: oldName.toUpperCase() },
    { name: normalizedNew }
  );

  // Cascade update to all doctors with the old specialization
  await Doctor.updateMany(
    { specialization: oldName },
    { specialization: normalizedNew }
  );
};

export const deleteSpecialization = async (name: string): Promise<void> => {
  await Specialization.findOneAndDelete({ name: name.toUpperCase() });
};
