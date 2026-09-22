from flask import Blueprint

from db import get_db


# Blueprint for personnel-related API routes.
personnel_bp = Blueprint(
    "personnel",
    __name__,
)


@personnel_bp.route("/api/personnel")
def get_personnel():
    """
    Return active personnel records.

    The frontend can use this for:
    - attorney dropdowns
    - contract manager dropdowns
    - personnel lookup
    """
    db = get_db()

    rows = db.execute(
        """
        SELECT
            personnel.id,
            personnel.name,
            personnel.role,
            personnel.email,
            personnel.active,
            departments.name AS department
        FROM personnel
        LEFT JOIN departments
            ON personnel.department_id = departments.id
        WHERE personnel.active = 1
        ORDER BY personnel.name ASC
        """
    ).fetchall()

    personnel = [
        dict(row)
        for row in rows
    ]

    return {
        "count": len(personnel),
        "personnel": personnel
    }