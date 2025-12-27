export default function DashboardPage() {
    return (
        <div className="animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold text-gray-800">Welcome back, User!</h1>
            <p className="text-gray-500 mt-2">Here is what's happening with your bookings.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h4 className="text-gray-500 font-medium text-sm uppercase tracking-wider">Active Bookings</h4>
                    <p className="text-5xl font-bold text-[#1a3a4a] mt-4">02</p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h4 className="text-gray-500 font-medium text-sm uppercase tracking-wider">Total Spent</h4>
                    <p className="text-5xl font-bold text-[#1a3a4a] mt-4">$1,240</p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h4 className="text-gray-500 font-medium text-sm uppercase tracking-wider">Reviews Written</h4>
                    <p className="text-5xl font-bold text-[#1a3a4a] mt-4">08</p>
                </div>
            </div>
        </div>
    );
}