import Link from 'next/link';

export default function TestPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Test Page</h1>
      <p>If you can see this, the server is working!</p>
      <Link href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
        Back to Home
      </Link>
    </div>
  );
}