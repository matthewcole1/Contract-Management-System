"""
Kings County Hospital Contract Management API

Current prototype:
- Flask REST API
- SQLite database
- Search/filter contracts
- Create contracts
- Partial updates with PATCH
- Field-level audit logging on updates
- Fake development seed data

Important: this is still a development prototype. Authentication, production CORS
restrictions, stronger validation, safer dev seeding, and deployment hardening
should be added before any real hospital contract data is used.
"""

# Standard-library imports.
# os: file paths + environment variables
# sqlite3: built-in SQLite database driver
# datetime/timezone: UTC timestamps for created_at/updated_at/audit history
import os
import sqlite3
from datetime import datetime, timezone

# Flask imports.
# Flask: creates the web application
# g: per-request temporary storage; we use it for the DB connection
# request: lets routes read query parameters and JSON request bodies
from flask import Flask, g, request

# CORS lets a browser frontend running on another origin/port call this API.
# NOTE: CORS(app) is intentionally broad for development and should be restricted
# before production use.
from flask_cors import CORS


# ---------------------------------------------------------------------------
# APPLICATION / DATABASE CONFIGURATION
# ---------------------------------------------------------------------------

# Absolute path to the folder containing this app.py file.
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Where the SQLite database lives.
# If CONTRACT_DB_PATH is defined in the environment, use that path.
# Otherwise, create/use contracts.db next to app.py.
DB_PATH = os.environ.get(
    "CONTRACT_DB_PATH",
    os.path.join(BASE_DIR, "contracts.db")
)

# Create the Flask application object.
app = Flask(__name__)

# Development CORS configuration.
# This currently allows cross-origin requests broadly.
CORS(app)

# Flask secret key.
# The fallback value is DEVELOPMENT ONLY.
# We are not yet using authentication in this version, but keeping the setting
# here makes later session/token work easier.
app.config["SECRET_KEY"] = os.environ.get(
    "SECRET_KEY",
    "dev-key-change-me"
)


# ---------------------------------------------------------------------------
# CONTROLLED VALUES
# ---------------------------------------------------------------------------

# Valid contract workflow statuses.
# These are used to validate incoming POST/PATCH data.
CONTRACT_STATUSES = [
    "Request Received",
    "Drafting",
    "Drafted / In Review",
    "Signatures in Progress",
    "Fully Executed",
    "Active",
    "Expired",
    "On Hold",
    "Canceled",
]

# Valid legal-review statuses.
LEGAL_STATUSES = [
    "Not Assigned",
    "Pending Legal Review",
    "In Legal Review",
    "Changes Requested",
    "Approved",
    "Legal Hold",
]

# Valid contract types in the current prototype.
# We can expand this later to match the workbook exactly.
CONTRACT_TYPES = [
    "Addendum",
    "Master Agreement",
    "Other",
]

# Whitelist of fields that PATCH is allowed to change.
# System-controlled fields such as id, created_at, and updated_at are deliberately
# excluded so clients cannot overwrite them.
EDITABLE_FIELDS = [
    "kch_number",
    "request_received",
    "institution_company_name",
    "institution_contact",
    "hospital_contact",
    "department",
    "contract_type",
    "contract_start_date",
    "contract_end_date",
    "contract_status",
    "legal_status",
    "assigned_attorney",
    "contract_manager",
    "master_agreement_id",
    "document_link",
    "notes",
]


# ---------------------------------------------------------------------------
# DATABASE SCHEMA
# ---------------------------------------------------------------------------

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
    legal_status TEXT NOT NULL DEFAULT 'Not Assigned',

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

CREATE INDEX IF NOT EXISTS idx_contracts_legal_status
    ON contracts(legal_status);

CREATE INDEX IF NOT EXISTS idx_contracts_company
    ON contracts(institution_company_name);

CREATE INDEX IF NOT EXISTS idx_contracts_end_date
    ON contracts(contract_end_date);
"""


# ---------------------------------------------------------------------------
# DATABASE CONNECTION HELPERS
# ---------------------------------------------------------------------------

def get_db():
    """Return the SQLite connection for the current Flask request.

    Flask's g object is request-scoped storage. The first call opens the
    connection and stores it as g.db; later calls during the same request reuse
    that same connection.
    """
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)

        # Return rows that support both numeric indexes and column names.
        # Example: row["kch_number"] instead of row[1].
        g.db.row_factory = sqlite3.Row

        # SQLite requires foreign-key enforcement to be enabled per connection.
        g.db.execute("PRAGMA foreign_keys = ON")

    return g.db


@app.teardown_appcontext
def close_db(exception=None):
    """Close the request's DB connection when Flask finishes the request."""
    db = g.pop("db", None)

    if db is not None:
        db.close()


