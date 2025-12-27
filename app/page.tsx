import Header from "./public/_components/Header";
import { Search, MapPin, Calendar, Users, Star } from "lucide-react";

export default function HomePage() {
    const listings = [
        { name: "Modern City View Apartment", loc: "Kathmandu, Nepal", price: 50, img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267" },
        { name: "Historic Bhaktapur Home", loc: "Bhaktapur, Nepal", price: 45, img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750" },
        { name: "Lakeside Guesthouse", loc: "Pokhara, Nepal", price: 40, img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb" },
        { name: "Mountain Vista Villa", loc: "Nagarkot, Nepal", price: 120, img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688" },
    ];

    return (
        <main className="min-h-screen bg-gray-50">
            <Header />

            {/* Hero Section */}
            <section className="relative h-[550px] flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1544735716-392fe2489ffa" className="absolute inset-0 w-full h-full object-cover brightness-50" />
                <div className="relative text-center text-white px-4">
                    <h1 className="text-5xl font-bold mb-4">Find Your Perfect Stay in Nepal</h1>
                    <p className="text-xl opacity-90 mb-10">Discover and book unique homes and experiences.</p>

                    {/* Search Box */}
                    <div className="bg-white rounded-xl p-3 shadow-2xl flex flex-col md:flex-row items-center gap-2 max-w-5xl mx-auto text-gray-800">
                        <div className="flex-1 flex items-center gap-2 px-4 py-2 border-r">
                            <MapPin className="text-blue-500" size={20} />
                            <input type="text" placeholder="e.g. Kathmandu" className="outline-none w-full" />
                        </div>
                        <div className="flex-1 flex items-center gap-2 px-4 py-2 border-r">
                            <Calendar className="text-blue-500" size={20} />
                            <span className="text-gray-400">mm/dd/yyyy</span>
                        </div>
                        <div className="flex-1 flex items-center gap-2 px-4 py-2">
                            <Users className="text-blue-500" size={20} />
                            <select className="bg-transparent outline-none w-full"><option>2 Guests</option></select>
                        </div>
                        <button className="bg-blue-600 text-white px-10 py-3 rounded-lg flex items-center gap-2 font-bold hover:bg-blue-700">
                            <Search size={18} /> Search
                        </button>
                    </div>
                </div>
            </section>

            {/* Featured Listings */}
            <section className="max-w-7xl mx-auto py-16 px-12">
                <h2 className="text-2xl font-bold mb-8 text-gray-800">Featured Listings</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {listings.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">
                            <img src={item.img} className="h-48 w-full object-cover" />
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800 truncate">{item.name}</h3>
                                <p className="text-sm text-gray-500">{item.loc}</p>
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="font-bold text-[#1a3a4a]">${item.price} <span className="text-gray-400 font-normal">/ night</span></span>
                                    <span className="flex items-center gap-1 text-sm font-semibold"><Star size={14} className="fill-yellow-400 text-yellow-400" /> 4.9</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}