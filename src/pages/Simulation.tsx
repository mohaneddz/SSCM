import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from "next-themes";
import { Tooltip } from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Plus, Trash, Settings, Eye, Save, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { Toaster } from 'sonner';

interface DeviceInfo {
  id: string;
  name: string;
  type: 'sensor' | 'actuator';
  status: string;
  image: string;
  description: string;
  position: { x: number; y: number };
}

export default function Simulation() {
  const { theme } = useTheme(); // Get current theme
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);
  const [mode, setMode] = useState<'read' | 'edit'>('read');
  const [devices, setDevices] = useState<DeviceInfo[]>([
    {
      id: 'camera1',
      name: 'Indoor Camera',
      type: 'sensor',
      status: 'Active',
      image: '/components/Camera.png',
      description: 'Indoor surveillance camera',
      position: { x: 200, y: 150 }
    },
    {
      id: 'camera2',
      name: 'Door Camera',
      type: 'sensor',
      status: 'Active',
      image: '/components/Camera.png',
      description: 'Door surveillance camera',
      position: { x: 400, y: 100 }
    },
    {
      id: 'motion1',
      name: 'Motion Sensor',
      type: 'sensor',
      status: 'Active',
      image: '/components/motion_sensor.png',
      description: 'Detects movement in the area',
      position: { x: 300, y: 200 }
    },
    {
      id: 'dht22',
      name: 'DHT22 Sensor',
      type: 'sensor',
      status: 'Active',
      image: '/components/DHT11.png',
      description: 'Temperature and humidity sensor',
      position: { x: 250, y: 250 }
    },
    {
      id: 'mq',
      name: 'MQ Gas Sensor',
      type: 'sensor',
      status: 'Active',
      image: '/components/fallback.png',
      description: 'Gas detection sensor',
      position: { x: 350, y: 250 }
    },
    {
      id: 'flame',
      name: 'KY-026 Flame Sensor',
      type: 'sensor',
      status: 'Active',
      image: '/components/fallback.png',
      description: 'Flame detection sensor',
      position: { x: 400, y: 300 }
    },
    {
      id: 'vibration',
      name: 'Ball Switch',
      type: 'sensor',
      status: 'Active',
      image: '/components/fallback.png',
      description: 'Vibration detection sensor',
      position: { x: 200, y: 300 }
    },
    {
      id: 'rfid',
      name: 'RFID Reader',
      type: 'sensor',
      status: 'Active',
      image: '/components/RFID.png',
      description: 'RFID access control',
      position: { x: 450, y: 100 }
    },
    {
      id: 'fan1',
      name: 'Fan 1',
      type: 'actuator',
      status: 'Active',
      image: '/components/Ventilation.png',
      description: 'Air conditioning unit 1',
      position: { x: 150, y: 150 }
    },
    {
      id: 'fan2',
      name: 'Fan 2',
      type: 'actuator',
      status: 'Active',
      image: '/components/Ventilation.png',
      description: 'Air conditioning unit 2',
      position: { x: 300, y: 150 }
    },
    {
      id: 'fan3',
      name: 'Fan 3',
      type: 'actuator',
      status: 'Active',
      image: '/components/Ventilation.png',
      description: 'Air conditioning unit 3',
      position: { x: 450, y: 150 }
    },
    {
      id: 'servo',
      name: 'Servo Motor',
      type: 'actuator',
      status: 'Active',
      image: '/components/servo_motor.png',
      description: 'Door control mechanism',
      position: { x: 500, y: 100 }
    },
  ]);

  // For adding or editing devices
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editDevice, setEditDevice] = useState<DeviceInfo | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved layout from localStorage on component mount
  useEffect(() => {
    try {
      const savedDevices = localStorage.getItem('floorPlanDevices');
      if (savedDevices) {
        setDevices(JSON.parse(savedDevices));
        toast.success("Layout Loaded", {
          description: "Successfully loaded saved device layout",
        });
      }
    } catch (error) {
      console.error("Error loading saved layout:", error);
    }
  }, []);

  // Handle device click based on mode
  const handleDeviceClick = (device: DeviceInfo, e: React.MouseEvent) => {
    // Stop propagation to prevent container click handler from firing
    e.stopPropagation();

    if (mode === 'read') {
      setSelectedDevice(device);
    } else {
      // In edit mode, we'll show device actions
      setSelectedDevice(device);
    }
  };

  // Add a new device at click position
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== 'edit') return;

    // Ignore clicks on devices
    if ((e.target as HTMLElement).closest('[data-device]')) return;

    // Get position relative to the container
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Open dialog to add a new device
    setDialogMode('add');
    setEditDevice({
      id: `device-${Date.now()}`,
      name: '',
      type: 'sensor',
      status: 'Active',
      image: '/components/fallback.png',
      description: '',
      position: { x, y }
    });
    setIsDialogOpen(true);
  };

  // Handle device dragging in edit mode
  const handleDeviceDragStart = (device: DeviceInfo, e: React.MouseEvent) => {
    if (mode !== 'edit') return;

    e.preventDefault();
    e.stopPropagation(); // Prevent container click
    setIsDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialPosition = { ...device.position };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      // Update device position
      setDevices(prev => prev.map(d => {
        if (d.id === device.id) {
          const newX = Math.max(0, Math.min(rect.width, initialPosition.x + deltaX));
          const newY = Math.max(0, Math.min(rect.height, initialPosition.y + deltaY));
          return {
            ...d,
            position: { x: newX, y: newY }
          };
        } const getLocationName = async (latitude: number, longitude: number): Promise<string> => {
          const apiKey = 'YOUR_OPENCAGE_API_KEY';
          const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;

          try {
            const response = await fetch(url);
            const data = await response.json();
            return data.results[0]?.formatted || 'Unknown location';
          } catch (error) {
            console.error('Error fetching location:', error);
            return 'Error fetching location';
          }
        };

        return d;
      }));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Edit device
  const handleEditDevice = (device: DeviceInfo) => {
    setDialogMode('edit');
    setEditDevice({ ...device });
    setIsDialogOpen(true);
  };

  // Delete device
  const handleDeleteDevice = (device: DeviceInfo) => {
    setDevices(devices.filter(d => d.id !== device.id));
    if (selectedDevice?.id === device.id) {
      setSelectedDevice(null);
    }
  };

  // Save device
  const handleSaveDevice = () => {
    if (!editDevice) return;

    if (dialogMode === 'add') {
      setDevices([...devices, editDevice]);
    } else {
      setDevices(devices.map(device =>
        device.id === editDevice.id ? editDevice : device
      ));
    }

    setIsDialogOpen(false);
  };

  // Update edit device form
  const updateEditDevice = (field: keyof DeviceInfo, value: any) => {
    if (!editDevice) return;
    setEditDevice({ ...editDevice, [field]: value });
  };

  // Save layout to localStorage
  const saveLayout = () => {
    try {
      localStorage.setItem('floorPlanDevices', JSON.stringify(devices));
      toast.success("Layout Saved", {
        description: "Device layout has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving layout:", error);
      toast.error("Save Error", {
        description: "Failed to save device layout",
      });
    }
  };

  // Export layout as JSON file
  const exportLayout = () => {
    const dataStr = JSON.stringify(devices, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

    const exportFileDefaultName = `floor-plan-layout-${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import layout from JSON file
  const importLayout = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setDevices(json);
        toast.success("Layout Imported", {
          description: "Device layout has been imported successfully",
        });
      } catch (error) {
        console.error("Error parsing imported file:", error);
        toast.error("Import Error", {
          description: "Failed to import device layout. Invalid file format.",
        });
      }
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative w-full h-full dark:bg-black p-4 overflow">
      <Toaster richColors />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold dark:text-white">Floor Plan Simulation</h1>

        <div className="flex items-center gap-2">
          {/* Mode Toggle */}
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'read' | 'edit')} className="bg-gray-800 rounded-lg">
            <TabsList>
              <TabsTrigger value="read" className="flex items-center gap-1">
                <Eye size={16} />
                Read Mode
              </TabsTrigger>
              <TabsTrigger value="edit" className="flex items-center gap-1">
                <Settings size={16} />
                Edit Mode
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Save/Load Buttons - Only visible in edit mode */}
          {mode === 'edit' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={saveLayout}
                className="flex items-center gap-1 text-green-400 border-green-500"
              >
                <Save size={16} />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportLayout}
                className="flex items-center gap-1"
              >
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={importLayout}
                className="flex items-center gap-1"
              >
                <Upload size={16} />
                Import
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mode Description */}
      <div className={`mb-4 p-2 rounded ${mode === 'edit' ? 'bg-amber-600/20 text-amber-800 dark:text-amber-300' : 'text-blue-800 bg-blue-600/20 dark:text-blue-300'}`}>
        {mode === 'edit'
          ? "Edit Mode: Click on the floor plan to add devices. Drag to move devices. Use the device menu to edit or delete."
          : "Read Mode: Click on devices to view their details."
        }
      </div>

      {/* Floor Plan Container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-4xl h-[600px] mx-auto border-2 border-gray-700 rounded-lg cursor-default overflow-hidden"
        onClick={handleContainerClick}
        style={{ cursor: mode === 'edit' ? 'crosshair' : 'default' }}
      >
        {/* Floor Plan Background with Image */}
        <div className="absolute inset-0">
          {/* Dark overlay for better visibility - use gray background in light mode */}
          <div className="absolute inset-0 bg-[#02060e] dark:bg-opacity-30 bg-opacity-0 z-10" 
               style={{ backgroundColor: theme === 'dark' ? '#02060e' : '#ffffff' }}>
          </div>
          
          {/* Floor Plan Image */}
          <div className="w-full h-full relative z-20">
            <Image
              src={theme === 'dark' ? "/plan-dark.svg" : "/plan-light.svg"}
              alt="Floor Plan"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
              style={{ objectFit: "contain" }}
              className="opacity-80"
              priority
            />
          </div>
        </div>

        {/* Device Markers */}
        {devices.map((device) => (
          <div
            key={device.id}
            data-device={device.id}
            className={`absolute cursor-pointer transform z-30 -translate-x-1/2 -translate-y-1/2 ${device.type === 'sensor' ? 'text-blue-500' : 'text-green-500'
              } ${isDragging ? 'pointer-events-none' : ''} ${mode === 'edit' ? 'hover:scale-110' : ''}`}
            style={{
              left: device.position.x,
              top: device.position.y,
              cursor: mode === 'edit' ? 'move' : 'pointer'
            }}
            onClick={(e) => handleDeviceClick(device, e)}
            onMouseDown={mode === 'edit' ? (e) => handleDeviceDragStart(device, e) : undefined}
          >
            <div className="w-4 h-4 rounded-full bg-current animate-pulse" />
            <div className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 text-xs dark:text-white whitespace-nowrap">
              {device.name}
            </div>

            {/* Edit mode controls */}
            {mode === 'edit' && selectedDevice?.id === device.id && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="outline" className="h-6 w-6 rounded-full bg-gray-800">
                      <Settings size={12} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-40">
                    <DropdownMenuLabel>Device Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEditDevice(device)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteDevice(device)} className="text-red-600">
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        ))}

        {/* Device Info Popup - Only in Read Mode */}
        {mode === 'read' && selectedDevice && (
          <Card className="absolute right-4 top-4 p-4 bg-gray-800 text-white w-64">
            <h3 className="text-lg font-bold mb-2">{selectedDevice.name}</h3>
            <img
              src={selectedDevice.image}
              alt={selectedDevice.name}
              className="w-20 h-20 object-contain mb-2"
            />
            <p className="text-sm mb-1">Type: {selectedDevice.type}</p>
            <p className="text-sm mb-1">Status: {selectedDevice.status}</p>
            <p className="text-sm">{selectedDevice.description}</p>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => setSelectedDevice(null)}
            >
              ×
            </button>
          </Card>
        )}
      </div>

      {/* Add/Edit Device Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'add' ? 'Add New Device' : 'Edit Device'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {dialogMode === 'add'
                ? 'Add a new device to the floor plan.'
                : 'Edit device details and location.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={editDevice?.name || ''}
                onChange={(e) => updateEditDevice('name', e.target.value)}
                className="col-span-3 bg-gray-700 text-white border-gray-600"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Select
                value={editDevice?.type || 'sensor'}
                onValueChange={(value) => updateEditDevice('type', value as 'sensor' | 'actuator')}
              >
                <SelectTrigger className="col-span-3 bg-gray-700 text-white border-gray-600">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 text-white border-gray-600">
                  <SelectItem value="sensor">Sensor</SelectItem>
                  <SelectItem value="actuator">Actuator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select
                value={editDevice?.status || 'Active'}
                onValueChange={(value) => updateEditDevice('status', value)}
              >
                <SelectTrigger className="col-span-3 bg-gray-700 text-white border-gray-600">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 text-white border-gray-600">
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">Image</Label>
              <Select
                value={editDevice?.image || '/components/fallback.png'}
                onValueChange={(value) => updateEditDevice('image', value)}
              >
                <SelectTrigger className="col-span-3 bg-gray-700 text-white border-gray-600">
                  <SelectValue placeholder="Select image" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 text-white border-gray-600">
                  <SelectItem value="/components/Camera.png">Camera</SelectItem>
                  <SelectItem value="/components/motion_sensor.png">Motion Sensor</SelectItem>
                  <SelectItem value="/components/DHT11.png">Temperature Sensor</SelectItem>
                  <SelectItem value="/components/RFID.png">RFID Reader</SelectItem>
                  <SelectItem value="/components/Ventilation.png">Fan</SelectItem>
                  <SelectItem value="/components/servo_motor.png">Servo Motor</SelectItem>
                  <SelectItem value="/components/fallback.png">Other Device</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Input
                id="description"
                value={editDevice?.description || ''}
                onChange={(e) => updateEditDevice('description', e.target.value)}
                className="col-span-3 bg-gray-700 text-white border-gray-600"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Position</Label>
              <div className="col-span-3 flex gap-2">
                <div className="flex items-center">
                  <Label htmlFor="posX" className="mr-2">X:</Label>
                  <Input
                    id="posX"
                    type="number"
                    value={Math.round(editDevice?.position?.x || 0)}
                    onChange={(e) => updateEditDevice('position', {
                      ...editDevice?.position,
                      x: Number(e.target.value)
                    })}
                    className="w-20 bg-gray-700 text-white border-gray-600"
                  />
                </div>
                <div className="flex items-center">
                  <Label htmlFor="posY" className="mr-2">Y:</Label>
                  <Input
                    id="posY"
                    type="number"
                    value={Math.round(editDevice?.position?.y || 0)}
                    onChange={(e) => updateEditDevice('position', {
                      ...editDevice?.position,
                      y: Number(e.target.value)
                    })}
                    className="w-20 bg-gray-700 text-white border-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="text-white">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveDevice} className="bg-green-600 hover:bg-green-700">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}