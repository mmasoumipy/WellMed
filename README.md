# WellMed - Healthcare Professional Burnout Prevention App

<div align="center">

![WellMed Logo](mobile/WellMed/assets/logo_half.png)

**A comprehensive mobile application designed to detect and prevent burnout among healthcare professionals**

[![React Native](https://img.shields.io/badge/React%20Native-0.79.1-blue.svg)](https://reactnative.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

</div>

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [API Documentation](#api-documentation)
<!-- - [Screenshots](#screenshots) -->

## 🩺 Overview

WellMed is a specialized mobile application designed specifically for healthcare professionals to monitor, assess, and prevent burnout. The app provides evidence-based assessment tools, wellness activities, and AI-powered support to help healthcare workers maintain their mental health and professional wellbeing.

### 🎯 Mission

To provide healthcare professionals with accessible, scientifically-backed tools for monitoring and improving their mental health, ultimately leading to better patient care and reduced healthcare worker burnout.

## ✨ Features

### 📊 Assessment Tools
- **Maslach Burnout Inventory (MBI)** - Gold standard for burnout assessment
- **Micro Assessments** - Quick daily wellness check-ins
- **Mood Tracking** - Simple emotion logging with trend analysis

### 🧘 Wellness Activities
- **Box Breathing** - 4-4-4-4 breathing technique with guided sessions
- **Stretching Routines** - Targeted exercises for healthcare workers
- **Activity Tracking** - Monitor wellness session streaks and progress

### 🤖 AI Support
- **Carely Chatbot** - AI companion for emotional support and guidance
- **Daily Journaling** - Reflective writing with AI-powered insights
- **Personalized Recommendations** - Tailored wellness suggestions

### 📈 Analytics & Insights
- **Burnout Risk Assessment** - Real-time risk calculation and trends
- **Progress Tracking** - Visual representations of wellness journey
- **Historical Data** - Long-term pattern recognition and insights

### 🔔 Smart Notifications
- **Assessment Reminders** - Monthly MBI and daily check-in prompts
- **Wellness Nudges** - Encouraging messages and activity suggestions
- **Streak Celebrations** - Positive reinforcement for consistent use

## 🛠 Tech Stack

### Frontend (Mobile)
- **React Native** 0.79.1 - Cross-platform mobile development
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation library
- **React Native Vector Icons** - Icon library
- **React Native Chart Kit** - Data visualization
- **AsyncStorage** - Local data persistence
- **Axios** - HTTP client for API communication

### Backend (API)
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Python SQL toolkit and ORM
- **PostgreSQL** - Robust relational database
- **Alembic** - Database migration tool
- **Pydantic** - Data validation using Python type hints
- **Passlib** - Password hashing library
- **Jose** - JWT token handling

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **PostgreSQL** - Production database

## 🏗 Architecture

```
WellMed/
├── mobile/WellMed/          # React Native mobile app
│   ├── src/
│   │   ├── screens/         # App screens
│   │   ├── components/      # Reusable components
│   │   ├── api/            # API integration
│   │   ├── constants/      # App constants and colors
│   │   └── utils/          # Utility functions
│   ├── ios/                # iOS-specific files
│   └── android/            # Android-specific files
│
└── backend/                # FastAPI backend
    ├── app/
    │   ├── models/         # Database models
    │   ├── routes/         # API endpoints
    │   ├── schemas.py      # Pydantic schemas
    │   ├── crud.py         # Database operations
    │   └── main.py         # FastAPI app
    ├── Dockerfile          # Backend containerization
    └── requirements.txt    # Python dependencies
```

## 🚀 Installation

### Prerequisites
- Node.js (v16 or later)
- Python 3.11+
- PostgreSQL 15+
- Docker & Docker Compose
- iOS: Xcode 14+ and iOS Simulator
- Android: Android Studio and Android SDK

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/wellmed-app.git
cd wellmed-app
```

2. **Set up backend with Docker**
```bash
cd backend
docker-compose up -d
```

3. **Or run backend locally**
```bash
cd backend
pip install -r requirements.txt
export DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/wellmed_db"
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

### Mobile App Setup

1. **Navigate to mobile directory**
```bash
cd mobile/WellMed
```

2. **Install dependencies**
```bash
npm install
```

3. **iOS Setup**
```bash
cd ios
pod install
cd ..
```

4. **Environment Configuration**
Create `.env` file in mobile/WellMed/:
```env
PUBLIC_API_BASE_URL=http://127.0.0.1:8080
```

5. **Run the app**
```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

### Database Setup

The database will be automatically set up when running with Docker Compose. For manual setup:

```sql
CREATE DATABASE wellmed_db;
CREATE USER myuser WITH ENCRYPTED PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE wellmed_db TO myuser;
```

## 📚 API Documentation

The API documentation is automatically generated and available at:
- **Swagger UI**: `http://localhost:8080/docs`
- **ReDoc**: `http://localhost:8080/redoc`

### Key Endpoints

#### Authentication
- `POST /users/register` - User registration
- `POST /users/login` - User authentication

#### Assessments
- `POST /micro/` - Submit micro assessment
- `GET /micro/user/{user_id}` - Get user's micro assessments
- `POST /mbi/` - Submit MBI assessment
- `GET /mbi/user/{user_id}` - Get user's MBI assessments

#### Wellness
- `POST /wellness/` - Record wellness activity
- `GET /wellness/user/{user_id}` - Get user's wellness activities
- `GET /wellness/user/{user_id}/stats` - Get wellness statistics

#### Mood & Journal
- `POST /moods/` - Log mood entry
- `GET /moods/user/{user_id}` - Get mood history
- `POST /journals/` - Create journal entry
- `GET /journals/user/{user_id}` - Get journal entries

<!-- ## 📱 Screenshots

<div align="center">

| Home Screen | Wellness Activities | MBI Assessment |
|-------------|-------------------|----------------|
| ![Home](screenshots/home.png) | ![Wellness](screenshots/wellness.png) | ![MBI](screenshots/mbi.png) |

| Carely Chat | Profile | Settings |
|-------------|---------|----------|
| ![Chat](screenshots/chat.png) | ![Profile](screenshots/profile.png) | ![Settings](screenshots/settings.png) |

</div> -->


## 📈 Data Models

### Core Models
- **User** - Healthcare professional profiles
- **MoodEntry** - Daily mood tracking
- **MicroAssessment** - Quick wellness check-ins
- **MBIAssessment** - Comprehensive burnout assessments
- **WellnessActivity** - Breathing and stretching sessions
- **JournalEntry** - Reflective writing entries
- **Goal** - Personal wellness objectives


---

<div align="center">

**Made with ❤️ for Healthcare Heroes**

*WellMed - Because those who heal others deserve healing too*

</div>