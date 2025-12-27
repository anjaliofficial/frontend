import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <section style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {children}
        </section>
    );
}
