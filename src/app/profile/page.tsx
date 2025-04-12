import { createClient } from "@/utils/supabase/server";
import ProfileImageUploader from "@/components/profileuploader";
import { IconArrowLeft } from '@tabler/icons-react';
import Link from "next/link";

const ProfilePage = async () => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-gray-50 rounded-xl shadow-md text-center border border-gray-200">
        <p className="text-lg font-semibold text-gray-700">Please log in to view your profile.</p>
      </div>
    );
  }

  const { data, error } = await supabase
    .from("User")
    .select("name, email, profile_image, rfid_code, role")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 rounded-xl shadow-md text-center border border-red-200">
        <p className="text-lg font-semibold text-red-700">Error loading profile: {error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-yellow-50 rounded-xl shadow-md text-center border border-yellow-200">
        <p className="text-lg font-semibold text-yellow-700">No profile found for this user.</p>
      </div>
    );
  }

  return (
    <div className="relative max-w-xl mx-auto mt-10 p-6 dark:bg-[#111827] rounded-2xl shadow-2xl space-y-6 border border-gray-700 overflow-hidden">
      
      <svg
        className="absolute inset-0 w-full h-full opacity-10 fill-current text-gray-800 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 300"
      >
        <path d="M0,150 C300,250 700,50 1000,150 L1000,300 L0,300 Z"></path>
      </svg>

      <Link
        href="/dashboard"
        className="absolute top-4 left-4 p-4 rounded-full bg-slate-300 hover:slate-500 text-gray-400 hover:text-gray-200 transition-colors duration-200 z-10"
        aria-label="Go back"
      >
        <IconArrowLeft size={24} stroke={1.5} />
      </Link>

      <div className="flex flex-col items-center space-y-4 relative z-10">
        {data.profile_image ? (
          <div className="relative">
            <img
              src={data.profile_image}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-green-800 shadow-md object-cover aspect-square"
            />
            <div className="absolute inset-0 rounded-full border-4 border-green-500 opacity-0 hover:opacity-50 transition-opacity duration-300"></div>
          </div>
        ) : (
          <div className="w-32 h-32 rounded-full bg-green-700 flex items-center justify-center text-gray-100 text-xl shadow-md">
            No Image
          </div>
        )}

        <ProfileImageUploader userId={user.id} />
      </div>

      <div className="space-y-4 divide-y divide-gray-700 relative z-10">
        <div className="flex justify-between py-3">
          <span className="text-gray-400 font-medium">Email:</span>
          <span className="dark:text-gray-200">{user.email}</span>
        </div>
        <div className="flex justify-between py-3">
          <span className="text-gray-400 font-medium">RFID Code:</span>
          <span className="dark:text-gray-200">{data.rfid_code || "N/A"}</span>
        </div>
        <div className="flex justify-between py-3">
          <span className="text-gray-400 font-medium">Role:</span>
          <span className="dark:text-gray-200">{data.role || "N/A"}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;