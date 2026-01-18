# Financial Ledger API (Double-Entry Bookkeeping)

A robust REST API implementing double-entry bookkeeping for high-integrity financial transactions.

## 🏗 Architecture & Design Decisions

### 1. Double-Entry Bookkeeping Model
Every financial movement is recorded as a **Transaction** linked to at least two **Ledger Entries**. 
- A **Transfer** creates a `debit` (negative amount) for the sender and a `credit` (positive amount) for the receiver.
- The system ensures that for every transaction: $\sum \text{Ledger Entries} = 0$.

### 2. ACID Compliance & Atomicity
We use PostgreSQL's native transactions (`BEGIN`, `COMMIT`, `ROLLBACK`). 
- **Atomicity:** Creating ledger entries and updating the transaction status happens in a single block. If the receiver's entry fails, the sender's entry is never created.

### 3. Transaction Isolation Level
We use **`READ COMMITTED`** combined with **Row-Level Locking** (`SELECT ... FOR UPDATE`).
- **Rationale:** While `SERIALIZABLE` is the safest, it often leads to performance bottlenecks and serialization failures. By using `SELECT ... FOR UPDATE` on the account rows during a transaction, we prevent concurrent updates to the same account, effectively eliminating race conditions while maintaining high throughput.

### 4. Balance Integrity & Negative Prevention
- **On-Demand Calculation:** Balances are not stored. They are calculated using `SUM(amount)` from the `ledger_entries` table.
- **Overdraft Prevention:** Before committing a transfer or withdrawal, the service calculates the "projected balance." If `current_balance + change < 0`, the database transaction is rolled back.

### 5. Immutability
The database user permissions and application logic are structured so that `ledger_entries` are **Append-Only**. There is no `UPDATE` or `DELETE` logic implemented for the ledger.

---

## 📊 System Diagrams

### Architecture Diagram


### Database Schema (ERD)


---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v15+) or Docker

### Setup with Docker (Recommended)
1. Clone the repo.
2. Run: `docker-compose up --build`

### Manual Setup
1. **Environment:** Create a `.env` file (see `.env.example`).
2. **Install:** `npm install`
3. **Database:** Run the scripts in `src/database/migrations/init.sql`.
4. **Run:** `npm run dev`

---

## 🚦 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/accounts` | Create a new account |
| `GET` | `/accounts/:id` | Get account info + Calculated Balance |
| `GET` | `/accounts/:id/ledger` | Get chronological audit trail |
| `POST` | `/transfers` | Move money between accounts |
| `POST` | `/deposits` | Add funds to an account |

---

## 🧪 Testing
Run `npm test` to execute the suite covering:
- Atomicity during failed transfers.
- Prevention of negative balances under concurrency.