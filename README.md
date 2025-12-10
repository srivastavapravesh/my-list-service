# My List Service API

A high‑performance backend service that manages a user's personal list (favorites + watchlist) for an OTT platform. Built using **Node.js, TypeScript, Express, and MongoDB (Mongoose)**, optimized for **sub‑10ms read performance** for home‑screen loads.

---

## 🚀 Features

* Add items to a user's list
* Remove items from the list
* Paginated retrieval of user list
* Duplicate‑safe operations
* Atomic DB updates for high throughput
* Clean architecture with modular services/controllers
* Integration test suite included

---

## 📦 Tech Stack

* **Node.js** (v18+)
* **Express.js**
* **TypeScript**
* **MongoDB (Mongoose)**
* Jest + Supertest (Integration Testing)

---

## 📁 Folder Structure

```
my-list-service/
 ├── src/
 │    ├── controllers/
 │    ├── routes/
 │    ├── services/
 │    ├── models/
 │    ├── config/
 │    └── app.ts
 ├── tests/
 ├── package.json
 ├── tsconfig.json
 ├── .env
 └── README.md
```

---

## 🛠️ Installation

```bash
git clone <YOUR_REPO_URL>
cd my-list-service
npm install
```

---

## ⚙️ Configuration

Create a `.env` file in the root:

```
# MongoDB Atlas Connection String
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/mylistdb?retryWrites=true&w=majority
PORT=3000
```

---

## ▶️ Running the Application

| Command       | Description                          |
| ------------- | ------------------------------------ |
| `npm start`   | Run in production mode (ts-node)     |
| `npm run dev` | Run in development mode with nodemon |

API Base URL:

```
http://localhost:3000/api/v1/list
```

---

## 🧪 Testing

```bash
npm test
```

Integration tests cover:

* Add to list
* Remove from list
* Pagination logic
* Duplicate prevention
* Schema validation

---

## 🧠 Architecture & Design Decisions

### **1. Single Document Schema (Embedded Array)**

All user list items are stored inside **one MyList document per user**.

**Benefits:**

* One fast DB query (`findOne`)
* No joins, no multi‑collection lookups
* Perfect for sub‑10ms reads

### **2. Index Optimization**

`userId` is indexed → O(log n) lookup time.

### **3. `.lean()` for Ultra‑Fast Reads**

All read operations use `.lean()` to avoid Mongoose hydration overhead.

### **4. Atomic Array Updates**

* `$addToSet` → Add without duplicates
* `$pull` → Efficient item removal

Updates run at the database level → no read‑modify‑write cycles.

---

## 📌 API Endpoints

### **POST /api/v1/list**

Add an item to user's list.

```
{
  "contentId": "m-101",
  "contentType": "Movie"
}
```

### **DELETE /api/v1/list/:contentId**

Remove an item from list.

### **GET /api/v1/list?page=1**

Get paginated list for the user.

---

## 🗂️ Assumptions

* Authentication mocked with userId: **`user-12345`**
* This service only returns `contentId` + `contentType`
* A separate Content Service will enrich movie/show details
* Integration tests handle their own DB seeding

---
