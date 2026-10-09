def test_get_master_agreements(client):
    response = client.get("/api/master-agreements")

    assert response.status_code == 200

    data = response.get_json()

    assert "master_agreements" in data
    assert "count" in data


def test_create_master_agreement(client):
    response = client.post(
        "/api/master-agreements",
        json={
            "agreement_number": "MA-TEST-100",
            "institution_company_name": "Test University",
            "date": "2026-10-01",
            "end_date": "2027-06-30",
            "document_link": "",
            "notes": "Created by automated test",
        },
    )

    assert response.status_code == 201

    data = response.get_json()

    agreement = data["master_agreement"]

    assert agreement["agreement_number"] == "MA-TEST-100"
    assert (
        agreement["institution_company_name"]
        == "Test University"
    )
    assert agreement["date"] == "2026-10-01"
    assert agreement["end_date"] == "2027-06-30"
    assert agreement["notes"] == "Created by automated test"

def test_get_one_master_agreement(client):
    create_response = client.post(
        "/api/master-agreements",
        json={
            "agreement_number": "MA-GET-001",
            "institution_company_name": "Lookup University",
            "date": "2026-10-01",
            "end_date": None,
        },
    )

    agreement_id = create_response.get_json()[
        "master_agreement"
    ]["id"]

    response = client.get(
        f"/api/master-agreements/{agreement_id}"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert (
        data["master_agreement"]["agreement_number"]
        == "MA-GET-001"
    )


def test_update_master_agreement(client):
    create_response = client.post(
        "/api/master-agreements",
        json={
            "agreement_number": "MA-PATCH-001",
            "institution_company_name": "Patch University",
        },
    )

    agreement_id = create_response.get_json()[
        "master_agreement"
    ]["id"]

    response = client.patch(
        f"/api/master-agreements/{agreement_id}",
        json={
            "notes": "Updated by test",
            "end_date": "2027-06-30",
        },
    )

    assert response.status_code == 200

    data = response.get_json()

    assert (
        data["master_agreement"]["notes"]
        == "Updated by test"
    )

    assert (
        data["master_agreement"]["end_date"]
        == "2027-06-30"
    )


def test_duplicate_master_agreement_number_rejected(client):
    payload = {
        "agreement_number": "MA-DUP-001",
        "institution_company_name": "Duplicate University",
    }

    first_response = client.post(
        "/api/master-agreements",
        json=payload,
    )

    assert first_response.status_code == 201

    second_response = client.post(
        "/api/master-agreements",
        json=payload,
    )

    assert second_response.status_code == 409

    data = second_response.get_json()

    assert "already exists" in data["error"]


def test_master_agreement_not_found(client):
    response = client.get(
        "/api/master-agreements/999999"
    )

    assert response.status_code == 404

    data = response.get_json()

    assert data["error"] == "Master agreement not found."


def test_master_agreement_end_date_can_be_null(client):
    response = client.post(
        "/api/master-agreements",
        json={
            "agreement_number": "MA-NO-END-001",
            "institution_company_name": "No End Date University",
            "date": "2026-10-01",
            "end_date": None,
        },
    )

    assert response.status_code == 201

    data = response.get_json()

    assert data["master_agreement"]["end_date"] is None