
# 📌 Employee Service – HR Management Microservices

The Employee Service manages all employee-related data in the HR Management system.

It is responsible for:
- Employee profile creation
- Employee data management (CRUD)
- Role-Based Access Control (RBAC)
- JWT-based authentication integration
- Linking employees with Auth Service users (`userId`)

---

# 🏗️ Tech Stack

- Node.js
- Express.js
- MongoDB (Atlas)
- Mongoose
- JWT (JSON Web Token)
- Role-Based Access Control (RBAC)

---

# 🔐 Security Overview

This service is protected using:

- JWT Authentication Middleware (from Auth Service)
- Role-based Authorization Middleware

### Supported Roles:
- ADMIN
- HR
- MANAGER

---

# 📦 Employee Schema

```js
{
  userId: String (required, indexed),
  name: String (required),
  email: String (required, unique scoped),
  phone: String (required),
  department: String (required),
  designation: String (required),
  salary: Number (required),

  address: String (optional),

  documents: [
    {
      documentType: String,
      fileUrl: String,
      uploadDate: Date
    }
  ],

  managerId: ObjectId (ref: Employee, optional),

  createdAt: Date,
  updatedAt: Date
}
````

---

## 🔎 Indexing Strategy

```js
employeeSchema.index({ userId: 1, email: 1 }, { unique: true, sparse: true });
```

---

# 🚀 Base URL

```
/employees
```

---

# 📌 API Endpoints

---

## 🔹 Create Employee

```
POST /employees
```

### Access:

* ADMIN
* HR

### Headers:

```
Authorization: Bearer <token>
```

### Request Body:

```json
{
  "userId": "6a038cc20fe12d986bee3c7a",
  "name": "dev1",
  "email": "dev1@gmail.com",
  "phone": "011812345678",
  "department": "IT",
  "designation": "Developer",
  "salary": 30000
}
```

### Response:

```json
{
  "message": "Employee created successfully",
  "employee": {
    "_id": "64f1cabc123",
    "userId": "6a038cc20fe12d986bee3c7a",
    "name": "dev1",
    "email": "dev1@gmail.com",
    "department": "IT",
    "designation": "Developer",
    "salary": 30000
  }
}
```

---

## 🔹 Get All Employees

```
GET /employees
```

### Access:

* ADMIN
* HR
* MANAGER

### Response:

```json
{
  "count": 10,
  "employees": [
    {
      "_id": "64f1...",
      "name": "Dev1",
      "department": "IT",
      "designation": "Backend Developer"
    }
  ]
}
```

---

## 🔹 Get Single Employee

```
GET /employees/:id
```

### Access:

* Authenticated Users

### Response:

```json
{
  "employee": {
    "_id": "64f1...",
    "name": "Dev1",
    "email": "dev1@gmail.com",
    "department": "IT",
    "designation": "Developer",
    "salary": 30000
  }
}
```

---

## 🔹 Update Employee

```
PUT /employees/:id
```

### Access:

* ADMIN
* HR

### Request Body:

```json
{
  "designation": "Senior Developer",
  "salary": 50000
}
```

### Response:

```json
{
  "message": "Employee updated successfully"
}
```

---

## 🔹 Delete Employee

```
DELETE /employees/:id
```

### Access:

* ADMIN only

### Response:

```json
{
  "message": "Employee deleted successfully"
}
```

---

# 🔐 Authentication Flow

1. User logs in via Auth Service
2. JWT token generated
3. Token sent in request headers
4. Employee service validates token
5. Role checked via authorization middleware
6. Access granted or denied

---

# 🎟️ JWT Example Payload

```json
{
  "id": "6a038c430fe12d986bee3c79",
  "role": "HR",
  "iat": 1779673765,
  "exp": 1780278565
}
```

---

# 🔗 Microservice Dependency

* Auth Service → Identity & JWT issuance
* Employee Service → Uses Auth Service token validation
* Cross-service communication via `userId`

---

# 📁 Document System

Employees can store documents:

```json
{
  "documentType": "NID",
  "fileUrl": "https://storage/file.pdf",
  "uploadDate": "2026-01-01"
}
```

---

# ⚠️ Standard Error Format

```json
{
  "success": false,
  "message": "Error description"
}
```

---

# 🧠 System Design Highlights

* Microservice architecture
* Stateless authentication (JWT)
* Role-based access control (RBAC)
* Scalable MongoDB schema with indexing
* Manager hierarchy support (`managerId`)
* Clean separation of concerns

---

# 🚀 Future Improvements

* Pagination & filtering (department, role)
* File upload (S3 / Cloudinary)
* Audit logs for employee changes
* Event-driven sync with Auth Service
* API Gateway integration
