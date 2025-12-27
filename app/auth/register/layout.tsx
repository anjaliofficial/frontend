// app/auth/register/layout.tsx
import React from "react";

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
    return (
        <section style={{ width: '100%', minHeight: '100vh' }}>
            {children}
        </section>
    );
}