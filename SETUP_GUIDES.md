# GoDiscreet - Complete Setup Guides

## 📱 Mobile App Setup Guide (Flutter)

### Prerequisites
- Flutter SDK 3.10+ ([Download](https://flutter.dev/docs/get-started/install))
- Android Studio / Xcode
- Git
- VS Code or Android Studio

### Step 1: Clone Repository
```bash
git clone https://github.com/abhimanyukinra19-eng/GoDiscreet.git
cd GoDiscreet/mobile
```

### Step 2: Install Dependencies
```bash
flutter clean
flutter pub get
flutter pub upgrade
```

### Step 3: Configure Android
```bash
cd android
# Update build.gradle with your signing key
# Add Google Services plugin configuration
cd ..
```

**Update `android/app/build.gradle`:**
```gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "com.godiscreet.app"
        minSdkVersion 26
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
}
```

### Step 4: Configure iOS
```bash
cd ios
pod install
pod repo update
cd ..
```

**Update `ios/Podfile`:**
```ruby
platform :ios, '14.0'

target 'Runner' do
  flutter_root = File.expand_path(File.join(packages_path, 'flutter'))
  load File.join(flutter_root, 'packages', 'flutter_tools', 'bin', 'podhelper')

  flutter_ios_podfile_setup
  
  # Add permissions
  post_install do |installer|
    installer.pods_project.targets.each do |target|
      flutter_additional_ios_build_settings(target)
    end
  end
end
```

### Step 5: Add Google Sign-In Configuration

**For Android** (`android/app/google-services.json`):
- Download from Firebase Console
- Place in `android/app/` directory

**For iOS** (`ios/Runner/GoogleService-Info.plist`):
- Download from Firebase Console
- Add to Xcode project

### Step 6: Update API Configuration

**Create `lib/config/api_config.dart`:**
```dart
class ApiConfig {
  static const String baseUrl = 'https://api.godiscreet.com/api/v1';
  static const String googleClientId = 'YOUR_GOOGLE_CLIENT_ID';
  static const String agoraAppId = 'YOUR_AGORA_APP_ID';
}
```

### Step 7: Run Development

**Android:**
```bash
flutter run -d android
# Or with specific emulator
flutter run -d emulator-5554
```

**iOS:**
```bash
flutter run -d ios
# Or with specific simulator
flutter run -d "iPhone 15 Pro"
```

### Step 8: Request Permissions

**Update `pubspec.yaml` for permissions:**
```yaml
permission_handler:
  - camera
  - microphone
  - location
  - photos
```

**Android** (`android/app/src/main/AndroidManifest.xml`):
```xml
<manifest>
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
</manifest>
```

**iOS** (`ios/Runner/Info.plist`):
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access for video calls and profile pictures</string>
<key>NSMicrophoneUsageDescription</key>
<string>We need microphone access for voice calls</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need location access to find matches near you</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photos for profile pictures</string>
```

### Step 9: Build for Release

**Android APK:**
```bash
flutter build apk --release
# Output: build/app/outputs/apk/release/app-release.apk
```

**Android App Bundle:**
```bash
flutter build appbundle --release
# Output: build/app/outputs/bundle/release/app-release.aab
```

**iOS IPA:**
```bash
flutter build ios --release
# Output: build/ios/iphoneos/Runner.app
```

### Step 10: Testing

```bash
# Run tests
flutter test

# Run with coverage
flutter test --coverage

# Integration tests
flutter drive --target=test_driver/app.dart
```

---

## 🖥️ Windows Desktop App Setup (Electron + React)

### Prerequisites
- Node.js 16+
- npm or yarn
- Git
- Windows 10/11

### Step 1: Setup Project
```bash
cd desktop/windows
npm install
```

### Step 2: Create Electron Main File

**Create `public/electron.js`:**
```javascript
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '../src/assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('api-call', async (event, method, endpoint, data) => {
  // API call handler
});
```

### Step 3: Create Preload Script

**Create `public/preload.js`:**
```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
});
```

### Step 4: Development
```bash
# Terminal 1: Start React dev server
npm start

# Terminal 2: Start Electron
npm run electron
```

### Step 5: Build for Production
```bash
# Build React
npm run build

# Build installer
npm run electron-build

# Output: dist/GoDiscreet Setup 1.0.0.exe
```

---

## 🤖 Telegram Bot Setup (Python)

### Prerequisites
- Python 3.9+
- pip / poetry
- Git

### Step 1: Setup Project
```bash
cd telegram-bot
pip install poetry
poetry install
```

### Step 2: Create Environment File

**Create `.env`:**
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
API_BASE_URL=https://api.godiscreet.com/api/v1
ADMIN_ID=your_admin_telegram_id
LOG_LEVEL=INFO
DATABASE_URL=postgresql://user:password@localhost/godiscreet
```

