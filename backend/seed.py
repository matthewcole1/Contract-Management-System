"""
Development seed data for the Contract Management API.

This module inserts fake departments and fake contracts for local development.
It should never be used to load real hospital data.
"""

import sqlite3
from datetime import datetime, timezone

from db import DB_PATH

def seed_departments():
    """
    Insert development departments if the departments table is empty.

    These are prototype values only.
    Later, this list should be replaced with the approved hospital
    department list.
    """

    db = sqlite3.connect(DB_PATH)

    count = db.execute(
        """
        SELECT COUNT(*)
        FROM departments
        """
    ).fetchone()[0]

    if count == 0:
        departments = [
            ("Radiology",),
            ("Laboratory",),
            ("Pharmacy",),
        ]

        db.executemany(
            """
            INSERT INTO departments (name)
            VALUES (?)
            """,
            departments
        )

        db.commit()

    db.close()
    
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
                assigned_attorney,
                contract_manager,
                master_agreement_id,
                document_link,
                notes,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            fake_contracts,
        )

        db.commit()

    db.close()
