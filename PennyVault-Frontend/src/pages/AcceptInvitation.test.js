import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import AcceptInvitation from "./AcceptInvitation";
import { acceptHouseholdInvitation } from "../services/householdAccessService";
import { isAuthenticated, logout } from "../utils/auth";

jest.mock("../utils/auth", () => ({
  isAuthenticated: jest.fn(),
  logout: jest.fn(),
}));
jest.mock("../services/householdAccessService", () => ({
  acceptHouseholdInvitation: jest.fn(),
}));

function LocationDisplay() {
  const location = useLocation();
  return <span data-testid="current-location">{location.pathname + location.search}</span>;
}

const renderPage = (entry) => render(
  <MemoryRouter initialEntries={[entry]}>
    <AcceptInvitation />
    <LocationDisplay />
  </MemoryRouter>
);

beforeEach(() => {
  jest.clearAllMocks();
  isAuthenticated.mockReturnValue(true);
});

describe("Accept Invitation page", () => {
  test("redirects unauthenticated visitors to login and preserves the invitation link", async () => {
    isAuthenticated.mockReturnValue(false);
    renderPage("/accept-invitation?token=invite-token");

    expect(await screen.findByTestId("current-location")).toHaveTextContent(
      "/login"
    );
  });

  test("shows a helpful error when the invitation token is missing", async () => {
    renderPage("/accept-invitation");

    expect(await screen.findByText(/invitation link is missing its token/i)).toBeInTheDocument();
    expect(acceptHouseholdInvitation).not.toHaveBeenCalled();
  });

  test("accepts a valid invitation and shows success feedback", async () => {
    acceptHouseholdInvitation.mockResolvedValue({});
    renderPage("/accept-invitation?token=valid-token");

    expect(await screen.findByText("Invitation accepted")).toBeInTheDocument();
    expect(screen.getByText(/Your invitation has been accepted/)).toBeInTheDocument();
    expect(acceptHouseholdInvitation).toHaveBeenCalledTimes(1);
    expect(acceptHouseholdInvitation).toHaveBeenCalledWith("valid-token");
  });

  test("shows the API error and offers sign-in with the invited email", async () => {
    acceptHouseholdInvitation.mockRejectedValue(new Error("This invitation has expired"));
    renderPage("/accept-invitation?token=expired-token");

    expect(await screen.findByText("This invitation has expired")).toBeInTheDocument();
    const signInButton = screen.getByRole("button", { name: /sign in with invited email/i });
    fireEvent.click(signInButton);

    expect(logout).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByTestId("current-location")).toHaveTextContent("/login"));
  });

  test("does not submit the same token more than once during a mounted page", async () => {
    let resolveAcceptance;
    acceptHouseholdInvitation.mockReturnValue(new Promise((resolve) => {
      resolveAcceptance = resolve;
    }));
    renderPage("/accept-invitation?token=single-use-token");

    await waitFor(() => expect(acceptHouseholdInvitation).toHaveBeenCalledTimes(1));
    await act(async () => resolveAcceptance({}));
    expect(acceptHouseholdInvitation).toHaveBeenCalledTimes(1);
  });
});
