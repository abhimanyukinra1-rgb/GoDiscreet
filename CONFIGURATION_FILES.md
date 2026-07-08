# GoDiscreet - Installation & Configuration Files

## File Listing

### 📁 Backend Configuration Files

#### 1. Production Environment (`.env.production`)
```env
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.godiscreet.com

# Database - Production RDS
DB_HOST=godiscreet-db.xxxxx.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=godiscreet_prod
DB_USER=prod_user
DB_PASSWORD=SECURE_PASSWORD_HERE
DB_POOL_MIN=20
DB_POOL_MAX=50

# Redis - AWS ElastiCache
REDIS_HOST=godiscreet-cache.xxxxx.ng.0001.aps1.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=REDIS_PASSWORD
REDIS_DB=0

# JWT
JWT_SECRET=CHANGE_THIS_TO_VERY_LONG_RANDOM_STRING_IN_PRODUCTION
JWT_EXPIRY=900
REFRESH_TOKEN_EXPIRY=2592000

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_PRODUCTION_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_PRODUCTION_GOOGLE_SECRET

# AWS S3
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=PRODUCTION_AWS_KEY
AWS_SECRET_ACCESS_KEY=PRODUCTION_AWS_SECRET
AWS_S3_BUCKET=godiscreet-prod-media

# RabbitMQ - AWS MQ
RABBITMQ_URL=amqps://user:password@godiscreet-broker.xxxxx.mq.ap-south-1.amazonaws.com:5671

# Razorpay (Production)
RAZORPAY_KEY_ID=PROD_RAZORPAY_KEY
RAZORPAY_KEY_SECRET=PROD_RAZORPAY_SECRET
RAZORPAY_WEBHOOK_SECRET=PROD_WEBHOOK_SECRET

# Agora
AGORA_APP_ID=PRODUCTION_AGORA_APP_ID
AGORA_APP_CERTIFICATE=PRODUCTION_AGORA_CERTIFICATE

# Email (SendGrid)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.SENDGRID_API_KEY
SMTP_FROM=noreply@godiscreet.com

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/godiscreet/app.log

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# CORS (Restrict in production)
CORS_ORIGIN=https://godiscreet.com,https://www.godiscreet.com,https://app.godiscreet.com

# Admin
ADMIN_EMAIL=admin@godiscreet.com
ADMIN_PASSWORD=CHANGE_ME
```

#### 2. Staging Environment (`.env.staging`)
```env
NODE_ENV=staging
PORT=3000
API_BASE_URL=https://staging-api.godiscreet.com

DB_HOST=godiscreet-staging-db.xxxxx.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=godiscreet_staging
DB_USER=staging_user
DB_PASSWORD=STAGING_PASSWORD

REDIS_HOST=godiscreet-staging-cache.xxxxx.ng.0001.aps1.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=STAGING_REDIS_PASSWORD

JWT_SECRET=STAGING_JWT_SECRET_CHANGE_THIS

GOOGLE_CLIENT_ID=STAGING_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=STAGING_GOOGLE_SECRET

AWS_S3_BUCKET=godiscreet-staging-media

RAZORPAY_KEY_ID=STAGING_RAZORPAY_KEY
RAZORPAY_KEY_SECRET=STAGING_RAZORPAY_SECRET

LOG_LEVEL=debug
CORS_ORIGIN=*
```

#### 3. Development Environment (`.env.local`)
```env
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=godiscreet_dev
DB_USER=dev_user
DB_PASSWORD=dev_password

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_SECRET=dev_jwt_secret_not_for_production

GOOGLE_CLIENT_ID=development-google-client-id
GOOGLE_CLIENT_SECRET=development-google-secret

AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=development-aws-key
AWS_SECRET_ACCESS_KEY=development-aws-secret
AWS_S3_BUCKET=godiscreet-dev-media

RABBITMQ_URL=amqp://guest:guest@localhost:5672

RAZORPAY_KEY_ID=dev_razorpay_key
RAZORPAY_KEY_SECRET=dev_razorpay_secret

AGORA_APP_ID=dev_agora_app_id
AGORA_APP_CERTIFICATE=dev_agora_certificate

SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=465
SMTP_USER=mailtrap_user
SMTP_PASSWORD=mailtrap_password
SMTP_FROM=dev@godiscreet.local

LOG_LEVEL=debug
LOG_FILE=logs/app.log

CORS_ORIGIN=*
```

