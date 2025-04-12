import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const cameraStreams = [
  {
    id: 1,
    name: "Main Camera",
    url: "main-camera", // Placeholder for the main camera
  },
  {
    id: 2,
    name: "Camera 2",
    url: "/public/camera.mp4",
  },
  {
    id: 3,
    name: "Camera 3",
    url: "/public/camera.mp4",
  },
];

export default function Surveillance() {
  const [activeCamera, setActiveCamera] = useState(0);

  const handlePrevCamera = () => {
    setActiveCamera((prev) => (prev === 0 ? cameraStreams.length - 1 : prev - 1));
  };

  const handleNextCamera = () => {
    setActiveCamera((prev) => (prev === cameraStreams.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-gradient-to-b  dark:text-white p-6 gap-16">
      <h1 className="text-3xl font-bold mb-4 text-center ">Surveillance Dashboard</h1>
      <div className="flex justify-center items-center space-x-4">
        <Button onClick={handlePrevCamera} variant="outline">
          Previous
        </Button>
        <div className="relative w-[640px] h-[360px] overflow-hidden rounded-lg border border-gray-700">
          {cameraStreams.map((camera, index) => (
            <div
              key={camera.id}
              className={`absolute inset-0 w-full h-full transition-transform duration-500 ${
                index === activeCamera
                  ? "translate-x-0"
                  : index < activeCamera
                  ? "-translate-x-full"
                  : "translate-x-full"
              }`}
            >
              {camera.url === "main-camera" ? (
                <video
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                >
                  <source src="/public/camera.mp4" type="video/mp4" />
                </video>
              ) : (
                <video
                  autoPlay
                  muted
                  loop
                  className="w-full h-full object-cover"
                >
                  <source src={camera.url} type="video/mp4" />
                </video>
              )}
            </div>
          ))}
        </div>
        <Button onClick={handleNextCamera} variant="outline">
          Next
        </Button>
      </div>
      <div className="mt-4 text-center">
        <p className="text-lg font-medium">
          Viewing: {cameraStreams[activeCamera].name}
        </p>
      </div>
    </div>
  );
}
