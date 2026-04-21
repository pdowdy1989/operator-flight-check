import { useEffect, useState } from 'react';
import PageShell from '../components/ui/PageShell';
import profileService from '../services/profileService';
import './ProfilePage.css';

const LOSS_TYPES = ['STORM', 'FIRE', 'WATER', 'WIND', 'HAIL', 'VANDALISM', 'OTHER'];
const PROPERTY_TYPES = ['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'AGRICULTURAL'];

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    profileService.getMyProfile()
      .then(data => {
        setProfile(data);
        setForm(data || {});
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    // Only send non-null changed fields
    const payload = {};
    Object.keys(form).forEach(key => {
      if (form[key] !== '' && form[key] != null) {
        payload[key] = form[key];
      }
    });

    try {
      const updated = await profileService.updateMyProfile(payload);
      setProfile(updated);
      setForm(updated || form);
      setSuccessMsg('Profile updated successfully.');
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const isCompany = profile?.role === 'COMPANY';

  return (
    <PageShell title="My Profile" subtitle="Manage your account information">
      {loading ? (
        <div className="prof-loading">Loading profile...</div>
      ) : (
        <form className="prof-form" onSubmit={handleSave}>
          {successMsg && <div className="prof-success">{successMsg}</div>}
          {errorMsg && <div className="prof-error">{errorMsg}</div>}

          {/* Basic Info */}
          <section className="prof-section">
            <h2 className="prof-section__title">Basic Information</h2>
            <div className="prof-grid">
              <div className="prof-field">
                <label>First Name</label>
                <input value={form.firstName || ''} onChange={handleChange('firstName')} />
              </div>
              <div className="prof-field">
                <label>Last Name</label>
                <input value={form.lastName || ''} onChange={handleChange('lastName')} />
              </div>
              <div className="prof-field">
                <label>Email</label>
                <input type="email" value={form.email || ''} onChange={handleChange('email')} />
              </div>
              <div className="prof-field">
                <label>Phone</label>
                <input value={form.phone || ''} onChange={handleChange('phone')} />
              </div>
            </div>
          </section>

          {/* Business Info (COMPANY only) */}
          {isCompany && (
            <section className="prof-section">
              <h2 className="prof-section__title">Business Information</h2>
              <div className="prof-grid">
                <div className="prof-field">
                  <label>Company Name</label>
                  <input value={form.companyName || ''} onChange={handleChange('companyName')} />
                </div>
                <div className="prof-field">
                  <label>Business Type</label>
                  <input value={form.businessType || ''} onChange={handleChange('businessType')} />
                </div>
                <div className="prof-field">
                  <label>Tax ID / EIN</label>
                  <input value={form.taxId || ''} onChange={handleChange('taxId')} />
                </div>
                <div className="prof-field">
                  <label>Website</label>
                  <input type="url" value={form.website || ''} onChange={handleChange('website')} />
                </div>
              </div>
            </section>
          )}

          {/* Billing Address */}
          <section className="prof-section">
            <h2 className="prof-section__title">Billing Address</h2>
            <div className="prof-grid">
              <div className="prof-field prof-field--full">
                <label>Street Address</label>
                <input value={form.billingAddress || ''} onChange={handleChange('billingAddress')} />
              </div>
              <div className="prof-field">
                <label>City</label>
                <input value={form.billingCity || ''} onChange={handleChange('billingCity')} />
              </div>
              <div className="prof-field">
                <label>State</label>
                <input value={form.billingState || ''} onChange={handleChange('billingState')} />
              </div>
              <div className="prof-field">
                <label>ZIP Code</label>
                <input value={form.billingZip || ''} onChange={handleChange('billingZip')} />
              </div>
            </div>
          </section>

          {/* Insurance Info */}
          <section className="prof-section">
            <h2 className="prof-section__title">Insurance Information</h2>
            <div className="prof-grid">
              <div className="prof-field">
                <label>Insurance Company</label>
                <input value={form.insuranceCompany || ''} onChange={handleChange('insuranceCompany')} />
              </div>
              <div className="prof-field">
                <label>Policy Number</label>
                <input value={form.insurancePolicyNumber || ''} onChange={handleChange('insurancePolicyNumber')} />
              </div>
              <div className="prof-field">
                <label>Adjuster Name</label>
                <input value={form.adjusterName || ''} onChange={handleChange('adjusterName')} />
              </div>
              <div className="prof-field">
                <label>Adjuster Email</label>
                <input type="email" value={form.adjusterEmail || ''} onChange={handleChange('adjusterEmail')} />
              </div>
            </div>
          </section>

          <div className="prof-actions">
            <button type="submit" className="prof-btn prof-btn--primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </PageShell>
  );
}
