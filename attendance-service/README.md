# Attendance Service Implementation

## Overview
The Attendance Service is a microservice that manages employee check-in and check-out functionality with automatic duration calculation and validation against the Employee Service.

## Architecture & Design

### Request Flow
```
Client -> API Gateway -> Attendance Service -> Employee Service (for validation)
         (JWT/Token)    (userId extracted)
```

### Database Structure (MongoDB)

#### Attendance Collection Schema
```javascript
{
  _id: ObjectId,
  employeeId: ObjectId,  // Reference to employee
  userId: String,        // User ID for indexing
  attendance: [
    {
      date: "YYYY-MM-DD",
      checkIn: ISO8601DateTime,
      checkOut: ISO8601DateTime | null,
      duration: "X hours, Y minutes" | null
    }
  ],
  createdAt: ISO8601DateTime,
  updatedAt: ISO8601DateTime
}
```

**Indexes:**
- `userId` (indexed for fast lookups)
- `employeeId` (indexed for relationships)
- Unique compound index on `userId` + `attendance.date` (prevents duplicate check-ins per day)

## API Endpoints

### 1. Check-In Endpoint
**`POST /attendance/check-in`**

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request:**
```json
{}
```

**Response (Success - 200):**
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

**Response (Already Checked In - 400):**
```json
{
  "success": false,
  "message": "You have already checked in today"
}
```

**Response (Employee Not Found - 404):**
```json
{
  "success": false,
  "message": "Employee not found for this user"
}
```

### 2. Check-Out Endpoint
**`POST /attendance/check-out`**

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request:**
```json
{}
```

**Response (Success - 200):**
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

**Response (No Check-In Found - 400):**
```json
{
  "success": false,
  "message": "No check-in found for today"
}
```

**Response (Already Checked Out - 400):**
```json
{
  "success": false,
  "message": "You have already checked out today"
}
```

