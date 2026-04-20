import './InsuranceDetailsCard.css';

const LOSS_LABELS = {
  STORM: 'Storm', FIRE: 'Fire', WATER: 'Water', WIND: 'Wind',
  HAIL: 'Hail', VANDALISM: 'Vandalism', OTHER: 'Other',
};

export function InsuranceDetailsCard({ details }) {
  if (!details) return null;
  return (
    <div className="ins-card">
      <div className="ins-card__header">
        <span className="ins-card__badge">🏛 Insurance</span>
        <span className="ins-card__company">{details.insuranceCompany}</span>
      </div>
      <div className="ins-card__grid">
        <div className="ins-card__field">
          <span className="ins-card__label">Claim #</span>
          <span className="ins-card__value">{details.claimNumber}</span>
        </div>
        {details.policyNumber && (
          <div className="ins-card__field">
            <span className="ins-card__label">Policy #</span>
            <span className="ins-card__value">{details.policyNumber}</span>
          </div>
        )}
        {details.lossType && (
          <div className="ins-card__field">
            <span className="ins-card__label">Loss Type</span>
            <span className="ins-card__value">{LOSS_LABELS[details.lossType] || details.lossType}</span>
          </div>
        )}
        {details.lossDate && (
          <div className="ins-card__field">
            <span className="ins-card__label">Loss Date</span>
            <span className="ins-card__value">{new Date(details.lossDate).toLocaleDateString()}</span>
          </div>
        )}
        {details.adjusterName && (
          <div className="ins-card__field">
            <span className="ins-card__label">Adjuster</span>
            <span className="ins-card__value">{details.adjusterName}</span>
          </div>
        )}
        {details.adjusterEmail && (
          <div className="ins-card__field">
            <span className="ins-card__label">Email</span>
            <span className="ins-card__value">{details.adjusterEmail}</span>
          </div>
        )}
      </div>
      {details.inspectionScope && (
        <div className="ins-card__scope">
          <span className="ins-card__label">Scope</span>
          <p>{details.inspectionScope}</p>
        </div>
      )}
    </div>
  );
}
