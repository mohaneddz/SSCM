"use client";

import { LayoutDashboard  } from "lucide-react"; // You can choose any icon you prefer
import Link from "next/link";

const FloatingCircleButton = () => {
  return (
    <Link
      href="/dashboard" // Replace with the appropriate link
      className="fixed bottom-24 right-6 p-4 bg-green-600 hover:bg-green-500 text-white rounded-full shadow-lg transition duration-300"
    >
      <LayoutDashboard  className="h-8 w-8" />
    </Link>
  );
};

export default FloatingCircleButton;
