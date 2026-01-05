import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";
import fav from '../assets/favicon.webp'
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { fetchProfile } = useAuthStore();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("a09fb25fcd26fcf");
  const [apiSecret, setApiSecret] = useState("097992c1cbd0ce7");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetchProfile(apiKey, apiSecret)
    if (res) navigate("/user-profile")
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
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              API Key
            </label>
            <input
              type="text"
              placeholder="API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              API Secret
            </label>
            <input
              type="password"
              placeholder="********"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

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
          <a href="#" className="text-blue-500 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
