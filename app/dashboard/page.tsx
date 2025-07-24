import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ maxWidth: '600px', width: '100%', backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', backgroundColor: '#8b5cf6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem' }}>
          📊
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>Dashboard</h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          Welcome to your dashboard! This is where you&apos;ll manage your partnerships and collaborations.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: 'white', 
            border: '1px solid #d1d5db', 
            borderRadius: '0.5rem', 
            textDecoration: 'none', 
            color: '#374151',
            fontSize: '1rem'
          }}>
            ← Back to Home
          </Link>
          <Link href="/sign-in" style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: '#8b5cf6', 
            color: 'white', 
            borderRadius: '0.5rem', 
            textDecoration: 'none',
            fontSize: '1rem'
          }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}