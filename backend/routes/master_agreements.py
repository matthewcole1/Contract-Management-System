from flask import Blueprint

from db import get_db


# Blueprint for master-agreement-related API routes.
master_agreements_bp = Blueprint(
    "master_agreements",
    __name__,
)


@master_agreements_bp.route("/api/master-agreements")
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
        "master_agreements": master_agreements
    }