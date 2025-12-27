import Link from 'next/link';

export default function Header() {
    return (
        <header className="flex items-center justify-between px-12 py-4 bg-white border-b sticky top-0 z-50">
            <div className="text-2xl font-bold text-[#1a3a4a]">Nepal Stays</div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                <Link href="/">List a Property</Link>
                <Link href="/about">About Us</Link>
                <Link href="#">Help</Link>
            </nav>

            <div className="flex gap-4 items-center">
                <Link href="/auth/login" className="px-4 py-2 text-blue-600 font-semibold">Login</Link>
                <Link href="/auth/register" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Sign Up</Link>
            </div>
        </header>
    );
}