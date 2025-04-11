import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
 import { cn } from "@/lib/utils/cn";
import {
  AlertCircle,
  Check,
  Play,
  Pause,
  RotateCw,
  Thermometer,
  Shield,
  Wind, // Fan/Air
  Flame, // Flame
  Droplet, // Rain
  Waves, // Vibration
  ScanLine, // RFID
  Eye, // Motion/Camera
  CloudCog, // Gas Sensor (placeholder)
  Cog, // Servo
  Network, // Placeholder for Network type
  BatteryCharging, // Placeholder for Power type
} from "lucide-react";

// --- Interfaces and Types ---
type SensorStatus = 'online' | 'offline' | 'warning' | 'critical' | 'active' | 'inactive';
type SensorType =
  | 'temperature'
  | 'security'
  | 'network' // Added placeholder type
  | 'power' // Added placeholder type
  | 'access'
  | 'compute' // Currently unused in sample data
  | 'environment' // Gas, Rain
  | 'hvac' // Fan
  | 'safety' // Flame
  | 'vibration'
  | 'actuator' // Servo
  | 'other';
type ViewMode = 'default' | 'temperature' | 'security' | 'environment' | 'hvac' | 'access' | 'safety';
type SimulationSpeed = 'slow' | 'normal' | 'fast';

export interface SensorData {
  id: string;
  type: SensorType;
  title: string;
  image?: string; // Icon image path (now less relevant with Lucide icons)
  model: string;
  health: number; // 0-100
  estimateTime?: string; // Optional maintenance date
  status?: SensorStatus;
  x: number; // Absolute X coordinate in SVG viewBox
  y: number; // Absolute Y coordinate in SVG viewBox
  iconSize?: number;
  currentValue?: string | number | boolean; // More flexible value
  historicalValues?: number[]; // For potential sparklines later
  alertThreshold?: number; // Health threshold
  valueThreshold?: { warn: number; critical: number }; // Thresholds for currentValue
}

interface SimulationState {
  isRunning: boolean;
  speed: SimulationSpeed;
  tick: number;
  alerts: {id: string, message: string, time: Date}[];
}

// --- Component Props ---
interface DataCenterFloorPlanProps {
  initialSensors?: SensorData[];
  width?: string | number;
  height?: string | number;
  viewBox?: string;
  backgroundColor?: string; // Background color for the outer div, not SVG
  onSensorClick?: (sensor: SensorData) => void;
  onAlert?: (sensorId: string, message: string) => void;
  backgroundImage?: string;
}

