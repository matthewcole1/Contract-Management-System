"""
Validation and normalization helpers for the Contract Management API.

These functions do not define Flask routes or directly modify the database.
They validate incoming client data and return cleaned values for app.py to use.
"""

from datetime import datetime
from db import get_db


# ---------------------------------------------------------------------------
# STRING VALIDATION / NORMALIZATION
# ---------------------------------------------------------------------------

# Validates incoming string fields before using string methods.
# Rejects non-string values, allows null for optional fields,
# and trims extra whitespace before saving to the database.
def clean_string(value, field_name, required=False):
    """
    Validates and cleans a string value.

    Returns:
        (True, cleaned_value)
        or
        (False, error_message)

    Examples:
        "  Radiology  " -> "Radiology"
        None            -> None, if optional
        26001           -> error
    """

    # Optional fields may be omitted or explicitly set to null.
    if value is None:
        if required:
            return False, f"{field_name} is required"

        return True, None

    # Reject non-string JSON values before calling .strip().
    if not isinstance(value, str):
        return False, f"{field_name} must be a string"

    # Remove leading/trailing whitespace.
    cleaned = value.strip()

    # A required field containing only spaces is still considered missing.
    if required and cleaned == "":
        return False, f"{field_name} is required"

    return True, cleaned


# ---------------------------------------------------------------------------
# DATE VALIDATION / NORMALIZATION
# ---------------------------------------------------------------------------

# Validates incoming date values and normalizes them to YYYY-MM-DD.
# This prevents invalid dates and keeps SQLite text-date sorting reliable.
# Optional blank dates are stored as None / SQL NULL.
def validate_date(date_string, field_name):
    """
    Validates and normalizes a date value.

    Examples of accepted input:
        2026-09-16
        2027-01-05
        2026-9-5

    The last example is normalized to:
        2026-09-05

    Examples of invalid input:
        09/16/2026
        2026-13-01
        2026-02-30
        tomorrow
    """

    # Optional date fields may be empty.
    if date_string in (None, ""):
        return True, None

    # JSON values are not guaranteed to be strings.
    #
    # Example:
    #     "contract_start_date": 20261001
    #
    # datetime.strptime() requires a string, so reject
    # incorrect JSON types before attempting to parse them.
    if not isinstance(date_string, str):
        return (
            False,
            f"{field_name} must be a date string in YYYY-MM-DD format"
        )

    try:
        # Remove accidental whitespace.
        cleaned_date = date_string.strip()

        # Try converting the string into a Python datetime object.
        # "%Y-%m-%d" means:
        #
        # %Y = 4-digit year
        # %m = 2-digit month
        # %d = 2-digit day
        #
        # Example:
        # 2026-09-16
        normalized_date = datetime.strptime(cleaned_date,"%Y-%m-%d").date().isoformat()

        return True, normalized_date

    except ValueError:
        # ValueError means the string either has an unsupported format
        # or represents an impossible calendar date.

        # INVALID FORMAT EXAMPLES:
        # 09/16/2026
        # Uses MM/DD/YYYY instead of YYYY-MM-DD.
        #
        # 2026/09/16
        # Uses slashes instead of hyphens.
        #
        # September 16, 2026
        # Uses words instead of the required numeric format.
        #
        # tomorrow
        # Is not a date in YYYY-MM-DD format.
        #
        # IMPOSSIBLE DATE EXAMPLES:
        #
        # 2026-13-01
        # Month 13 does not exist.
        #
        # 2026-00-15
        # Month 00 does not exist.
        #
        # 2026-02-30
        # February does not have 30 days.
        #
        # 2026-04-31
        # April only has 30 days.
        #
        # 2025-02-29
        # 2025 is not a leap year, so February 29 is invalid.
        #
        # If any of these are supplied, the function returns False.
        return (
            False,
            f"{field_name} must be a valid date in YYYY-MM-DD format"
        )


def validate_date_range(start_date, end_date):
    """
    Checks whether the contract end date is on or after
    the contract start date.

    Valid:
        Start: 2026-10-01
        End:   2027-09-30

    Invalid:
        Start: 2026-10-01
        End:   2026-09-01
    """

    # If either date is missing, there is nothing to compare yet.
    if not start_date or not end_date:
        return True

    # These values should already have been validated and normalized before this function is called.
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")

    # Returns True if:
    #
    # end date is after start date
    #
    # OR
    #
    # end date is the same as start date.
    #
    # Examples:
    #
    # Start: 2026-10-01
    # End:   2027-09-30
    # Result: True
    #
    # Start: 2026-10-01
    # End:   2026-10-01
    # Result: True
    #
    # Start: 2026-10-01
    # End:   2026-09-30
    # Result: False
    return end >= start

def department_exists(department_name):
    """
    Checks whether a department exists in the departments table
    and is marked as active.

    Returns True if the department is valid.
    Returns False if it does not exist or is inactive.
    """

    # A missing or blank department is not valid.
    if not department_name:
        return False

    db = get_db()

    row = db.execute(
        """
        SELECT id
        FROM departments
        WHERE name = ?
          AND active = 1
        """,
        (department_name.strip(),)
    ).fetchone()

    return row is not None

def master_agreement_exists(master_agreement_id):
    """
    Checks whether a master agreement ID exists.

    None is allowed because linking a contract to a
    master agreement is optional.
    """

    # No master agreement selected is valid.
    if master_agreement_id is None:
        return True

    # JSON could send a string, boolean, list, etc.
    # We only accept an integer database ID.
    if not isinstance(master_agreement_id, int):
        return False

    db = get_db()

    row = db.execute(
        """
        SELECT id
        FROM master_agreements
        WHERE id = ?
        """,
        (master_agreement_id,)
    ).fetchone()

    return row is not None