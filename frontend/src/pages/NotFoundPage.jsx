import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(80px, 20vw, 160px)', lineHeight: 1, color: 'var(--border-light)', marginBottom: 0 }}>404</h1>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--white)', marginBottom: 12 }}>Page Not Found</p>
      <p style={{ color: 'var(--white-muted)', marginBottom: 32, maxWidth: 360 }}>The page you're looking for doesn't exist or was moved.</p>
      <Link to="/" className="btn btn-primary btn-lg">Back to Home</Link>
    </div>
  )
}
