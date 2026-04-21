import { useSearchParams, Link } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';

export default function PaymentResultPage({ variant }) {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const mock = searchParams.get('mock');

  const isCancelled = variant === 'cancel';

  return (
    <PageShell title={isCancelled ? 'Payment Cancelled' : 'Payment Successful'}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        padding: '3rem 1rem',
        textAlign: 'center',
      }}>
        {isCancelled ? (
          <>
            <div style={{ fontSize: '3rem' }}>✗</div>
            <h2 style={{ color: '#ef4444', margin: 0 }}>Payment Cancelled</h2>
            <p style={{ color: '#94a3b8', maxWidth: 400 }}>
              Your payment was not completed. No charges were made.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: '3rem' }}>✓</div>
            <h2 style={{ color: '#22c55e', margin: 0 }}>Payment Successful!</h2>
            <p style={{ color: '#94a3b8', maxWidth: 400 }}>
              Thank you for your payment. Your invoice will be marked as paid shortly.
              {sessionId && <span style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginTop: '0.5rem' }}>Session: {sessionId}</span>}
            </p>
          </>
        )}
        <Link
          to="/my-requests"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.6rem 1.5rem',
            background: '#0096FF',
            color: '#fff',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '0.9rem',
            textDecoration: 'none',
            marginTop: '0.5rem',
          }}
        >
          Go to My Requests
        </Link>
      </div>
    </PageShell>
  );
}
