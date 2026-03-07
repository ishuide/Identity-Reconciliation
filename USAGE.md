# How to Use: Identity Reconciliation Service

This guide explains the different ways to run the service and how to interact with the API endpoints.

---

## 1. Running the Project

### A. Using Docker (Recommended)
Docker is the easiest way to run the service with all dependencies pre-configured.

1. **Build the image**:
   ```bash
   docker build -t bitespeed-service .
   ```
2. **Run the container**:
   ```bash
   # Map host port 8080 to container port 3000
   docker run -p 8080:3000 bitespeed-service
   ```
   *The service will be available at http://localhost:8080*

### B. Running Locally (Node.js)
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Setup Database (SQLite)**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   *The service will be available at http://localhost:3000*

---

## 2. Using the API (POST /identify)

The `/identify` endpoint reconciles overlapping contact information.

### Via PowerShell (Windows)
PowerShell requires specific syntax for JSON data and quotes:
```powershell
curl.exe -X POST http://localhost:8080/identify `
  -H "Content-Type: application/json" `
  -d '{\"email\": \"lorraine@hill.com\", \"phoneNumber\": \"123456\"}'
```

### Via Bash / Git Bash / Linux
```bash
curl -X POST http://localhost:8080/identify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lorraine@hill.com",
    "phoneNumber": "123456"
  }'
```

### Via Postman / Thunder Client
- **Method**: `POST`
- **URL**: `http://localhost:8080/identify`
- **Body**: `raw (JSON)`
  ```json
  {
    "email": "lorraine@hill.com",
    "phoneNumber": "123456"
  }
  ```

---

## 3. Checking Results

### Expected Response
You will receive a unified contact profile:
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["lorraine@hill.com"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": []
  }
}
```

### Verification Scenarios
1. **New User**: Becomes a `primary` contact.
2. **Existing User (New Info)**: Running again with a new email but same phone number creates a `secondary` contact linked to the same `primaryContactId`.
3. **Merging Primaries**: If an entry matches two different primary contacts, the older one remains primary and the newer one transitions to secondary.

### Viewing the Database
You can visualize the SQLite data using Prisma Studio:
```bash
npx prisma studio
```

---

## 4. Troubleshooting

- **Port 3000/8080 Busy**: If the port is taken, run Docker with a different mapping: `-p 9000:3000`.
- **Docker Image not found**: Ensure you ran the `docker build` command first while inside the project folder.
- **ts-node not recognized**: Ensure you ran `npm install` or use `npx ts-node`.
