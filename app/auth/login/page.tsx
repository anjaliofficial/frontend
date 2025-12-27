import LoginForm from "../_components/LoginForm";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl flex max-w-5xl w-full h-[650px]">
                {/* Left Side - Image */}
                <div className="hidden md:block w-1/2">
                    <img
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
                        className="w-full h-full object-cover"
                        alt="Interior"
                    />
                </div>
                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-12 lg:p-16 flex flex-col justify-center">
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}