def init_db():
    """Create the SQLite database/tables/indexes if they do not already exist."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.executescript(SCHEMA)
    conn.commit()
    conn.close()


# ---------------------------------------------------------------------------
# BASIC / HEALTH ROUTES
# ---------------------------------------------------------------------------

@app.route("/")
def home():
    """Simple root endpoint showing that the API exists."""
    return {
        "message": "Kings County Hospital Contract Management API"
    }


@app.route("/api/health")
def health():
    """Liveness endpoint: useful for local checks and later monitoring."""
    return {
        "status": "ok",
        "message": "Contract Management API is running"
    }


# ---------------------------------------------------------------------------
# CONTRACT READ ROUTES
# ---------------------------------------------------------------------------

@app.route("/api/contracts")
def get_contracts():
    """Return contracts, optionally filtered by query-string parameters.

    Supported parameters:
      search=<text>
      department=<exact department>
      status=<exact contract status>
      attorney=<partial attorney name>

    Example:
      /api/contracts?department=Pharmacy&status=Active
    """
    db = get_db()

    # Read optional query-string parameters from the URL.
    # .strip() removes accidental leading/trailing spaces.
    search_term = request.args.get("search", "").strip()
    department = request.args.get("department", "").strip()
    status = request.args.get("status", "").strip()
    attorney = request.args.get("attorney", "").strip()

    # where stores SQL conditions.
    # params stores the user-provided values separately for parameterized SQL.
    where = []
    params = []

    # General search looks across several text fields.
    if search_term:
        # SQL % is a wildcard, so %metro% matches text containing "metro".
        like = f"%{search_term}%"

        where.append(
            """
            (
                kch_number LIKE ?
                OR institution_company_name LIKE ?
                OR institution_contact LIKE ?
                OR hospital_contact LIKE ?
                OR department LIKE ?
                OR contract_type LIKE ?
                OR assigned_attorney LIKE ?
                OR contract_manager LIKE ?
                OR notes LIKE ?
            )
            """
        )

        # There are nine ? placeholders above, so the same LIKE value is supplied
        # nine times.
        params.extend([like] * 9)

    # Exact department filter.
    if department:
        where.append("department = ?")
        params.append(department)

    # Exact contract-status filter.
    if status:
        where.append("contract_status = ?")
        params.append(status)

    # Partial attorney-name filter.
    if attorney:
        where.append("assigned_attorney LIKE ?")
        params.append(f"%{attorney}%")

    # Base query: return every column from contracts.
    sql = """
        SELECT *
        FROM contracts
    """

    # Add a WHERE clause only when filters were supplied.
    if where:
        sql += " WHERE " + " AND ".join(where)

    # Sort by earliest contract end date first.
    sql += " ORDER BY contract_end_date ASC"

    # Execute with parameters kept separate from the SQL string.
    # This is safer than directly concatenating user input into SQL.
    rows = db.execute(sql, params).fetchall()

    # Convert sqlite3.Row objects into ordinary Python dictionaries so Flask can
    # serialize them as JSON.
    contracts = [dict(row) for row in rows]

    return {
        "count": len(contracts),
        "contracts": contracts
    }


@app.route("/api/contracts/<int:contract_id>")
def get_contract(contract_id):
    """Return one contract by its internal numeric database ID."""
    db = get_db()

    row = db.execute(
        """
        SELECT *
        FROM contracts
        WHERE id = ?
        """,
        (contract_id,)  # trailing comma makes this a one-item tuple
    ).fetchone()

    # No matching row -> HTTP 404 Not Found.
    if row is None:
        return {
            "error": "Contract not found"
        }, 404

    return {
        "contract": dict(row)
    }


# ---------------------------------------------------------------------------
# CONTRACT CREATE ROUTE
# ---------------------------------------------------------------------------

@app.route("/api/contracts", methods=["POST"])
def create_contract():
    """Create a new contract from a JSON request body."""
    db = get_db()

    # Parse JSON sent by the client.
    data = request.get_json()

    if not data:
        return {
            "error": "Request body must contain JSON"
        }, 400

    # Minimum fields required to create a useful contract record.
    required_fields = [
        "kch_number",
        "institution_company_name",
        "department"
    ]

    # Build a list of required fields that are missing/empty.
    missing_fields = [
        field
        for field in required_fields
        if not data.get(field)
    ]

    if missing_fields:
        return {
            "error": "Missing required fields",
            "fields": missing_fields
        }, 400

    # Optional controlled-choice fields get defaults when omitted.
    contract_status = data.get(
        "contract_status",
        "Request Received"
    )

    legal_status = data.get(
        "legal_status",
        "Not Assigned"
    )

    contract_type = data.get(
        "contract_type",
        "Other"
    )

    # Reject values outside our controlled lists.
    if contract_status not in CONTRACT_STATUSES:
        return {
            "error": "Invalid contract status"
        }, 400

    if legal_status not in LEGAL_STATUSES:
        return {
            "error": "Invalid legal status"
        }, 400

    if contract_type not in CONTRACT_TYPES:
        return {
            "error": "Invalid contract type"
        }, 400

    # UTC timestamp stored as ISO text.
    now = datetime.now(timezone.utc).isoformat()

    try:
        # ? placeholders keep user values separate from SQL code.
        cursor = db.execute(
            """
            INSERT INTO contracts (
                kch_number,
                request_received,
                institution_company_name,
                institution_contact,
                hospital_contact,
                department,
                contract_type,
                contract_start_date,
                contract_end_date,
                contract_status,
                legal_status,
                assigned_attorney,
                contract_manager,
                master_agreement_id,
                document_link,
                notes,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data["kch_number"].strip(),
                data.get("request_received"),
                data["institution_company_name"].strip(),
                data.get("institution_contact", "").strip(),
                data.get("hospital_contact", "").strip(),
                data["department"].strip(),
                contract_type,
                data.get("contract_start_date"),
                data.get("contract_end_date"),
                contract_status,
                legal_status,
                data.get("assigned_attorney", "").strip(),
                data.get("contract_manager", "").strip(),
                data.get("master_agreement_id"),
                data.get("document_link", "").strip(),
                data.get("notes", "").strip(),
                now,
                now,
            )
        )

        # INSERT/UPDATE/DELETE changes are not durable until committed.
        db.commit()

    except sqlite3.IntegrityError:
        # The common cause in this version is the UNIQUE kch_number constraint.
        return {
            "error": "A contract with that KCH number already exists"
        }, 409

    # SQLite exposes the auto-generated primary-key ID from the INSERT.
    new_contract_id = cursor.lastrowid

    # Read the inserted row back so the API can return the complete saved record.
    row = db.execute(
        """
        SELECT *
        FROM contracts
        WHERE id = ?
        """,
        (new_contract_id,)
    ).fetchone()

    # 201 Created is the standard success status for creating a resource.
    return {
        "contract": dict(row)
    }, 201


