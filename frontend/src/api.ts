const API_BASE_URL = "http://127.0.0.1:5001";

type ContractFilters = {
  search?: string;
  department?: string;
  status?: string;
};

export async function getContracts(filters: ContractFilters = {}) {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.department) {
    params.set("department", filters.department);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  const queryString = params.toString();

  const url = queryString
    ? `${API_BASE_URL}/api/contracts?${queryString}`
    : `${API_BASE_URL}/api/contracts`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to load contracts");
  }

  return response.json();
}

export async function getContract(contractId: number) {
  const response = await fetch(
    `${API_BASE_URL}/api/contracts/${contractId}`
  );

  if (!response.ok) {
    throw new Error("Failed to load contract");
  }

  return response.json();
}

export async function getContractHistory(contractId: number) {
  const response = await fetch(
    `${API_BASE_URL}/api/contracts/${contractId}/history`
  );

  if (!response.ok) {
    throw new Error("Failed to load contract history");
  }

  return response.json();
}

export async function updateContract(
  contractId: number,
  updates: Record<string, unknown>
) {
  const response = await fetch(
    `${API_BASE_URL}/api/contracts/${contractId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to update contract"
    );
  }

  return data;
}

export async function createContract(
  contract: Record<string, unknown>
) {
  const response = await fetch(
    `${API_BASE_URL}/api/contracts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contract),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to create contract"
    );
  }

  return data;
}

export async function createMasterAgreement(
  agreement: Record<string, unknown>
) {
  const response = await fetch(
    `${API_BASE_URL}/api/master-agreements`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(agreement),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to create master agreement"
    );
  }

  return data;
}

export async function getMasterAgreements() {
  const response = await fetch(
    `${API_BASE_URL}/api/master-agreements`
  );

  if (!response.ok) {
    throw new Error("Failed to load master agreements");
  }

  return response.json();
}

export async function getMasterAgreement(
  agreementId: number
) {
  const response = await fetch(
    `${API_BASE_URL}/api/master-agreements/${agreementId}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to load master agreement"
    );
  }

  return data;
}

export async function updateMasterAgreement(
  agreementId: number,
  updates: Record<string, unknown>
) {
  const response = await fetch(
    `${API_BASE_URL}/api/master-agreements/${agreementId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to update master agreement"
    );
  }

  return data;
}

export async function getOptions() {
  const response = await fetch(`${API_BASE_URL}/api/options`);

  if (!response.ok) {
    throw new Error("Failed to load options");
  }

  return response.json();
}