const ICONS = {
  PHOTO: '📷',
  VIDEO: '🎥',
  PDF: '📄',
  REPORT: '📋',
  INVOICE: '🧾',
  RECEIPT: '🧾',
  MAP: '🗺️',
  OTHER: '📎',
};

export function FileIcon({ fileType, size = 'md' }) {
  const icon = ICONS[fileType] || ICONS.OTHER;
  const fontSize = size === 'lg' ? '2rem' : size === 'sm' ? '0.9rem' : '1.2rem';
  return <span style={{ fontSize, lineHeight: 1 }}>{icon}</span>;
}
