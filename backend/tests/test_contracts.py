import os
import sys

# Add the backend folder to Python's import path so tests can import app.py.
sys.path.insert(
    0,
    os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            ".."
        )
    )
)

def test_get_contracts(client):
    response = client.get("/api/contracts")

    assert response.status_code == 200

    data = response.get_json()

    assert "contracts" in data
    assert "count" in data


def test_get_departments(client):
    response = client.get("/api/departments")

    assert response.status_code == 200

    data = response.get_json()

    assert "departments" in data
    assert "count" in data


def test_empty_patch_rejected(client):
    response = client.patch(
        "/api/contracts/1",
        json={}
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["error"] == "No update data provided"

def test_create_contract(client):
    response = client.post(
        "/api/contracts",
        json={
            "kch_number": "KCH-TEST-AUTO-001",
            "institution_company_name": "Automated Test University",
            "department": "Radiology",
            "contract_type": "Agreement",
        },
    )

    assert response.status_code == 201

    data = response.get_json()

    assert data["contract"]["kch_number"] == "KCH-TEST-AUTO-001"


def test_duplicate_kch_rejected(client):
    payload = {
        "kch_number": "KCH-DUPLICATE-001",
        "institution_company_name": "Duplicate Test University",
        "department": "Radiology",
        "contract_type": "Agreement",
    }

    first_response = client.post(
        "/api/contracts",
        json=payload,
    )

    second_response = client.post(
        "/api/contracts",
        json=payload,
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 409


def test_patch_creates_audit_history(client):
    create_response = client.post(
        "/api/contracts",
        json={
            "kch_number": "KCH-AUDIT-001",
            "institution_company_name": "Audit Test University",
            "department": "Radiology",
            "contract_type": "Agreement",
        },
    )

    contract_id = create_response.get_json()["contract"]["id"]

    history_response = client.get(
        f"/api/contracts/{contract_id}/history"
    )

    assert history_response.status_code == 200


def test_date_normalization(client):
    response = client.post(
        "/api/contracts",
        json={
            "kch_number": "KCH-DATE-001",
            "institution_company_name": "Date Test University",
            "department": "Radiology",
            "contract_type": "Agreement",
            "contract_start_date": "2026-9-5",
            "contract_end_date": "2026-9-30",
        },
    )

    assert response.status_code == 201

    contract = response.get_json()["contract"]

    assert contract["contract_start_date"] == "2026-09-05"
    assert contract["contract_end_date"] == "2026-09-30"


def test_invalid_department_rejected(client):
    response = client.post(
        "/api/contracts",
        json={
            "kch_number": "KCH-DEPT-001",
            "institution_company_name": "Department Test",
            "department": "Fake Department",
            "contract_type": "Agreement",
        },
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["error"] == "Invalid or inactive department"


def test_invalid_contract_type_rejected(client):
    response = client.post(
        "/api/contracts",
        json={
            "kch_number": "KCH-TYPE-INVALID-001",
            "institution_company_name": "Type Test",
            "department": "Radiology",
            "contract_type": "Fake Contract Type",
        },
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["error"] == "Invalid contract type"


def test_invalid_master_agreement_rejected(client):
    response = client.post(
        "/api/contracts",
        json={
            "kch_number": "KCH-MASTER-001",
            "institution_company_name": "Master Test",
            "department": "Radiology",
            "contract_type": "Agreement",
            "master_agreement_id": 999999,
        },
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["error"] == "Invalid master_agreement_id"


def test_non_string_attorney_rejected(client):
    response = client.post(
        "/api/contracts",
        json={
            "kch_number": "KCH-STRING-001",
            "institution_company_name": "String Test",
            "department": "Radiology",
            "contract_type": "Agreement",
            "assigned_attorney": 123,
        },
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["error"] == "assigned_attorney must be a string"

def test_filter_contracts_by_department(client):
    response = client.get(
        "/api/contracts?department=Radiology"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["count"] >= 1

    for contract in data["contracts"]:
        assert contract["department"] == "Radiology"


def test_filter_contracts_by_status(client):
    response = client.get(
        "/api/contracts?status=Active"
    )

    assert response.status_code == 200

    data = response.get_json()

    for contract in data["contracts"]:
        assert contract["contract_status"] == "Active"


def test_search_contracts(client):
    response = client.get(
        "/api/contracts?search=ABC"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["count"] >= 1

    assert any(
        "ABC" in contract["institution_company_name"]
        or "ABC" in contract["kch_number"]
        for contract in data["contracts"]
    )


def test_filter_contracts_by_attorney(client):
    response = client.get(
        "/api/contracts?attorney=Jordan"
    )

    assert response.status_code == 200

    data = response.get_json()

    for contract in data["contracts"]:
        assert "Jordan" in contract["assigned_attorney"]

def test_get_options(client):
    response = client.get("/api/options")

    assert response.status_code == 200

    data = response.get_json()

    assert "contract_statuses" in data
    assert "contract_types" in data
    assert "departments" in data
    assert "personnel" in data