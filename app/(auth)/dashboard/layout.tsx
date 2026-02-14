import Header from "@/app/(auth)/dashboard/_components/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="p-8">
                {children}
            </main>
        </div>
    );
}