-- ==========================================================
-- APLIKASI MANAGEMENT KEUANGAN NAVI (NAVI FINANCE)
-- PostgreSQL / Supabase Schema with Multi-Tenant Household RLS
-- ==========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabel Rumah Tangga (Household Workspace)
CREATE TABLE IF NOT EXISTS households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    invite_code VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel User & Profil (Multi-User Suami & Istri)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    persona VARCHAR(20) CHECK (persona IN ('suami', 'istri', 'lainnya')) DEFAULT 'suami',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabel Rekening & Kas (Accounts)
-- Mendukung Bank Utama (Gaji), E-Wallet, Kas Tunai, Pos Dana Darurat, Tabungan Anak
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('bank', 'ewallet', 'cash', 'investment', 'savings')) NOT NULL,
    account_number VARCHAR(50),
    balance DECIMAL(15, 2) DEFAULT 0.00,
    color VARCHAR(20) DEFAULT '#10b981',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabel Kategori
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('income', 'expense')) NOT NULL,
    icon VARCHAR(50) DEFAULT 'Tag',
    color VARCHAR(20) DEFAULT '#6b7280',
    is_budgeted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabel Transaksi
-- Mendukung income, expense, serta transfer internal antar-rekening
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    destination_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL, -- Diisi jika type = 'transfer'
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(20) CHECK (type IN ('income', 'expense', 'transfer')) DEFAULT 'expense',
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabel Anggaran (Budgeting Bulanan / Pos Alokasi)
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    target_amount DECIMAL(15, 2) NOT NULL CHECK (target_amount >= 0),
    month INT CHECK (month BETWEEN 1 AND 12) NOT NULL,
    year INT CHECK (year >= 2024) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(household_id, category_id, month, year)
);

-- 8. Tabel Tagihan Rutin (Checklist Recurring Bills)
CREATE TABLE IF NOT EXISTS recurring_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    preferred_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    due_day INT CHECK (due_day BETWEEN 1 AND 31) NOT NULL,
    is_paid BOOLEAN DEFAULT false,
    last_paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================================
