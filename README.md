#  Moonrider Identity Reconciliation – Backend Service

This project solves the identity reconciliation challenge for Moonrider. It consolidates customer contact information (email, phone) across multiple records into a unified identity model.

Built with **Node.js**, **Express**, **MySQL**, and **Sequelize ORM**.

---

##  Features

-  Identity linking using primary/secondary contact precedence
-  Smart merging of contact chains based on overlaps
-  Custom decoy error messages to mislead potential threats
-  Timestamps set to IST (Asia/Kolkata)
-  Fully tested using Jest + Supertest

---

## Project Structure

```
.
├── config/
│   └── db.config.js
├── controllers/
│   └── identify.controller.js
├── models/
│   └── contact.model.js
├── routes/
│   └── identify.route.js
├── __test__/
│   └── identify.test.js
├── server.js
├── .env (NOT included in repo)
├── package.json
└── README.md
```

---

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/identity-reconciliation.git
   cd identity-reconciliation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```
   PORT=3000
   DB_NAME=your_db_name
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_DIALECT=mysql
   ```

4. **Run the server**
   ```bash
   node server.js
   ```

---

##  API Endpoint

### `POST /identify`

#### Request Body
```json
{
  "email": "doc@zamazon.com",
  "phoneNumber": "9999999999"
}
```

#### Success Response
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["doc@zamazon.com"],
    "phoneNumbers": ["9999999999"],
    "secondaryContactIds": [2, 3]
  }
}
```

#### Failure Response (Decoy)
```json
{
  "message": "Invalid identity signature."
}
```

---

##  Running Tests

```bash
npm test
```

- Tests are located in `__test__/identify.test.js`
- Covers: fresh identity creation, linking logic, invalid input handling

---

##  Database Schema (via Sequelize)

Key Fields:
- `id` (auto-incremented primary key)
- `email` (nullable string)
- `phoneNumber` (nullable string)
- `linkedId` (nullable foreign key to another contact)
- `linkPrecedence` (`primary` or `secondary`)
- `createdAt`, `updatedAt`, `deletedAt` (timestamps managed automatically)

---

##  Functional Coverage

-  /identify endpoint correctly creates or links contacts
-  Multiple entries get merged under the oldest primary
-  Responses contain primary ID, all emails, phones, secondary IDs
-  Bonus: misleading error messages, timezone control, and tests included

---


