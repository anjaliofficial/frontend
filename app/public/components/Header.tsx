import Link from 'next/link';

export default function Header() {
    const navItemStyle = {
        textDecoration: 'none',
        color: '#475569',
        fontSize: '14px',
        fontWeight: 500,
    };

    return (
        <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 48px',
            backgroundColor: 'white',
            borderBottom: '1px solid #f1f5f9',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            fontFamily: 'sans-serif'
        }}>
            {/* Branding */}
            <Link href="/" style={{ textDecoration: 'none', fontSize: '24px', fontWeight: 'bold', color: '#1a3a4a' }}>
                Sajilo Baas
            </Link>

            {/* Navigation */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <Link href="/about" style={navItemStyle}>About Us</Link>
                <Link href="/dashboard" style={navItemStyle}>My Dashboard</Link>
                <Link href="#" style={navItemStyle}>Help</Link>
            </nav>

            {/* Auth Buttons - Updated Paths */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Link href="/auth/login" style={{
                    textDecoration: 'none', color: '#1a3a4a', fontWeight: 600, padding: '8px 16px'
                }}>Login</Link>

                <Link href="/auth/register" style={{
                    textDecoration: 'none', backgroundColor: '#2563eb', color: 'white',
                    padding: '10px 24px', borderRadius: '10px', fontWeight: 600
                }}>Sign Up</Link>
            </div>
        </header>
    );
}