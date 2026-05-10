import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './models/User';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connected to MongoDB for seeding...');

    const adminEmail = 'admin@gmail.com';
    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
      console.log(`Admin user found (Current email: ${adminExists.email}). Updating to ${adminEmail}...`);
      adminExists.email = adminEmail;
      await adminExists.save();
      console.log('Admin email updated successfully.');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        phone: '1234567890'
      });
      console.log('Admin user created successfully!');
    }
    console.log(`Admin Email: ${adminEmail}`);
    console.log('Admin Password: admin123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedAdmin();
