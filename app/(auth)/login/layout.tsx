// app/auth/login/layout.tsx
import React from "react";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return (
        <section style={{ width: '100%', minHeight: '100vh' }}>
            {children}
        </section>
    );
}