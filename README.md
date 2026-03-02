# Identity Reconciliation Service

A robust Node.js and TypeScript web service designed to reconcile multiple user identities into a single "Primary" contact profile. This service handles merging overlapping contact information (emails and phone numbers) to create a unified view of a customer.

---

## 🚀 Live Endpoint

**Base URL**: `https://identity-reconciliation-ishuide.onrender.com` (Example - Please update once deployed)
**Endpoint**: `POST /identify`

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (v22+)
- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: SQLite (Local/Development)
- **Deployment**: Render / Docker

---

## 📖 API Documentation

### Identify Contact
Reconciles an incoming contact request with existing records.

- **URL**: `/identify`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "mcfly@hillvalley.edu",
    "phoneNumber": "123456"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "contact": {
      "primaryContatctId": 1,
      "emails": ["mcfly@hillvalley.edu"],
      "phoneNumbers": ["123456"],
      "secondaryContactIds": []
    }
  }
  ```

---

## 💻 Local Development

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/) installed.

### Setup using Docker
1. **Clone the repository**:
   ```bash
   git clone https://github.com/ishuide/Identity-Reconciliation.git
   cd Identity-Reconciliation
   ```

2. **Build and Run**:
   ```bash
   docker build -t identity-reconciliation .
   docker run -p 3000:3000 identity-reconciliation
   ```

3. **Access the service**:
   The service will be available at `http://localhost:3000`.

### Manual Setup (without Docker)
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Setup Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
3. **Run in development mode**:
   ```bash
   npm run dev
   ```

---

## 🏗️ Architecture & Logic

- **Primary Contact**: The oldest contact in a linked group.
- **Secondary Contact**: Any contact created after the primary or linked to it.
- **Link Precedence**: 
  - If a new request contains info that matches two different primary contacts, the older one remains primary and the newer one (and its secondaries) are updated to point to the older one.
  - If a new request contains a new email/phone number for an existing contact, a new secondary contact is created.

---

## 📝 License
ISC
