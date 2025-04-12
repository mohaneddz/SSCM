"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ProfileImageUploader({ userId }: { userId: string }) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // Validate file type & size
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setMessage("Please upload a valid image (jpg, png, webp).");
      return;
    }
    // Removed size validation for brevity, add back if needed

    setUploading(true);
    setMessage(null);

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `profilepic/${fileName}`; // Path within the bucket

    console.log("Attempting to upload file to:", filePath);

    // --- UPLOAD ---
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profilepic") // Bucket for upload
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload failed:", uploadError);
      setMessage(`Upload failed: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    console.log("Upload successful:", uploadData);

    // --- GET PUBLIC URL ---
    const { data: urlData } = supabase.storage
      .from("profilepic") // *** CORRECTED: Use same bucket name "profilepic" ***
      .getPublicUrl(filePath);

    const publicUrl = urlData?.publicUrl;
    console.log("Public URL:", publicUrl);

    if (!publicUrl) {
      console.error("Failed to get public URL. urlData:", urlData);
      setMessage("Failed to get public URL. Check bucket name and policies.");
      setUploading(false);
      // await supabase.storage.from("profilepic").remove([filePath]); // Clean up failed upload?
      return;
    }

    // --- UPDATE DATABASE ---
    console.log(`Attempting to update User table for user_id: ${userId} with URL: ${publicUrl}`);
    const { error: updateError } = await supabase
      .from("User")
      .update({ profile_image: publicUrl })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Update failed:", updateError);
      setMessage(`Update failed: ${updateError.message}`);
      setUploading(false);
    } else {
      setMessage("Profile picture updated!");
      setTimeout(() => window.location.reload(), 1000);
    }

    setUploading(false);
  };

  // --- JSX ---
  return (
    <div className="text-center mt-6 space-y-2">
      <label className="cursor-pointer inline-block px-4 py-2 text-sm bg-green-700 text-white rounded hover:bg-green-800 m-3 transition">
        {uploading ? "Uploading..." : "Upload Image"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>
      {/* Message display */}
      {message && (
         <p className={`text-sm ${ message.includes("failed") || message.includes("Please") ? "text-red-600" : "text-green-600" }`}>
           {message}
         </p>
       )}
    </div>
  );
}