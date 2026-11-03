-- ==========================================================
-- APLIKASI MANAGEMENT KEUANGAN NAVI (NAVI FINANCE)
-- PostgreSQL / Supabase Schema - Multi-User Realtime Sync
-- ==========================================================

-- Hapus tabel lama jika ada agar bersih dan fresh
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS recurring_bills CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS households CASCADE;

-- 1. Tabel Rumah Tangga (Household Workspace)
CREATE TABLE households (
    id TEXT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    invite_code VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel User & Profil (Multi-User Suami & Istri)
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    household_id TEXT REFERENCES households(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'member',
    persona VARCHAR(20) DEFAULT 'suami',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Rekening & Kas (Accounts)
CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    household_id TEXT REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,
    account_number VARCHAR(50),
    balance DECIMAL(15, 2) DEFAULT 0.00,
    color VARCHAR(20) DEFAULT '#10b981',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabel Kategori
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    household_id TEXT REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,
    icon VARCHAR(50) DEFAULT 'Tag',
    color VARCHAR(20) DEFAULT '#6b7280',
    is_budgeted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabel Transaksi
CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    household_id TEXT REFERENCES households(id) ON DELETE CASCADE,
    account_id TEXT REFERENCES accounts(id) ON DELETE CASCADE,
    destination_account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(20) DEFAULT 'expense',
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabel Anggaran (Budgets Bulanan)
CREATE TABLE budgets (
    id TEXT PRIMARY KEY,
    household_id TEXT REFERENCES households(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
    target_amount DECIMAL(15, 2) NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabel Tagihan Rutin (Recurring Bills)
CREATE TABLE recurring_bills (
    id TEXT PRIMARY KEY,
    household_id TEXT REFERENCES households(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    preferred_account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    due_day INT NOT NULL,
    is_paid BOOLEAN DEFAULT false,
    last_paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Izinkan akses publik (anon key) agar HP Suami & Istri dapat tersinkronisasi
-- ==========================================================
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on households" ON households FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on users" ON users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on accounts" ON accounts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on categories" ON categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on transactions" ON transactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on budgets" ON budgets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on recurring_bills" ON recurring_bills FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ==========================================================
-- REALTIME BROADCAST
-- ==========================================================
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE budgets;
ALTER PUBLICATION supabase_realtime ADD TABLE recurring_bills;
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE households;