# ---------------------------------------------------------------------------
# CONTRACT UPDATE / AUDIT ROUTE
# ---------------------------------------------------------------------------

@app.route("/api/contracts/<int:contract_id>", methods=["PATCH"])
def update_contract(contract_id):
    """Partially update a contract and write one audit row per changed field."""
    db = get_db()

    # Load the current database row first so we can:
    # 1) return 404 if it does not exist
    # 2) compare old vs. new values
    # 3) create field-level audit records
    existing = db.execute(
        """
        SELECT *
        FROM contracts
        WHERE id = ?
        """,
        (contract_id,)
    ).fetchone()

    if existing is None:
        return {
            "error": "Contract not found"
        }, 404

    data = request.get_json()

    if not data:
        return {
            "error": "Request body must contain JSON"
        }, 400

    # Reject attempts to edit fields outside the whitelist.
    unknown_fields = [
        field
        for field in data
        if field not in EDITABLE_FIELDS
    ]

    if unknown_fields:
        return {
            "error": "Unknown or non-editable fields",
            "fields": unknown_fields
        }, 400

    # Validate controlled-choice fields only when they were included in the PATCH.
    if "contract_status" in data:
        if data["contract_status"] not in CONTRACT_STATUSES:
            return {
                "error": "Invalid contract status"
            }, 400

    if "legal_status" in data:
        if data["legal_status"] not in LEGAL_STATUSES:
            return {
                "error": "Invalid legal status"
            }, 400

    if "contract_type" in data:
        if data["contract_type"] not in CONTRACT_TYPES:
            return {
                "error": "Invalid contract type"
            }, 400

    # changes will contain only fields whose submitted value differs from the DB.
    changes = {}

    for field, new_value in data.items():
        # Trim strings before comparing/saving.
        if isinstance(new_value, str):
            new_value = new_value.strip()

        old_value = existing[field]

        if new_value != old_value:
            changes[field] = new_value

    # If every submitted value already matches the DB, do nothing.
    if not changes:
        return {
            "contract": dict(existing),
            "message": "No changes to apply"
        }

    now = datetime.now(timezone.utc).isoformat()

    # Build only the SET assignments needed for the changed fields.
    # Example: "contract_status = ?, legal_status = ?"
    set_clause = ", ".join(
        f"{field} = ?"
        for field in changes
    )

    values = list(changes.values())

    try:
        db.execute(
            f"""
            UPDATE contracts
            SET {set_clause},
                updated_at = ?
            WHERE id = ?
            """,
            values + [now, contract_id]
        )

    except sqlite3.IntegrityError:
        return {
            "error": "Could not update contract. The KCH number may already exist."
        }, 409

    # Write one audit row per actual changed field.
    for field, new_value in changes.items():
        old_value = existing[field]

        db.execute(
            """
            INSERT INTO audit_log (
                contract_id,
                action,
                field_name,
                old_value,
                new_value,
                performed_by,
                performed_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                contract_id,
                "update",
                field,
                None if old_value is None else str(old_value),
                None if new_value is None else str(new_value),

                # Temporary prototype identity.
                # Replace with an authenticated user/SSO identity later.
                "Development User",

                now,
            )
        )

    # Commit the contract update and audit rows in the same transaction.
    db.commit()

    # Read back the updated record.
    updated = db.execute(
        """
        SELECT *
        FROM contracts
        WHERE id = ?
        """,
        (contract_id,)
    ).fetchone()

    return {
        "contract": dict(updated),
        "changed_fields": list(changes.keys())
    }


# ---------------------------------------------------------------------------
# DEVELOPMENT SEED DATA
# ---------------------------------------------------------------------------

def seed_data():
    """Insert fake contracts only when the contracts table is empty.

    NOTE: In the current version this function is called every startup. It only
    inserts when the table is empty, but before production we should also gate
    this behind an environment variable such as SEED_DEV_DATA=1.
    """
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")

    existing = db.execute(
        "SELECT COUNT(*) AS count FROM contracts"
    ).fetchone()["count"]

    if existing == 0:
        now = datetime.now(timezone.utc).isoformat()

        fake_contracts = [
            (
                "KCH-TEST-001",
                "2026-09-01",
                "ABC Medical University",
                "Alex Johnson",
                "Taylor Smith",
                "Radiology",
                "Addendum",
                "2026-10-01",
                "2027-09-30",
                "Active",
                "Approved",
                "Jordan Lee",
                "Morgan Davis",
                None,
                "",
                "Fake development record only.",
                now,
                now,
            ),
            (
                "KCH-TEST-002",
                "2026-09-03",
                "Metro Lab Services",
                "Jamie Brown",
                "Casey Wilson",
                "Laboratory",
                "Other",
                "2026-09-15",
                "2026-12-31",
                "Drafted / In Review",
                "In Legal Review",
                "Jordan Lee",
                "Morgan Davis",
                None,
                "",
                "Fake development record only.",
                now,
                now,
            ),
            (
                "KCH-TEST-003",
                "2026-08-20",
                "Northside Pharmacy Group",
                "Chris Martin",
                "Avery Thomas",
                "Pharmacy",
                "Master Agreement",
                "2026-09-01",
                "2026-10-15",
                "Signatures in Progress",
                "Approved",
                "Riley Clark",
                "Morgan Davis",
                None,
                "",
                "Fake development record only.",
                now,
                now,
            ),
        ]

        # executemany runs the same parameterized INSERT for each tuple above.
        db.executemany(
            """
            INSERT INTO contracts (
                kch_number,
                request_received,
                institution_company_name,
                institution_contact,
                hospital_contact,
                department,
                contract_type,
                contract_start_date,
                contract_end_date,
                contract_status,
                legal_status,
                assigned_attorney,
                contract_manager,
                master_agreement_id,
                document_link,
                notes,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            fake_contracts,
        )

        db.commit()

    db.close()


# ---------------------------------------------------------------------------
# STARTUP
# ---------------------------------------------------------------------------

# Ensure the database/tables exist every time the module loads.
init_db()

# Development convenience: insert fake rows if the table is empty.
# TODO before production: gate this behind SEED_DEV_DATA instead of always calling.
seed_data()


# Only start Flask's built-in development server when this file is executed
# directly with `python app.py`.
if __name__ == "__main__":
    app.run(debug=True)