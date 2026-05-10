# MedMatch Healthcare System

A premium, full-stack medical appointment booking platform built with Next.js, Express, MongoDB, and Socket.io. MedMatch supports patient booking requests, admin appointment approval, real-time slot synchronization, and patient notification messages through the navbar bell.

## Quick Start

### Prerequisites
- Node.js v22+
- MongoDB local or Atlas
- AWS account for S3 image storage

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_REGION=your_region
   S3_BUCKET_NAME=your_bucket
   ```
4. Seed the database, optional:
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

## Appointment Workflow

1. A patient selects a doctor, date, slot, and consultation reason.
2. The backend creates the appointment as `pending`.
3. Pending and confirmed appointments block the selected slot from public availability.
4. Admin reviews appointments by status buttons in this order: `Pending`, `Confirmed`, `Completed`, `Cancelled`.
5. When admin confirms a pending request, the patient receives a `Booking Confirmed` message in the notification bell.
6. When admin marks an appointment completed or cancelled, the patient receives that update in the notification bell.
7. The notification bell stores recent messages per patient in browser storage and includes a clear action.

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/register` | Create a new patient account | Public |
| POST | `/login` | Authenticate user and get tokens | Public |
| GET | `/me` | Get current user profile | Private |
| GET | `/refresh` | Rotate access tokens | Public |
| POST | `/logout` | Clear session cookies | Public |
| PUT | `/update-password` | Change account password | Private |

### Doctors (`/api/doctors`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/` | List and search verified specialists | Public |
| GET | `/specializations` | Fetch unique medical categories | Public |
| GET | `/:id` | View detailed specialist profile | Public |
| GET | `/:id/slots` | Get real-time availability for a date | Public |

### Appointments (`/api/appointments`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/` | Submit a pending appointment request | Patient |
| GET | `/` | View personal booking history | Patient |
| GET | `/stats` | View patient consultation metrics | Patient |
| PUT | `/:id/cancel` | Cancel an upcoming appointment | Patient |

### Administrative Console (`/api/admin`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/upload-image` | Upload profile assets to S3 | Admin |
| POST | `/doctors` | Register a new doctor | Admin |
| PUT | `/doctors/:id` | Update practitioner metadata | Admin |
| DELETE | `/doctors/:id` | Decommission doctor profile | Admin |
| GET | `/appointments` | View global appointment registry | Admin |
| PUT | `/appointments/:id` | Update appointment status | Admin |
| GET | `/dashboard-stats` | View real-time operational metrics | Admin |

## Real-Time Events

Socket.io keeps patient and admin interfaces synchronized.

| Event | Purpose |
| :--- | :--- |
| `slot_booked` | Removes a requested slot from availability immediately |
| `slot_cancelled` | Makes a cancelled slot available again |
| `appointment_booked` | Adds a request-submitted message to the patient's bell |
| `appointment_confirmed` | Adds a booking-confirmed message to the patient's bell |
| `appointment_status_updated` | Syncs status changes across dashboards |
| `appointment_updated` | Refreshes appointment lists and patient dashboard data |

## Key Features

- **Role-Based Access Control**: Separate patient and admin permissions.
- **Pending Approval Flow**: Patient bookings start as pending and require admin confirmation.
- **Status-Based Admin View**: Admin appointments are separated by Pending, Confirmed, Completed, and Cancelled buttons.
- **Patient Notification Bell**: Booking requests, confirmations, completions, and cancellations appear in the navbar notification list.
- **Concurrency Control**: Prevents double-booking using database constraints and pending-slot blocking.
- **Real-Time Sync**: Socket.io integration for slot, dashboard, and notification updates.
- **Secure Auth**: JWT access tokens, refresh token rotation, and bcrypt password hashing.
- **Cloud Storage**: AWS S3 integration for practitioner profile assets.
- **Validation**: Joi schemas for strict request validation.

## Deployment

- **Frontend**: Vercel, optimized for Next.js.
- **Backend**: Render or any Node.js-compatible host.
- **Database**: MongoDB Atlas or local MongoDB.
- **Storage**: AWS S3 for practitioner profile assets.
