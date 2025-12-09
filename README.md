# Patient Portal - Medical Document Management System

A full-stack web application that allows users to upload, view, download, and delete medical documents (PDFs). Built with React frontend, Express.js backend, and PostgreSQL database.

## Project Overview

This application provides a simple patient portal interface for managing medical documents. Users can:
- Upload PDF files (prescriptions, test results, referral notes)
- View all uploaded documents in a list
- Download any document
- Delete documents when no longer needed

## Tech Stack

- **Frontend:** React 18, Axios
- **Backend:** Node.js, Fastify, @fastify/multipart
- **Database:** PostgreSQL
- **File Storage:** Local filesystem (`uploads/` directory)

## Project Structure

```
INI8/
├── frontend/              # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API service layer
│   │   └── App.js
│   └── package.json
├── backend/              # Fastify backend API
│   ├── config/           # Database configuration
│   ├── controllers/      # Request handlers
│   ├── database/         # Database schema and initialization
│   ├── middleware/       # Multer upload middleware
│   ├── routes/           # API routes
│   ├── uploads/          # Uploaded files (created at runtime)
│   └── server.js
├── design.md             # Design document with architecture and decisions
└── README.md             # This file
```

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v14 or higher) and npm
- **PostgreSQL** (v12 or higher)
- **Git** (for cloning the repository)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd INI8
```

### 2. Set Up PostgreSQL Database

#### Option A: Using the PowerShell Setup Script (Windows - Recommended)

If `psql` is not in your PATH, use the provided PowerShell script:

```powershell
cd backend
.\setup-database.ps1
```

The script will:
- Automatically find PostgreSQL installation
- Prompt for database credentials
- Create the database and initialize the schema

#### Option B: Add PostgreSQL to PATH (Windows)

If PostgreSQL is installed but `psql` is not recognized:

1. Find your PostgreSQL installation (usually `C:\Program Files\PostgreSQL\16\bin\` or similar)
2. Add it to PATH temporarily:
   ```powershell
   $env:Path += ";C:\Program Files\PostgreSQL\16\bin"
   ```
3. Or add it permanently via System Environment Variables

Then run:
```bash
psql -U postgres
CREATE DATABASE patient_portal;
\q
```

#### Option C: Using pgAdmin (GUI)

1. Open **pgAdmin** (installed with PostgreSQL)
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → "Create" → "Database"
4. Name it `patient_portal`
5. Right-click on the new database → "Query Tool"
6. Copy and paste the contents of `backend/database/schema.sql`
7. Execute the query (F5)

#### Option D: Manual SQL Script

1. Open `backend/setup-database.sql` in pgAdmin Query Tool
2. Run the commands step by step

#### Initialize Schema (if using Option B, C, or D)

After creating the database:

```bash
cd backend
npm install
node database/init.js
```

Or manually run:
```bash
psql -U postgres -d patient_portal -f database/schema.sql
```

### 3. Configure Backend Environment

1. **Create `.env` file in the `backend/` directory:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit `.env` with your PostgreSQL credentials:**
   ```env
   PORT=3001
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=patient_portal
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   ```

### 4. Install Backend Dependencies

```bash
cd backend
npm install
```

### 5. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Running the Application

### Start the Backend Server

```bash
cd backend
npm start
```

The backend server will run on `http://localhost:3001`

For development with auto-reload:
```bash
npm run dev
```

### Start the Frontend Application

Open a new terminal window:

```bash
cd frontend
npm start
```

The frontend will automatically open in your browser at `http://localhost:3000`

## API Endpoints

### Base URL
```
http://localhost:3001/api/documents
```

### 1. Upload a PDF File

**Endpoint:** `POST /api/documents/upload`

**Request:**
```bash
curl -X POST http://localhost:3001/api/documents/upload \
  -F "file=@/path/to/your/document.pdf"
```

