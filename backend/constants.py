"""
Controlled values used throughout the Contract Management API.

Keeping these values in one file prevents routes from hardcoding
workflow statuses, legal statuses, contract types, and editable fields.
"""

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
    "Agreement",
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
