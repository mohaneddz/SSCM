"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { useState, useEffect, useRef } from 'react';
import { Camera, Video, Monitor, RefreshCw, Maximize, Minimize, Play, Pause } from 'lucide-react';

// Updated color palette and camera names
const cardStyle = "p-3 border-0 shadow-lg relative before:absolute before:inset-0 before:p-[1px] before:bg-gradient-to-br before:from-[var(--card-gradient-from)] before:via-[var(--card-gradient-via)] before:to-[var(--card-gradient-to)] before:rounded-lg before:-z-10 before:pointer-events-none backdrop-blur-sm bg-light-slate";

export default function CameraViewer() {
  const [mainStreamActive, setMainStreamActive] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(0);
  const [fullscreenCamera, setFullscreenCamera] = useState(null);
  const videoRef = useRef(null);
  const secondaryVideoRefs = useRef([]);

  // Set up refs for secondary camera feeds
  for (let i = 0; i < 3; i++) {
    if (!secondaryVideoRefs.current[i]) {
      secondaryVideoRefs.current[i] = React.createRef();
    }
  }

  // Handle main camera stream
  useEffect(() => {
    if (mainStreamActive && videoRef.current) {
      const startWebcam = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = stream;
        } catch (err) {
          console.error("Error accessing webcam:", err);
          setMainStreamActive(false);
        }
      };
      
      startWebcam();
      
      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = videoRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop());
        }
      };
    }
  }, [mainStreamActive]);

  // Update the secondary camera feeds to fix issues with Camera 1 and Camera 3
  useEffect(() => {
    secondaryVideoRefs.current.forEach((ref, index) => {
      if (ref && ref.current) {
        if (index === 1) {
          ref.current.src = "/camera2.mp4"; // Camera 2 uses camera2.mp4
        } else {
          ref.current.src = "/camera1.mp4"; // Camera 1 and Camera 3 use camera1.mp4
        }
        ref.current.load();
      }
    });
  }, []);

  // Hide the play controls for all video elements
  useEffect(() => {
    secondaryVideoRefs.current.forEach((ref) => {
      if (ref && ref.current) {
        ref.current.controls = false; // Disable play controls
      }
    });

    if (videoRef.current) {
      videoRef.current.controls = false; // Disable play controls for the main video
    }
  }, []);

  const toggleMainStream = () => {
    setMainStreamActive(!mainStreamActive);
  };

  const handleCameraSelect = (index) => {
    setSelectedCamera(index);
  };

  const toggleFullscreen = (index) => {
    if (fullscreenCamera === index) {
      setFullscreenCamera(null);
    } else {
      setFullscreenCamera(index);
    }
  };

  return (
    <div className="flex flex-1 flex-col p-4 gap-4 bg-background">
      {/* Camera Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="text-primary" />
          <h2 className="text-lg font-semibold text-primary">Camera Surveillance</h2>
        </div>
        <div className="flex items-center gap-4">
          <button 
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-primary hover:bg-primary-dark text-white"
            onClick={toggleMainStream}
          >
            {mainStreamActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {mainStreamActive ? 'Stop Camera' : 'Start Camera'}
          </button>
          <button className="flex items-center gap-1 px-3 py-1 rounded-md bg-light-slate hover:bg-light-slate-dark dark:text-white">
            <RefreshCw className="w-4 h-4" />
            Refresh Feeds
          </button>
        </div>
      </div>

      {/* Main Camera View */}
      {fullscreenCamera !== null ? (
        <div className="relative h-screen">
          {fullscreenCamera === 'main' ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              muted
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <video 
              ref={fullscreenCamera < secondaryVideoRefs.current.length ? secondaryVideoRefs.current[fullscreenCamera] : null}
              autoPlay 
              loop
              muted
              controls
              className="w-full h-full object-cover rounded-lg"
            />
          )}
          <button 
            className="absolute top-4 right-4 p-2 bg-slate-800 bg-opacity-70 rounded-full hover:bg-opacity-100"
            onClick={() => toggleFullscreen(null)}
          >
            <Minimize className="w-5 h-5 text-white" />
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Camera Feed */}
            <Card className={`${cardStyle} col-span-2 relative`}>
              <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Main Camera Feed</h3>
              <div className="relative aspect-video bg-slate-900 rounded-md overflow-hidden">
                {mainStreamActive ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Camera className="w-12 h-12 mx-auto mb-2 text-slate-500" />
                      <p className="text-slate-400">Camera is inactive. Click Start Camera to activate.</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button 
                    className="p-2 bg-slate-800 bg-opacity-70 rounded-full hover:bg-opacity-100"
                    onClick={() => toggleFullscreen('main')}
                  >
                    <Maximize className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </Card>

            {/* Camera Details */}
            <Card className={cardStyle}>
              <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Camera Details</h3>
              <div className="flex flex-col gap-4">
                <div className="p-3 bg-slate-800 bg-opacity-30 rounded-md">
                  <h4 className="font-medium mb-1">Main Camera</h4>
                  <div className="text-sm text-slate-400">
                    <p>Type: Webcam</p>
                    <p>Status: {mainStreamActive ? 'Active' : 'Inactive'}</p>
                    <p>Resolution: 1080p</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-800 bg-opacity-30 rounded-md">
                  <h4 className="font-medium mb-1 text-white">Secondary Feeds</h4>
                  <div className="text-sm text-slate-400">
                    <p>Source: camera.mp4</p>
                    <p>Status: Active</p>
                    <p>Count: 3</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <button className="w-full py-2 px-3 bg-primary hover:bg-primary text-white rounded-md">
                    Export Footage
                  </button>
                  <button className="w-full py-2 px-3 bg-slate-700 hover:bg-slate-800 text-white rounded-md">
                    Camera Settings
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Secondary Camera Feeds */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["Indoor Camera", "Outdoor Camera", "Outer Camera"].map((name, index) => (
              <Card key={index} className={`${cardStyle} relative`}>
                <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  {name}
                </h3>
                <div className="aspect-video bg-slate-900 rounded-md overflow-hidden">
                  <video 
                    ref={secondaryVideoRefs.current[index]}
                    autoPlay 
                    loop
                    muted
                    controls
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button 
                      className="p-2 bg-slate-800 bg-opacity-70 rounded-full hover:bg-opacity-100"
                      onClick={() => toggleFullscreen(index)}
                    >
                      <Maximize className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}