### 3. Get Attendance Record Endpoint
**`GET /attendance/record`**

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Attendance records fetched successfully",
  "data": {
    "_id": ObjectId,
    "employeeId": ObjectId,
    "userId": "user123",
    "attendance": [
      {
        "date": "2026-05-24",
        "checkIn": "2026-05-24T09:20:30.822Z",
        "checkOut": "2026-05-24T17:45:15.200Z",
        "duration": "8 hours, 24 minutes"
      },
      {
        "date": "2026-05-23",
        "checkIn": "2026-05-23T09:15:00.000Z",
        "checkOut": "2026-05-23T17:30:00.000Z",
        "duration": "8 hours, 15 minutes"
      }
    ],
    "createdAt": "2026-05-10T07:34:11.194Z",
    "updatedAt": "2026-05-24T17:45:15.200Z"
  }
}
```

## Business Rules & Validation

### Check-In Validation
1. ✅ User must be authenticated (valid JWT token)
2. ✅ User must have a valid employee profile in Employee Service
3. ✅ **Duplicate Prevention:** User can only check in once per calendar day
4. ✅ **Server-Side Timestamp:** Check-in time is always set by server (ISO 8601 format)
5. ✅ System prevents manual time input from client

### Check-Out Validation
1. ✅ User must be authenticated (valid JWT token)
2. ✅ User must have an active check-in for today
3. ✅ User cannot check out if already checked out
4. ✅ **Server-Side Timestamp:** Check-out time is always set by server
5. ✅ **Automatic Duration Calculation:** Calculates hours and minutes worked

### Error Handling
- **401 Unauthorized:** Missing or invalid JWT token
- **400 Bad Request:** Duplicate check-in, no check-in for check-out, invalid data
- **404 Not Found:** Employee record not found, user not found
- **500 Internal Server Error:** Database or service errors

## File Structure

```
attendance-service/
├── src/
│   ├── controller/
│   │   └── attendance.controller.js    # Route handlers (checkIn, checkOut)
│   ├── model/
│   │   └── attendance.model.js         # Mongoose schema definition
│   ├── routes/
│   │   └── attendanceRoutes.js         # Express routes
│   ├── attendanceService.js            # Business logic layer
│   ├── authMiddleware.js               # JWT authentication middleware
│   ├── db.js                           # MongoDB connection setup
│   └── server.js                       # Express app initialization
├── package.json
├── .env.example
└── README.md
```

## Implementation Details

### Duration Calculation
The `calculateDuration()` function:
1. Takes check-in and check-out Date objects
2. Calculates time difference in milliseconds
3. Converts to total minutes
4. Extracts hours and remaining minutes
5. Returns formatted string: `"X hours, Y minutes"`

**Example:**
- Check-in: 09:20:30
- Check-out: 17:45:15
- Difference: 8 hours, 24 minutes, 45 seconds
- Stored as: `"8 hours, 24 minutes"`

### Employee Verification
The service calls the Employee Service endpoint:
```
GET http://localhost:5002/employees?userId={userId}
```

- Verifies employee exists before allowing check-in
- Retrieves employeeId for record storage
- Throws error if employee not found (404)

### Date Handling
- **Format:** `YYYY-MM-DD` (ISO 8601 date only, no time)
- **Timezone:** Uses server's local timezone
- **Uniqueness:** Prevents multiple check-ins on same calendar day

## Key Features

### ✅ Duplicate Prevention
- Compound unique index on `userId` + `attendance.date`
- Check before inserting prevents concurrent check-ins

### ✅ Modular Design
- Service layer separates business logic
- Controllers handle HTTP requests
- Models define data structure
- Clean separation of concerns

### ✅ Error Handling
- Comprehensive error messages
- Proper HTTP status codes
- Graceful failure scenarios

### ✅ Security
- JWT-based authentication
- Employee validation via microservice call
- No client-side timestamp manipulation

## Environment Variables

```
MONGO_URI=mongodb://localhost:27017
ATTENDANCE_SERVICE_PORT=5003
JWT_SECRET=your_jwt_secret_key
EMPLOYEE_SERVICE_URL=http://localhost:5002
```

## Dependencies

- **express:** Web framework
- **mongoose:** MongoDB ODM
- **dotenv:** Environment variable management
- **cors:** Cross-origin resource sharing
- **jwt:** JSON Web Token verification
- **axios:** HTTP client for Employee Service calls

## Running the Service

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start the service
npm start

# Development mode with auto-reload
npm run dev
```

## Integration with API Gateway

The API Gateway should:
1. Extract `userId` from JWT token
2. Add it to request headers or body
3. Forward request to Attendance Service
4. Attendance Service extracts `userId` from `req.user.id` (set by authMiddleware)

**Example API Gateway Route:**
```javascript
app.post('/attendance/check-in', authMiddleware, (req, res) => {
  // Forward to Attendance Service
  axios.post('http://localhost:5003/attendance/check-in', req.body, {
    headers: { Authorization: req.headers.authorization }
  }).then(response => res.json(response.data));
});
```

## Example Usage

### Check-In
```bash
curl -X POST http://localhost:5003/attendance/check-in \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

### Check-Out
```bash
curl -X POST http://localhost:5003/attendance/check-out \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

### Get Records
```bash
curl -X GET http://localhost:5003/attendance/record \
  -H "Authorization: Bearer eyJhbGc..."
```

## Testing Checklist

- [ ] Check-in creates attendance record
- [ ] Duplicate check-in returns 400
- [ ] Check-out calculates duration correctly
- [ ] Check-out without check-in returns 400
- [ ] Employee verification fails for non-existent user
- [ ] Database uniqueness constraint prevents duplicates
- [ ] Invalid JWT returns 401
- [ ] Timestamps are server-generated
- [ ] Duration format is correct (X hours, Y minutes)
- [ ] Retrieved records show complete history

## Edge Cases Handled

1. **Multiple check-ins same day:** Blocked with "already checked in" message
2. **Check-out without check-in:** Blocked with "no check-in found" message
3. **Multiple check-outs same day:** Blocked with "already checked out" message
4. **Non-existent employee:** Employee Service validation fails
5. **Invalid JWT:** Middleware rejects request
6. **Concurrent requests:** Mongoose ensures data consistency
7. **Negative duration:** Prevented by check that check-out > check-in