### Step 3: Create Logger

**Create `app/logger.py`:**
```python
import logging
from pathlib import Path

LOG_DIR = Path(__file__).parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

handler = logging.FileHandler(LOG_DIR / "bot.log")
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)
```

### Step 4: Create API Client

**Create `app/api_client.py`:**
```python
import aiohttp
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class APIClient:
    def __init__(self):
        self.base_url = settings.API_BASE_URL
        self.session = None
    
    async def init(self):
        self.session = aiohttp.ClientSession()
    
    async def close(self):
        if self.session:
            await self.session.close()
    
    async def post(self, endpoint, data):
        async with self.session.post(
            f"{self.base_url}{endpoint}",
            json=data
        ) as response:
            return await response.json()
    
    async def get(self, endpoint):
        async with self.session.get(
            f"{self.base_url}{endpoint}"
        ) as response:
            return await response.json()

api_client = APIClient()
```

### Step 5: Update Bot Handlers

**Update `app/handlers.py`:**
```python
import logging
from aiogram import Router, F
from aiogram.filters import Command, CommandStart
from aiogram.types import Message, CallbackQuery
from aiogram.utils.keyboard import InlineKeyboardBuilder
from app.config import settings
from app.api_client import api_client

router = Router()
logger = logging.getLogger(__name__)

@router.message(CommandStart())
async def cmd_start(message: Message):
    # Store user ID in session
    text = (
        "🎭 Welcome to GoDiscreet!\n\n"
        "🔥 Anonymous Dating Platform\n\n"
        "Choose an option:"
    )
    keyboard = InlineKeyboardBuilder()
    keyboard.button(text="📱 Open App", url="https://godiscreet.com")
    keyboard.button(text="💬 Chat", callback_data="chat")
    keyboard.button(text="⚙️ Settings", callback_data="settings")
    
    await message.answer(text, reply_markup=keyboard.as_markup())

@router.message(Command("profile"))
async def cmd_profile(message: Message):
    # Get user profile from API
    try:
        user_id = message.from_user.id
        # Call API to get profile
        text = "👤 Your Profile\n\nBio: Love traveling and photography"
        await message.answer(text)
    except Exception as e:
        logger.error(f"Error fetching profile: {e}")
        await message.answer("❌ Error fetching profile")

@router.callback_query(F.data == "settings")
async def settings_callback(callback: CallbackQuery):
    text = (
        "⚙️ Settings\n\n"
        "Choose setting to modify:"
    )
    keyboard = InlineKeyboardBuilder()
    keyboard.button(text="🔔 Notifications", callback_data="notif")
    keyboard.button(text="🔒 Privacy", callback_data="privacy")
    keyboard.button(text="❌ Close", callback_data="close")
    
    await callback.message.edit_text(text, reply_markup=keyboard.as_markup())
    await callback.answer()
```

### Step 6: Create Database Connection

**Create `app/database.py`:**
```python
import asyncpg
from app.config import settings

class Database:
    def __init__(self):
        self.pool = None
    
    async def init(self):
        self.pool = await asyncpg.create_pool(settings.DATABASE_URL)
    
    async def close(self):
        if self.pool:
            await self.pool.close()
    
    async def get_user(self, user_id: str):
        async with self.pool.acquire() as conn:
            return await conn.fetchrow(
                'SELECT * FROM users WHERE id = $1',
                user_id
            )
    
    async def save_user(self, user_id: str, data: dict):
        async with self.pool.acquire() as conn:
            await conn.execute(
                'INSERT INTO users (id, telegram_id, data) VALUES ($1, $2, $3)',
                user_id, user_id, data
            )

db = Database()
```

### Step 7: Update Main Entry Point

**Update `main.py`:**
```python
#!/usr/bin/env python3

import asyncio
import logging
from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from app.handlers import router
from app.config import settings
from app.api_client import api_client
from app.database import db
from app.logger import logger

async def main():
    # Setup logging
    logging.basicConfig(
        level=getattr(logging, settings.LOG_LEVEL),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    logger.info("Starting GoDiscreet Telegram Bot")
    
    # Initialize clients
    await api_client.init()
    await db.init()
    
    # Setup bot and dispatcher
    bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
    dp = Dispatcher(storage=MemoryStorage())
    dp.include_routers(router)
    
    # Start polling
    try:
        await dp.start_polling(bot, allowed_updates=dp.resolve_used_update_types())
    finally:
        await api_client.close()
        await db.close()
        await bot.session.close()

if __name__ == '__main__':
    asyncio.run(main())
```

