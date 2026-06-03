# 🏢 HR Management System — Microservices Architecture

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.x-black?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/atlas)
[![Docker](https://img.shields.io/badge/Docker-Containerized-blue?logo=docker)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-orange?logo=jsonwebtokens)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

A production-ready **HR Management System** built with a **microservices architecture**, designed to streamline daily HR operations including employee onboarding, attendance tracking, profile management, and secure access control.

---

## 🌐 Live Deployments

| Service | URL |
|---|---|
| 🔀 **API Gateway** | [https://api-gateway-hrqt.onrender.com](https://api-gateway-hrqt.onrender.com) |
| 🔐 **Auth Service** | [https://auth-service-latest-ot64.onrender.com](https://auth-service-latest-ot64.onrender.com) |
| 👤 **Employee Service** | [https://employee-service-latest.onrender.com](https://employee-service-latest.onrender.com) |
| 📅 **Attendance Service** | [https://attendance-service-k838.onrender.com](https://attendance-service-k838.onrender.com) |

---

## 🐳 Docker Hub Images

All services are containerized and published to Docker Hub for easy deployment:

| Service | Docker Hub |
|---|---|
| API Gateway | [`raihanuldev/api-gateway`](https://hub.docker.com/r/raihanuldev/api-gateway) |
| Auth Service | [`raihanuldev/auth-service`](https://hub.docker.com/u/raihanuldev/auth-service) |
| Employee Service | [`raihanuldev/employee-service`](https://hub.docker.com/r/raihanuldev/employee-service) |
| Attendance Service | [`raihanuldev/attendance-service`](https://hub.docker.com/r/raihanuldev/attendance-service) |

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [System Architecture](#-system-architecture)
- [Services](#-services)
  - [API Gateway](#1-api-gateway)
  - [Auth Service](#2-auth-service)
  - [Employee Service](#3-employee-service)
  - [Attendance Service](#4-attendance-service)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Security](#-security)
- [Docker Deployment](#-docker-deployment)
- [Future Improvements](#-future-improvements)

---

## 🎯 Project Overview

**Mission:** To build an easy-to-maintain, scalable system that automates and simplifies HR daily operations — from employee onboarding and profile management to real-time attendance tracking with minimal manual intervention.

**Key capabilities:**

- Secure authentication with role-based access control (RBAC)
- Employee lifecycle management (create, update, delete profiles)
- Real-time check-in / check-out attendance with automatic duration calculation
- Document storage support for employee records
- Centralized API Gateway with global logging, rate limiting, and routing

---

## 🏗️ System Architecture

```
                          ┌─────────────────────────────────────────────────┐
                          │               CLIENT (Browser / App)             │
                          └──────────────────────┬──────────────────────────┘
                                                 │ HTTP Request
                                                 ▼
                          ┌─────────────────────────────────────────────────┐
                          │                  API GATEWAY                     │
                          │  ┌──────────────────────────────────────────┐   │
                          │  │  ✅ JWT Validation                        │   │
                          │  │  ✅ Global Request Logging               │   │
                          │  │  ✅ Rate Limiting                        │   │
                          │  │  ✅ Request Forwarding                   │   │
                          │  └──────────────────────────────────────────┘   │
                          └────────┬────────────────┬────────────────┬──────┘
                                   │                │                │
                    ┌──────────────┘   ┌────────────┘   ┌───────────┘
                    ▼                  ▼                 ▼
          ┌─────────────────┐ ┌──────────────────┐ ┌──────────────────────┐
          │   AUTH SERVICE  │ │ EMPLOYEE SERVICE  │ │  ATTENDANCE SERVICE  │
          │                 │ │                  │ │                      │
          │  - Register     │ │  - Create        │ │  - Check-In          │
          │  - Login        │ │  - Read          │ │  - Check-Out         │
          │  - Verify User  │ │  - Update        │ │  - View Records      │
          │  - JWT Issue    │ │  - Delete        │ │  - Auto Duration     │
          └────────┬────────┘ └────────┬─────────┘ └──────────┬───────────┘
                   │                   │                       │
                   ▼                   ▼                       ▼
          ┌─────────────────┐ ┌──────────────────┐ ┌──────────────────────┐
          │  MongoDB Atlas  │ │  MongoDB Atlas   │ │    MongoDB Atlas      │
          │   (auth_db)     │ │  (employee_db)   │ │   (attendance_db)    │
          └─────────────────┘ └──────────────────┘ └──────────────────────┘
```

> Each service is independently deployable, containerized with Docker, and communicates via HTTP REST APIs.

---

## 🔧 Services

### 1. API Gateway

The single entry point for all client requests. Handles cross-cutting concerns before forwarding to downstream services.

**Responsibilities:**
- Receive all incoming HTTP requests
- Validate JWT tokens globally
- Apply rate limiting to prevent abuse
- Log every request for observability
- Forward requests to the correct microservice

**Key Features:**

| Feature | Details |
|---|---|
| **Global Logging** | All requests are logged with timestamps, methods, and status codes |
| **Rate Limiting** | Prevents API abuse and DDoS-style flooding |
| **Request Forwarding** | Routes `/auth/*`, `/employees/*`, `/attendance/*` to correct services |
| **JWT Validation** | Centralized token verification before forwarding |

---

### 2. Auth Service

Handles all user identity and authentication concerns. Issues JWT tokens consumed across the entire system.

**Base URL:** `/auth`

**Responsibilities:**
- User registration with hashed passwords (bcrypt, 10 salt rounds)
- Secure login with JWT token issuance
- User verification endpoint for inter-service communication
- Role management (ADMIN, HR, MANAGER, employee)

**User Model:**
```js
{
  email:     String  // unique, required
  password:  String  // bcrypt hashed, never returned in responses
  role:      Enum    // ADMIN | HR | MANAGER | employee
  isActive:  Boolean // default: true
  createdAt: Date
  updatedAt: Date
}
```

**Authentication Flow:**
```
1. User registers  ──►  Password hashed with bcrypt (10 rounds)
2. User logs in    ──►  bcrypt.compare() validates password
3. Login success   ──►  JWT generated with { id, email, role }
4. Token returned  ──►  Client includes in Authorization header
5. Other services  ──►  Call GET /auth/verify/:userId for validation
```

---

### 3. Employee Service

Manages all employee profile data with full CRUD operations, secured by JWT and Role-Based Access Control (RBAC).

**Base URL:** `/employees`

**Responsibilities:**
- Employee onboarding and profile creation
- Department, designation, and salary management
- Manager hierarchy support via `managerId`
- Employee document storage (NID, contracts, etc.)
- Enforces access rules per role

**Employee Schema:**
```js
{
  userId:      String    // Linked to Auth Service user
  name:        String
  email:       String    // unique per user
  phone:       String
  department:  String
  designation: String
  salary:      Number
  address:     String    // optional
  documents:   [{ documentType, fileUrl, uploadDate }]
  managerId:   ObjectId  // ref: Employee (optional hierarchy)
}
```

**Access Control:**

| Endpoint | ADMIN | HR | MANAGER | Employee |
|---|:---:|:---:|:---:|:---:|
| `POST /employees` | ✅ | ✅ | ❌ | ❌ |
| `GET /employees` | ✅ | ✅ | ✅ | ❌ |
| `GET /employees/:id` | ✅ | ✅ | ✅ | ✅ |
| `PUT /employees/:id` | ✅ | ✅ | ❌ | ❌ |
| `DELETE /employees/:id` | ✅ | ❌ | ❌ | ❌ |

---

### 4. Attendance Service

Tracks employee check-ins and check-outs with server-side timestamps and automatic duration calculation. Integrates with the Employee Service for employee validation.

**Base URL:** `/attendance`

**Request Flow:**
```
Client ──► API Gateway ──► Attendance Service ──► Employee Service (validation)
```

**Responsibilities:**
- Record daily check-in and check-out per employee
- Prevent duplicate check-ins on the same calendar day
- Automatically calculate work duration (hours + minutes)
- Validate employee existence via Employee Service before recording

**Attendance Schema:**
```js
{
  employeeId: ObjectId  // ref: Employee
  userId:     String    // indexed for fast lookup
  attendance: [
    {
      date:      "YYYY-MM-DD"
      checkIn:   ISO8601 DateTime   // server-side timestamp
      checkOut:  ISO8601 DateTime   // server-side timestamp
      duration:  "X hours, Y minutes"
    }
  ]
}
```

**Business Rules:**

| Rule | Description |
|---|---|
| One check-in/day | Compound unique index on `userId + date` |
| Server timestamps | Client cannot manipulate time values |
| Auto duration | Calculated on check-out: `(checkOut - checkIn)` |
| Employee validation | Calls Employee Service before allowing check-in |
| JWT required | All endpoints are protected by authentication middleware |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 18.x |
| **Framework** | Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Authentication** | JWT (JSON Web Tokens) |
| **Password Hashing** | bcrypt (10 salt rounds) |
| **HTTP Client** | Axios (inter-service communication) |
| **Containerization** | Docker |
| **Deployment** | Render.com (Docker-based) |
| **Registry** | Docker Hub |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- MongoDB Atlas account (or local MongoDB)

### Clone the Repository

```bash
git clone https://github.com/raihanuldev/hr-management-system.git
cd hr-management-system
```

### Environment Variables

Each service requires a `.env` file. Examples:

**Auth Service** (`.env`)
```env
PORT=5001
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/auth_db
JWT_SECRET=your_jwt_secret_key
```

**Employee Service** (`.env`)
```env
PORT=5002
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/employee_db
JWT_SECRET=your_jwt_secret_key
AUTH_SERVICE_URL=http://localhost:5001
```

**Attendance Service** (`.env`)
```env
PORT=5003
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/attendance_db
JWT_SECRET=your_jwt_secret_key
EMPLOYEE_SERVICE_URL=http://localhost:5002
```

**API Gateway** (`.env`)
```env
PORT=3000
AUTH_SERVICES_URL=http://localhost:5001
EMPLOYEE_SERVICES_URL=http://localhost:5002
ATTENDANCE_SERVICE_URL=http://localhost:5003
```

### Run with Docker (Recommended)

```bash
# Pull all images from Docker Hub
docker pull raihanuldev/api-gateway
docker pull raihanuldev/auth-service
docker pull raihanuldev/employee-service
docker pull raihanuldev/attendance-service

# Run each service
docker run -d -p 3000:3000 --env-file .env raihanuldev/api-gateway
docker run -d -p 5001:5001 --env-file .env raihanuldev/auth-service
docker run -d -p 5002:5002 --env-file .env raihanuldev/employee-service
docker run -d -p 5003:5003 --env-file .env raihanuldev/attendance-service
```

### Run Locally (Development)

```bash
# In each service directory
npm install
npm run dev
```

---

## 📖 API Reference

All requests go through the **API Gateway** at `https://api-gateway-hrqt.onrender.com`.

### Authentication

Include the JWT token in every protected request:
```
Authorization: Bearer <token>
```

---

### 🔐 Auth Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "123456",
  "role": "employee"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": { "id": "...", "email": "user@example.com", "role": "employee" }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "JWT_TOKEN_HERE",
  "user": { "id": "...", "email": "user@example.com", "role": "employee" }
}
```

#### Verify User (Internal)
```http
GET /auth/verify/:userId
```

---

### 👤 Employee Endpoints

#### Create Employee
```http
POST /employees
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "6a038cc20fe12d986bee3c7a",
  "name": "John Doe",
  "email": "john@company.com",
  "phone": "01812345678",
  "department": "IT",
  "designation": "Developer",
  "salary": 50000
}
```

#### Get All Employees
```http
GET /employees
Authorization: Bearer <token>
```

#### Get Single Employee
```http
GET /employees/:id
Authorization: Bearer <token>
```

#### Update Employee
```http
PUT /employees/:id
Authorization: Bearer <token>

{ "designation": "Senior Developer", "salary": 70000 }
```

#### Delete Employee
```http
DELETE /employees/:id
Authorization: Bearer <token>
```
> ADMIN only

---

### 📅 Attendance Endpoints

#### Check In
```http
POST /attendance/check-in
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Check-in successful",
  "data": {
    "userId": "user123",
    "date": "2026-05-24",
    "checkIn": "2026-05-24T09:20:30.822Z"
  }
}
```

#### Check Out
```http
POST /attendance/check-out
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Check-out successful",
  "data": {
    "userId": "user123",
    "date": "2026-05-24",
    "checkIn": "2026-05-24T09:20:30.822Z",
    "checkOut": "2026-05-24T17:45:15.200Z",
    "duration": "8 hours, 24 minutes"
  }
}
```

#### Get Attendance Records
```http
GET /attendance/record
Authorization: Bearer <token>
```

---

### ⚠️ Standard Error Format

All services return errors in this consistent format:
```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

**HTTP Status Codes used:**

| Code | Meaning |
|---|---|
| `200` | Success |
| `400` | Bad Request (validation, duplicate) |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (insufficient role) |
| `404` | Resource Not Found |
| `500` | Internal Server Error |

---

## 🔒 Security

| Mechanism | Implementation |
|---|---|
| **Password Hashing** | bcrypt with 10 salt rounds — passwords are never stored in plain text |
| **Stateless Auth** | JWT tokens — no session storage, fully stateless |
| **RBAC** | Role-based middleware on every protected route |
| **Token Never Stored** | Auth service never returns the user's password |
| **Server Timestamps** | Attendance times set server-side — clients cannot spoof timestamps |
| **Input Validation** | Request data validated before processing |

**JWT Payload Example:**
```json
{
  "id": "6a038c430fe12d986bee3c79",
  "email": "user@example.com",
  "role": "HR",
  "iat": 1779673765,
  "exp": 1780278565
}
```

---

## 🐳 Docker Deployment

Each service is independently Dockerized with its own image published to Docker Hub.

### Docker Hub

| Service | Image |
|---|---|
| API Gateway | `docker pull raihanuldev/api-gateway` |
| Auth Service | `docker pull raihanuldev/auth-service` |
| Employee Service | `docker pull raihanuldev/employee-service` |
| Attendance Service | `docker pull raihanuldev/attendance-service` |

### docker-compose (Example)

```yaml
version: "3.8"
services:
  api-gateway:
    image: raihanuldev/api-gateway
    ports:
      - "3000:3000"
    env_file: ./api-gateway/.env

  auth-service:
    image: raihanuldev/auth-service
    ports:
      - "5001:5001"
    env_file: ./auth-service/.env

  employee-service:
    image: raihanuldev/employee-service
    ports:
      - "5002:5002"
    env_file: ./employee-service/.env

  attendance-service:
    image: raihanuldev/attendance-service
    ports:
      - "5003:5003"
    env_file: ./attendance-service/.env
```

```bash
docker-compose up -d
```

---

## 📁 Project Structure

```
hr-management-system/
├── api-gateway/
│   ├── src/
│   │   ├── middleware/        # JWT validation, rate limiting, logging
│   │   ├── routes/            # Proxy routes to services
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
│
├── auth-service/
│   ├── src/
│   │   ├── models/            # User schema
│   │   ├── controllers/       # Register, login, verify
│   │   ├── routes/
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
│
├── employee-service/
│   ├── src/
│   │   ├── models/            # Employee schema
│   │   ├── controllers/       # CRUD handlers
│   │   ├── middleware/        # Auth + RBAC
│   │   ├── routes/
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
│
├── attendance-service/
│   ├── src/
│   │   ├── model/             # Attendance schema
│   │   ├── controller/        # Check-in, check-out, records
│   │   ├── routes/
│   │   ├── attendanceService.js
│   │   ├── authMiddleware.js
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
│
└── docker-compose.yml
```

---

## 🗺️ Microservice Communication Map

```
API Gateway
    │
    ├── POST /auth/*         ──►  Auth Service        (Registration, Login)
    │
    ├── GET|POST|PUT|DELETE  ──►  Employee Service     (Profile Management)
    │   /employees/*               │
    │                              └──► Auth Service  (GET /verify/:userId)
    │
    └── POST|GET             ──►  Attendance Service  (Check-in, Check-out)
        /attendance/*              │
                                   └──► Employee Service (GET /employees?userId=)
```

---

## 🚀 Future Improvements

- [ ] **Refresh Token System** — Silent re-authentication without re-login
- [ ] **Pagination & Filtering** — Filter employees by department, role, status
- [ ] **File Upload** — AWS S3 / Cloudinary for employee documents
- [ ] **Audit Logging** — Track who made what changes and when
- [ ] **OTP Verification** — Two-factor authentication for login
- [ ] **Leave Management Service** — Apply, approve, and track leave requests
- [ ] **Payroll Service** — Salary slip generation and payroll calculation
- [ ] **Event-Driven Architecture** — Kafka/RabbitMQ for async inter-service events
- [ ] **Kubernetes Deployment** — Orchestrate containers at scale
- [ ] **CI/CD Pipeline** — GitHub Actions for automated build, test, and deploy

---

## 👨‍💻 Author

**Raihanul Dev**
- Docker Hub: [hub.docker.com/u/raihanuldev](https://hub.docker.com/u/raihanuldev)
- GitHub: [@raihanuldev](https://github.com/raihanuldev)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> ⭐ If this project helped you, please give it a star on GitHub!