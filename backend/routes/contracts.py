# Standard-library imports.
# sqlite3: built-in SQLite database driver
# datetime/timezone: UTC timestamps for created_at/updated_at/audit history
import sqlite3
from datetime import datetime, timezone

# Flask imports.
# Flask: creates the web application
# Blueprint: 
# request: lets routes read query parameters and JSON request bodies
from flask import Blueprint, request

from constants import (
    CONTRACT_STATUSES,
    CONTRACT_TYPES,
    EDITABLE_FIELDS,
)
from db import get_db

from validators import (
    clean_string,
    validate_date,
    validate_date_range,
    department_exists,
    master_agreement_exists,
)


# All contract-related routes will be registered through this Blueprint.
contracts_bp = Blueprint(
    "contracts",
    __name__,
)

@contracts_bp.route("/api/contracts")
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
    sql += """ 
        ORDER BY 
        (contract_end_date IS NULL) ASC,
        contract_end_date
        """

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


@contracts_bp.route("/api/contracts/<int:contract_id>")
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

@contracts_bp.route("/api/contracts", methods=["POST"])
def create_contract():

    # Read JSON without letting Flask raise its own error first.
    data = request.get_json(silent=True)

    # The request body must be a JSON object/dictionary.
    if not isinstance(data, dict):
        return {
            "error": "Request body must contain a JSON object"
        }

    # -----------------------------------------------------------------------
    # REQUIRED FIELD VALIDATION
    # -----------------------------------------------------------------------

    required_fields = [
        "kch_number",
        "institution_company_name",
        "department",
    ]

    missing_fields = [
        field
        for field in required_fields
        if not data.get(field)
    ]

    if missing_fields:
        return {
            "error": "Missing required fields",
            "missing_fields": missing_fields,
        }, 400

    # -----------------------------------------------------------------------
    # STRING VALIDATION / NORMALIZATION
    # -----------------------------------------------------------------------

    string_fields = {
        "kch_number": True,
        "institution_company_name": True,
        "department": True,
        "institution_contact": False,
        "hospital_contact": False,
        "assigned_attorney": False,
        "contract_manager": False,
        "document_link": False,
        "notes": False,
    }

    for field, required in string_fields.items():
        if field in data or required:
            ok, result = clean_string(
                data.get(field),
                field,
                required=required
            )

            if not ok:
                return {
                    "error": result
                }, 400

            # Replace the incoming value with the cleaned value.
            data[field] = result

    # -----------------------------------------------------------------------
    # DEPARTMENT VALIDATION
    # -----------------------------------------------------------------------

    if not department_exists(data["department"]):
        return {
            "error": "Invalid or inactive department"
        }, 400

    # -----------------------------------------------------------------------
    # MASTER AGREEMENT VALIDATION
    # -----------------------------------------------------------------------

    if not master_agreement_exists(
        data.get("master_agreement_id")
    ):
        return {
            "error": "Invalid master_agreement_id"
        }, 400

    # -----------------------------------------------------------------------
    # DATE VALIDATION
    # -----------------------------------------------------------------------

    date_fields = [
        "request_received",
        "contract_start_date",
        "contract_end_date",
    ]

    # Validate any date field included in the PATCH request.
    for field in date_fields:
        if field in data:
        # validate_date() now returns two values:
        # ok = True/False
        # result = normalized date OR an error message
            ok, result = validate_date(
                data.get(field),
                field
            )

        # If validation failed, result contains
        # the error message returned by validate_date().
            if not ok:
                return {
                    "error": result
                }, 400

            # Store the normalized value back into the request data.
            # Example:
            # "2026-9-5" becomes "2026-09-05"
            data[field] = result


    # -----------------------------------------------------------------------
    # DATE RANGE VALIDATION
    # -----------------------------------------------------------------------

    # For a brand-new contract, there is no existing database row yet.
    # We only compare the dates supplied in this POST request.

    if not validate_date_range(
    data.get("contract_start_date"),
    data.get("contract_end_date")
    ):
        return {
            "error": (
                "contract_end_date cannot be earlier "
                "than contract_start_date"
            )
        }, 400


    # -----------------------------------------------------------------------
    # CONTROLLED VALUE DEFAULTS
    # -----------------------------------------------------------------------

    contract_status = data.get(
        "contract_status",
        "Request Received"
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

    if contract_type not in CONTRACT_TYPES:
        return {
            "error": "Invalid contract type"
        }, 400

    # Get this request's SQLite database connection.
    db = get_db()

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
            (
                data["kch_number"],
                data.get("request_received"),
                data["institution_company_name"],
                data.get("institution_contact", ""),
                data.get("hospital_contact", ""),
                data["department"],
                contract_type,
                data.get("contract_start_date"),
                data.get("contract_end_date"),
                contract_status,
                data.get("assigned_attorney", ""),
                data.get("contract_manager", ""),
                data.get("master_agreement_id"),
                data.get("document_link", ""),
                data.get("notes", ""),
                now,
                now,
            )
        )

        # SQLite exposes the auto-generated primary-key ID from the INSERT.
        # We need this ID so the audit_log row can reference the new contract.
        new_contract_id = cursor.lastrowid


        # -----------------------------------------------------------------------
        # AUDIT LOG - CONTRACT CREATION
        # -----------------------------------------------------------------------

        # Record that a new contract was created.
        #
        # For a creation event:
        # - action = "create"
        # - field_name is None because this represents the whole contract,
        #   not a change to one specific field
        # - old_value is None because the contract did not exist before
        # - new_value stores the KCH number as a useful identifier
        #
        # "Development User" is temporary until real authentication/SSO is added.

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
                new_contract_id,
                "create",
                None,
                None,
                data["kch_number"],
                "Development User",
                now,
            )
        )
        
        # INSERT/UPDATE/DELETE changes are not durable until committed.
        db.commit()
        
    except sqlite3.IntegrityError:
        # Undo any uncommitted database changes from this failed transaction.
        db.rollback()

        # The common cause in this version is the UNIQUE kch_number constraint.
        return {
            "error": "A contract with that KCH number already exists"
        }, 409

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

