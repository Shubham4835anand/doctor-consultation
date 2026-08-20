# Doctor Consultation Booking Application

A responsive, premium full-stack Doctor Consultation Booking application built using **React** (Vite + Tailwind CSS v4) on the frontend, **Node.js & Express** on the backend, and a file-based **JSON database** for persistence.

## Key Features

* **Role-Based Authentication**: Separate signup/login flows for Patients and Doctors. JWT-based route protection on the React frontend.
* **Frictionless Login**: Enter an email and password, and the platform automatically determines your role and maps you to your corresponding dashboard.
* **Provider Listings & Filters**: Search doctors by name or specialization, and filter doctors dynamically based on date availability.
* **Real-time Availability Slot Manager**: Doctors can add or remove availability slots.
* **Conflict Prevention**: Custom double-booking checks guarantee that patients cannot book slots that are already booked.
* **Appointment State Lifecycle**: Appointments progress through state changes: `Pending Approval` ➡️ `Confirmed` ➡️ `Completed` or `Cancelled`.
* **Patient Dashboard**: Patients can view all of their consultation histories, cancel upcoming appointments, or reschedule them using the doctor's real-time availability calendar.
* **Doctor Dashboard**: Doctors can approve or decline pending bookings, complete confirmed sessions, and configure their active slots calendar.
* **Administrative panel**: Admins can monitor global booking histories, register new doctors directly, and delete doctor profiles along with their credentials.

---

## Folder Structure

```
d:\doctor-consultation
├── server/
│   ├── db/
│   │   ├── db.json (Mock DB file seeded with sample users)
│   │   └── dbClient.js (Handles JSON file reading and writing)
│   ├── middleware/
│   │   └── auth.js (JWT authentication & role verification)
│   ├── routes/
│   │   ├── auth.js (User registration and login)
│   │   ├── doctors.js (Listing, profiles, and slots updates)
│   │   ├── appointments.js (Booking, rescheduling, and status updates)
│   │   └── admin.js (Admin doctor creation/deletion and global logs)
│   ├── server.js (Bootstrap script and global error handler)
│   └── package.json
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx (Dynamic navigation based on logged-in role)
    │   │   └── ProtectedRoute.jsx (Shields views from unauthorized access)
    │   ├── context/
    │   │   └── AuthContext.jsx (Axios client config & state management)
    │   ├── pages/
    │   │   ├── Home.jsx (Polished Landing Page)
    │   │   ├── Login.jsx (Login Page)
    │   │   ├── Signup.jsx (Role-based registration form)
    │   │   ├── DoctorList.jsx (Professional listing directory)
    │   │   ├── DoctorDetail.jsx (Availability slot scheduler)
    │   │   ├── PatientDashboard.jsx (Patient control panel)
    │   │   ├── DoctorDashboard.jsx (Doctor control panel)
    │   │   ├── AdminDashboard.jsx (Admin panel)
    │   │   └── AppointmentConfirmation.jsx (Success summary page)
    │   ├── App.jsx (Route controller)
    │   ├── main.jsx (Boots React app)
    │   └── index.css (Tailwind layers & premium typography)
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

---

## Seed Accounts / Login Credentials

All seed accounts use the password: **`password123`**

| Role | Email Address | Description / Note |
| :--- | :--- | :--- |
| **Patient** | `patient@example.com` | John Doe. Has a booking history. |
| **Doctor 1** | `doctor@example.com` | Dr. Elizabeth Blackwell (Cardiology). Has slot hours. |
| **Doctor 2** | `house@example.com` | Dr. Gregory House (Neurology). Has slot hours. |
| **Admin** | `admin@example.com` | Platform Admin. Can manage doctors. |

---

## Installation & Running

### Step 1: Run Backend Server
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Boot the API server (runs on `http://localhost:5000`):
   ```bash
   npm start
   ```

### Step 2: Run Frontend Client
1. Open a new terminal tab and navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite dev server (runs on `http://localhost:5173`):
   ```bash
   npm run dev
   ```

Open your browser and navigate to `http://localhost:5173` to interact with the application.
