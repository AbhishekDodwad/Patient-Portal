import React, { useState, useEffect } from 'react';
import './App.css';
import DocumentUpload from './components/DocumentUpload';
import DocumentList from './components/DocumentList';
import { getDocuments } from './services/api';

function App() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await getDocuments();
      setDocuments(data.documents || []);
    } catch (error) {
      showMessage('error', 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 5000);
  };

  const handleUploadSuccess = () => {
    showMessage('success', 'File uploaded successfully!');
    fetchDocuments();
  };

  const handleDeleteSuccess = () => {
    showMessage('success', 'Document deleted successfully!');
    fetchDocuments();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Patient Portal</h1>
        <p>Manage your medical documents</p>
      </header>

      <main className="App-main">
        {message.text && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        <DocumentUpload onUploadSuccess={handleUploadSuccess} />

        <DocumentList
          documents={documents}
          loading={loading}
          onDeleteSuccess={handleDeleteSuccess}
        />
      </main>
    </div>
  );
}

export default App;