---

### 📱 Mobile App Configuration

#### Flutter Development Configuration

**`mobile/lib/config/dev_config.dart`:**
```dart
class DevConfig {
  static const String apiBaseUrl = 'http://10.0.2.2:3000/api/v1'; // Android emulator
  // static const String apiBaseUrl = 'http://localhost:3000/api/v1'; // iOS simulator
  static const String googleClientId = 'YOUR_DEV_GOOGLE_CLIENT_ID';
  static const String agoraAppId = 'YOUR_DEV_AGORA_APP_ID';
  static const bool enableLogging = true;
  static const bool enableStetho = true; // Network debugging
}
```

**`mobile/lib/config/prod_config.dart`:**
```dart
class ProdConfig {
  static const String apiBaseUrl = 'https://api.godiscreet.com/api/v1';
  static const String googleClientId = 'YOUR_PROD_GOOGLE_CLIENT_ID';
  static const String agoraAppId = 'YOUR_PROD_AGORA_APP_ID';
  static const bool enableLogging = false;
  static const bool enableStetho = false;
}
```

**`mobile/android/build.gradle`:**
```gradle
allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://www.jitpack.io' }
    }
}

subprojects {
    project.evaluationDependsOn(':flutter')
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
```

**`mobile/android/app/build.gradle`:**
```gradle
def localProperties = new Properties()
def localPropertiesFile = rootProject.file('local.properties')
if (localPropertiesFile.exists()) {
    localPropertiesFile.withReader('UTF-8') { reader ->
        localProperties.load(reader)
    }
}

def flutterRoot = localProperties.getProperty('flutter.sdk')
if (flutterRoot == null) {
    throw new GradleException("Flutter SDK not found")
}

def flutterVersionCode = localProperties.getProperty('flutter.versionCode')
if (flutterVersionCode == null) {
    flutterVersionCode = '1'
}

def flutterVersionName = localProperties.getProperty('flutter.versionName')
if (flutterVersionName == null) {
    flutterVersionName = '1.0.0'
}

apply plugin: 'com.android.application'
apply plugin: 'kotlin-android'
apply from: "$flutterRoot/packages/flutter_tools/gradle/flutter.gradle"

android {
    compileSdkVersion 34

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }

    kotlinOptions {
        jvmTarget = '1.8'
    }

    sourceSets {
        main.java.srcDirs += 'src/main/kotlin'
    }

    defaultConfig {
        applicationId "com.godiscreet.app"
        minSdkVersion 26
        targetSdkVersion 34
        versionCode flutterVersionCode.toInteger()
        versionName flutterVersionName
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            debuggable true
        }
    }
}

flutter {
    source = "../"
}

dependencies {
    implementation "org.kotlin:kotlin-stdlib-jdk7:$kotlin_version"
    implementation 'com.google.firebase:firebase-analytics'
}
```

**`mobile/ios/Podfile`:**
```ruby
platform :ios, '14.0'

# CocoaPods analytics sends network stats synchronously affecting flutter build latency.
post_install do |installer|
  installer.pods_project.targets.each do |target|
    flutter_additional_ios_build_settings(target)
    target.build_configurations.each do |config|
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= [
        '$(inherited)',
        'PERMISSION_CAMERA=1',
        'PERMISSION_MICROPHONE=1',
        'PERMISSION_LOCATION=1',
        'PERMISSION_PHOTOS=1',
      ]
    end
  end
end
```

**`mobile/ios/Runner/Info.plist`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>GoDiscreet</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleSignature</key>
    <string>????</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>UIMainStoryboardFile</key>
    <string>Main</string>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    
    <!-- Permissions -->
    <key>NSCameraUsageDescription</key>
    <string>We need camera access for video calls and profile pictures</string>
    <key>NSMicrophoneUsageDescription</key>
    <string>We need microphone access for voice calls and blind dates</string>
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>We need location to find matches near you</string>
    <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
    <string>We need location to find matches near you</string>
    <key>NSPhotoLibraryUsageDescription</key>
    <string>We need access to photos for profile pictures</string>
    <key>NSPhotoLibraryAddUsageDescription</key>
    <string>We need to save received photos to your library</string>
    <key>NSCalendarsUsageDescription</key>
    <string>We need calendar access for blind date scheduling</string>
    <key>UIViewControllerBasedStatusBarAppearance</key>
    <false/>