**Response:**
```json
{
  "message": "File uploaded successfully",
  "document": {
    "id": 1,
    "filename": "1699123456789-123456789-document.pdf",
    "filesize": 245678,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. List All Documents

**Endpoint:** `GET /api/documents`

**Request:**
```bash
curl -X GET http://localhost:3001/api/documents
```

**Response:**
```json
{
  "documents": [
    {
      "id": 1,
      "filename": "1699123456789-123456789-document.pdf",
      "filesize": 245678,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 3. Download a Document

**Endpoint:** `GET /api/documents/:id`

**Request:**
```bash
curl -X GET http://localhost:3001/api/documents/1 \
  -o downloaded-file.pdf
```

**Response:** Binary PDF file

### 4. Delete a Document

**Endpoint:** `DELETE /api/documents/:id`

**Request:**
```bash
curl -X DELETE http://localhost:3001/api/documents/1
```

**Response:**
```json
{
  "message": "Document deleted successfully",
  "id": 1
}
```

## Using Postman

### Upload File
1. Create a new POST request to `http://localhost:3001/api/documents/upload`
2. Go to the **Body** tab
3. Select **form-data**
4. Add a key named `file` with type **File**
5. Select a PDF file
6. Send the request

### List Documents
1. Create a new GET request to `http://localhost:3001/api/documents`
2. Send the request

### Download File
1. Create a new GET request to `http://localhost:3001/api/documents/:id`
2. Replace `:id` with the document ID (e.g., `1`)
3. Send the request
4. Save the response as a file

### Delete File
1. Create a new DELETE request to `http://localhost:3001/api/documents/:id`
2. Replace `:id` with the document ID
3. Send the request

## Features

-  PDF file upload with validation
-  File size limit (10MB)
-  List all uploaded documents
-  Download documents
-  Delete documents
-  Responsive UI design
-  Success/error message notifications
-  File metadata storage in PostgreSQL

## File Storage

Uploaded files are stored in the `backend/uploads/` directory. Files are renamed with a unique identifier to prevent naming conflicts:
- Format: `{timestamp}-{random}-{originalname}.pdf`
- Example: `1699123456789-123456789-prescription.pdf`

## Database Schema

The `documents` table has the following structure:

| Column     | Type      | Description                    |
|------------|-----------|--------------------------------|
| id         | SERIAL    | Primary key, auto-increment    |
| filename   | VARCHAR   | Stored filename                |
| filepath   | VARCHAR   | Full path to file              |
| filesize   | BIGINT    | File size in bytes             |
| created_at | TIMESTAMP | Upload timestamp (auto)        |

## Troubleshooting

### Backend won't start
- Check that PostgreSQL is running
- Verify database credentials in `.env` file
- Ensure database `patient_portal` exists
- Check that port 3001 is not in use

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check CORS configuration in `backend/server.js`
- Verify API URL in `frontend/src/services/api.js`

### File upload fails
- Ensure `backend/uploads/` directory exists (created automatically)
- Check file size is under 10MB
- Verify file is a PDF (`.pdf` extension, `application/pdf` MIME type)

### Database connection errors
- Verify PostgreSQL is installed and running
- Check database credentials in `.env` file
- Ensure database exists: `CREATE DATABASE patient_portal;`
- Run schema initialization: `node backend/database/init.js`
- **Windows users:** If `psql` is not recognized:
  - Use the PowerShell script: `backend\setup-database.ps1`
  - Or use pgAdmin GUI to create the database
  - Or add PostgreSQL bin directory to PATH

## Development Notes

- Backend runs on port **3001**
- Frontend runs on port **3000**
- Database uses default PostgreSQL port **5432**
- File uploads limited to **10MB** per file
- Only **PDF files** are accepted

## Future Enhancements

For production use, consider:
- User authentication and authorization
- Cloud storage integration (AWS S3, Azure Blob)
- File encryption
- Virus scanning
- Audit logging
- Pagination for large document lists
- Search and filter functionality
- File versioning
- HTTPS/TLS encryption
- Rate limiting
- Comprehensive error logging

## License

This project is created for assignment purposes.

## Contact

For questions or issues, please refer to the design document (`design.md`) for detailed architecture and decision explanations.

