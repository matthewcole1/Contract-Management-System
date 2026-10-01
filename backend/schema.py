"""
SQLite schema for the Contract Management API.

This file contains the table and index definitions used when the
development database is initialized.
"""

# SQL used to create the database tables and indexes when they do not yet exist.
#
# Important:
# - SQLite stores our dates as ISO text (YYYY-MM-DD).
# - kch_number is UNIQUE so duplicate KCH numbers are rejected.
# - foreign keys relate personnel -> departments and contracts -> master agreements.
# - audit_log stores one row per changed field during PATCH updates.
SCHEMA = """
CREATE TABLE IF NOT EXISTS master_agreements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agreement_number TEXT UNIQUE,
    institution_company_name TEXT NOT NULL,
    date TEXT,
    document_link TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS personnel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    department_id INTEGER,
    role TEXT,
    email TEXT,
    active INTEGER NOT NULL DEFAULT 1,

    FOREIGN KEY (department_id)
        REFERENCES departments(id)
);

CREATE TABLE IF NOT EXISTS contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    kch_number TEXT UNIQUE NOT NULL,
    request_received TEXT,

    institution_company_name TEXT NOT NULL,
    institution_contact TEXT,
    hospital_contact TEXT,

    department TEXT NOT NULL,
    contract_type TEXT,

    contract_start_date TEXT,
    contract_end_date TEXT,

    contract_status TEXT NOT NULL DEFAULT 'Request Received',

    assigned_attorney TEXT,
    contract_manager TEXT,

    master_agreement_id INTEGER,

    document_link TEXT,
    notes TEXT,

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    FOREIGN KEY (master_agreement_id)
        REFERENCES master_agreements(id)
);

CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    contract_id INTEGER,
    action TEXT NOT NULL,
    field_name TEXT,

    old_value TEXT,
    new_value TEXT,

    performed_by TEXT,
    performed_at TEXT NOT NULL,

    FOREIGN KEY (contract_id)
        REFERENCES contracts(id)
);

-- Indexes speed up common searches/filters.
CREATE INDEX IF NOT EXISTS idx_contracts_kch
    ON contracts(kch_number);

CREATE INDEX IF NOT EXISTS idx_contracts_department
    ON contracts(department);

CREATE INDEX IF NOT EXISTS idx_contracts_status
    ON contracts(contract_status);

CREATE INDEX IF NOT EXISTS idx_contracts_company
    ON contracts(institution_company_name);

CREATE INDEX IF NOT EXISTS idx_contracts_end_date
    ON contracts(contract_end_date);
"""