</dict>
</plist>
```

---

### 🤖 Telegram Bot Configuration

**`telegram-bot/.env.prod`:**
```env
TELEGRAM_BOT_TOKEN=production_bot_token_here
API_BASE_URL=https://api.godiscreet.com/api/v1
ADMIN_ID=production_admin_telegram_id
LOG_LEVEL=INFO
DATABASE_URL=postgresql://prod_user:prod_pass@godiscreet-db.xxxxx.rds.amazonaws.com:5432/godiscreet_prod
WEBHOOK_URL=https://godiscreet-bot.herokuapp.com/webhook
SUPPORT_CHAT_ID=-production_group_id
```

**`telegram-bot/.env.dev`:**
```env
TELEGRAM_BOT_TOKEN=dev_bot_token_here
API_BASE_URL=http://localhost:3000/api/v1
ADMIN_ID=dev_admin_telegram_id
LOG_LEVEL=DEBUG
DATABASE_URL=postgresql://dev_user:dev_pass@localhost:5432/godiscreet_dev
WEBHOOK_URL=http://localhost:8000/webhook
SUPPORT_CHAT_ID=-dev_group_id
```

---

### 🖥️ Desktop App Configuration

**`desktop/windows/.env.prod`:**
```env
REACT_APP_API_BASE_URL=https://api.godiscreet.com/api/v1
REACT_APP_GOOGLE_CLIENT_ID=prod_google_client_id
REACT_APP_ENVIRONMENT=production
REACT_APP_LOG_LEVEL=error
```

**`desktop/windows/.env.dev`:**
```env
REACT_APP_API_BASE_URL=http://localhost:3000/api/v1
REACT_APP_GOOGLE_CLIENT_ID=dev_google_client_id
REACT_APP_ENVIRONMENT=development
REACT_APP_LOG_LEVEL=debug
```

---

### 🐳 Docker Configuration

**`backend/docker-compose.yml` (Already included)**

**`docker-compose.prod.yml`:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: godiscreet_postgres_prod
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: godiscreet_redis_prod
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_prod_data:/data
    ports:
      - "6379:6379"
    restart: always
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: godiscreet_api_prod
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      REDIS_HOST: redis
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: always
    networks:
      - godiscreet_network

volumes:
  postgres_prod_data:
  redis_prod_data:

networks:
  godiscreet_network:
    driver: bridge
```

---

### 🔐 SSL/TLS Certificate Generation

**`scripts/generate-certificates.sh`:**
```bash
#!/bin/bash

# Generate self-signed certificate for development
echo "🔐 Generating SSL certificates..."

mkdir -p certs

# Create private key
openssl genrsa -out certs/private.key 2048

# Create certificate
openssl req -new -x509 -key certs/private.key -out certs/certificate.crt -days 365 \
  -subj "/C=IN/ST=MH/L=Mumbai/O=GoDiscreet/CN=localhost"

echo "✅ Certificates generated in certs/ directory"
ls -la certs/
```

---

### 📦 Package Installation Scripts

**`scripts/install-all.sh`:**
```bash
#!/bin/bash

set -e

echo "📦 Installing GoDiscreet dependencies..."

# Install Backend
echo "📥 Installing Backend dependencies..."
cd backend
npm install
cd ..

# Install Mobile
echo "📥 Installing Mobile dependencies..."
cd mobile
flutter pub get
cd ..

# Install Bot
echo "📥 Installing Bot dependencies..."
cd telegram-bot
pip install poetry
poetry install
cd ..

# Install Desktop
echo "📥 Installing Desktop dependencies..."
cd desktop/windows
npm install
cd ../..

echo "✅ All dependencies installed successfully!"
```

---

### 🧪 Testing Configuration

**`backend/jest.config.js`:**
```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/**/*.test.js',
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

---

## Quick Reference

| Environment | Database | Redis | API URL | Frontend |
|---|---|---|---|---|
| **Development** | `localhost:5432` | `localhost:6379` | `http://localhost:3000` | `http://localhost:3000` |
| **Staging** | RDS (ap-south-1) | ElastiCache | `https://staging-api.godiscreet.com` | `https://staging.godiscreet.com` |
| **Production** | RDS (ap-south-1) | ElastiCache | `https://api.godiscreet.com` | `https://godiscreet.com` |

---

**All configuration files are ready to use! Just update the values with your actual credentials.** ✅