-- INDEXES UNTUK PERFORMA QUERY
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_users_household ON users(household_id);
CREATE INDEX IF NOT EXISTS idx_accounts_household ON accounts(household_id);
CREATE INDEX IF NOT EXISTS idx_categories_household ON categories(household_id);
CREATE INDEX IF NOT EXISTS idx_transactions_household ON transactions(household_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_budgets_lookup ON budgets(household_id, month, year);
CREATE INDEX IF NOT EXISTS idx_recurring_bills_household ON recurring_bills(household_id);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_bills ENABLE ROW LEVEL SECURITY;

-- Helper function: Dapatkan household_id user saat ini
CREATE OR REPLACE FUNCTION get_auth_household_id()
RETURNS UUID AS $$
  SELECT household_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Household policies
CREATE POLICY "Users can view their own household"
ON households FOR SELECT
USING (id = get_auth_household_id());

CREATE POLICY "Authenticated users can create household"
ON households FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update household"
ON households FOR UPDATE
USING (id = get_auth_household_id());

-- Users policies
CREATE POLICY "Users can view members of their household"
ON users FOR SELECT
USING (household_id = get_auth_household_id());

CREATE POLICY "Users can insert their own profile"
ON users FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
USING (id = auth.uid());

-- Accounts policies
CREATE POLICY "Users can view household accounts"
ON accounts FOR SELECT
USING (household_id = get_auth_household_id());

CREATE POLICY "Users can insert household accounts"
ON accounts FOR INSERT
WITH CHECK (household_id = get_auth_household_id());

CREATE POLICY "Users can update household accounts"
ON accounts FOR UPDATE
USING (household_id = get_auth_household_id());

CREATE POLICY "Users can delete household accounts"
ON accounts FOR DELETE
USING (household_id = get_auth_household_id());

-- Categories policies
CREATE POLICY "Users can view household categories"
ON categories FOR SELECT
USING (household_id = get_auth_household_id());

CREATE POLICY "Users can insert household categories"
ON categories FOR INSERT
WITH CHECK (household_id = get_auth_household_id());

CREATE POLICY "Users can update household categories"
ON categories FOR UPDATE
USING (household_id = get_auth_household_id());

CREATE POLICY "Users can delete household categories"
ON categories FOR DELETE
USING (household_id = get_auth_household_id());

-- Transactions policies
CREATE POLICY "Users can view household transactions"
ON transactions FOR SELECT
USING (household_id = get_auth_household_id());

CREATE POLICY "Users can insert household transactions"
ON transactions FOR INSERT
WITH CHECK (household_id = get_auth_household_id());

CREATE POLICY "Users can update household transactions"
ON transactions FOR UPDATE
USING (household_id = get_auth_household_id());

CREATE POLICY "Users can delete household transactions"
ON transactions FOR DELETE
USING (household_id = get_auth_household_id());

-- Budgets policies
CREATE POLICY "Users can view household budgets"
ON budgets FOR SELECT
USING (household_id = get_auth_household_id());

CREATE POLICY "Users can insert household budgets"
ON budgets FOR INSERT
WITH CHECK (household_id = get_auth_household_id());

CREATE POLICY "Users can update household budgets"
ON budgets FOR UPDATE
USING (household_id = get_auth_household_id());

CREATE POLICY "Users can delete household budgets"
ON budgets FOR DELETE
USING (household_id = get_auth_household_id());

-- Recurring bills policies
CREATE POLICY "Users can view household recurring bills"
ON recurring_bills FOR SELECT
USING (household_id = get_auth_household_id());

CREATE POLICY "Users can insert household recurring bills"
ON recurring_bills FOR INSERT
WITH CHECK (household_id = get_auth_household_id());

CREATE POLICY "Users can update household recurring bills"
ON recurring_bills FOR UPDATE
USING (household_id = get_auth_household_id());

CREATE POLICY "Users can delete household recurring bills"
ON recurring_bills FOR DELETE
USING (household_id = get_auth_household_id());

-- ==========================================================
-- TRIGGER & AUTOMATION: SINKRONISASI SALDO REKENING OTOMATIS
-- ==========================================================
CREATE OR REPLACE FUNCTION update_account_balance_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- JIKA INSERT TRANSAKSI
    IF (TG_OP = 'INSERT') THEN
        IF NEW.type = 'income' THEN
            UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
        ELSIF NEW.type = 'expense' THEN
            UPDATE accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
        ELSIF NEW.type = 'transfer' THEN
            -- Potong dari rekening asal
            UPDATE accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
            -- Tambah ke rekening tujuan
            IF NEW.destination_account_id IS NOT NULL THEN
                UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.destination_account_id;
            END IF;
        END IF;

    -- JIKA DELETE TRANSAKSI
    ELSIF (TG_OP = 'DELETE') THEN
        IF OLD.type = 'income' THEN
            UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
        ELSIF OLD.type = 'expense' THEN
            UPDATE accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
        ELSIF OLD.type = 'transfer' THEN
            UPDATE accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
            IF OLD.destination_account_id IS NOT NULL THEN
                UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.destination_account_id;
            END IF;
        END IF;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_account_balance ON transactions;
CREATE TRIGGER trg_update_account_balance
AFTER INSERT OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_account_balance_on_transaction();

-- ==========================================================
-- RPC HELPER: JOIN HOUSEHOLD DENGAN INVITE CODE
-- ==========================================================
CREATE OR REPLACE FUNCTION join_household_by_code(
    p_invite_code VARCHAR,
    p_full_name VARCHAR,
    p_persona VARCHAR
)
RETURNS JSON AS $$
DECLARE
    v_household_id UUID;
    v_household_name VARCHAR;
BEGIN
    -- Cari household berdasarkan kode invite
    SELECT id, name INTO v_household_id, v_household_name
    FROM households
    WHERE UPPER(invite_code) = UPPER(p_invite_code);

    IF v_household_id IS NULL THEN
        RAISE EXCEPTION 'Kode undangan rumah tangga tidak valid atau tidak ditemukan.';
    END IF;

    -- Update atau buat profil user
    INSERT INTO users (id, household_id, full_name, role, persona)
    VALUES (auth.uid(), v_household_id, p_full_name, 'member', p_persona)
    ON CONFLICT (id) DO UPDATE
    SET household_id = v_household_id,
        full_name = p_full_name,
        persona = p_persona;

    RETURN json_build_object(
        'success', true,
        'household_id', v_household_id,
        'household_name', v_household_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================================
-- REALTIME REPLICATION ENABLE
-- ==========================================================
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE budgets;
ALTER PUBLICATION supabase_realtime ADD TABLE recurring_bills;
