# Route Deviation Detection System 🚸

An IoT-based child safety system that provides **real-time location tracking and route deviation detection** using GPS, GSM, ESP32, and a mobile application.

The system is designed to help parents or guardians monitor a child's location and identify when the child moves away from a predefined route.

---

## 👥 Team

### Kushal Bhatta

GitHub: [kushal Bhatta](https://github.com/kushal080bei025-source)

### Musnit Ijam Limbu

GitHub: [Musnit Ijam Limbu](https://github.com/Musnit-Ijam)

### Nabin Pokharel

GitHub: [Nabin Pokharel](https://github.com/Nabin080bei027-eng)

---

## 📌 About the Project

The **Route Deviation Detection System** combines an embedded tracking device, backend server, database, and mobile application.

The tracking device collects GPS coordinates using the **NEO-6M GPS module** and processes the location data using an **ESP32**. The processed location is transmitted to the backend server through network connectivity.

The mobile application displays the child's live location and provides route monitoring. If the child moves away from the predefined route, the system can detect the deviation and provide an alert.

---

## ✨ Features

* 📍 Real-time child location tracking
* 🛣️ Predefined route monitoring
* 🚸 Route deviation detection
* 🆘 SOS emergency alert
* 📱 Mobile application for monitoring
* 📡 GSM/GPRS communication
* 🛰️ GPS-based positioning
* 📳 Firebase notifications
* 🧭 Motion/fall detection using MPU6050
* 🔐 User authentication
* ☁️ Cloud-based backend

---

## 🏗️ System Architecture

```text
                  ┌───────────────┐
                  │    NEO-6M     │
                  │      GPS      │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │     ESP32     │
                  │ Microcontroller│
                  └───────┬───────┘
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
        ┌─────────┐  ┌─────────┐  ┌─────────┐
        │ SIM800L │  │ MPU6050 │  │ SOS Btn │
        │  GSM    │  │ Motion  │  │         │
        └────┬────┘  └─────────┘  └─────────┘
             │
             │ Internet
             ▼
       ┌─────────────────┐
       │ Node.js/Express │
       │     Backend     │
       └────────┬────────┘
                │
         ┌──────┴──────┐
         ▼             ▼
    ┌─────────┐   ┌──────────┐
    │ MongoDB │   │ Firebase │
    └─────────┘   └──────────┘
         │
         ▼
   ┌─────────────────┐
   │  React Native   │
   │  Mobile App     │
   └─────────────────┘
```

---

## 🔧 Hardware

| Component         | Purpose                   |
| ----------------- | ------------------------- |
| **ESP32**         | Main microcontroller      |
| **NEO-6M**        | GPS location acquisition  |
| **SIM800L**       | GSM/GPRS communication    |
| **MPU6050**       | Motion and fall detection |
| **Push Button**   | SOS emergency trigger     |
| **Li-Po Battery** | Power supply              |
| **TP4056**        | Battery charging          |

---

## 💻 Software & Technologies

### Embedded System

* C/C++
* Arduino IDE
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

---

## 🛰️ GPS Data Processing

GPS data received from the NEO-6M goes through multiple processing stages:

```text
NEO-6M
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
Moving Average Filter
  │
  ▼
Validated Latitude & Longitude
  │
  ▼
Backend Server
  │
  ▼
Mobile Application
```

This processing helps reduce inaccurate GPS readings and provides more stable location information.

---

## 🆘 Emergency System

The device includes an SOS button that can be used to trigger an emergency event.

When an SOS event is triggered, the system can transmit relevant information such as:

* Child/device identification
* Current GPS location
* Emergency status

The backend can then process the event and provide a notification to the monitoring application.

---

## 🧭 Route Deviation Detection

A predefined route is created between selected locations.

The system continuously compares the child's current GPS position with the expected route.

```text
       Predefined Route
Home ───────────────────────► School
             ▲
             │
             │ Expected path
             │
          Child ●
             │
             │
             ▼
       Possible deviation
```

If the child's position moves beyond the acceptable route boundary, the system identifies a possible route deviation.

---

## 📱 Mobile Application

The mobile application provides:

* User login and authentication
* Child information
* Live location tracking
* Route visualization
* Route deviation monitoring
* Emergency notifications
* Map-based monitoring

The map interface uses **OpenStreetMap** data displayed through Leaflet.

---

## ☁️ Backend

The backend is developed using **Node.js and Express.js**.

It handles:

* User authentication
* Child/device information
* GPS location updates
* Route information
* Location storage
* Route deviation processing
* Emergency events
* Firebase notifications

The backend can be deployed using **Render**, while MongoDB can be hosted using **MongoDB Atlas**.

---

## 🔐 Firebase Configuration

Firebase Admin SDK is used for backend services such as notifications.

The Firebase service-account key must **not** be uploaded to GitHub.

For local development:

```text
serviceAccountKey.json
```

can be used.

For production deployment on Render, Firebase credentials can be stored as:

```text
FIREBASE_SERVICE_ACCOUNT
```

The credential file should also be included in `.gitignore`:

```gitignore
node_modules/
.env
serviceAccountKey.json
```

---

## 📂 Repository Structure

```text
Route-Deviation-Detection/
│
├── backend/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── firebase.js
│   ├── server.js
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

---

## 🚀 Future Improvements

* Extended Kalman Filter (EKF) for improved GPS accuracy
* More accurate route deviation detection
* Geofencing
* Battery optimization
* Offline data storage
* Improved GSM connectivity handling
* Enhanced notification system
* Improved device security
* Compact wearable hardware design

---

## 🎓 Academic Project

This project is developed as an academic project by:

**Kushal Bhatta · Musnit Ijam Limbu · Nabin Pokharel**

---

## 📜 License

This project is intended for educational and academic purposes.
