"use client";

export default function SplashScreen() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontFamily: 'sans-serif'
    }}>
      {/* Container for Logo and Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

        {/* The "S" Icon Box */}
        <div style={{
          width: '56px',
          height: '56px',
          backgroundColor: '#1a3a4a',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(26, 58, 74, 0.2)'
        }}>
          <span style={{
            color: 'white',
            fontSize: '28px',
            fontWeight: 'bold'
          }}>S</span>
        </div>

        {/* Brand Name */}
        <h1 style={{
          fontSize: '36px',
          fontWeight: '800',
          color: '#1a3a4a',
          margin: 0,
          letterSpacing: '-1px'
        }}>
          Sajilo Baas
        </h1>
      </div>

      {/* Loading Progress Bar */}
      <div style={{
        marginTop: '48px',
        width: '240px',
        height: '6px',
        backgroundColor: '#f1f5f9',
        borderRadius: '10px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          backgroundColor: '#1a3a4a',
          width: '0%',
          borderRadius: '10px',
          animation: 'fillProgress 2.5s ease-in-out forwards'
        }}></div>
      </div>

      {/* Subtext */}
      <p style={{
        marginTop: '20px',
        fontSize: '14px',
        color: '#94a3b8',
        fontWeight: '500',
        letterSpacing: '1px'
      }}>
        NEPAL STAYS
      </p>

      {/* Animation Logic */}
      <style>{`
        @keyframes fillProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}