// --- Helper: Generate Sample Data (Moved outside component) ---
function generateSampleData(): SensorData[] {
    return [
      // Row 1 (Left)
      { id: 'temp-rack-a1', type: 'temperature', title: 'Rack A1 Temp', model: 'DHT22', health: 95, status: 'online', x: 150, y: 150, currentValue: '23°C', valueThreshold: { warn: 30, critical: 35 } },
      { id: 'temp-rack-a2', type: 'temperature', title: 'Rack A2 Temp', model: 'DHT22', health: 98, status: 'online', x: 150, y: 250, currentValue: '24°C', valueThreshold: { warn: 30, critical: 35 } },
      { id: 'temp-rack-a3', type: 'temperature', title: 'Rack A3 Temp', model: 'DHT22', health: 92, status: 'online', x: 150, y: 350, currentValue: '22°C', valueThreshold: { warn: 30, critical: 35 } },
      { id: 'access-main-entry', type: 'access', title: 'Main Entry RFID', model: 'RFID-RC522', health: 100, status: 'online', x: 50, y: 400, currentValue: 'Ready' },

      // Row 2 (Center)
      { id: 'hvac-unit-1', type: 'hvac', title: 'HVAC Unit 1', model: 'ClimMaster 5000', health: 88, status: 'active', x: 500, y: 100, currentValue: 'Cooling' },
      { id: 'temp-ambient-1', type: 'temperature', title: 'Ambient Center', model: 'BME280', health: 99, status: 'online', x: 500, y: 200, currentValue: '21°C', valueThreshold: { warn: 28, critical: 32 } },
      { id: 'sec-cam-1', type: 'security', title: 'Camera Corridor 1', model: 'CAM-IP-DOME', health: 100, status: 'online', x: 350, y: 100, currentValue: true }, // Assuming true means recording/active
      { id: 'sec-motion-1', type: 'security', title: 'Motion Corridor 1', model: 'PIR-HC-SR501', health: 97, status: 'inactive', x: 400, y: 300, currentValue: false }, // false means no motion
      { id: 'env-gas-1', type: 'environment', title: 'Gas Sensor Near UPS', model: 'MQ-2', health: 96, status: 'online', x: 450, y: 450, currentValue: '180ppm', valueThreshold: { warn: 500, critical: 1000 } },
      { id: 'safety-flame-1', type: 'safety', title: 'Flame Sensor Rack B', model: 'FLM-MOD-01', health: 100, status: 'online', x: 650, y: 150, currentValue: 'Normal' },

      // Row 3 (Right)
      { id: 'temp-rack-b1', type: 'temperature', title: 'Rack B1 Temp', model: 'DHT22', health: 65, status: 'warning', x: 850, y: 150, currentValue: '29°C', valueThreshold: { warn: 30, critical: 35 } },
      { id: 'temp-rack-b2', type: 'temperature', title: 'Rack B2 Temp', model: 'DHT22', health: 25, status: 'critical', x: 850, y: 250, currentValue: '36°C', valueThreshold: { warn: 30, critical: 35 } },
      { id: 'temp-rack-b3', type: 'temperature', title: 'Rack B3 Temp', model: 'DHT22', health: 90, status: 'online', x: 850, y: 350, currentValue: '25°C', valueThreshold: { warn: 30, critical: 35 } },
      { id: 'sec-vibration-1', type: 'vibration', title: 'Rack B1 Vibration', model: 'SW-420', health: 99, status: 'online', x: 800, y: 150, currentValue: 'Stable' }, // Explicitly vibration type now
      { id: 'access-rack-b', type: 'access', title: 'Rack B Access', model: 'RFID-PN532', health: 98, status: 'online', x: 900, y: 100, currentValue: 'Ready' },

      // Others
      { id: 'env-rain-ext', type: 'environment', title: 'External Rain Sensor', model: 'RainDrop-01', health: 95, status: 'online', x: 50, y: 50, currentValue: 'Dry' },
      { id: 'actuator-door-lock', type: 'actuator', title: 'Main Door Lock', model: 'SERVO-MG996R', health: 100, status: 'active', x: 50, y: 500, currentValue: 'Locked' }, // active when locked
      { id: 'temp-hvac-out', type: 'temperature', title: 'HVAC Outlet Temp', model: 'DS18B20', health: 97, status: 'online', x: 550, y: 80, currentValue: '19°C', valueThreshold: { warn: 18, critical: 16 } }, // Low temp is warning/critical
      { id: 'temp-rectifier', type: 'temperature', title: 'Rectifier Temp', model: 'DHT22', health: 80, status: 'online', x: 600, y: 550, currentValue: '33°C', valueThreshold: { warn: 40, critical: 45 } },
      { id: 'temp-tgbt', type: 'temperature', title: 'TGBT Area Temp', model: 'BME280', health: 99, status: 'online', x: 100, y: 600, currentValue: '24°C', valueThreshold: { warn: 28, critical: 32 } },
      { id: 'temp-rac-1', type: 'temperature', title: 'RAC 1 Temp', model: 'DHT22', health: 70, status: 'warning', x: 300, y: 650, currentValue: '30°C', valueThreshold: { warn: 32, critical: 37 } },
    ];
}

// --- Helper: Get Sensor Icon (Moved outside component) ---
const getSensorIcon = (sensor: SensorData, size: number = 16) => {
    const commonProps = { size, strokeWidth: 1.5 };
    switch (sensor.type) {
      case 'temperature': return <Thermometer {...commonProps} className="text-blue-300" />;
      case 'security':
        if (sensor.model.startsWith('CAM')) return <Eye {...commonProps} className="text-yellow-300" />;
        if (sensor.model.startsWith('PIR')) return <Eye {...commonProps} className="text-orange-300" />; // Maybe use different icon if needed
        return <Shield {...commonProps} className="text-yellow-300" />; // Default Security
      case 'hvac': return <Wind {...commonProps} className="text-cyan-300" />;
      case 'environment':
        if (sensor.model === 'MQ-2') return <CloudCog {...commonProps} className="text-teal-300" />; // Gas
        if (sensor.model === 'RainDrop-01') return <Droplet {...commonProps} className="text-sky-300" />; // Rain
        return <CloudCog {...commonProps} className="text-teal-300" />; // Default Environment
      case 'safety': return <Flame {...commonProps} className="text-red-300" />;
      case 'access': return <ScanLine {...commonProps} className="text-indigo-300" />;
      case 'vibration': return <Waves {...commonProps} className="text-purple-300" />;
      case 'actuator': return <Cog {...commonProps} className="text-gray-300" />;
      case 'network': return <Network {...commonProps} className="text-green-300" />;
      case 'power': return <BatteryCharging {...commonProps} className="text-lime-300" />;
      default: return <AlertCircle {...commonProps} className="text-gray-400" />;
    }
  };

