import { useState } from 'react';
import { DropZone } from '../ui/DropZone';
import { ProgressBar } from '../ui/ProgressBar';
import { uploadDocument } from '../../services/documentsService';
import { useToast } from '../../context/ToastContext';
import './DocumentUploader.css';

const CATEGORIES = [
  'PRE_INSPECTION', 'AERIAL_PHOTO', 'AERIAL_VIDEO', 'DAMAGE_PHOTO',
  'THERMAL', 'ORTHOMOSAIC', 'INSPECTION_REPORT', 'CLIENT_DOCUMENT', 'INVOICE', 'OTHER',
];

const CATEGORY_LABELS = {
  PRE_INSPECTION: 'Pre-Inspection', AERIAL_PHOTO: 'Aerial Photo', AERIAL_VIDEO: 'Aerial Video',
  DAMAGE_PHOTO: 'Damage Photo', THERMAL: 'Thermal', ORTHOMOSAIC: 'Orthomosaic',
  INSPECTION_REPORT: 'Inspection Report', CLIENT_DOCUMENT: 'Client Document', INVOICE: 'Invoice', OTHER: 'Other',
};

export function DocumentUploader({ jobId, missionId, onUploaded }) {
  const { showToast } = useToast();
  const [category, setCategory] = useState('AERIAL_PHOTO');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isDeliverable, setIsDeliverable] = useState(false);
  const [uploads, setUploads] = useState([]);

  const handleFiles = async (files) => {
    const newUploads = files.map((f) => ({ file: f, progress: 0, done: false, error: null }));
    setUploads((prev) => [...prev, ...newUploads]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('jobId', jobId);
      if (missionId) formData.append('missionId', missionId);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('tags', tags);
      formData.append('isDeliverable', String(isDeliverable));

      try {
        await uploadDocument(formData);
        setUploads((prev) => prev.map((u, idx) => {
          const globalIdx = prev.length - files.length + i;
          return idx === globalIdx ? { ...u, progress: 100, done: true } : u;
        }));
        if (onUploaded) onUploaded();
      } catch (err) {
        const msg = err?.response?.data?.message || 'Upload failed';
        setUploads((prev) => prev.map((u, idx) => {
          const globalIdx = prev.length - files.length + i;
          return idx === globalIdx ? { ...u, error: msg } : u;
        }));
        showToast({
          title: "Upload failed",
          description: msg,
          variant: "error",
        });
      }
    }
  };

  return (
    <div className="doc-uploader">
      <div className="doc-uploader__controls">
        <label className="doc-uploader__label">
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="doc-uploader__select">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </label>
        <label className="doc-uploader__label">
          Description
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            className="doc-uploader__input"
          />
        </label>
        <label className="doc-uploader__label">
          Tags (comma-separated)
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. roof, north-side, hail"
            className="doc-uploader__input"
          />
        </label>
        <label className="doc-uploader__checkbox">
          <input
            type="checkbox"
            checked={isDeliverable}
            onChange={(e) => setIsDeliverable(e.target.checked)}
          />
          <span>Visible to client</span>
        </label>
      </div>
      <DropZone
        onFiles={handleFiles}
        accept="image/*,video/mp4,video/quicktime,application/pdf,.docx,.kml,.tiff"
        multiple
      />
      {uploads.length > 0 && (
        <div className="doc-uploader__progress-list">
          {uploads.map((u, i) => (
            <div key={i} className="doc-uploader__progress-item">
              {u.error ? (
                <span className="doc-uploader__error">❌ {u.file.name} — {u.error}</span>
              ) : (
                <ProgressBar value={u.done ? 100 : u.progress} label={u.file.name} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