### Step 8: Run Bot
```bash
python main.py
```

### Step 9: Deploy to Heroku

**Create `Procfile`:**
```
worker: python main.py
```

**Deploy:**
```bash
heroku create godiscreet-bot
heroku config:set TELEGRAM_BOT_TOKEN=your_token
git push heroku main
```

---

## ⚙️ Backend Server Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker (optional)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Setup Database
```bash
# Using Docker
docker-compose up -d postgres

# Or local PostgreSQL
psql -U postgres
CREATE DATABASE godiscreet;
CREATE USER godiscreet_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE godiscreet TO godiscreet_user;
```

### Step 3: Run Migrations
```bash
# Create migration file
node src/database/migrate.js

# Run migrations
npm run db:migrate
```

### Step 4: Configure Environment

**Copy and edit `.env`:**
```bash
cp .env.example .env
# Edit with your values
```

### Step 5: Start Development
```bash
npm run dev
# Server runs on http://localhost:3000
```

### Step 6: Run Tests
```bash
npm test
```

### Step 7: Build for Production
```bash
npm run build
```

### Step 8: Deploy

**Using Docker:**
```bash
docker build -t godiscreet-api:latest .
docker run -p 3000:3000 --env-file .env godiscreet-api:latest
```

**Using PM2:**
```bash
npm install -g pm2
pm2 start src/index.js --name "godiscreet-api"
pm2 save
pm2 startup
```

---

## 🔧 Local Configuration Files

### Backend Configuration

**`backend/.env`:**
```env
# Server
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=godiscreet
DB_USER=godiscreet_user
DB_PASSWORD=secure_password
DB_POOL_MIN=5
DB_POOL_MAX=20

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRY=900
REFRESH_TOKEN_EXPIRY=2592000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret

# AWS S3
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=godiscreet-media

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Agora
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@godiscreet.com

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/app.log

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=*
```

### Mobile Configuration

**`mobile/lib/config/constants.dart`:**
```dart
class AppConstants {
  static const String appName = 'GoDiscreet';
  static const String apiBaseUrl = 'https://api.godiscreet.com/api/v1';
  static const String googleClientId = 'YOUR_GOOGLE_CLIENT_ID';
  static const String agoraAppId = 'YOUR_AGORA_APP_ID';
  
  // Pearl packages
  static const int pearlBasicPackage = 100;
  static const int pearlStandardPackage = 500;
  static const int pearlPremiumPackage = 1000;
  static const int pearlElitePackage = 5000;
  
  // Boost costs
  static const int boost1HourCost = 200;
  static const int boost2HourCost = 300;
  
  // Chat costs
  static const int unlockChatCost = 50;
}
```

### Desktop Configuration

**`desktop/windows/.env`:**
```env
REACT_APP_API_BASE_URL=https://api.godiscreet.com/api/v1
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### Telegram Bot Configuration

**`telegram-bot/.env`:**
```env
TELEGRAM_BOT_TOKEN=your_bot_token
API_BASE_URL=https://api.godiscreet.com/api/v1
ADMIN_ID=your_admin_id
LOG_LEVEL=INFO
DATABASE_URL=postgresql://user:password@localhost/godiscreet
```

---

## 🚀 Quick Start Scripts

**Create `scripts/dev.sh`:**
```bash
#!/bin/bash

echo "🚀 Starting GoDiscreet Development Environment"

# Start backend
echo "📦 Starting Backend..."
cd backend
npm install
npm run dev &
BACKEND_PID=$!

# Start mobile (optional)
echo "📱 Starting Mobile..."
cd ../mobile
flutter run &
MOBILE_PID=$!

echo "✅ Development environment ready!"
echo "Backend PID: $BACKEND_PID"
echo "Mobile PID: $MOBILE_PID"

# Keep running
wait
```

**Create `scripts/docker-up.sh`:**
```bash
#!/bin/bash

echo "🐳 Starting Docker services..."

cd backend
docker-compose up -d

echo "✅ Docker services running"
docker-compose ps
```

---

## 📋 Checklist for Local Development

- [ ] Clone repository
- [ ] Install Node.js 18+
- [ ] Install Flutter SDK 3.10+
- [ ] Install Python 3.9+
- [ ] Install PostgreSQL 14+
- [ ] Install Redis 7+
- [ ] Setup backend `.env` file
- [ ] Run database migrations
- [ ] Start backend server
- [ ] Configure mobile app
- [ ] Configure telegram bot
- [ ] Run tests
- [ ] Start development

---

**All set! You're ready to develop GoDiscreet! 🎉**
