import React, { useState } from 'react';
import './DocumentUpload.css';
import { uploadDocument } from '../services/api';

const DocumentUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');

    if (!selectedFile) {
      return;
    }

    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a PDF file');
      setFile(null);
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      await uploadDocument(file);
      setFile(null);
      e.target.reset();
      onUploadSuccess();
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to upload file. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Medical Document</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="file-input-wrapper">
          <input
            type="file"
            id="file-input"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <label htmlFor="file-input" className="file-label">
            {file ? file.name : 'Choose PDF file'}
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          type="submit"
          disabled={!file || uploading}
          className="upload-button"
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>
    </div>
  );
};

export default DocumentUpload;

