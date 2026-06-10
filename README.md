# Campus-Interview-Tracking-Result-Management-System-

## 📌 Project Overview

The **Campus Interview Tracking & Result Management System** is a MERN stack web application designed to simplify and centralize campus recruitment processes. It helps placement officers manage students, companies, interview rounds, attendance, and selection results efficiently without relying on spreadsheets or manual tracking.

---

## 🚀 Features

### 🔐 Authentication

* Secure user login system using JWT
* Protected routes for authorized users only

### 🎓 Student Management

* Add, update, delete, and view student records
* Search and filter students easily

### 🏢 Company Management

* Manage company profiles
* Define recruitment roles and processes

### 🧪 Interview Round Management

* Create multiple interview rounds per company
* Maintain round sequence (Aptitude, Coding, HR, etc.)

### 📝 Attendance Tracking

* Mark student attendance for each round
* Track participation history

### 📊 Result Management

* Record pass/fail status for each round
* Automatically progress students through stages

### 📈 Candidate Progress Tracking

* View current status of each student:

  * In Process
  * Selected
  * Rejected

### 📊 Dashboard & Analytics

* Total students and companies overview
* Selection and rejection statistics
* Company-wise performance insights

### 🔍 Search & Reporting

* Search students, companies, and results
* Generate recruitment reports

---

## 🛠️ Tech Stack

**Frontend:**

* React.js
* Axios
* React Router DOM
* Recharts
* React Toastify

**Backend:**

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication
* Bcrypt.js

**Database:**

* MongoDB Atlas

---

## 📁 Project Structure

```
campus-interview-system/
│
├── client/              # React frontend
│   ├── src/
│   └── package.json
│
├── server/              # Express backend
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── config/
│   └── server.js
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/campus-interview-system.git
cd campus-interview-system
```

---

### 2️⃣ Backend Setup

```bash
cd server
npm install
```

Create `.env` file:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

Run backend:

```bash
npm start
```

---

### 3️⃣ Frontend Setup

```bash
cd client
npm install
npm start
```

---

## 🌐 Deployment

* Frontend: Netlify
* Backend: Render
* Database: MongoDB Atlas
* URL
  [![Netlify Status](https://campusinterviewtracker.netlify.app/)

---

## 📊 API Endpoints

### Auth

* POST `/api/auth/register`
* POST `/api/auth/login`

### Students

* GET `/api/students`
* POST `/api/students`
* PUT `/api/students/:id`
* DELETE `/api/students/:id`

### Companies

* GET `/api/companies`
* POST `/api/companies`

### Attendance

* POST `/api/attendance`

### Results

* POST `/api/results`

---

## 📌 Business Rules

* Students must pass previous round before moving forward
* Failed students are marked as "Rejected"
* Attendance is required before result entry
* Final round pass = "Selected"

---

## 🧠 Challenges Faced

* Designing multi-stage interview workflow
* Managing student progression logic
* Ensuring data consistency across rounds
* Handling authentication and route protection

---

## 📷 Screenshots (Optional)

Add UI screenshots here:

* Dashboard
* Student Management
* Company Workflow
* Result Tracking

---

## 👨‍💻 Author

**Aaryan Koirala**
BSc (Hons) Computing
London Metropolitan University

---

## 📄 License

This project is for educational purposes only.
