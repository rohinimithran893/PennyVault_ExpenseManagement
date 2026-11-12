import React from "react";
import "@testing-library/jest-dom";
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

    await waitFor(() => {
      expect(screen.getByTestId("current-location")).toHaveTextContent("/login");
    });
  });

  test("shows a helpful error when the invitation token is missing", async () => {
    renderPage("/accept-invitation");

    expect(await screen.findByText(/invitation link is missing its token/i)).toBeInTheDocument();
    expect(acceptHouseholdInvitation).not.toHaveBeenCalled();
  });

  test("accepts a valid invitation and shows success feedback", async () => {
    jest.useFakeTimers();
    acceptHouseholdInvitation.mockResolvedValue({});
    renderPage("/accept-invitation?token=valid-token");

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByText("Invitation accepted")).toBeInTheDocument();
    expect(screen.getByText(/Your invitation has been accepted/)).toBeInTheDocument();
    expect(acceptHouseholdInvitation).toHaveBeenCalledTimes(1);
    expect(acceptHouseholdInvitation).toHaveBeenCalledWith("valid-token");

    await act(async () => {
      jest.advanceTimersByTime(1800);
    });
    expect(screen.getByTestId("current-location")).toHaveTextContent("/");
    jest.useRealTimers();
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
