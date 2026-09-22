const API_BASE_URL = "http://127.0.0.1:5001";

export async function getContracts() {
  const response = await fetch(`${API_BASE_URL}/api/contracts`);

  if (!response.ok) {
    throw new Error("Failed to load contracts");
  }

  return response.json();
}

export async function getOptions() {
  const response = await fetch(`${API_BASE_URL}/api/options`);

  if (!response.ok) {
    throw new Error("Failed to load options");
  }

  return response.json();
}