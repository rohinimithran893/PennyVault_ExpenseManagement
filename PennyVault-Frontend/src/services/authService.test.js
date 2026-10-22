import { loginUser, register } from "./authService";

describe("authentication API contract", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("registration sends household name, username, email, full name, and password", async () => {
    const responseBody = {
      id: 12,
      fullName: "Alice Example",
      householdId: 77,
      householdName: "Alice Household",
      username: "alice_01",
      email: "alice@example.com",
      role: "PRIMARY_OWNER",
      status: "ACTIVE",
    };
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => responseBody,
    });

    const result = await register(
      "Alice Example",
      "Alice Household",
      "alice_01",
      "alice@example.com",
      "Password123"
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/auth/register",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Alice Example",
          householdName: "Alice Household",
          username: "alice_01",
          email: "alice@example.com",
          password: "Password123",
        }),
      })
    );
    expect(result).toEqual(responseBody);
  });

  test("registration preserves server conflict details for duplicate usernames", async () => {
    const errorBody = {
      status: 409,
      message: "Username already exists",
    };
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => errorBody,
    });

    await expect(
      register("Alice Example", "Alice Household", "alice_01", "alice@example.com", "Password123")
    ).rejects.toEqual(errorBody);
  });

  test("login sends the identifier in the existing email field", async () => {
    const responseBody = {
      token: "test-token",
      user: {
        id: 12,
        fullName: "Alice Example",
        username: "alice_01",
        email: "alice@example.com",
        role: "PRIMARY_OWNER",
        status: "ACTIVE",
      },
    };
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => responseBody,
    });

    const result = await loginUser("alice_01", "Password123");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/auth/login",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "alice_01",
          password: "Password123",
        }),
      })
    );
    expect(result).toEqual(responseBody);
  });

  test("login exposes the backend invalid-credentials message", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ status: 401, message: "Invalid credentials" }),
    });

    await expect(loginUser("alice_01", "wrong-password")).rejects.toThrow(
      "Invalid credentials"
    );
  });
});
