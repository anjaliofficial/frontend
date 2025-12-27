import { Mail, Lock } from 'lucide-react';

export default function LoginForm() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">Welcome back to Sajilo Baas</h2>
                <p className="text-gray-500 text-sm">Login with your registered Email & Password</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Email</label>
                    <input type="email" placeholder="E-mail@example.com" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1a3a4a] outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Password</label>
                    <input type="password" placeholder="Password" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1a3a4a] outline-none" />
                </div>
            </div>

            <button className="w-full bg-[#1e3a4c] text-white py-3 rounded-lg font-semibold hover:bg-[#152936] transition">
                Log In
            </button>

            <div className="text-center">
                <button className="text-sm text-gray-500 hover:underline">Forgot password?</button>
            </div>

            <p className="text-center text-sm text-gray-600">
                Don't have an account? <a href="/auth/register" className="text-blue-600 font-semibold">Register Now</a>
            </p>
        </div>
    );
}