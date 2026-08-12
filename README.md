# Route Deviation Detection System

An IoT-based child safety and location monitoring system designed to track a child's real-time location and detect deviations from a predefined route.

The system combines **ESP32, NEO-6M GPS, SIM800L GSM, MPU6050, Node.js/Express, MongoDB, Firebase, and React Native** to provide real-time tracking and safety notifications.

## 👥 Team Members

| Member                | GitHub                                                               |
| --------------------- | -------------------------------------------------------------------- |
| **Kushal Bhatta**     | [@kushal080bei025-source](https://github.com/kushal080bei025-source) |
| **Musnit Ijam Limbu** | [@Musnit-Ijam](https://github.com/Musnit-Ijam)                       |
| **Nabin Pokharel**    | [@Nabin080bei027-eng](https://github.com/Nabin080bei027-eng)         |

## 📌 Project Overview

The Route Deviation Detection System is developed to improve child safety by allowing parents or guardians to monitor a child's location remotely.

A GPS-enabled hardware device carried by the child collects location data and sends it to the backend server. The mobile application displays the child's live location and compares the current position with a predefined route.

If the child moves significantly away from the expected route, the system can identify the deviation and notify the responsible user.

## 🎯 Objectives

* Track the child's real-time geographical location.
* Display the child's location on a mobile application.
* Define and monitor a predefined route.
* Detect deviations from the expected route.
* Provide emergency/SOS functionality.
* Support fall detection using the MPU6050.
* Send location and emergency information to the backend.
* Store relevant user and tracking information securely.

## 🏗️ System Architecture

```text
                 ┌─────────────────────┐
                 │       NEO-6M        │
                 │      GPS Module     │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │        ESP32        │
                 │  Main Controller    │
                 └──────┬─────┬────────┘
                        │     │
              ┌─────────┘     └─────────┐
              ▼                         ▼
       ┌─────────────┐          ┌─────────────┐
       │   MPU6050   │          │   SIM800L   │
       │ Fall/Motion │          │ GSM/GPRS    │
       │  Detection  │          │ Communication│
       └─────────────┘          └──────┬──────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ Node.js/Express │
                              │    Backend      │
                              └────────┬────────┘
                                       │
                         ┌─────────────┴─────────────┐
                         ▼                           ▼
                  ┌─────────────┐             ┌─────────────┐
                  │   MongoDB   │             │   Firebase  │
                  │   Database  │             │ Notifications│
                  └─────────────┘             └─────────────┘
                         │
                         ▼
                  ┌─────────────────┐
                  │ React Native App│
                  │  Live Tracking  │
                  └─────────────────┘
```

## 🔧 Hardware Components

* **ESP32** – Main microcontroller
* **NEO-6M GPS** – Provides geographical coordinates
* **SIM800L** – GSM/GPRS communication
* **MPU6050** – Accelerometer and gyroscope for motion/fall detection
* **Li-Po Battery** – Portable power source
* **TP4056** – Battery charging module
* Push button – SOS/emergency input
* LEDs and supporting electronic components

## 💻 Software & Technologies

### Embedded System

* Arduino IDE
* C/C++
* ESP32
* TinyGPS++
* TinyGSM
* ArduinoHttpClient

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Firebase Admin SDK
* JWT
* Socket.IO

### Mobile Application

* React Native
* Expo
* Leaflet
* OpenStreetMap
* WebView

### Deployment

* GitHub
* Render
* MongoDB Atlas

## 📍 GPS Data Processing

The GPS data received from the NEO-6M module goes through several processing stages before being transmitted to the backend.

```text
NEO-6M GPS
    │
    ▼
NMEA Data
    │
    ▼
GPS Quality Validation
    │
    ▼
Outlier Detection
    │
    ▼
Moving Average Filtering
    │
    ▼
Validated Location
    │
    ▼
Backend Server
    │
    ▼
Mobile Application
```

These processing steps help reduce inaccurate GPS readings and improve the stability of the displayed location.

## 🚨 Safety Features

### Route Deviation Detection

The system uses a predefined route between locations such as home and school/playground. The child's current GPS position is compared against the expected route to identify potential deviations.

### SOS Alert

An emergency button allows the child to trigger an SOS event. The system can transmit the emergency information, including the child's location, to the backend and notify the responsible user.

### Fall Detection

The MPU6050 provides acceleration and gyroscope data that can be processed to identify abnormal motion patterns associated with a possible fall.

### Live Location Tracking

The mobile application receives location information from the backend and displays the child's current position on a map.

## 📱 Application

The mobile application provides functionality such as:

* User authentication
* Child registration
* Live child location
* Route visualization
* Route deviation monitoring
* Emergency notifications
* Map-based location tracking

## 🔐 Firebase Configuration

Firebase Admin SDK is used for backend services such as notifications.

The Firebase service-account key **must not be committed to GitHub**.

For local development, the project can use:

```text
serviceAccountKey.json
```

For production deployment, such as Render, the Firebase credentials should be stored as an environment variable:

```text
FIREBASE_SERVICE_ACCOUNT
```

The service-account JSON should never be exposed publicly.

## ⚙️ Environment Variables

Create a `.env` file for local development.

Example:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
FIREBASE_SERVICE_ACCOUNT=your_firebase_service_account_json
```

Do not commit `.env` to the repository.

Add the following to `.gitignore`:

```gitignore
node_modules/
.env
serviceAccountKey.json
```

## 🚀 Backend Setup

Clone the repository:

```bash
git clone <repository-url>
```

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Configure the required environment variables.

Start the development server:

```bash
npm run dev
```

Or start the production server:

```bash
npm start
```

The backend should then be available at:

```text
http://localhost:3000
```

## 📱 Mobile Application Setup

Install the project dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npx expo start
```

The application can then be tested using Expo Go or an appropriate emulator.

## 🔌 ESP32 Setup

1. Install Arduino IDE.
2. Install ESP32 board support.
3. Install the required libraries.
4. Connect the ESP32.
5. Configure the GPS and GSM serial pins.
6. Configure the backend server address.
7. Upload the firmware.
8. Monitor the serial output for GPS and network status.

## 📂 Suggested Repository Structure

```text
Route-Deviation-Detection/
│
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── firebase.js
│   └── package.json
│
├── mobile/
│   ├── components/
│   ├── screens/
│   ├── assets/
│   └── package.json
│
├── esp32/
│   ├── ChildTracker/
│   ├── gpsmanager.h
│   ├── gsmmanager.h
│   ├── http_client.h
│   ├── sendgps.h
│   └── token_storage.h
│
└── README.md
```

## 🔄 Overall Data Flow

```text
Child Device
     │
     │ GPS Location
     ▼
   ESP32
     │
     │ GSM/GPRS / Internet
     ▼
 Express Backend
     │
     ├──────────────► MongoDB
     │
     ├──────────────► Firebase
     │
     ▼
 React Native App
     │
     ▼
Live Location + Route Monitoring
```

## 🔮 Future Improvements

* Improved GPS filtering using Extended Kalman Filter (EKF)
* More accurate route deviation detection
* Geofencing
* Improved battery optimization
* Offline location storage
* Better emergency notification handling
* Additional wearable-device integration
* Improved security and authentication
* More robust GSM/network failure handling

## 📜 License

This project was developed as an academic project by:

**Kushal Bhatta · Musnit Ijam Limbu · Nabin Pokharel**

All rights reserved unless otherwise specified.
