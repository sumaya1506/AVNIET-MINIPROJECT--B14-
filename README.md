# AVNIET-MINIPROJECT--B14-
# Placement Management System

A comprehensive full-stack web application developed to manage and streamline campus placement activities by connecting students, recruiters, and administrators on a centralized platform.

The system provides secure authentication, student profile management, job posting, application tracking, interview scheduling, recruiter management, and administrative analytics for effective placement management.

---

## 🚀 Features

### 👨‍🎓 Student Module

* Student registration and login
* Profile management
* Resume upload
* Browse available jobs
* Apply for jobs
* Track application status
* View interview schedules
* Receive notifications

### 🏢 Recruiter Module

* Recruiter registration and login
* Company profile management
* Post job opportunities
* Manage job postings
* View applicants
* Shortlist candidates
* Schedule interviews
* Update hiring status

### 🛡️ Admin Module

* Manage students
* Manage recruiters
* Monitor job postings
* Track placement records
* View analytics and reports
* Manage overall system activities

---

## 🛠️ Technologies Used

### Frontend:

* HTML5
* CSS3
* JavaScript

### Backend:

* Node.js
* Express.js

### Database:

* MongoDB

### Authentication:

* JWT (JSON Web Token)

### Additional Tools:

* Multer
* Nodemailer

---

## 📁 Project Structure

```plaintext
PlacementManagementSystem/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── css/
    ├── js/
    ├── index.html
    ├── Student.html
    ├── Recruiter.html
    ├── Admin.html
    └── reset-password.html
```

---

## ⚡ Installation & Setup

### Prerequisites

* Node.js
* MongoDB
* npm

---

### Step 1: Clone Repository

```bash
git clone https://github.com/sumaya1506/AVNIET-MINIPROJECT--B14-.git
cd AVNIET-MINIPROJECT--B14-/backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create `.env` file:

```env
MONGO_URI=mongodb://127.0.0.1:27017/placementDB
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
```

### Step 4: Seed Sample Data

```bash
node utils/seed.js
```

### Step 5: Run Application

```bash
npm start
```

---

## 🌐 Access Application

```plaintext
http://localhost:5000
```

---

## 🔐 Default Login Credentials

### Admin:

* Email: [admin@placement.com](mailto:admin@placement.com)
* Password: Admin@123

### Recruiter:

* Email: [recruiter@company.com](mailto:recruiter@company.com)
* Password: Recruiter@123

### Student:

* Email: [student@college.com](mailto:student@college.com)
* Password: Student@123

---

## 📊 Advantages

* Efficient placement management
* Reduces manual processing
* Centralized student and recruiter data
* Real-time job tracking
* Secure role-based access
* Simplifies communication
* Organized interview scheduling

---

## 🐞 Bug Fixes Implemented

* Authentication improvements
* Dashboard optimization
* Route protection fixes
* Resume upload improvements
* Recruiter workflow enhancements
* UI consistency fixes

---

## 🚀 Future Scope

* AI job recommendations
* Resume analysis
* Enhanced reporting
* Video interview support
* Mobile compatibility

---

## 📄 Conclusion

The Placement Management System serves as an effective platform for managing placement-related activities within educational institutions. It improves coordination among students, recruiters, and administrators while ensuring an organized, transparent, and secure placement process.

---

## 👨‍💻 Developed For

Academic Mini Project / College Placement Management System
