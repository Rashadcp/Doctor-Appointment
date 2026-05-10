import { Request, Response } from 'express';
import Specialization from '../models/specialization.model';
import Doctor from '../models/Doctor';

export const getSpecializations = async (req: Request, res: Response) => {
  try {
    const specializations = await Specialization.find().sort({ name: 1 });
    res.json(specializations.map(s => s.name));
  } catch (error) {
    res.status(500).json({ message: "Error fetching specializations" });
  }
};

export const createSpecialization = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const existing = await Specialization.findOne({ name: name.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: "Specialization already exists" });
    }
    const specialization = await Specialization.create({ name: name.toUpperCase() });
    res.status(201).json(specialization);
  } catch (error) {
    res.status(500).json({ message: "Error creating specialization" });
  }
};

export const updateSpecialization = async (req: Request, res: Response) => {
  try {
    const { oldName, newName } = req.body;
    const normalizedNewName = newName.toUpperCase();
    
    // Update the record
    await Specialization.findOneAndUpdate({ name: oldName.toUpperCase() }, { name: normalizedNewName });
    
    // Update all doctors with this specialization
    await Doctor.updateMany({ specialization: oldName }, { specialization: normalizedNewName });
    
    res.json({ message: "Specialization updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating specialization" });
  }
};

export const deleteSpecialization = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    await Specialization.findOneAndDelete({ name: name.toUpperCase() });
    res.json({ message: "Specialization deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting specialization" });
  }
};
