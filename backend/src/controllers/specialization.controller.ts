import { Request, Response } from 'express';
import * as specializationService from '../services/specialization.service';

// ---------------------------------------------------------------------------
// GET /api/specializations
// ---------------------------------------------------------------------------
export const getSpecializations = async (req: Request, res: Response) => {
  try {
    const specializations = await specializationService.getSpecializations();
    res.json(specializations);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Error fetching specializations' });
  }
};

// ---------------------------------------------------------------------------
// POST /api/specializations
// ---------------------------------------------------------------------------
export const createSpecialization = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const specialization = await specializationService.createSpecialization(name);
    res.status(201).json(specialization);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Error creating specialization' });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/specializations
// ---------------------------------------------------------------------------
export const updateSpecialization = async (req: Request, res: Response) => {
  try {
    const { oldName, newName } = req.body;
    await specializationService.updateSpecialization(oldName, newName);
    res.json({ message: 'Specialization updated successfully' });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Error updating specialization' });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/specializations/:name
// ---------------------------------------------------------------------------
export const deleteSpecialization = async (req: Request, res: Response) => {
  try {
    await specializationService.deleteSpecialization(req.params.name);
    res.json({ message: 'Specialization deleted successfully' });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Error deleting specialization' });
  }
};
