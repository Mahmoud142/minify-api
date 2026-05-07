# Minify API

Minify API is a backend service for creating, managing, and tracking shortened links. It is built for products that need simple link sharing, authenticated user accounts, and lightweight analytics around link performance.

The project combines user authentication, account management, public URL shortening, and click tracking in one NestJS API. Visitors can create short links without logging in, while registered users can keep ownership of their links and manage them later.

## Product Vision

Minify is designed to make link sharing faster, cleaner, and easier to measure. Instead of sending long URLs, users can generate compact links that are simple to share across social media, campaigns, messages, and internal tools.

For logged-in users, Minify adds ownership and management. This makes it useful for personal dashboards, marketing workflows, admin panels, and products that need trackable user-generated links.

## Core Capabilities

- Public short-link creation without requiring an account.
- Authenticated link ownership for registered users.
- Secure signup and login using JWT authentication.
- Role-based access for protected user and admin actions.
- Password reset flow with email verification.
- Redirect handling for generated short links.
- Click tracking and basic link analytics.
- Consistent API response format for frontend integration.

## Business Value

Minify helps teams and products reduce friction around link sharing. Anonymous users can create links quickly, while authenticated users get a more complete experience with ownership, management, and analytics.

The API can support use cases such as:

- Marketing campaign links.
- Social media sharing.
- Customer-facing dashboards.
- Internal link management tools.
- User-generated short links inside a larger platform.
- Analytics for measuring link engagement.

## User Experience

The intended user flow is simple:

1. A visitor submits a long URL.
2. Minify generates a short link.
3. The short link redirects visitors to the original URL.
4. Click activity is tracked in the background.
5. Logged-in users can view and manage their own links.

This keeps the public experience fast while still supporting account-based features for users who need more control.

## Platform Foundation

Minify API is built with NestJS and TypeScript, using MongoDB for persistence and JWT for authentication. The codebase is organized around clear modules for authentication, users, URLs, mail delivery, and shared infrastructure.

The current backend foundation is ready for frontend clients such as web dashboards, admin panels, browser extensions, or mobile apps.

## Main Modules

```txt
src/
  auth/        Authentication, JWT strategy, guards, decorators, and DTOs
  user/        User profile, admin user management, schemas, and DTOs
  url/         Short URL creation, redirects, analytics, and URL schemas
  mail/        Transactional email delivery
  common/      Shared filters and interceptors
```

## Tech Stack

- NestJS
- TypeScript
- MongoDB and Mongoose
- Passport JWT
- SendGrid
- class-validator
- Morgan

## Project Status

The API currently supports authentication, password reset, user management, public URL shortening, authenticated URL ownership, redirects, and click analytics. Future improvements can include richer analytics, custom aliases, QR codes, rate limiting, link expiration controls, and a dedicated dashboard experience.
