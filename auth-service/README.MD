 ---

# 📌 Auth Service – HR Management Microservices

This service handles authentication and user identity management for the HR Management system.

It is responsible for:

* User registration
* User login
* JWT token generation
* Password hashing & validation
* User verification for other microservices

---

# 🏗️ Tech Stack

* Node.js
* Express.js
* MongoDB (Atlas)
* Mongoose
* bcrypt
* JWT (JSON Web Token)

---

# 📦 User Model

```js
{
  email: String (unique, required),
  password: String (hashed using bcrypt),
  role: ["ADMIN", "HR", "MANAGER", "employee"],
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

---

# 🔐 Authentication Flow

1. User registers → password is hashed (bcrypt)
2. User logs in → password validated
3. JWT token generated on successful login
4. Token used for protected API access
5. Other services (Employee Service) call `/verify/:userId`

---

# 🚀 Base URL

```
/auth
```

---

# 📌 API Documentation

---

## 🔹 1. Register User

### ➤ Endpoint

```
POST /auth/register
```

### ➤ Description

Creates a new user account.

---

### ➤ Request Body

```json
{
  "email": "user@example.com",
  "password": "123456",
  "role": "employee"
}
```

> ⚠️ Role is optional (default: employee)

---

### ➤ Success Response

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "64f1c2a9b1c2d3e4f5a6b7c8",
    "email": "user@example.com",
    "role": "employee"
  }
}
```

---

### ➤ Error Responses

#### Email already exists

```json
{
  "message": "User already exists"
}
```

#### Validation error

```json
{
  "message": "Invalid input data"
}
```

---

## 🔹 2. Login User

### ➤ Endpoint

```
POST /auth/login
```

---

### ➤ Description

Authenticate user and returns JWT token.

---

### ➤ Request Body

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

---

### ➤ Success Response

```json
{
  "message": "Login successful",
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": "64f1c2a9b1c2d3e4f5a6b7c8",
    "email": "user@example.com",
    "role": "employee"
  }
}
```

---

### ➤ Notes

* Password is validated using `bcrypt.compare()`
* JWT token is generated and returned
* Token should be sent in headers for protected routes

---

## 🔹 3. Verify User (Internal Service Communication)

### ➤ Endpoint

```
GET /auth/verify/:userId
```

---

### ➤ Description

Used by **Employee Service** to verify if a user exists.

---

### ➤ Params

```
userId: MongoDB ObjectId
```

---

### ➤ Success Response

```json
{
  "success": true,
  "user": {
    "id": "64f1c2a9b1c2d3e4f5a6b7c8",
    "email": "user@example.com",
    "role": "employee",
    "isActive": true
  }
}
```

---

### ➤ Failure Response

```json
{
  "success": false,
  "message": "User not found"
}
```

---

# 🔐 Password Security

* Passwords are hashed using **bcrypt (salt rounds: 10)**
* Password comparison is done using:

```js
bcrypt.compare(enteredPassword, hashedPassword)
```

---

# 🎟️ JWT Authentication

### ➤ Token Usage

Send token in request headers:

```
Authorization: Bearer <token>
```

---

### ➤ Token Payload (example)

```json
{
  "id": "userId",
  "email": "user@example.com",
  "role": "employee"
}
```

---

# 🔗 Microservice Integration

### Employee Service Integration

Employee service calls auth-service:

```
GET /auth/verify/:userId
```

Used for:

* Checking user existence
* Role validation
* Linking employee profile

---

# ⚠️ Error Format (Standard)

All errors follow this structure:

```json
{
  "success": false,
  "message": "Error description"
}
```

---

# 🧠 Notes (Important)

* MongoDB Atlas is used for production DB
* Auth service is independent microservice
* No session storage used (stateless JWT system)
* Password is never returned in any response

---

# 🚀 Future Improvements

* Refresh token system
* Role-based access middleware
* Rate limiting for login
* OTP-based verification
* Audit logging system

---