@contracts_bp.route("/api/contracts/<int:contract_id>", methods=["PATCH"])
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

    # Read JSON without letting Flask raise its own error first.
    data = request.get_json(silent=True)

    # PATCH requires a JSON object.
    if not isinstance(data, dict):
        return {
            "error": "Request body must contain JSON"
        }

    # An empty object is valid JSON, but there is nothing to update.
    if not data:
        return {
            "error": "No update data provided"
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

    # -----------------------------------------------------------------------
    # STRING VALIDATION / NORMALIZATION
    # -----------------------------------------------------------------------

    string_fields = {
        "kch_number": True,
        "institution_company_name": True,
        "department": True,
        "institution_contact": False,
        "hospital_contact": False,
        "assigned_attorney": False,
        "contract_manager": False,
        "document_link": False,
        "notes": False,
    }

    for field, required in string_fields.items():
        if field in data:
            ok, result = clean_string(
            data.get(field),
            field,
            required=required
        )

            if not ok:
                return {
                    "error": result
                }, 400

            # Replace the incoming value with the cleaned value.
            data[field] = result

    # -----------------------------------------------------------------------
    # DEPARTMENT VALIDATION
    # -----------------------------------------------------------------------

    if "department" in data:
        if not department_exists(data["department"]):
            return {
                "error": "Invalid or inactive department"
            }, 400

    # -----------------------------------------------------------------------
    # MASTER AGREEMENT VALIDATION
    # -----------------------------------------------------------------------

    if "master_agreement_id" in data:
        if not master_agreement_exists(
            data["master_agreement_id"]
        ):
            return {
                "error": "Invalid master_agreement_id"
            }, 400

    # -----------------------------------------------------------------------
    # DATE VALIDATION
    # -----------------------------------------------------------------------

    # These fields are expected to contain dates in YYYY-MM-DD format.
    date_fields = [
        "request_received",
        "contract_start_date",
        "contract_end_date",
    ]

    # Validate only the date fields that were actually included in this PATCH.
    for field in date_fields:
        if field in data:
            ok, result = validate_date(
                data.get(field),
                field
            )

            if not ok:    
                return {
                    "error" : result
                }, 400

            # Store the normalized value back into the request data.
            # Example:
            # "2026-9-5" becomes "2026-09-05"
            data[field] = result

    # -----------------------------------------------------------------------
    # DATE RANGE VALIDATION
    # -----------------------------------------------------------------------

    # PATCH may update only one of the two contract dates.
    # Use the submitted value if present; otherwise keep the existing DB value.
    final_start_date = data.get(
        "contract_start_date",
        existing["contract_start_date"]
    )

    final_end_date = data.get(
        "contract_end_date",
        existing["contract_end_date"]
    )

    # Make sure the final end date is not before the final start date.
    if not validate_date_range(
        final_start_date,
        final_end_date
    ):
        return {
            "error": (
                "contract_end_date cannot be earlier "
                "than contract_start_date"
            )
        }, 400

    # Validate controlled-choice fields only when they were included in the PATCH.
    if "contract_status" in data:
        if data["contract_status"] not in CONTRACT_STATUSES:
            return {
                "error": "Invalid contract status"
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
            "message": "No changes detected"
        }

    now = datetime.now(timezone.utc).isoformat()

    # Build only the SET assignments needed for the changed fields.
    # Example: "contract_status = ?
    set_clause = ", ".join(
        f"{field} = ?"
        for field in changes
    )

    values = list(changes.values())

    try:
        # Update the contract record.
        db.execute(
            f"""
            UPDATE contracts
            SET {set_clause},
                updated_at = ?
            WHERE id = ?
            """,
            values + [now, contract_id]
        )

    

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

    except sqlite3.IntegrityError:
        # Undo any uncommitted changes from this failed transaction.
        db.rollback()

        # Use a generic integrity-error message for now.
        # Later we can inspect str(exc) and return a more specific message.
        return {
            "error": "Could not update contract. The KCH number may already exist."
        }, 409

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

@contracts_bp.route("/api/contracts/<int:contract_id>/history")
def get_contract_history(contract_id):
    db = get_db()

    contract = db.execute(
        """
        SELECT id
        FROM contracts
        WHERE id = ?
        """,
        (contract_id,)
    ).fetchone()

    if contract is None:
        return {
            "error": "Contract not found"
        }, 404

    rows = db.execute(
        """
        SELECT
            id,
            contract_id,
            action,
            field_name,
            old_value,
            new_value,
            performed_by,
            performed_at
        FROM audit_log
        WHERE contract_id = ?
        ORDER BY performed_at DESC, id DESC
        """,
        (contract_id,)
    ).fetchall()

    history = [dict(row) for row in rows]

    return {
        "count": len(history),
        "history": history
    }