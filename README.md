# 🕷️ Blogging Web Application — Backend

A production-oriented REST API backend for a modern blogging platform built with **Node.js, Express, PostgreSQL, and Prisma**.

The backend provides secure authentication, user profiles, follow relationships, private/public accounts, post management, comments, OTP-based email verification, refresh-token authentication, and authorization for protected resources.

---

## 🚀 Features

### 🔐 Authentication & Security

- User registration with email verification
- OTP-based account verification
- Secure password hashing
- Login with JWT access tokens
- Refresh-token based session management
- Protected routes using authentication middleware
- Role-based user information
- Environment variable validation using Zod
- Temporary OTP storage using Redis
- Email delivery using Nodemailer
- Authorization checks for resource ownership

### 👤 User & Profile Management

- Unique usernames
- Public profile retrieval
- Profile information management
- Display name, bio and avatar support
- GitHub and LinkedIn profile links
- Personal website support
- Public/private account functionality
- Protected profile modifications

### 👥 Follow System

- Follow users
- Unfollow users
- Followers/following relationships
- Composite-key based follow records
- Authorization-aware private account access

### 📝 Blog Posts

- Create posts
- Update posts
- Delete posts
- Draft and published post states
- Unique post slugs
- Retrieve posts by ID
- Retrieve user's own posts
- Public post retrieval
- Private-account visibility rules
- Followers-only access for private accounts

### 💬 Comments

- Create comments
- Retrieve comments
- Update comments
- Delete comments
- Comment ownership authorization
- Comments restricted to published posts
- Private-post comment authorization
- Newest comments returned first

---

## 🏗️ Architecture

The backend follows a modular structure separating routing, business logic, authentication, configuration, and database access.

```text
Client
  │
  ▼
Express Router
  │
  ▼
Middleware
  │
  ├── Authentication
  ├── Optional Authentication
  └── Request Validation
  │
  ▼
Service Layer
  │
  ├── Business Logic
  ├── Authorization
  └── Database Operations
  │
  ▼
Prisma ORM
  │
  ▼
PostgreSQL