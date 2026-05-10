# MedMatch Clinical Infrastructure

A high-performance, precision-engineered medical consultation and doctor appointment platform. Built with a Swiss-Brutalist aesthetic and modern clinical workflows.

## 🚀 Live Links
- **Frontend**: [doctor-appointment-smoky-eight.vercel.app](https://doctor-appointment-smoky-eight.vercel.app/)
- **Backend API**: [doctor-appointment-6zf7.onrender.com](https://doctor-appointment-6zf7.onrender.com)

## 🛠 Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React, Axios, Socket.io-client.
- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose), JWT, Socket.io, AWS S3 (for image storage).
- **Deployment**: Vercel (Frontend), Render (Backend).

---

## 💻 Local Setup

### 1. Prerequisites
- Node.js 18+ 
- MongoDB (Local or Atlas)
- AWS S3 Bucket (Optional for local, fallback to local path possible)

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000

# AWS S3 Configuration (Optional)
AWS_S3_ACCESS_KEY_ID=your_key
AWS_S3_SECRET_ACCESS_KEY=your_secret
AWS_BUCKET_NAME=your_bucket
AWS_S3_REGION=your_region
```
Run development server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```
Run development server:
```bash
npm run dev
```

---

## 📑 API Documentation

### Auth Endpoints (`/api/auth`)
- `POST /register` - Register a new patient
- `POST /login` - Login and receive JWT in cookies
- `GET /me` - Get current user profile (Protected)
- `GET /refresh` - Refresh access token
- `POST /logout` - Logout and clear cookies
- `PUT /update-password` - Update account password (Protected)

### Doctor Endpoints (`/api/doctors`)
- `GET /` - List all doctors with filters
- `GET /specializations` - List all available medical specialties
- `GET /stats/specializations` - Get count of doctors per specialty
- `GET /:id` - Get detailed doctor profile
- `GET /:id/slots` - Get available booking slots for a doctor

### Appointment Endpoints (`/api/appointments`)
- `POST /` - Book a new appointment (Patient Only)
- `GET /` - Get my appointments (Protected)
- `GET /stats` - Get patient health metrics (Protected)
- `PUT /:id/cancel` - Cancel an appointment (Patient Only)

### Admin Endpoints (`/api/admin`) - (Requires Admin Role)
- `POST /upload-image` - Upload doctor profile image to S3
- `POST /doctors` - Register a new doctor
- `PUT /doctors/:id` - Update doctor details
- `DELETE /doctors/:id` - Remove a doctor
- `GET /appointments` - View all system appointments
- `PUT /appointments/:id` - Update appointment status (Complete/Cancel)
- `GET /dashboard-stats` - Get global clinical metrics

---

## 🔒 Security Features
- **JWT + Cookie Auth**: Secure HttpOnly cookies for session management.
- **RBAC**: Role-Based Access Control (Admin vs Patient).
- **Joi Validation**: Strict input validation for all API endpoints.
- **Helmet & CORS**: Hardened headers and restricted origin policies.
- **Rate Limiting**: Protection against brute-force attacks.

## 📡 Real-time Engine
The platform uses **Socket.io** for:
- Real-time notification of appointment status changes.
- Live administrative updates for the dashboard metrics.

---
Built for Precision. MedMatch Clinical Infrastructure © 2026.
