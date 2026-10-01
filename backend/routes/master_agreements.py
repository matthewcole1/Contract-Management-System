import sqlite3

from flask import Blueprint, jsonify, request

from db import get_db


# Blueprint for master-agreement-related API routes.
master_agreements_bp = Blueprint(
    "master_agreements",
    __name__,
)


@master_agreements_bp.get("/api/master-agreements/<int:agreement_id>")
def get_master_agreement(agreement_id):
    """
    Return one master agreement by ID.
    """

    db = get_db()

    master_agreement = db.execute(
        """
        SELECT
            id,
            agreement_number,
            institution_company_name,
            date,
            end_date,
            document_link,
            notes,
            created_at,
            updated_at
        FROM master_agreements
        WHERE id = ?
        """,
        (agreement_id,),
    ).fetchone()

    if master_agreement is None:
        return jsonify({
            "error": "Master agreement not found."
        }), 404

    return jsonify({
        "master_agreement": dict(master_agreement)
    })


@master_agreements_bp.get("/api/master-agreements")
def get_master_agreements():
    """
    Return all master agreements.

    The frontend will use this endpoint for:
    - master agreement lookup
    - linking contracts to a master agreement
    - search/filter dropdowns
    """

    db = get_db()

    rows = db.execute(
        """
        SELECT
            id,
            agreement_number,
            institution_company_name,
            date,
            end_date,
            document_link,
            notes,
            created_at,
            updated_at
        FROM master_agreements
        ORDER BY institution_company_name ASC
        """
    ).fetchall()

    master_agreements = [
        dict(row)
        for row in rows
    ]

    return {
        "count": len(master_agreements),
        "master_agreements": master_agreements,
    }


@master_agreements_bp.post("/api/master-agreements")
def create_master_agreement():
    """
    Create a new master agreement.

    Required:
    - agreement_number
    - institution_company_name

    Optional:
    - date
    - end_date
    - document_link
    - notes
    """

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Request body must be a JSON object."
        }), 400

    agreement_number = str(
        data.get("agreement_number", "")
    ).strip()

    institution_company_name = str(
        data.get("institution_company_name", "")
    ).strip()

    agreement_date = data.get("date") or None

    agreement_end_date = data.get("end_date") or None

    document_link = str(
        data.get("document_link", "")
    ).strip() or None

    notes = str(
        data.get("notes", "")
    ).strip() or None

    if not agreement_number:
        return jsonify({
            "error": "Agreement number is required."
        }), 400

    if not institution_company_name:
        return jsonify({
            "error": "School / institution is required."
        }), 400

    db = get_db()

    try:
        cursor = db.execute(
            """
            INSERT INTO master_agreements (
                agreement_number,
                institution_company_name,
                date,
                end_date,
                document_link,
                notes,
                created_at,
                updated_at
            )
            VALUES (
                ?, ?, ?, ?, ?, ?,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            )
            """,
            (
                agreement_number,
                institution_company_name,
                agreement_date,
                agreement_end_date,
                document_link,
                notes,
            ),
        )

        db.commit()

    except sqlite3.IntegrityError as exc:
        db.rollback()

        if "agreement_number" in str(exc):
            return jsonify({
                "error": (
                    "A master agreement with that "
                    "agreement number already exists."
                )
            }), 409

        return jsonify({
            "error": "Could not create master agreement."
        }), 400

    master_agreement = db.execute(
        """
        SELECT
            id,
            agreement_number,
            institution_company_name,
            date,
            end_date,
            document_link,
            notes,
            created_at,
            updated_at
        FROM master_agreements
        WHERE id = ?
        """,
        (cursor.lastrowid,),
    ).fetchone()

    return jsonify({
        "master_agreement": dict(master_agreement)
    }), 201


@master_agreements_bp.patch("/api/master-agreements/<int:agreement_id>")
def update_master_agreement(agreement_id):
    """
    Update an existing master agreement.
    """

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Request body must be a JSON object."
        }), 400

    db = get_db()

    existing = db.execute(
        """
        SELECT *
        FROM master_agreements
        WHERE id = ?
        """,
        (agreement_id,),
    ).fetchone()

    if existing is None:
        return jsonify({
            "error": "Master agreement not found."
        }), 404

    agreement_number = str(
        data.get(
            "agreement_number",
            existing["agreement_number"],
        )
    ).strip()

    institution_company_name = str(
        data.get(
            "institution_company_name",
            existing["institution_company_name"],
        )
    ).strip()

    agreement_date = data.get(
        "date",
        existing["date"],
    )

    agreement_end_date = data.get(
        "end_date",
        existing["end_date"],
    )

    document_link = str(
        data.get(
            "document_link",
            existing["document_link"] or "",
        )
    ).strip() or None

    notes = str(
        data.get(
            "notes",
            existing["notes"] or "",
        )
    ).strip() or None

    if not agreement_number:
        return jsonify({
            "error": "Agreement number is required."
        }), 400

    if not institution_company_name:
        return jsonify({
            "error": "School / institution is required."
        }), 400

    try:
        db.execute(
            """
            UPDATE master_agreements
            SET
                agreement_number = ?,
                institution_company_name = ?,
                date = ?,
                end_date = ?,
                document_link = ?,
                notes = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (
                agreement_number,
                institution_company_name,
                agreement_date or None,
                agreement_end_date or None,
                document_link,
                notes,
                agreement_id,
            ),
        )

        db.commit()

    except sqlite3.IntegrityError as exc:
        db.rollback()

        if "agreement_number" in str(exc):
            return jsonify({
                "error": (
                    "A master agreement with that "
                    "agreement number already exists."
                )
            }), 409

        return jsonify({
            "error": "Could not update master agreement."
        }), 400

    updated = db.execute(
        """
        SELECT
            id,
            agreement_number,
            institution_company_name,
            date,
            end_date,
            document_link,
            notes,
            created_at,
            updated_at
        FROM master_agreements
        WHERE id = ?
        """,
        (agreement_id,),
    ).fetchone()

    return jsonify({
        "master_agreement": dict(updated)
    })