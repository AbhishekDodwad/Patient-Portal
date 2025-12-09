import React, { useState } from 'react';
import './DocumentList.css';
import { downloadDocument, deleteDocument } from '../services/api';

const DocumentList = ({ documents, loading, onDeleteSuccess }) => {
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = async (id, filename) => {
    setDownloadingId(id);
    try {
      await downloadDocument(id, filename);
    } catch (error) {
      alert('Failed to download file. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteDocument(id);
      onDeleteSuccess();
    } catch (error) {
      alert('Failed to delete document. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="document-list-container">
        <div className="loading">Loading documents...</div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="document-list-container">
        <h2>Your Documents</h2>
        <div className="empty-state">
          <p>No documents uploaded yet.</p>
          <p>Upload your first medical document above.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="document-list-container">
      <h2>Your Documents ({documents.length})</h2>
      <div className="document-list">
        {documents.map((doc) => (
          <div key={doc.id} className="document-item">
            <div className="document-info">
              <div className="document-icon">📄</div>
              <div className="document-details">
                <h3 className="document-name">{doc.filename}</h3>
                <div className="document-meta">
                  <span className="document-size">{formatFileSize(doc.filesize)}</span>
                  <span className="document-separator">•</span>
                  <span className="document-date">{formatDate(doc.created_at)}</span>
                </div>
              </div>
            </div>
            <div className="document-actions">
              <button
                className="action-button download-button"
                onClick={() => handleDownload(doc.id, doc.filename)}
                disabled={downloadingId === doc.id}
              >
                {downloadingId === doc.id ? 'Downloading...' : 'Download'}
              </button>
              <button
                className="action-button delete-button"
                onClick={() => handleDelete(doc.id)}
                disabled={deletingId === doc.id}
              >
                {deletingId === doc.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;

