import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import fav from "../assets/favicon.webp";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

const Login = () => {
    const { fetchProfile, login } = useAuthStore();
    const navigate = useNavigate();


    const [email, setEmail] = useState("test@gmail.com");
    const [password, setPassword] = useState("xyz@123");
    const [showPassword, setShowPassword] = useState(false);
    const { isAuthenticated, authInitialized } = useAuthStore();

    if (authInitialized && isAuthenticated) {
        return <Navigate to="/user-profile" replace />;
    }
    console.log("LOGIN PAGE:", { authInitialized, isAuthenticated });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log("test running")
            const res = await login(email, password);
            console.log("response:", res.data);

            if (res.data.message?.success) {
                navigate("/user-profile");
            }
        } catch (err) {
            console.error("login error:", err);
        }
    };

    return (
        <div className="bg-gray-100 flex items-center justify-center h-screen">
            <div className="bg-white shadow-lg rounded-lg w-full max-w-md p-8">
                {/* Header */}
                <div className="text-center mb-6">
                    <img
                        src={fav}
                        alt="Time Tracker Logo"
                        className="mx-auto w-24 h-24 mb-4"
                    />
                    <h1 className="text-3xl font-bold text-gray-800">
                        Time Tracker
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Login to your tracker account
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg
                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg
                        hover:bg-blue-600 transition-colors"
                    >
                        Login
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    Don&apos;t have an account?{" "}
                    <Link href="#" className="text-blue-500 hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
