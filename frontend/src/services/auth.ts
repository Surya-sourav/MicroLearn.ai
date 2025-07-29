const API_BASE_URL = "http://localhost:8000/api/v1";

export async function registerUser(data: {
  email: string;
  username: string;
  password: string;
}) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Registration failed");
  }
  return res.json();
}

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Login failed");
  }
  return res.json();
}
