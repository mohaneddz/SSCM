// src/components/Simulation.tsx
// (Adjust the path based on your project structure)

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function Simulation() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isDoorOpen, setIsDoorOpen] = useState(true); // State for door color/status

  // Refs to store Three.js objects and other persistent values
  // These don't trigger re-renders when they change.
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const controlsRef = useRef<OrbitControls>();
  const doorMeshRef = useRef<THREE.Mesh>();
  const animationFrameIdRef = useRef<number>();
  const materialsRef = useRef<{
      slate: THREE.MeshStandardMaterial | null,
      white: THREE.MeshStandardMaterial | null,
      green: THREE.MeshStandardMaterial | null,
      red: THREE.MeshStandardMaterial | null,
  }>({ slate: null, white: null, green: null, red: null });

  // Memoize the resize handler using useCallback to keep its identity stable
  const handleResize = useCallback(() => {
    if (!rendererRef.current || !cameraRef.current || !mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Update renderer size
    rendererRef.current.setSize(width, height);

    // Update camera aspect ratio
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix(); // Important after changing aspect
  }, []); // Empty dependency array means this function is created only once

  // Main effect for Three.js setup and cleanup
  // Runs only once on mount and cleanup runs on unmount
  useEffect(() => {
    // Guard against running on server or if ref is not attached yet
    if (typeof window === 'undefined' || !mountRef.current) {
      console.log("Skipping Three.js setup (SSR or mountRef not ready).");
      return;
    }

    const currentMount = mountRef.current;
    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;
    console.log("Initializing Three.js scene...");

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f4f8); // Light slate-like background
    sceneRef.current = scene;

    // --- Camera Setup ---
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(10, 10, 15); // Initial camera position
    camera.lookAt(scene.position); // Look at the center
    cameraRef.current = camera;

    // --- Renderer Setup ---
    const renderer = new THREE.WebGLRenderer({
        antialias: true, // Enable anti-aliasing for smoother edges
        // alpha: true, // Use if you need transparent background
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio); // Adjust for high-DPI displays
    rendererRef.current = renderer;
    currentMount.appendChild(renderer.domElement); // Add canvas to the div

    // --- Controls Setup ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Creates a smoother, inertial effect
    controls.dampingFactor = 0.05; // Adjust damping strength
    // controls.minDistance = 5;    // Optional: Limit zoom in
    // controls.maxDistance = 50;   // Optional: Limit zoom out
    // controls.maxPolarAngle = Math.PI / 2 - 0.05; // Optional: Prevent camera going below ground plane
    controlsRef.current = controls;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Soft ambient light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9); // Directional light like sun
    directionalLight.position.set(5, 15, 10);
    // Optional: Add shadows
    // directionalLight.castShadow = true;
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene.add(directionalLight);

    // --- Materials (Store in ref for easy disposal) ---
    materialsRef.current.slate = new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.8, metalness: 0.2 });
    materialsRef.current.white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0.1 });
    materialsRef.current.green = new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.7 });
    materialsRef.current.red = new THREE.MeshStandardMaterial({ color: 0xf87171, roughness: 0.7 });

    // --- Geometry / Objects ---

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(30, 30);
    const floor = new THREE.Mesh(floorGeometry, materialsRef.current.white);
    floor.rotation.x = -Math.PI / 2; // Rotate flat on XZ plane
    floor.position.y = -0.5;        // Position slightly below origin
    // floor.receiveShadow = true; // Optional: Allow floor to receive shadows
    scene.add(floor);

    // Simple Data Center "Building" (a box)
    const buildingGeometry = new THREE.BoxGeometry(15, 8, 10);
    const building = new THREE.Mesh(buildingGeometry, materialsRef.current.slate);
    building.position.y = 8 / 2 - 0.5; // Position on top of the floor (adjust for floor Y)
    // building.castShadow = true; // Optional: Allow building to cast shadows
    // building.receiveShadow = true;
    scene.add(building);

    // Simple "Door"
    const doorGeometry = new THREE.BoxGeometry(0.2, 4, 2); // Thin door shape
    const initialDoorMaterial = isDoorOpen ? materialsRef.current.green : materialsRef.current.red;
    const doorMesh = new THREE.Mesh(doorGeometry, initialDoorMaterial!); // Use non-null assertion or check
    doorMesh.name = 'interactive_door'; // Name for identification in raycasting
    // Position it on the front face of the building
    doorMesh.position.set(
        0,                 // Centered X on building face
        4 / 2 - 0.5,       // Centered Y relative to floor
        10 / 2             // Positioned on the front face (positive Z edge of the building box)
    );
    // doorMesh.castShadow = true; // Optional
    scene.add(doorMesh);
    doorMeshRef.current = doorMesh; // Store door mesh in ref for access in animation loop

    // --- Raycaster for Interaction ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event: MouseEvent) => {
        // Ensure necessary objects exist before proceeding
        if (!currentMount || !cameraRef.current || !sceneRef.current) return;

        // Calculate mouse position in normalized device coordinates (-1 to +1)
        const rect = currentMount.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, cameraRef.current);

        // Calculate objects intersecting the picking ray
        // Check only children of the scene for performance, make sure door is direct child
        const intersects = raycaster.intersectObjects(sceneRef.current.children);

        for (let i = 0; i < intersects.length; i++) {
            // Check if the intersected object is our named door
            if (intersects[i].object.name === 'interactive_door') {
                console.log("Door clicked!");
                // Only update the React state here. The animation loop handles the visual change.
                setIsDoorOpen(prev => !prev);
                break; // Stop checking after finding the door
            }
        }
    };
    // Add click listener to the container div
    currentMount.addEventListener('click', onClick);


    // --- Resize Handling ---
    // Use ResizeObserver for more robust container resize detection
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(currentMount);
    // Call initial resize to set correct size from start
    handleResize();

    // --- WebGL Context Lost/Restored Handling ---
    const handleContextLost = (event: Event) => {
      event.preventDefault(); // Prevent default browser behavior (like black screen)
      console.warn('THREE.WebGLRenderer: Context Lost. Pausing render loop.');
      if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current); // Stop rendering
      }
      // Optionally disable controls or show an overlay
      controlsRef.current?.dispose(); // Dispose to remove listeners temporarily
    };

    const handleContextRestored = () => {
      console.log('THREE.WebGLRenderer: Context Restored. Restarting setup...');
       // Easiest recovery is often to re-initialize controls and restart loop
       if (rendererRef.current && cameraRef.current && rendererRef.current.domElement) {
            controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
            controlsRef.current.enableDamping = true;
            controlsRef.current.dampingFactor = 0.05;
             // Re-apply other control settings if needed
             console.log('OrbitControls re-initialized.');
       } else {
           console.error("Could not re-initialize OrbitControls after context restore.");
           // More complex recovery might be needed here
       }
       // It might be prudent to force a resize calculation
       handleResize();
       // Restart the animation loop
      animate();
    };

    // Add listeners to the canvas element itself
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);

    // --- Animation Loop ---
    const animate = () => {
      // Check if essential refs still exist (important during cleanup/context loss)
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !doorMeshRef.current || !materialsRef.current.green || !materialsRef.current.red) {
          console.log("Stopping animation loop (missing refs).");
          return;
      }

      // Schedule the next frame
      animationFrameIdRef.current = requestAnimationFrame(animate);

      // Update door material and position based on the CURRENT React state
      doorMeshRef.current.material = isDoorOpen ? materialsRef.current.green : materialsRef.current.red;
      // Simple "close" effect: slightly move back when red (closed)
      doorMeshRef.current.position.z = isDoorOpen ? 10 / 2 : 10 / 2 - 0.1;

      // Update OrbitControls if damping is enabled
      controlsRef.current?.update();

      // Render the scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    // Start the animation loop
    console.log("Starting animation loop.");
    animate();

    // --- Cleanup Function ---
    // This runs when the component unmounts or before the effect runs again (due to dependency changes, though we have none here)
    return () => {
      console.log("Cleaning up Three.js scene...");

      // 1. Stop the animation loop
      if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
          animationFrameIdRef.current = undefined;
      }

      // 2. Disconnect ResizeObserver
      resizeObserver.disconnect();

      // 3. Remove event listeners
      currentMount?.removeEventListener('click', onClick);
      if (rendererRef.current) {
        rendererRef.current.domElement.removeEventListener('webglcontextlost', handleContextLost);
        rendererRef.current.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      }

      // 4. Dispose of controls (removes its listeners)
      controlsRef.current?.dispose();

      // 5. Dispose of Three.js geometries and materials
      sceneRef.current?.traverse((object) => {
          if (object instanceof THREE.Mesh) {
              object.geometry?.dispose();
              // Materials disposed separately below
          }
      });
      Object.values(materialsRef.current).forEach(material => material?.dispose());
      materialsRef.current = { slate: null, white: null, green: null, red: null }; // Clear material refs

      // 6. Dispose of the renderer
      rendererRef.current?.dispose();

      // 7. Remove the canvas from the DOM
      if (rendererRef.current?.domElement && currentMount?.contains(rendererRef.current.domElement)) {
          currentMount.removeChild(rendererRef.current.domElement);
      }

      // 8. Clear refs (optional, but good practice)
      sceneRef.current = undefined;
      cameraRef.current = undefined;
      rendererRef.current = undefined;
      controlsRef.current = undefined;
      doorMeshRef.current = undefined;

      console.log("Three.js cleanup complete.");
    };

  // IMPORTANT: The main setup/cleanup effect depends only on `handleResize`
  // because it's defined outside but used inside. Since `handleResize` is memoized,
  // this effect runs only once on mount.
  }, [handleResize, isDoorOpen]); // Include isDoorOpen only if initial door state needs to re-run setup (usually not needed)
  // ---> REVISED: Remove isDoorOpen from dependency array - it's handled in animate()
  // }, [handleResize]);


  // --- Component Render ---
  return (
    // This div acts as the container for the Three.js canvas.
    // It needs explicit or inherited dimensions to be visible.
    // Tailwind classes ensure it tries to fill its parent and handles overflow.
    <div
      ref={mountRef}
      className="flex-1 h-full w-full overflow-hidden relative cursor-grab active:cursor-grabbing" // Added cursor styles for OrbitControls feedback
      style={{ minHeight: '300px' }} // Example minimum size
    >
      {/* The Three.js canvas will be appended here by the useEffect hook */}
      {/* You could add a loading indicator here if needed */}
    </div>
  );
};