# API Reference

This document provides comprehensive documentation for all available API endpoints in the Samurai04 API.

## Base URL

```
http://localhost:3000
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents

- [Index Routes](#index-routes)
- [User Routes](#user-routes)
- [Data Routes](#data-routes)
- [Chat Routes](#chat-routes)

---

## Index Routes

### GET /

Serves the main HTML page.

**Authentication:** Not required

**Request:**
```http
GET / HTTP/1.1
Host: localhost:3000
```

**Success Response (200 OK):**
```html
<!DOCTYPE html>
<html>
  <!-- HTML content -->
</html>
```

**Error Response (500 Internal Server Error):**
```json
{
  "error": "Internal server error"
}
```

---

## User Routes

### GET /users

Returns a simple message indicating the users endpoint is available.

**Authentication:** Not required

**Request:**
```http
GET /users HTTP/1.1
Host: localhost:3000
```

**Success Response (200 OK):**
```
users endpoint
```

---

### POST /users/register

Register a new user account.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Request Example:**
```bash
curl --location 'http://localhost:3000/users/register' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "user@example.com",
  "password": "securePassword123"
}'
```

**Success Response (201 Created):**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "user",
    "email": "user@example.com"
  }
}
```

**Error Responses:**

**400 Bad Request - Missing Fields:**
```json
{
  "error": "Missing email, password"
}
```

**400 Bad Request - User Already Exists:**
```json
{
  "error": "User already exists"
}
```

---

### POST /users/login

Authenticate and log in an existing user.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Request Example:**
```bash
curl --location 'http://localhost:3000/users/login' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "user@example.com",
  "password": "securePassword123"
}'
```

**Success Response (200 OK):**
```json
{
  "message": "User logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "user",
    "email": "user@example.com",
    "isAdmin": false
  }
}
```

**Error Responses:**

**400 Bad Request - Missing Fields:**
```json
{
  "error": "Missing email, password"
}
```

**400 Bad Request - User Not Found:**
```json
{
  "error": "User not found"
}
```

**400 Bad Request - Invalid Password:**
```json
{
  "error": "Invalid password"
}
```

---

## Data Routes

### POST /data/receive-user-data

Upload a file (typically CSV) to be associated with the authenticated user's account. The file will be stored in a user-specific directory and a database record will be created.

**Authentication:** Required (JWT token)

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (required): The file to upload

**Request Example:**
```bash
curl --location 'http://localhost:3000/data/receive-user-data' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
--form 'file=@"/path/to/your/data.csv"'
```

**Success Response (201 Created):**
```json
{
  "ok": true,
  "message": "File uploaded and recorded.",
  "file": {
    "originalName": "user_data.csv",
    "savedAs": "user_data.csv",
    "absolutePath": "/path/to/storage/user_001/user_data.csv",
    "size": 2048,
    "mimeType": "text/csv"
  },
  "record": {
    "id": "1",
    "userId": "1",
    "pathToFile": "/path/to/storage/user_001/user_data.csv",
    "filename": "user_data.csv",
    "createdAt": "2025-10-14T18:00:00.000Z",
    "updatedAt": "2025-10-14T18:00:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request - Missing File:**
```json
{
  "ok": false,
  "error": "Missing file. Use field name 'file'."
}
```

**401 Unauthorized - Invalid Token:**
```json
{
  "ok": false,
  "error": "Unauthenticated or invalid token."
}
```

**500 Internal Server Error - Directory Creation Failed:**
```json
{
  "ok": false,
  "error": "PATH_TO_USER_CONTEXT_DATA env var is not set."
}
```

**500 Internal Server Error:**
```json
{
  "ok": false,
  "error": "Internal server error."
}
```

**Notes:**
- If a file with the same name already exists, the system will automatically append `_1`, `_2`, etc. to avoid overwriting
- The file is stored in memory first, then written to disk
- A database record is created to track the uploaded file

---

### GET /data/user-data-files-list

Retrieve a list of all files uploaded by the authenticated user. This endpoint returns the names of all files stored in the user's data directory, excluding system files.

**Authentication:** Required (JWT token)

**Request Example:**
```bash
curl --location 'http://localhost:3000/data/user-data-files-list/' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

**Success Response (200 OK):**
```json
{
  "result": true,
  "files": [
    "user_data.csv",
    "sleep_data.csv",
    "fitness_data_1.csv"
  ]
}
```

**Error Responses:**

**401 Unauthorized - Invalid Token:**
```json
{
  "result": false,
  "message": "Unauthenticated or invalid token."
}
```

**500 Internal Server Error - Directory Access Failed:**
```json
{
  "result": false,
  "message": "PATH_TO_USER_CONTEXT_DATA env var is not set."
}
```

**500 Internal Server Error:**
```json
{
  "result": false,
  "message": "Internal server error",
  "error": "Error message details"
}
```

**Notes:**
- Returns an array of filenames (not full paths)
- Automatically filters out `.DS_Store` files (macOS system files)
- Only shows files for the authenticated user
- Files are returned in the order they appear in the directory

---

### DELETE /data/user-data/:filename

Delete a specific file uploaded by the authenticated user. This endpoint removes both the file from the filesystem and its corresponding database record.

**Authentication:** Required (JWT token)

**URL Parameters:**
- `filename` (required): The exact filename to delete (e.g., `user_data.csv`)

