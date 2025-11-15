# Cron Jobs Setup

## Business Logic Implementation

Aplikasi ini mengimplementasikan business logic tracking pengeluaran makan harian dengan automasi:

### 🔄 Proses Otomatis

#### 1. Daily Reset (Setiap Hari, Jam 00:00)
- **Endpoint**: `/api/cron/daily-reset`
- **Schedule**: `0 0 * * *` (Midnight every day)
- **Function**:
  - Menghitung sisa budget harian (leftover)
  - Menambahkan leftover ke weekly accumulation
  - Membuat daily record baru untuk hari tersebut

#### 2. Weekly Calculation (Hari Minggu, 23:59)
- **Endpoint**: `/api/cron/weekly-calculate`
- **Schedule**: `59 23 * * 0` (Sunday 11:59 PM)
- **Function**:
  - Menghitung total weekly leftover
  - Transfer weekly leftover ke savings balance
  - Menandai weekly record sebagai transferred

### 🚀 Setup di Vercel

1. **Environment Variables**:
   ```
   CRON_SECRET=your-secret-key-here
   DATABASE_URL=your-database-url
   NEXTAUTH_URL=your-app-url
   ```

2. **Deploy**:
   - Push kode ke repository
   - Deploy ke Vercel
   - Cron jobs akan otomatis aktif

3. **Testing Cron Jobs**:
   ```bash
   # Test daily reset
   curl -X POST https://your-app.vercel.app/api/cron/daily-reset \
        -H "Authorization: Bearer your-secret-key"

   # Test weekly calculation
   curl -X POST https://your-app.vercel.app/api/cron/weekly-calculate \
        -H "Authorization: Bearer your-secret-key"
   ```

### 📊 Flow Data

1. **Input Pengeluaran** → `/api/expenses`
   - Simpan ke expenses table
   - Update daily record
   - Kurangi daily budget remaining

2. **Reset Harian** → `/api/cron/daily-reset`
   - Hitung leftover hari kemarin
   - Tambah ke weekly accumulation
   - Reset daily budget

3. **Kalkulasi Mingguan** → `/api/cron/weekly-calculate`
   - Total weekly leftover → savings balance
   - Reset weekly accumulation

### 🗄️ Database Schema

- **users**: dailyBudget, savingsBalance
- **expenses**: amount, note, date, type (MEAL)
- **daily_records**: dailyBudget, dailyBudgetRemaining, totalExpense, leftover
- **weekly_records**: totalExpenses, weeklyLeftover, transferredToSavings

### 🔒 Security

- Cron jobs dilindungi dengan `CRON_SECRET`
- Hanya authorized requests yang bisa execute
- Validasi input pada semua endpoints