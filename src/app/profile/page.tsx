import { createClient } from "@/utils/supabase/server";
import ProfileImageUploader from "../../components/profileuploader";

const ProfilePage = async () => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-gray-100 rounded-xl shadow-md text-center">
        <p className="text-lg font-semibold">Please log in to view your profile.</p>
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
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-100 rounded-xl shadow-md text-center">
        <p className="text-lg font-semibold text-red-700">Error loading profile: {error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-yellow-100 rounded-xl shadow-md text-center">
        <p className="text-lg font-semibold text-yellow-700">No profile found for this user.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-[#0a1020] rounded-2xl shadow-xl space-y-6">
      {/* Profile Image */}
      <div className="flex flex-col items-center space-y-2">
        {data.profile_image ? (
          <img
            src={data.profile_image}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover aspect-square"

          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-xl shadow-lg">
            No Image
          </div>
        )}

        {/* Image Upload Button */}
        <ProfileImageUploader userId={user.id} />
      </div>

      {/* Profile Details */}
      <div className="space-y-3 divide-y divide-gray-200">
        <div className="flex justify-between pt-2">
          <span className="text-gray-600 font-medium">Email:</span>
          <span className="text-slate-200">{user.email}</span>
        </div>
        <div className="flex justify-between pt-2">
          <span className="text-gray-600 font-medium">RFID Code:</span>
          <span className="text-slate-200">{data.rfid_code || "N/A"}</span>
        </div>
        <div className="flex justify-between pt-2">
          <span className="text-gray-600 font-medium">Role:</span>
          <span className="text-slate-200">{data.role || "N/A"}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
