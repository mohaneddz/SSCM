# 🖥️ SSCM - Smart Server Center Monitoring

## 📌 Overview
Smart Server Center is a **real-time monitoring and control platform** for server centers (callrooms).  
It integrates **Raspberry Pi hardware**, **secure MQTT communication**, and a **modern Next.js dashboard** to provide live tracking, remote control, and visual insights into environmental and security metrics.

---

## 🚀 Features
- **Interactive Callroom Map**: Live status, color-coded indicators for temperature and alerts  
- **Realtime Sensor Monitoring**: Temperature, humidity, motion, and smoke data visualized with charts  
- **Remote Device Control**: Activate/deactivate fans, alarms, and LEDs securely via MQTT  
- **User Management & Access Control**  
- **Historical Analytics & Reporting**: System health, power consumption, and environmental trends  
- **Configurable Alerts**: Temperature, humidity, and security thresholds  
- **Scheduling & Automation**: Automated device operations based on time/events  

---

## 🏗 System Architecture

| Layer | Components | Description |
|-------|------------|-------------|
| **Hardware** | Raspberry Pi, Sensors (Temp, Humidity, Motion, Smoke), Actuators (Fans, LEDs, Alarms) | Devices connect via network and send data via MQTT |
| **Communication** | MQTT Protocol, TLS/SSL encryption, Secure Broker | Handles pub/sub events for real-time control and monitoring |
| **Backend Services** | Supabase (PostgreSQL), Supabase Auth, Realtime Updates | Stores data, manages users, and pushes updates to the frontend |
| **Frontend** | Next.js, TailwindCSS, Recharts | Real-time dashboard for visualization, control, and analytics |

---

## 📸 Screenshots Gallery

### Dashboard & Monitoring Views
| Dashboard Landing | Overview | Callroom Map |
|-----------------|---------|--------------|
| ![](/screenshots/0.png) | ![](/screenshots/1.png) | ![](/screenshots/2.png) |

| Power Monitoring | Server Metrics | Health Monitoring |
|-----------------|---------------|-----------------|
| ![](/screenshots/3.png) | ![](/screenshots/4.png) | ![](/screenshots/5.png) |

### Control & Management Screens
| Environmental Control | Device Management | System Logs |
|----------------------|-----------------|------------|
| ![](/screenshots/6.png) | ![](/screenshots/7.png) | ![](/screenshots/8.png) |

| User Management | Surveillance View | Weather Conditions |
|----------------|-----------------|-----------------|
| ![](/screenshots/9.png) | ![](/screenshots/10.png) | ![](/screenshots/11.png) |

### Configuration & Simulation
| Floor Plan | Device Configuration | System Settings |
|------------|-------------------|----------------|
| ![](/screenshots/12.png) | ![](/screenshots/13.png) | ![](/screenshots/14.png) |

| Alert Configuration | Network Topology | Scheduling |
|-------------------|----------------|------------|
| ![](/screenshots/15.png) | ![](/screenshots/16.png) | ![](/screenshots/17.png) |

### Analytics & Reports
| Historical Analytics | Power Usage Report | Security Reports |
|--------------------|-----------------|----------------|
| ![](/screenshots/18.png) | ![](/screenshots/19.png) | ![](/screenshots/20.png) |

| System Health Report | Environmental Reports | User Activity Dashboard |
|--------------------|---------------------|-----------------------|
| ![](/screenshots/21.png) | ![](/screenshots/22.png) | ![](/screenshots/23.png) |

---

## 🛠️ Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs)  
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)  
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss)  
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python)  
![MQTT](https://img.shields.io/badge/MQTT-FF6F00?style=for-the-badge&logo=mqtt)  
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase)  
![Raspberry Pi](https://img.shields.io/badge/Raspberry%20Pi-C51A4A?style=for-the-badge&logo=raspberry-pi)  

---

## 🔧 Installation

```bash
git clone <repository-url>
cd smart-server-center
pnpm install
pnpm run dev
````

Raspberry Pi devices must be configured with sensors and actuators, connected to the MQTT broker, and linked with Supabase credentials.

---

## 📄 License

This project is released under the **MIT License**.
