from flask import Blueprint

from db import get_db


# Blueprint for department-related API routes.
departments_bp = Blueprint(
    "departments",
    __name__,
)


@departments_bp.route("/api/departments")
def get_departments():
    """
    Return all active departments.

    The frontend will use this endpoint to populate
    department dropdowns and filters.
    """
    db = get_db()

    rows = db.execute(
        """
        SELECT
            id,
            name,
            active
        FROM departments
        WHERE active = 1
        ORDER BY name ASC
        """
    ).fetchall()

    departments = [dict(row) for row in rows]

    return {
        "count": len(departments),
        "departments": departments
    }