import { createContext, useCallback, useContext, useState } from 'react';
import { getJobDocuments } from '../services/documentsService';

const DocumentContext = createContext(null);

export function DocumentProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeJobId, setActiveJobId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const fetchDocuments = useCallback(async (jobId) => {
    setLoading(true);
    setActiveJobId(jobId);
    try {
      const res = await getJobDocuments(jobId);
      setDocuments(res.data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredDocuments =
    categoryFilter === 'ALL'
      ? documents
      : documents.filter((d) => d.category === categoryFilter);

  return (
    <DocumentContext.Provider
      value={{
        documents,
        setDocuments,
        filteredDocuments,
        loading,
        uploading,
        setUploading,
        uploadProgress,
        setUploadProgress,
        activeJobId,
        categoryFilter,
        setCategoryFilter,
        fetchDocuments,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error('useDocuments must be used within DocumentProvider');
  return ctx;
}
