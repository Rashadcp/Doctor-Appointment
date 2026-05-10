# MedMatch Clinical Infrastructure - Project Documentation

## 1. Project Overview & Architecture
MedMatch is a full-stack clinical appointment platform designed for precision scheduling and high-fidelity patient-doctor interactions. The system follows a decoupled architecture with a TypeScript-based MERN stack (MongoDB, Express, React/Next.js, Node.js).

### Architecture Highlights:
- **Client-Side Rendering (CSR) & Server-Side Rendering (SSR)**: Leveraging Next.js 14 App Router for optimal performance and SEO.
- **Service-Oriented Backend**: Separated into Controllers, Services, and Models for maintainability.
- **Real-time Communication**: Integrated Socket.io for live updates on appointment status and administrative metrics.
- **Security First**: Implements HttpOnly cookies for JWT session management and strict RBAC (Role-Based Access Control).

---

## 2. Setup & Installation

### Local Development
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd <project-folder>
   ```
2. **Environment Configuration**:
   - Backend: Create `backend/.env` with `MONGODB_URI`, `JWT_SECRET`, `AWS` credentials, and `FRONTEND_URL`.
   - Frontend: Create `frontend/.env.local` with `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL`.
3. **Run Backend**:
   ```bash
   cd backend && npm install && npm run dev
   ```
4. **Run Frontend**:
   ```bash
   cd frontend && npm install && npm run dev
   ```

### Deployment
- **Backend**: Deployed on **Render** (Node.js runtime). Ensure `Root Directory` is set to `backend`.
- **Frontend**: Deployed on **Vercel**. Ensure `Root Directory` is set to `frontend`.

---

## 3. Database Schema

### User Schema (`User`)
- `name`: String (Required)
- `email`: String (Unique, Required)
- `password`: String (Hashed via bcrypt)
- `role`: Enum ['patient', 'admin'] (Default: 'patient')
- `phone`: String

### Doctor Schema (`Doctor`)
- `name`: String (Required)
- `specialization`: String (Required)
- `experience`: Number (Years)
- `fee`: Number (USD)
- `bio`: String
- `image`: String (S3 URL)
- `location`: String
- `availability`: Object { days: string[], startTime: string, endTime: string, slotDuration: number }

### Appointment Schema (`Appointment`)
- `patientId`: ObjectId (Ref: User)
- `doctorId`: ObjectId (Ref: Doctor)
- `date`: String (YYYY-MM-DD)
- `startTime`: String (HH:mm)
- `endTime`: String (HH:mm)
- `status`: Enum ['pending', 'confirmed', 'completed', 'cancelled']
- **Constraint**: Unique compound index on `{ doctorId, date, startTime }` to prevent double-booking.

---

## 4. API Endpoints

### Authentication
- `POST /api/auth/register`: Create patient account.
- `POST /api/auth/login`: Authenticate and receive JWT.
- `POST /api/auth/logout`: Clear session cookies.

### Patient Operations
- `GET /api/doctors`: Browse directory with specialization/search filters.
- `POST /api/appointments`: Book a time slot.
- `GET /api/appointments`: View personal booking history.
- `GET /api/appointments/stats`: View health engagement metrics.

### Administrative Command Center (Admin Only)
- `POST /api/admin/doctors`: Register new medical practitioners.
- `POST /api/admin/upload-image`: Direct stream upload to AWS S3.
- `GET /api/admin/appointments`: Global oversight of all clinical bookings.
- `PUT /api/admin/appointments/:id`: Update status (e.g., mark as "Complete").

---

## 5. Features Implemented
- **Precision Booking**: Automatic slot generation based on doctor availability and duration.
- **Swiss-Brutalist UI**: High-contrast, minimalist design focused on operational efficiency.
- **AWS S3 Integration**: High-performance image storage for clinical profiles.
- **Real-time Notifications**: Socket.io alerts for patients when appointments are updated.
- **Mobile Responsive**: Ergonomic design for on-the-go medical scheduling.
- **Error Resilience**: Centralized error handling and Joi-based input validation.

---

## 6. Assumptions & Design Decisions
- **Date Handling**: Dates are stored as `YYYY-MM-DD` strings to avoid timezone discrepancies between server and client.
- **Cancellation Policy**: Appointments can be cancelled by patients, but once cancelled, the slot is immediately released for re-booking (via Partial Filter Expression in MongoDB index).
- **Security Choice**: Opted for HttpOnly cookies for JWT storage to mitigate XSS (Cross-Site Scripting) risks.
- **Infrastructure**: Chose Render/Vercel split to optimize for frontend edge delivery and reliable backend long-polling for Sockets.

---
Built by MedMatch Engineering Team © 2026.
