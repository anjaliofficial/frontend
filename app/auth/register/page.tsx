import RegisterForm from "../_components/RegisterForm";

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl flex max-w-5xl w-full min-h-[750px]">
                {/* Left Side - Form */}
                <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
                    <RegisterForm />
                </div>
                {/* Right Side - Image */}
                <div className="hidden md:block w-1/2">
                    <img
                        src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6"
                        className="w-full h-full object-cover"
                        alt="Interior Design"
                    />
                </div>
            </div>
        </div>
    );
}