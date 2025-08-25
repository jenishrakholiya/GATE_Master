# File: backend/gate_master/settings.py

import os
import dj_database_url
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()
BASE_DIR = Path(__file__).resolve().parent.parent

# --- SECURITY SETTINGS (PRODUCTION-READY) ---
SECRET_KEY = os.environ.get('SECRET_KEY')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# --- HOSTS CONFIGURATION ---
# This correctly handles Vercel's automatic deployment URLs.
ALLOWED_HOSTS = []
VERCEL_URL = os.environ.get('VERCEL_URL')
if VERCEL_URL:
    ALLOWED_HOSTS.append(VERCEL_URL.split('//')[1])

# --- APPLICATION DEFINITION ---
INSTALLED_APPS = [
    "django.contrib.admin", "django.contrib.auth",
    "django.contrib.contenttypes", "django.contrib.sessions",
    "django.contrib.messages", "django.contrib.staticfiles",
    'rest_framework', 'rest_framework_simplejwt',
    'corsheaders', 'api',
]
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware", # For serving static files
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
ROOT_URLCONF = "gate_master.urls"
TEMPLATES = [
     {
         "BACKEND": "django.template.backends.django.DjangoTemplates",
         "DIRS": [], "APP_DIRS": True,
         "OPTIONS": {
             "context_processors": [
                 "django.template.context_processors.debug",
                 "django.template.context_processors.request",
                 "django.contrib.auth.context_processors.auth",
                 "django.contrib.messages.context_processors.messages",
             ],
         },
     },
]
WSGI_APPLICATION = "gate_master.wsgi.application"

# --- DATABASE CONFIGURATION ---
# Uses the DATABASE_URL environment variable provided by Vercel Postgres.
DATABASES = {
    'default': dj_database_url.config(conn_max_age=600, ssl_require=True)
}

# --- AUTHENTICATION & API SETTINGS ---
AUTH_USER_MODEL = 'api.CustomUser'
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ('rest_framework_simplejwt.authentication.JWTAuthentication',)
}
AUTH_PASSWORD_VALIDATORS = [
     {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
     {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
     {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
     {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --- INTERNATIONALIZATION & TIMEZONE ---
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

# --- STATIC & MEDIA FILES ---
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# --- CORS & EMAIL CONFIGURATION ---
CORS_ALLOWED_ORIGINS = []
FRONTEND_URL = os.environ.get('FRONTEND_URL')
if FRONTEND_URL:
    CORS_ALLOWED_ORIGINS.append(FRONTEND_URL)

# Add localhost for local development if DEBUG is True
if DEBUG:
     CORS_ALLOWED_ORIGINS.extend([
         "http://localhost:3000",
         "http://127.0.0.1:3000",
     ])

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_PASS')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
