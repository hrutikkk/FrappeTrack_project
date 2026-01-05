import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import fav from '../assets/favicon.webp'

const Profile = () => {
  const { user } = useAuthStore()
  // const [profile, setProfile] = useState({
  //   name: "",
  //   empId: "",
  //   designation: "",
  //   email: "",
  //   image: "",
  // });

  // useEffect(() => {
  //   // 🔹 Replace this with your API call
  //   setProfile({
  //     name: "Suraj Rajbhar",
  //     empId: "EMP-1023",
  //     designation: "Software Engineer",
  //     email: "suraj@example.com",
  //     image: "/assests/profile.webp", // or default avatar
  //   });
  // }, []);

  const handleLogout = () => {
    console.log("Logout clicked");
    // clear cookies / localStorage / redirect
  };

  return (
    <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 min-h-screen flex items-center justify-center">
      {/* Profile Card */}
      <div className="relative bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl w-full max-w-sm p-8">

        {/* Top Gradient Banner */}
        <div className="absolute inset-x-0 top-0 h-28 rounded-t-3xl bg-gradient-to-r from-blue-500 to-indigo-600" />

        {/* Profile Image */}
        <div className="relative flex justify-center mt-16">
          <img
            src={user.employee.image || fav}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-gray-200"
          />
        </div>

        {/* Profile Info */}
        <div className="text-center mt-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {user.name}
          </h2>


          <p className="text-indigo-600 font-medium mt-3">
            {user.employee.designation}
          </p>

          
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2.5 rounded-xl font-medium shadow hover:scale-[1.02] hover:shadow-lg transition"
          >
            Edit Profile
          </button>

          <button
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2.5 rounded-xl font-medium shadow hover:scale-[1.02] hover:shadow-lg transition"
          >
            Start Tracker
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-100 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
