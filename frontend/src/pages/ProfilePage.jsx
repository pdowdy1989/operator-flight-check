import { useEffect, useState } from 'react';
import PageShell from '../components/ui/PageShell';
import profileService from '../services/profileService';
import { AUTH_STORAGE_KEY, readJsonStorage, writeJsonStorage } from '../utils/authStorage';
import './ProfilePage.css';

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

    // Only send the fields UserProfileUpdateRequest accepts
    const ALLOWED_FIELDS = [
      'email', 'firstName', 'lastName', 'phone', 'company', 'licenseNumber',
      'businessName', 'ein', 'paymentTerms',
      'billingAddress', 'billingCity', 'billingState', 'billingZip',
      'insurancePolicyNumber', 'insuranceCompanyName',
    ];
    const payload = {};
    ALLOWED_FIELDS.forEach(key => {
      if (form[key] !== '' && form[key] != null) {
        payload[key] = form[key];
      }
    });

    try {
      const updated = await profileService.updateMyProfile(payload);
      setProfile(updated);
      setForm(updated || form);
      const storedSession = readJsonStorage(AUTH_STORAGE_KEY, null);

      if (storedSession?.token) {
        writeJsonStorage(AUTH_STORAGE_KEY, {
          ...storedSession,
          email: updated.email,
        });
      }

      setSuccessMsg('Profile updated successfully.');
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      setErrorMsg(msg ? `Error ${status ?? ''}: ${msg}`.trim() : 'Failed to update profile. Check the browser console for details.');
      console.error('Profile update failed:', err?.response ?? err);
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
                  <label>Business Name</label>
                  <input value={form.businessName || ''} onChange={handleChange('businessName')} />
                </div>
                <div className="prof-field">
                  <label>Company</label>
                  <input value={form.company || ''} onChange={handleChange('company')} />
                </div>
                <div className="prof-field">
                  <label>EIN</label>
                  <input value={form.ein || ''} onChange={handleChange('ein')} />
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
                <input value={form.insuranceCompanyName || ''} onChange={handleChange('insuranceCompanyName')} />
              </div>
              <div className="prof-field">
                <label>Policy Number</label>
                <input value={form.insurancePolicyNumber || ''} onChange={handleChange('insurancePolicyNumber')} />
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
