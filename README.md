<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
npm install -g @nestjs/mau
mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

---

# API Documentation

This document outlines all available endpoints in the application, including the data you need to send and the exact JSON structure of the data you will receive in response.

## Standard Response Format

Every API endpoint strictly follows this standard JSON structure (except the 302 Redirect).

### Successful Response

```json
{
  "status": "success",
  "message": "Descriptive success message",
  "data": { ... } // The payload
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Human-readable error explanation",
  "data": {}
}
```

---

## Authentication Endpoints

### 1. Sign Up

Creates a new user account.

**POST** `/auth/signup`

**Request Body (JSON):**

```json
{
  "email": "test@example.com",
  "password": "Password123!",
  "phone": "1234567890",
  "profilePicUrl": "https://example.com/pic.jpg" // (optional)
}
```

**Response (JSON):**

```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "60d5ec...",
      "email": "test@example.com",
      "role": "USER",
      "profilePicUrl": "https://example.com/pic.jpg"
    }
  }
}
```

### 2. Log In

Authenticates a user and returns a JWT token.

**POST** `/auth/login`

**Request Body (JSON):**

```json
{
  "email": "test@example.com",
  "password": "Password123!"
}
```

**Response (JSON):**

```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "60d5ec...",
      "email": "test@example.com",
      "role": "USER",
      "profilePicUrl": "https://example.com/pic.jpg"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

---

## User Endpoints

> **Note:** All user endpoints require an `Authorization: Bearer <token>` header.

### 3. Get Current User Profile

Retrieves the logged-in user's data.

**GET** `/user/profile`

**Response (JSON):**

```json
{
  "status": "success",
  "message": "User fetched successfully",
  "data": {
    "user": {
      "_id": "60d5ec...",
      "email": "test@example.com",
      "role": "USER",
      "phone": "1234567890"
    }
  }
}
```

### 4. Get All Users (Admin)

Retrieves all users in the system.

**GET** `/user`

**Response (JSON):**

```json
{
  "status": "success",
  "message": "Users fetched successfully",
  "data": {
    "users": [
      {
        "_id": "60d5ec...",
        "email": "test@example.com"
      }
    ]
  }
}
```

### 5. Get User by ID

Retrieves a specific user's data.

**GET** `/user/:userId`

**Response (JSON):**

```json
{
  "status": "success",
  "message": "User fetched successfully",
  "data": {
    "user": {
      "_id": "60d5ec...",
      "email": "test@example.com"
    }
  }
}
```

### 6. Update User

Updates a user's data.

**PATCH** `/user/:userId`

**Request Body (JSON):**

```json
{
  "email": "updated@example.com", // (optional)
  "password": "NewPassword123!", // (optional)
  "phone": "0987654321", // (optional)
  "profilePicUrl": "https://example.com/newpic.jpg" // (optional)
}
```

**Response (JSON):**

```json
{
  "status": "success",
  "message": "User updated successfully",
  "data": {
    "user": {
      "_id": "60d5ec...",
      "email": "updated@example.com",
      "phone": "0987654321"
    }
  }
}
```

### 7. Delete User

Removes a user from the system.

**DELETE** `/user/:userId`

**Response (JSON):**

```json
{
  "status": "success",
  "message": "User deleted successfully",
  "data": {}
}
```

---

## URL Shortener Endpoints

### 8. Shorten a URL (Public, Optional Authentication)

Creates a shortened URL. An `Authorization` header is optional; when provided with a valid token, the URL is linked to the logged-in user.

**POST** `/url/shorten`

**Request Body (JSON):**

```json
{
  "originalUrl": "https://www.google.com/search?q=nestjs+url+shortener",
  "expiresAt": "2027-01-01T00:00:00.000Z" // (optional)
}
```

**Response (JSON):**

```json
{
  "status": "success",
  "message": "URL shortened successfully",
  "data": {
    "id": "65b9fc...",
    "originalUrl": "https://www.google.com/...",
    "shortCode": "aB3x9",
    "shortUrl": "http://localhost:3000/url/aB3x9",
    "expiresAt": "2027-01-01T00:00:00.000Z"
  }
}
```

### 9. Redirect to Original URL (Public)

Public endpoint that redirects the user to the original long URL and tracks analytics automatically (IP, User Agent, Referrer).

**GET** `/url/:shortCode`

**Response:**
*Returns a 302 HTTP Redirect to the original URL and safely bypasses the standard JSON response format.*

### 10. Get My URLs

Retrieves a list of all shortened URLs created by the authenticated user.

**GET** `/url/my-urls`

**Response (JSON):**

```json
{
  "status": "success",
  "message": "URLs fetched successfully",
  "data": {
    "urls": [
      {
        "_id": "65b9fc...",
        "originalUrl": "https://www.google.com/...",
        "shortCode": "aB3x9",
        "totalClicks": 0,
        "isActive": true,
        "userId": "60d5ec...",
        "createdAt": "2024-03-01T12:00:00Z",
        "updatedAt": "2024-03-01T12:00:00Z"
      }
    ]
  }
}
```

### 11. Get URL Stats

Retrieves detailed analytics and click statistics for a specific URL owned by the authenticated user. You can pass either the Mongo `_id` or the `shortCode` as the `:id` parameter.

**GET** `/url/:id/stats`

**Response (JSON):**

```json
{
  "status": "success",
  "message": "URL stats fetched successfully",
  "data": {
    "url": {
      "_id": "65b9fc...",
      "originalUrl": "https://www.google.com/...",
      "shortCode": "aB3x9"
    },
    "totalClicks": 15,
    "recentClicks": [
      {
        "_id": "65ba01...",
        "urlId": "65b9fc...",
        "timestamp": "2024-03-01T12:05:00Z",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0 ...",
        "browser": "Chrome",
        "os": "Windows",
        "country": "US"
      }
    ],
    "stats": {
      "browsers": [
        { "_id": "Chrome", "count": 10 },
        { "_id": "Safari", "count": 5 }
      ],
      "countries": [
        { "_id": "US", "count": 15 }
      ]
    }
  }
}
```

### 12. Delete URL

Deletes a shortened URL and all of its associated click analytics. Only the owner can delete their URL. You can pass either the Mongo `_id` or the `shortCode` as the `:id` parameter.

**DELETE** `/url/:id`

**Response (JSON):**

```json
{
  "status": "success",
  "message": "URL and associated analytics deleted successfully",
  "data": {}
}
```