// --- Main Component ---
const EnhancedDataCenterFloorPlan: React.FC<DataCenterFloorPlanProps> = ({
  initialSensors,
  width = "100%",
  height = "auto",
  viewBox = "0 0 1000 800",
  backgroundColor = "#111827", // Use for outer div if needed
  onSensorClick,
  onAlert,
  backgroundImage = "/plan.png", // Ensure this path is correct in your public folder
}) => {
  // Use useRef to ensure initial data is generated only once
  const defaultSensors = useRef<SensorData[]>(initialSensors || generateSampleData());
  const [sensors, setSensors] = useState<SensorData[]>(defaultSensors.current);
  const [activeMode, setActiveMode] = useState<ViewMode>('default');
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);

  // Simulation state
  const [simulation, setSimulation] = useState<SimulationState>({
    isRunning: false,
    speed: 'normal',
    tick: 0,
    alerts: []
  });

  const simulationInterval = useRef<NodeJS.Timeout | null>(null);

  // Get speed in milliseconds
  const getSpeedMs = useCallback((): number => {
    switch(simulation.speed) {
      case 'slow': return 3000;
      case 'fast': return 500;
      default: return 1500;
    }
  }, [simulation.speed]);

  // Helper function to get status color (Memoized)
  const getStatusColor = useCallback((status?: SensorStatus): string => {
    switch (status) {
      case 'online': return '#10B981'; // Green-500
      case 'active': return '#3B82F6'; // Blue-500
      case 'inactive': return '#6B7280'; // Gray-500
      case 'offline': return '#EF4444'; // Red-500
      case 'warning': return '#F59E0B'; // Amber-500
      case 'critical': return '#DC2626'; // Red-600
      default: return '#9CA3AF'; // Gray-400
    }
  }, []);

  // Helper function to get appropriate mode icon (Memoized)
  const getModeIcon = useCallback((mode: ViewMode | SensorType) => {
      const iconProps = { size: 16, className: "" };
      switch(mode) {
        case 'temperature': iconProps.className = "text-blue-400"; return <Thermometer {...iconProps} />;
        case 'security': iconProps.className = "text-yellow-400"; return <Shield {...iconProps} />;
        case 'environment': iconProps.className = "text-teal-400"; return <CloudCog {...iconProps} />;
        case 'hvac': iconProps.className = "text-cyan-400"; return <Wind {...iconProps} />;
        case 'access': iconProps.className = "text-indigo-400"; return <ScanLine {...iconProps} />;
        case 'safety': iconProps.className = "text-red-400"; return <Flame {...iconProps} />;
        // Add other types if needed for direct icon lookup
        default: return null;
      }
  }, []);

  // Handle sensor click with cleanup
  const handleSensorClick = useCallback((sensor: SensorData) => {
    setSelectedSensor(prev => prev?.id === sensor.id ? null : sensor);
    if (onSensorClick) {
      onSensorClick(sensor);
    }
  }, [onSensorClick]);

  // Reset selection when clicking the background
  const handleBackgroundClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    // Ensure click is directly on SVG or background image, not a sensor <g>
    if (e.target === e.currentTarget || (e.target as SVGElement).tagName === 'image') {
       setSelectedSensor(null);
    }
  }, []);

  // Improved sensor styling function with fading for filtering (Memoized per sensor based on dependencies)
  const getSensorStyle = useCallback((sensor: SensorData): React.CSSProperties => {
    const baseOpacity = 1;
    const filteredOutOpacity = 0.05; // Very dim when filtered out
    let scale = 1;
    let filter = 'none';
    let zIndex = 10;
    let targetOpacity = baseOpacity;
    let pointerEvents: 'auto' | 'none' = 'auto';

    const isSelected = selectedSensor?.id === sensor.id;

    // Determine if dimmed by the active mode
    let isDimmed = false;
    if (activeMode !== 'default') {
      const typeToModeMap: Record<ViewMode, SensorType[]> = {
        'default': [],
        'temperature': ['temperature'],
        'security': ['security', 'vibration'], // Group vibration under security view
        'environment': ['environment'],
        'hvac': ['hvac'],
        'access': ['access'],
        'safety': ['safety']
      };
      const relevantTypes = typeToModeMap[activeMode] || [];
      isDimmed = !relevantTypes.includes(sensor.type);
    }

    // Apply styles based on selection, filter status, and sensor status
    if (isSelected) {
      scale = 1.4;
      filter = 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.9))'; // Intense blue glow
      zIndex = 50;
      targetOpacity = baseOpacity; // Selected is always fully visible
      pointerEvents = 'auto';
    } else if (isDimmed) {
      targetOpacity = filteredOutOpacity;
      zIndex = 5;
      pointerEvents = 'none'; // Make filtered out sensors non-interactive
      // Reset scale and filter when dimmed
      scale = 1;
      filter = 'none';
    } else {
      // Sensor is relevant to the current mode (or default mode) and not selected
      targetOpacity = baseOpacity;
      pointerEvents = 'auto';
      zIndex = 20; // Base z-index for relevant items

      // Apply mode-specific highlight only if a specific mode is active
      if (activeMode !== 'default') {
          scale = 1.1; // Slight scale up for relevant items
          filter = 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.6))'; // Blue highlight for active mode items
      }

      // Status-based highlighting (overrides mode highlight if critical/warning/active)
      if (sensor.status === 'critical') {
        filter = 'drop-shadow(0 0 8px rgba(220, 38, 38, 0.9))'; // Strong red glow
        scale = 1.25; // Make critical stand out more
        zIndex = 40;
      } else if (sensor.status === 'warning') {
        filter = 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.8))'; // Amber glow
        scale = 1.15; // Make warning stand out
        zIndex = 30;
      } else if (sensor.status === 'active') {
         // Apply a glow for active status, slightly different if in specific mode vs default
         filter = activeMode !== 'default'
           ? 'drop-shadow(0 0 7px rgba(96, 165, 250, 0.8))' // Brighter blue in mode view
           : 'drop-shadow(0 0 5px rgba(59, 130, 246, 0.5))'; // Subtle blue in default view
         zIndex = activeMode !== 'default' ? 25 : 22;
         scale = activeMode !== 'default' ? 1.1 : 1.05; // Keep scale consistent or slightly larger
      } else if (sensor.status === 'offline') {
        filter = 'drop-shadow(0 0 6px rgba(156, 163, 175, 0.7))'; // Grayish glow for offline
        scale = 1.0;
        zIndex = 15; // Above default online, below warnings
        targetOpacity = 0.7; // Slightly faded for offline
      }
    }

    return {
      opacity: targetOpacity,
      transform: `scale(${scale})`,
      filter: filter,
      // Define specific transitions for smooth animations
      transition: 'opacity 0.3s ease-in-out, transform 0.2s ease-out, filter 0.2s ease-out',
      zIndex: zIndex,
      pointerEvents: pointerEvents,
    };
  }, [activeMode, selectedSensor?.id]); // Dependencies for memoization

  // --- Simulation Control Functions ---
  const startSimulation = useCallback(() => {
    if (simulationInterval.current) clearInterval(simulationInterval.current);
    setSimulation(prev => ({ ...prev, isRunning: true }));
    // Interval setup is handled by useEffect below
  }, []);

  const stopSimulation = useCallback(() => {
    if (simulationInterval.current) clearInterval(simulationInterval.current);
    simulationInterval.current = null;
    setSimulation(prev => ({ ...prev, isRunning: false }));
  }, []);

  const resetSimulation = useCallback(() => {
    stopSimulation();
    setSensors(defaultSensors.current); // Reset to original data
    setSimulation({ isRunning: false, speed: 'normal', tick: 0, alerts: [] });
    setSelectedSensor(null);
    setActiveMode('default');
  }, [stopSimulation]);

  const changeSimulationSpeed = useCallback((speed: SimulationSpeed) => {
    setSimulation(prev => ({ ...prev, speed }));
    // Interval update is handled by useEffect below
  }, []);

  // Add Alert function (Memoized)
  const addAlert = useCallback((sensorId: string, message: string) => {
    const alertItem = { id: sensorId, message, time: new Date() };
    setSimulation(prev => ({
      ...prev,
      // Add new alert to the beginning, limit to 10
      alerts: [alertItem, ...prev.alerts].slice(0, 10)
    }));
    if (onAlert) onAlert(sensorId, message);
  }, [onAlert]);


  // --- Simulate Sensor Changes (Memoized) ---
  const simulateSensorChanges = useCallback(() => {
    setSimulation(prev => ({ ...prev, tick: prev.tick + 1 }));
    setSensors(currentSensors => currentSensors.map(sensor => {
      // Create a mutable copy for updates
      const updatedSensor = { ...sensor };
      const prevStatus = sensor.status;
      let statusChanged = false;
      let valueChanged = false;
      const currentTick = simulation.tick + 1; // Use updated tick

      // --- Health Simulation ---
      if (Math.random() < 0.15) {
        const healthChange = Math.random() > 0.85 ? -1 : Math.random() > 0.98 ? 1 : 0; // Slower decay, rare recovery
        updatedSensor.health = Math.max(0, Math.min(100, updatedSensor.health + healthChange));
      }

      // --- Type-Specific Value/Status Simulation ---
      switch(updatedSensor.type) {
        case 'temperature':
          if (typeof updatedSensor.currentValue === 'string' && updatedSensor.currentValue.endsWith('°C')) {
            const currentTemp = parseFloat(updatedSensor.currentValue);
            if (!isNaN(currentTemp)) {
              let baselineTemp = 25; // Default ambient
              if (sensor.id.includes('hvac-out')) baselineTemp = 19;
              else if (sensor.id.includes('rack')) baselineTemp = 26; // Racks tend to be warmer
              else if (sensor.id.includes('rectifier')) baselineTemp = 33;
              else if (sensor.id.includes('tgbt')) baselineTemp = 24;
              else if (sensor.id.includes('rac')) baselineTemp = 30;

              const diff = baselineTemp - currentTemp;
              // Fluctuation: move towards baseline + random noise + occasional larger spike
              const randomFactor = (Math.random() - 0.5) * 0.8; // Base noise
              const spikeFactor = (Math.random() < 0.01) ? (Math.random() - 0.5) * 4 : 0; // Rare spike
              const tempChange = Math.sign(diff) * Math.min(Math.abs(diff * 0.1), 0.5) + randomFactor + spikeFactor;

              updatedSensor.currentValue = `${Math.max(0, Math.round((currentTemp + tempChange) * 10) / 10)}°C`;
              valueChanged = true;
            }
          }
          break;
        case 'hvac':
          if (Math.random() < 0.03) { // Slightly more frequent changes
            updatedSensor.status = updatedSensor.status === 'active' ? 'inactive' : 'active';
            updatedSensor.currentValue = updatedSensor.status === 'active' ? 'Cooling' : 'Idle';
            statusChanged = true;
          }
          break;
        case 'environment':
          if (updatedSensor.model === 'MQ-2' && typeof updatedSensor.currentValue === 'string') { // Gas
            const currentPPM = parseInt(updatedSensor.currentValue);
            if (!isNaN(currentPPM)) {
              const baseline = 150;
              const diff = baseline - currentPPM;
              // Move towards baseline + noise + rare large increase
              const change = Math.sign(diff) * Math.random() * 10 + (Math.random() - 0.5) * 20;
              const spike = Math.random() < 0.005 ? Math.random() * 300 : 0;
              updatedSensor.currentValue = `${Math.max(50, Math.min(1500, Math.floor(currentPPM + change + spike)))}ppm`;
              valueChanged = true;
            }
          } else if (updatedSensor.model === 'RainDrop-01') { // Rain
             if (currentTick % 15 === 0) { // Check less frequently
                if (Math.random() < 0.04 && updatedSensor.currentValue === 'Dry') {
                    updatedSensor.currentValue = "Wet";
                    updatedSensor.status = 'warning'; valueChanged = true; statusChanged = true;
                } else if (Math.random() < 0.25 && updatedSensor.currentValue === 'Wet') {
                    updatedSensor.currentValue = "Dry";
                    updatedSensor.status = 'online'; valueChanged = true; statusChanged = true;
                }
             }
          }
          break;
        case 'safety': // Flame
          if (Math.random() < 0.0008 && updatedSensor.currentValue === 'Normal') { // Slightly higher chance
            updatedSensor.currentValue = "Flame Detected!";
            updatedSensor.status = 'critical'; valueChanged = true; statusChanged = true;
          } else if (Math.random() < 0.1 && updatedSensor.currentValue !== 'Normal') {
            updatedSensor.currentValue = "Normal";
            updatedSensor.status = 'online'; valueChanged = true; statusChanged = true;
          }
          break;
        case 'vibration':
          if (currentTick % 8 === 0) { // Check slightly more often
            if (Math.random() < 0.03 && updatedSensor.currentValue === 'Stable') {
              updatedSensor.currentValue = "Vibration Detected";
              updatedSensor.status = 'warning'; valueChanged = true; statusChanged = true;
            } else if (Math.random() < 0.4 && updatedSensor.currentValue !== 'Stable') {
              updatedSensor.currentValue = "Stable";
              updatedSensor.status = 'online'; valueChanged = true; statusChanged = true;
            }
          }
          break;
        case 'security': // Camera, Motion
          if (updatedSensor.model.startsWith('CAM')) {
            if (Math.random() < 0.001 && updatedSensor.status === 'online') {
              updatedSensor.status = 'offline'; statusChanged = true;
              // Schedule auto-recovery
              setTimeout(() => {
                setSensors(prev => prev.map(s =>
                  s.id === updatedSensor.id && s.status === 'offline' ? {...s, status: 'online'} : s
                ));
              }, getSpeedMs() * (3 + Math.random() * 3)); // Recover after 3-6 ticks
            }
          } else if (updatedSensor.model.startsWith('PIR')) { // Motion
            // Simulate more realistic motion: bursts of activity, then longer inactivity
            const isActive = updatedSensor.status === 'active';
            if (Math.random() < (isActive ? 0.25 : 0.04)) { // Higher chance to stop, lower chance to start
              updatedSensor.currentValue = !isActive;
              updatedSensor.status = !isActive ? 'active' : 'inactive';
              statusChanged = true; valueChanged = true;
            }
          }
          break;
        case 'access': // RFID
          if (Math.random() < 0.02 && updatedSensor.status === 'online') { // Lower chance if not ready
            const accessGranted = Math.random() > 0.6; // Higher chance of grant
            updatedSensor.currentValue = accessGranted ? "Access Granted" : "Access Denied";
            updatedSensor.status = accessGranted ? 'active' : 'warning';
            statusChanged = true; valueChanged = true;
            // Reset after a short delay
            setTimeout(() => {
              setSensors(prev => prev.map(s =>
                s.id === updatedSensor.id && s.status !== 'online' ? {...s, currentValue: "Ready", status: 'online'} : s
              ));
            }, 1800); // Slightly longer timeout
          }
          break;
        case 'actuator': // Servo (Door Lock)
          if (Math.random() < 0.02) { // Less frequent changes
            const isLocked = updatedSensor.currentValue === 'Locked';
            updatedSensor.currentValue = isLocked ? 'Unlocked' : 'Locked';
            // Status reflects the *state*, not just activity. 'active' might mean 'secured' (locked).
            updatedSensor.status = updatedSensor.currentValue === 'Locked' ? 'active' : 'inactive';
            valueChanged = true; statusChanged = true;
          }
          break;
      }

      // --- Status Update based on Health (if not already set by specific logic) ---
      const oldStatusBeforeHealthCheck = updatedSensor.status;
      if (updatedSensor.health < 30 && updatedSensor.status !== 'offline') {
        updatedSensor.status = 'critical';
      } else if (updatedSensor.health < 60 && !['critical', 'offline'].includes(updatedSensor.status ?? '')) {
        updatedSensor.status = 'warning';
      } else if (updatedSensor.health >= 60 && ['critical', 'warning'].includes(updatedSensor.status ?? '') && !statusChanged) {
         // If health recovered and no other status change happened, attempt reset
         // (Need to be careful not to override 'active'/'inactive' states here)
         if (!['active', 'inactive'].includes(prevStatus ?? '')) {
            updatedSensor.status = 'online';
         } else {
             updatedSensor.status = prevStatus; // Keep active/inactive if health recovered
         }
      }
      // Check if health check changed the status
      if (oldStatusBeforeHealthCheck !== updatedSensor.status) statusChanged = true;


      // --- Status Update based on Value Thresholds ---
      if (valueChanged && updatedSensor.valueThreshold) {
        let currentValueNum: number | null = null;
        if (typeof updatedSensor.currentValue === 'number') currentValueNum = updatedSensor.currentValue;
        else if (typeof updatedSensor.currentValue === 'string') {
          const match = updatedSensor.currentValue.match(/-?\d+(\.\d+)?/); // Allow negative numbers
          if (match) currentValueNum = parseFloat(match[0]);
        }

        if (currentValueNum !== null) {
          const { warn, critical } = updatedSensor.valueThreshold;
          const oldStatusBeforeValueCheck = updatedSensor.status;

          // Handle different threshold logic (high value = bad, low value = bad)
          const isLowThresholdBad = sensor.id.includes('hvac-out'); // Example: Low temp is bad for HVAC output

          if (isLowThresholdBad) {
            if (currentValueNum <= critical) updatedSensor.status = 'critical';
            else if (currentValueNum <= warn) updatedSensor.status = 'warning';
            // If value is now normal, potentially reset status (unless offline/active/inactive)
            else if (currentValueNum > warn && ['critical', 'warning'].includes(updatedSensor.status ?? '')) {
                 if (!['offline', 'active', 'inactive'].includes(prevStatus ?? '')) {
                      updatedSensor.status = 'online';
                 } else {
                     updatedSensor.status = prevStatus; // Revert to previous non-alert state if applicable
                 }
            }
          } else { // Standard: High value is bad
            if (currentValueNum >= critical) updatedSensor.status = 'critical';
            else if (currentValueNum >= warn) updatedSensor.status = 'warning';
            // If value is now normal, potentially reset status
            else if (currentValueNum < warn && ['critical', 'warning'].includes(updatedSensor.status ?? '')) {
                 if (!['offline', 'active', 'inactive'].includes(prevStatus ?? '')) {
                      updatedSensor.status = 'online';
                 } else {
                     updatedSensor.status = prevStatus; // Revert to previous non-alert state if applicable
                 }
            }
          }
           // Check if value check changed the status
          if (oldStatusBeforeValueCheck !== updatedSensor.status) statusChanged = true;
        }
      }


      // --- Generate Alerts on Status Change ---
      if (statusChanged) {
        const currentStatus = updatedSensor.status;
        const healthInfo = `Health: ${updatedSensor.health}%`;
        const valueInfo = updatedSensor.currentValue !== undefined ? `Value: ${updatedSensor.currentValue}` : '';
        const details = valueInfo || healthInfo; // Prioritize value in message

        if (currentStatus === 'critical' && prevStatus !== 'critical') {
          addAlert(updatedSensor.id, `CRITICAL: ${updatedSensor.title}. ${details}`);
        } else if (currentStatus === 'warning' && !['critical', 'warning'].includes(prevStatus ?? '')) {
          addAlert(updatedSensor.id, `WARNING: ${updatedSensor.title}. ${details}`);
        } else if (currentStatus === 'offline' && prevStatus !== 'offline') {
          addAlert(updatedSensor.id, `ALERT: ${updatedSensor.title} went offline.`);
        } else if (currentStatus === 'online' && ['critical', 'warning', 'offline'].includes(prevStatus ?? '')) {
          // Optional: Alert when returning to normal
          // addAlert(updatedSensor.id, `INFO: ${updatedSensor.title} status returned to normal.`);
        }
      }

      // Generate alert if health drops below specific threshold (independent of status change)
      if (updatedSensor.alertThreshold && updatedSensor.health <= updatedSensor.alertThreshold && sensor.health > updatedSensor.alertThreshold) {
        addAlert(updatedSensor.id, `ALERT: ${updatedSensor.title} health low (${updatedSensor.health}%).`);
      }

      return updatedSensor;
    }));
  }, [simulation.tick, getSpeedMs, addAlert]); // Dependencies for simulation logic


  // --- Effect for controlling the simulation interval ---
  useEffect(() => {
    if (simulation.isRunning) {
      if (simulationInterval.current) clearInterval(simulationInterval.current);
      simulationInterval.current = setInterval(simulateSensorChanges, getSpeedMs());
    } else {
      if (simulationInterval.current) clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
    // Cleanup function to clear interval on unmount or when dependencies change
    return () => { if (simulationInterval.current) clearInterval(simulationInterval.current); };
  }, [simulation.isRunning, simulation.speed, getSpeedMs, simulateSensorChanges]); // Add simulateSensorChanges dependency

  const defaultIconSize = 24;
  const markerRadius = 5; // Slightly smaller status radius

  const availableViewModes: ViewMode[] = useMemo(() =>
    ['default', 'temperature', 'security', 'environment', 'hvac', 'access', 'safety']
  , []);

  return (
    <div className="flex flex-col space-y-4" style={{ backgroundColor }}>
      {/* Control Panel */}
      <div className="p-4 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-md">
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:justify-between">
          {/* View Mode Selector */}
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-medium text-gray-300">View Mode</h3>
            <RadioGroup
              value={activeMode}
              onValueChange={(value) => setActiveMode(value as ViewMode)}
              className="flex flex-wrap gap-x-4 gap-y-2"
            >
              {availableViewModes.map((mode) => (
                <div key={mode} className="flex items-center space-x-2">
                  <RadioGroupItem value={mode} id={`mode-${mode}`} className="text-blue-500 border-gray-600"/>
                  <Label
                    htmlFor={`mode-${mode}`}
                    className={cn(
                      "capitalize text-gray-300 cursor-pointer flex items-center space-x-1 text-sm hover:text-white",
                      activeMode === mode && "text-blue-400 font-medium"
                    )}
                  >
                    {mode !== 'default' && (
                      <span className="mr-1 opacity-80">
                        {getModeIcon(mode)}
                      </span>
                    )}
                    <span>{mode}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Simulation Controls */}
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-medium text-gray-300">Simulation</h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {simulation.isRunning ? (
                <Button variant="outline" size="sm" onClick={stopSimulation} className="bg-red-900/50 hover:bg-red-800/70 border-red-700/50 text-red-300 hover:text-red-100"> <Pause size={14} className="mr-1" /> Stop </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={startSimulation} className="bg-green-900/50 hover:bg-green-800/70 border-green-700/50 text-green-300 hover:text-green-100"> <Play size={14} className="mr-1" /> Run </Button>
              )}
              <Button variant="outline" size="sm" onClick={resetSimulation} className="bg-blue-900/50 hover:bg-blue-800/70 border-blue-700/50 text-blue-300 hover:text-blue-100"> <RotateCw size={14} className="mr-1" /> Reset </Button>
              <RadioGroup
                value={simulation.speed}
                onValueChange={(value) => changeSimulationSpeed(value as SimulationSpeed)}
                className="flex items-center space-x-3"
                orientation="horizontal"
              >
                {(['slow', 'normal', 'fast'] as SimulationSpeed[]).map(speed => (
                  <div key={speed} className="flex items-center space-x-1">
                    <RadioGroupItem value={speed} id={`speed-${speed}`} className="text-blue-500 border-gray-600"/>
                    <Label htmlFor={`speed-${speed}`} className={cn("capitalize text-sm text-gray-300 cursor-pointer hover:text-white", simulation.speed === speed && "text-blue-400 font-medium")}> {speed} </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </div>
      </div>

      {/* Main SVG Floor Plan and Alerts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* SVG Canvas */}
        <div className="lg:col-span-2">
          <TooltipProvider delayDuration={150}>
            <div className="w-full h-auto overflow-hidden rounded-lg border border-gray-700/50 shadow-lg relative bg-gray-800"> {/* SVG background color */}
              <svg
                width={width}
                height={height}
                viewBox={viewBox}
                xmlns="http://www.w3.org/2000/svg"
                className="block select-none" // Removed bg color here, applied to parent div
                preserveAspectRatio="xMidYMid meet"
                onClick={handleBackgroundClick}
              >
                {/* Background Image */}
                {backgroundImage && (
                  <image
                    href={backgroundImage}
                    x="0"
                    y="0"
                    width="1000" // Match viewBox width
                    height="800" // Match viewBox height
                    preserveAspectRatio="xMidYMid slice" // Use slice to cover potentially
                    opacity={0.6} // Make background slightly transparent
                  />
                )}

                {/* Render Sensors */}
                <g id="sensors-interactive">
                  {sensors.map((sensor) => {
                    const iconSize = sensor.iconSize ?? defaultIconSize;
                    const statusColor = getStatusColor(sensor.status);
                    const sensorStyle = getSensorStyle(sensor); // Calculated style with transitions
                    const iconRenderSize = iconSize * 0.85; // Icon size relative to overall size
                    const statusIndicatorOffset = iconSize * 0.45; // Position status bottom-right slightly inward

                    return (
                      <Tooltip key={sensor.id}>
                        <TooltipTrigger asChild>
                          <g
                            transform={`translate(${sensor.x}, ${sensor.y})`}
                            style={sensorStyle} // Apply dynamic style object here
                            tabIndex={sensorStyle.pointerEvents === 'none' ? -1 : 0} // Make non-interactive items unfocusable
                            aria-label={`Sensor: ${sensor.title} - Status: ${sensor.status || 'Unknown'}`}
                            onClick={(e) => {
                              // Prevent clicks if filtered out (style includes pointerEvents: 'none')
                              if (sensorStyle.pointerEvents !== 'none') {
                                e.stopPropagation(); // Prevent background click
                                handleSensorClick(sensor);
                              }
                            }}
                            onFocus={() => {
                               // Prevent focus if filtered out
                               if (sensorStyle.pointerEvents !== 'none') {
                                   handleSensorClick(sensor);
                               }
                            }}
                            // Adding pointer cursor only when interactive
                            className={sensorStyle.pointerEvents !== 'none' ? 'cursor-pointer focus:outline-none' : ''}
                          >
                            {/* Sensor Icon */}
                            <g transform={`translate(${-iconRenderSize / 2}, ${-iconRenderSize / 2})`}>
                               {getSensorIcon(sensor, iconRenderSize)}
                            </g>

                            {/* Status Indicator Circle */}
                            <circle
                              cx={statusIndicatorOffset}
                              cy={statusIndicatorOffset}
                              r={markerRadius * (selectedSensor?.id === sensor.id ? 1.2 : 1)} // Make status slightly bigger when selected
                              fill={statusColor}
                              stroke="#1F2937" // Dark background for contrast (adjust if SVG bg changes)
                              strokeWidth="1.5"
                              // Apply transition directly for smooth color/size changes
                              style={{ transition: 'r 0.2s ease-out, fill 0.3s ease-in-out' }}
                            />
                          </g>
                        </TooltipTrigger>
                        {/* Tooltip Content - only shows if trigger is interactive */}
                        <TooltipContent side="top" className="bg-gray-950 text-white border-gray-700 shadow-xl rounded-md">
                          <div className="p-2 max-w-xs text-sm">
                            <p className="font-semibold text-base mb-1">{sensor.title} <span className="text-xs font-normal text-gray-400">({sensor.model})</span></p>
                            <div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1"> {/* Adjusted grid layout */}
                              <span className="text-gray-400 font-medium">Status:</span>
                              <span style={{ color: statusColor }} className="font-medium">
                                {sensor.status?.charAt(0).toUpperCase() + sensor.status?.slice(1) || 'Unknown'}
                              </span>

                              {sensor.currentValue !== undefined && (
                                <>
                                  <span className="text-gray-400 font-medium">Value:</span>
                                  <span className="truncate">{String(sensor.currentValue)}</span>
                                </>
                              )}

                              <span className="text-gray-400 font-medium">Health:</span>
                              <span>{sensor.health}%</span>

                              {sensor.estimateTime && (
                                <>
                                  <span className="text-gray-400 font-medium">Next Maint:</span>
                                  <span>{sensor.estimateTime}</span>
                                </>
                              )}
                              <span className="text-gray-400 font-medium">Type:</span>
                              <span>{sensor.type.charAt(0).toUpperCase() + sensor.type.slice(1)}</span>
                             </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </g>
              </svg>
            </div>
          </TooltipProvider>
        </div>

        {/* Alerts Panel */}
        <div className="lg:col-span-1 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-md p-4 flex flex-col space-y-3 max-h-[600px] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-200 sticky top-0 bg-gray-900/90 pb-2 -mt-4 pt-4 z-10">
            Recent Alerts ({simulation.alerts.length})
          </h3>
          {simulation.alerts.length === 0 ? (
             <p className="text-gray-400 text-sm italic text-center py-4">No alerts.</p>
          ) : (
            <div className="space-y-3">
              {simulation.alerts.map((alert, index) => {
                  const alertSensor = sensors.find(s => s.id === alert.id);
                  const isCritical = alert.message.startsWith("CRITICAL");
                  const isWarning = alert.message.startsWith("WARNING");
                  const isOffline = alert.message.includes("offline");

                  return (
                    <div
                      key={`${alert.id}-${alert.time.toISOString()}-${index}`} // More unique key
                      className={cn(
                        "p-2 rounded-md border text-xs transition-colors duration-300",
                        isCritical ? "bg-red-900/30 border-red-700/50 text-red-200" :
                        isWarning ? "bg-amber-900/30 border-amber-700/50 text-amber-200" :
                        isOffline ? "bg-gray-700/30 border-gray-600/50 text-gray-300" :
                        "bg-blue-900/20 border-blue-800/40 text-blue-200",
                        "hover:bg-opacity-50 cursor-pointer" // Add hover effect
                      )}
                      onClick={() => alertSensor && handleSensorClick(alertSensor)} // Click alert to select sensor
                    >
                      <p className="font-medium break-words">{alert.message}</p>
                      <p className="text-gray-400 text-[11px] mt-1">
                        {alert.time.toLocaleTimeString()}
                        {alertSensor ? ` - ${alertSensor.title}` : ''}
                      </p>
                    </div>
                  );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedDataCenterFloorPlan;