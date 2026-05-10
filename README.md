# MedMatch Healthcare System

A premium, full-stack medical appointment booking platform built with the MERN stack. Designed with a high-fidelity "Swiss-Brutalist" aesthetic and featuring real-time synchronization, secure RBAC, and automated clinical scheduling.

## 🚀 Quick Start

### Prerequisites
- Node.js (v22+)
- MongoDB (Local or Atlas)
- AWS Account (for S3 image storage)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (`.env`):
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
4. Seed the database (Optional):
   ```bash
   npm run seed
   ```
5. Start the development server:
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

---

## 🛠️ API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/register` | Create a new patient account | Public |
| POST | `/login` | Authenticate user & get tokens | Public |
| GET | `/me` | Get current user profile | Private |
| GET | `/refresh` | Rotate access tokens | Public |
| POST | `/logout` | Clear session cookies | Public |
| PUT | `/update-password` | Change account password | Private |

### Doctors (`/api/doctors`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/` | List/Search verified specialists | Public |
| GET | `/specializations` | Fetch unique medical categories | Public |
| GET | `/:id` | Detailed specialist profile | Public |
| GET | `/:id/slots` | Real-time availability for a date | Public |

### Appointments (`/api/appointments`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/` | Reserve a clinical time slot | Patient |
| GET | `/` | View personal booking history | Patient |
| GET | `/stats` | Patient consultation metrics | Patient |
| PUT | `/:id/cancel` | Terminate upcoming appointment | Patient |

### Administrative Console (`/api/admin`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/upload-image` | Upload profile assets to S3 | Admin |
| POST | `/doctors` | Register new doctor to system | Admin |
| PUT | `/doctors/:id` | Update practitioner metadata | Admin |
| DELETE| `/doctors/:id` | Decommission doctor profile | Admin |
| GET | `/appointments` | Global clinical registry view | Admin |
| GET | `/dashboard-stats` | Real-time operational metrics | Admin |

---

## 🔐 Key Features
- **Role-Based Access Control (RBAC)**: Distinct permissions for Patients and Administrators.
- **Concurrency Control**: Prevents double-booking using unique database constraints.
- **Real-Time Sync**: Socket.io integration for instant UI updates when slots are taken.
- **Secure Auth**: JWT with Refresh Token rotation and Bcrypt password hashing.
- **Cloud Storage**: Integrated with AWS S3 for high-performance asset management.
- **Validation**: Strict input sanitization using Joi schemas.

---

## 🎨 Design System
The application utilizes a custom-built design system featuring:
- **Swiss-Brutalist Aesthetic**: Sharp borders, heavy typography, and high contrast.
- **Responsive Layouts**: Fully optimized for mobile/thumb-friendly interactions.
- **Micro-animations**: Smooth transitions powered by Framer Motion.
