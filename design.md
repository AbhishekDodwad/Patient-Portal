Patient Portal – Medical Document Management System
Design & Development Documentation

1. Project Overview

This project is a medical document portal where patients can upload, view, download, and delete their medical PDFs. The goal is to make document storage simple and reliable without involving complex features like hospital integration or patient authentication.

The core flow:

Upload a PDF → file gets saved to the server → metadata stored in PostgreSQL

Users can see a list of uploaded files with upload date and size

Users can download or delete any file

2. Tech Used
Area	Choice	Reason
Frontend	React	Easy UI management, reusable components
Backend	Fastify (Node.js)	Fast, lightweight, plugin support for file uploads
Database	PostgreSQL	Reliable for structured data and scalable beyond a single user
3. How to Run the Project Locally
Prerequisites

Node.js installed

PostgreSQL installed and running

Step-1: Setup Database

Create a database:

CREATE DATABASE patient_portal;


Create documents table:

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  filepath TEXT NOT NULL,
  filesize BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

Step-2: Backend Setup (Fastify)
cd backend
npm install


Create .env file in backend:

PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=yourpassword
PG_DATABASE=patient_portal


Start backend:

npm start


Backend runs on: http://localhost:3001

Step-3: Frontend Setup (React)
cd frontend
npm install
npm start


Frontend runs on: http://localhost:3000

4. Example API Calls (Postman)
1️ Upload a PDF
POST http://localhost:3001/api/documents/upload
Body → form-data
file : (select a PDF)

2️ List All Documents
GET http://localhost:3001/api/documents

3️ Download a Document
GET http://localhost:3001/api/documents/{id}


Example:

GET http://localhost:3001/api/documents/3

4️ Delete a Document
DELETE http://localhost:3001/api/documents/{id}


Example:

DELETE http://localhost:3001/api/documents/3

5. High-Level Functionality Flow (Short and Simple)
Action	What happens
Upload PDF	File saved in uploads/ + metadata saved in PostgreSQL
View documents	Fetch list from DB and show in UI
Download	API streams the PDF to browser
Delete	Delete file from server + delete row in DB
6. Assumptions Made

Single user system (no login)

Only PDF files up to 10MB

Local uploads folder used instead of cloud storage

Basic error validation only (not healthcare-grade security)