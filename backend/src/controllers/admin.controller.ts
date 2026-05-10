import { Request, Response } from 'express';
import Doctor from '../models/Doctor';
import Appointment from '../models/Appointment';
import User from '../models/User';
import s3Client from '../services/s3';
import { Upload } from "@aws-sdk/lib-storage";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const uploadImage = async (req: Request, res: Response) => {
  try {
    console.log('--- S3_IMAGE_UPLOAD_SEQUENCE_START ---');
    if (!req.file) {
      console.error('ERROR: No file object found in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log(`FILE_RECEIVED: ${req.file.originalname}, SIZE: ${req.file.size} bytes`);

    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `doctors/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    const parallelUploads3 = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.AWS_BUCKET_NAME || "dr.appointment",
        Key: fileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ACL: 'public-read', // Attempt to make the object publicly readable
      },
    });

    await parallelUploads3.done();

    const publicUrl = `https://s3.${process.env.AWS_S3_REGION}.amazonaws.com/${process.env.AWS_BUCKET_NAME}/${fileName}`;

    console.log('S3_UPLOAD_SUCCESS:', publicUrl);

    res.status(200).json({
      url: publicUrl,
      key: fileName,
    });
    console.log('--- S3_IMAGE_UPLOAD_SEQUENCE_COMPLETE ---');
  } catch (error: any) {
    console.error('S3_UPLOAD_CRITICAL_FAILURE:', error);
    res.status(500).json({ 
      message: 'Upload to S3 failed', 
      error: error.message || error,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

import { emitEvent } from '../services/socket.service';

const formatDoctorName = (name: string) => {
  if (!name) return name;
  let formatted = name.trim().toUpperCase();
  if (!formatted.startsWith('DR.')) {
    formatted = `DR. ${formatted}`;
  }
  return formatted;
};

export const createDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = { ...req.body };
    if (data.name) data.name = formatDoctorName(data.name);
    
    const doctor = new Doctor(data);
    const createdDoctor = await doctor.save();
    
    // Notify all clients that a new doctor is available
    emitEvent('doctor_registered', createdDoctor);
    
    res.status(201).json(createdDoctor);
  } catch (error: any) {
    console.error('Create Doctor Error:', error);
    res.status(500).json({ 
      message: 'Failed to create specialist record', 
      error: error.message || 'Unknown server error' 
    });
  }
};

export const updateDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = { ...req.body };
    if (data.name) data.name = formatDoctorName(data.name);

    const doctor = await Doctor.findByIdAndUpdate(req.params.id, data, { new: true });
    if (doctor) {
      emitEvent('doctor_updated', doctor);
      res.json(doctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error: any) {
    console.error('Update Doctor Error:', error);
    res.status(500).json({ 
      message: 'Failed to update specialist record', 
      error: error.message || 'Unknown server error' 
    });
  }
};

export const deleteDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (doctor) {
      emitEvent('doctor_decommissioned', { id: req.params.id });
      res.json({ message: 'Doctor removed' });
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialization')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });

    res.json({
      totalDoctors,
      totalPatients,
      totalAppointments,
      pendingAppointments,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    if (!appointment) {
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }
    
    // Emit socket event to notify patient of status change
    emitEvent('appointment_updated', { id: appointment._id, status: appointment.status, patientId: appointment.patientId });

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
