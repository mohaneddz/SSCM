# Smart Server Center Monitoring & Control System Documentation

## Overview
This system provides a real-time monitoring and control platform for server centers (callrooms). It is built using Raspberry Pi hardware, secure MQTT communication, and a modern web dashboard built with Next.js. The platform enables continuous tracking, real-time visualization, and remote management of environmental and security parameters within each server room.

---

## System Architecture

### 1. Hardware Layer
- **Device**: Raspberry Pi  
- **Sensors**: Temperature, humidity, motion, smoke detectors  
- **Actuators**: Fans, alarms, LEDs (for visual indicators)  
- **Connectivity**: Devices connect to the network and communicate via the MQTT protocol

### 2. Communication Layer
- **Protocol**: MQTT (Message Queuing Telemetry Transport)  
- **Security**: Encrypted transmission (TLS/SSL)  
- **Broker**: Secure and private MQTT broker handling publish/subscribe events

### 3. Backend Services
- **Database**: Supabase (PostgreSQL)  
- **Authentication**: Supabase Auth  
- **Realtime Updates**: Supabase Realtime or MQTT-integrated updates

### 4. Web Dashboard (Frontend)
- **Framework**: Next.js  
- **Data Visualization**: Recharts  
- **Design**: Tailwind CSS  
- **Features**:
- **Interactive** map of callrooms  

---

## Features

### Callroom Map Interface
- Displays each callroom’s location and live status  
- Color-coded indicators for temperature and alert levels

### Realtime Sensor Monitoring
- Displays live temperature, humidity, and other sensor data  
- Charted using Recharts with real-time updates

### Remote Control
- Admins can activate/deactivate devices (fans, alarms)  
- Secure commands sent via MQTT to Raspberry Pi controllers

---

## Project Screenshots Gallery

### Dashboard & Monitoring Views
![Dashboard Landing Page](/screenshots/0.png)
*Landing page of the NEST application with main navigation*

![Dashboard Overview](/screenshots/1.png)
*Dashboard overview with temperature and system status cards*

![Server Room Map](/screenshots/2.png)
*Map view showing server room locations with status indicators*

![Power Monitoring](/screenshots/3.png)
*Power consumption monitoring with usage graphs and analytics*

![Server Metrics](/screenshots/4.png)
*Server performance metrics with CPU, memory, and network charts*

![Health Monitoring](/screenshots/5.png)
*Health monitoring page showing component status indicators*

### Control & Management Screens
![Environmental Control](/screenshots/6.png)
*Control panel for managing server room environmental systems*

![Device Management](/screenshots/7.png)
*Device management interface for sensors and actuators*

![System Logs](/screenshots/8.png)
*System logs and event records with filtering capabilities*

![User Management](/screenshots/9.png)
*User management and access control settings*

![Surveillance View](/screenshots/10.png)
*Surveillance view showing camera feeds from monitored areas*

![Weather Conditions](/screenshots/11.png)
*Weather conditions and environmental forecasting*

### Configuration & Simulation
![Floor Plan](/screenshots/12.png)
*Floor plan simulation showing device placement*

![Device Configuration](/screenshots/13.png)
*Device configuration dialog for sensor settings*

![System Settings](/screenshots/14.png)
*System settings and global configuration options*

![Alert Configuration](/screenshots/15.png)
*Alert configuration for temperature and security thresholds*

![Network Topology](/screenshots/16.png)
*Network topology map showing connectivity between devices*

![Scheduling](/screenshots/17.png)
*Scheduling interface for automated system operations*

### Analytics & Reports
![Historical Analytics](/screenshots/18.png)
*Historical performance analytics with trend visualization*

![Power Usage Report](/screenshots/19.png)
*Power usage report with efficiency recommendations*

![Security Reports](/screenshots/20.png)
*Security incident reports and audit logs*

![System Health Report](/screenshots/21.png)
*System health report with component status history*

![Environmental Reports](/screenshots/22.png)
*Environmental conditions report showing temperature trends*

![User Activity Dashboard](/screenshots/23.png)
*User activity dashboard showing login and action history*

---

