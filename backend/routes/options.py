from flask import Blueprint

from constants import (
    CONTRACT_STATUSES,
    LEGAL_STATUSES,
    CONTRACT_TYPES,
)

from db import get_db


# Blueprint for frontend dropdown/filter options.
options_bp = Blueprint(
    "options",
    __name__,
)


@options_bp.route("/api/options")
def get_options():
    """
    Return controlled values and active lookup data
    needed by the frontend.

    React can call this once and use the response for:
    - contract status dropdowns
    - legal status dropdowns
    - contract type dropdowns
    - department dropdowns
    - personnel dropdowns
    """

    db = get_db()

    department_rows = db.execute(
        """
        SELECT
            id,
            name
        FROM departments
        WHERE active = 1
        ORDER BY name ASC
        """
    ).fetchall()

    personnel_rows = db.execute(
        """
        SELECT
            personnel.id,
            personnel.name,
            personnel.role,
            departments.name AS department
        FROM personnel
        LEFT JOIN departments
            ON personnel.department_id = departments.id
        WHERE personnel.active = 1
        ORDER BY personnel.name ASC
        """
    ).fetchall()

    departments = [
        dict(row)
        for row in department_rows
    ]

    personnel = [
        dict(row)
        for row in personnel_rows
    ]

    return {
        "contract_statuses": CONTRACT_STATUSES,
        "legal_statuses": LEGAL_STATUSES,
        "contract_types": CONTRACT_TYPES,
        "departments": departments,
        "personnel": personnel,
    }