**Request Example:**
```bash
curl --location --request DELETE 'http://localhost:3000/data/user-data/user_data.csv' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

**Success Response (200 OK):**
```json
{
  "result": true,
  "message": "File deleted successfully."
}
```

**Error Responses:**

**401 Unauthorized - Invalid Token:**
```json
{
  "result": false,
  "message": "Unauthenticated or invalid token."
}
```

**404 Not Found - File Does Not Exist:**
```json
{
  "result": false,
  "message": "File not found."
}
```

**500 Internal Server Error - Directory Access Failed:**
```json
{
  "result": false,
  "message": "PATH_TO_USER_CONTEXT_DATA env var is not set."
}
```

**500 Internal Server Error:**
```json
{
  "result": false,
  "message": "Internal server error",
  "error": "Error message details"
}
```

**Notes:**
- The filename parameter must match exactly (case-sensitive)
- Only the authenticated user can delete their own files
- Deletes both the physical file and the database record
- If the file doesn't exist in the filesystem, a 404 error is returned
- The operation is atomic - if the file deletion fails, the database record is not removed

---

## Chat Routes

### POST /chat/langflow

Send a user message to the Langflow AI service. This endpoint handles conversation management, retrieves user context data from uploaded CSV files, and forwards the complete conversation history to Langflow for processing.

**Authentication:** Required (JWT token)

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "conversationId": 1,
  "userMessage": "What was my average sleep in July?"
}
```

**Field Descriptions:**
- `conversationId` (number, optional): ID of an existing conversation. If not provided or null, a new conversation will be created.
- `userMessage` (string, required): The message from the user to send to the AI.

**Request Example:**
```bash
curl --location 'http://localhost:3000/chat/langflow' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
--data '{
  "conversationId": 1,
  "userMessage": "What was my average sleep in July?"
}'
```

**Success Response (200 OK):**
```json
{
  "message": "Response received",
  "conversationId": 1,
  "messageHistoryArray": [
    {
      "role": "user",
      "content": "What was my average sleep in July?"
    },
    {
      "role": "assistant",
      "content": "Based on your data, your average sleep in July was 6.8 hours per night."
    }
  ],
  "data": {
    "response": "Based on your data, your average sleep in July was 6.8 hours per night.",
    "metadata": {}
  }
}
```

**Response Field Descriptions:**
- `message`: Status message
- `conversationId`: The ID of the conversation (newly created or existing)
- `messageHistoryArray`: Complete conversation history with role and content
- `data`: Response data from Langflow webhook

**Error Responses:**

**401 Unauthorized - Invalid Token:**
```json
{
  "ok": false,
  "error": "Unauthenticated or invalid token."
}
```

**500 Internal Server Error:**
```json
{
  "ok": false,
  "error": "Internal server error."
}
```

**How It Works:**

1. **Conversation Management**: If no `conversationId` is provided, a new conversation is automatically created for the user
2. **Message Storage**: The user's message is saved to the database with role "user"
3. **Context Loading**: All CSV files previously uploaded by the user are loaded and parsed into JSON format
4. **Message History**: Complete conversation history is retrieved and base64-encoded for safe transport
5. **Langflow Request**: A formatted request is sent to the Langflow webhook with:
   - Conversation ID
   - Complete message history (base64 encoded)
   - User context data from CSV files
   - Input/output type indicators
6. **Response**: The complete conversation history and Langflow's response are returned

**Data Sent to Langflow:**
```json
{
  "conversationId": 1,
  "userMessageHistory": [
    {
      "role": "user",
      "content": "V2hhdCB3YXMgbXkgYXZlcmFnZSBzbGVlcCBpbiBKdWx5Pw==",
      "encoding": "base64"
    }
  ],
  "userContext": [
    {
      "description": "user_data",
      "data": [
        {
          "day": "2025-07-01",
          "score": "78",
          "total_sleep_hours": "6.23"
        }
      ]
    }
  ],
  "input_type": "chat",
  "output_type": "chat"
}
```

**Notes:**
- Message content is base64-encoded to ensure safe HTTP/JSON transport
- All user CSV files are automatically included as context
- CSV files are parsed with headers as keys
- Conversation history is ordered by creation time (oldest to newest)

---

## Environment Variables

The following environment variables must be configured:

- `PORT`: Server port (default: 3000)
- `JWT_SECRET`: Secret key for JWT token generation
- `PATH_TO_USER_CONTEXT_DATA`: Directory path for storing user data files
- `URL_LANGFLOW_WEBHOOK`: Langflow webhook URL for AI processing

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "error": "Error message description",
  "ok": false
}
```

Common HTTP status codes used:
- `200 OK`: Successful GET request
- `201 Created`: Successful POST request that creates a resource
- `400 Bad Request`: Invalid request body or missing required fields
- `401 Unauthorized`: Missing or invalid authentication token
- `500 Internal Server Error`: Server-side error

---

## Rate Limiting

Currently, no rate limiting is implemented. This should be added in production environments.

---

## CORS

CORS is enabled with credentials support. The following headers are exposed:
- `Content-Disposition`

---

## Security Notes

1. **Passwords**: All passwords are hashed using bcrypt (10 rounds) before storage
2. **JWT Tokens**: Tokens are signed with the JWT_SECRET environment variable
3. **File Uploads**: Files are validated and stored with unique names to prevent overwriting
4. **Authentication**: Protected endpoints require valid JWT tokens in the Authorization header
5. **Input Validation**: Request bodies are validated for required fields before processing
