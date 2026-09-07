const API_BASE_URL = "http://localhost:8080/api";

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Invalid email or password"
    );
  }

  return data;
};

export const register = async (fullName, email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName,
        email,
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
};