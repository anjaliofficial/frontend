export default function SplashScreen() {
    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center">
            <div className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 bg-[#1a3a4a] rounded-xl flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">S</span>
                </div>
                <h1 className="text-3xl font-bold text-[#1a3a4a]">Sajilo Baas</h1>
            </div>
            <div className="mt-8 w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#1a3a4a] animate-progress-bar"></div>
            </div>
            <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress-bar {
          animation: progress 2.5s ease-in-out forwards;
        }
      `}</style>
        </div>
    );
}