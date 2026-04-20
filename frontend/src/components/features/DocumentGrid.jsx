import { FileIcon } from '../ui/FileIcon';
import { StatusBadge } from '../ui/StatusBadge';
import { toggleDeliverable, deleteDocument } from '../../services/documentsService';
import { useToast } from '../../context/ToastContext';
import './DocumentGrid.css';

const CATEGORY_LABELS = {
  PRE_INSPECTION: 'Pre-Inspection', AERIAL_PHOTO: 'Aerial Photo', AERIAL_VIDEO: 'Aerial Video',
  DAMAGE_PHOTO: 'Damage Photo', THERMAL: 'Thermal', ORTHOMOSAIC: 'Orthomosaic',
  INSPECTION_REPORT: 'Inspection Report', CLIENT_DOCUMENT: 'Client Document', INVOICE: 'Invoice', OTHER: 'Other',
};

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentGrid({ documents, onRefresh, canEdit = true }) {
  const { showToast } = useToast();

  const handleToggle = async (doc) => {
    try {
      await toggleDeliverable(doc.id, !doc.isDeliverable);
      onRefresh?.();
      showToast({
        title: "Visibility updated",
        description: doc.isDeliverable ? "Document hidden from client." : "Document is now visible to the client.",
        variant: "success",
      });
    } catch {
      showToast({
        title: "Update failed",
        description: "Failed to update client visibility.",
        variant: "error",
      });
    }
  };

  const handleDelete = async (doc) => {
    if (!confirm(`Delete "${doc.fileName}"?`)) return;
    try {
      await deleteDocument(doc.id);
      onRefresh?.();
      showToast({
        title: "Document deleted",
        description: `"${doc.fileName}" was removed.`,
        variant: "success",
      });
    } catch {
      showToast({
        title: "Delete failed",
        description: "Failed to delete document.",
        variant: "error",
      });
    }
  };

  const handleDownload = (doc) => {
    window.open(doc.downloadUrl, '_blank');
  };

  if (!documents?.length) {
    return <p className="doc-grid__empty">No documents uploaded yet.</p>;
  }

  return (
    <div className="doc-grid">
      {documents.map((doc) => (
        <div key={doc.id} className="doc-tile">
          <div className="doc-tile__preview" onClick={() => handleDownload(doc)}>
            {doc.thumbnailPath ? (
              <img src={`/uploads/${doc.thumbnailPath.replace(/\\/g, '/').split('uploads/').pop()}`}
                alt={doc.fileName} className="doc-tile__thumb" />
            ) : (
              <FileIcon fileType={doc.fileType} size="lg" />
            )}
          </div>
          <div className="doc-tile__info">
            <div className="doc-tile__name" title={doc.fileName}>{doc.fileName}</div>
            <div className="doc-tile__meta">
              <span className="doc-tile__cat">{CATEGORY_LABELS[doc.category] || doc.category}</span>
              {doc.fileSizeBytes && <span>{formatBytes(doc.fileSizeBytes)}</span>}
            </div>
            {canEdit && (
              <div className="doc-tile__actions">
                <button
                  className={`doc-tile__visibility${doc.isDeliverable ? ' doc-tile__visibility--on' : ''}`}
                  onClick={() => handleToggle(doc)}
                  title={doc.isDeliverable ? 'Client can see this' : 'Not visible to client'}
                >
                  {doc.isDeliverable ? '👁 Client visible' : '🙈 Hidden'}
                </button>
                <button className="doc-tile__delete" onClick={() => handleDelete(doc)} title="Delete">🗑</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
