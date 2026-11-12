import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PeopleAccess from "./MemberAccess";
import { getUser } from "../utils/auth";
import {
  createHouseholdInvitation,
  getHouseholdInvitations,
  getHouseholdMembers,
  getHouseholdMemberStatistics,
} from "../services/householdAccessService";

jest.mock("../utils/auth", () => ({ getUser: jest.fn() }));
jest.mock("../services/householdAccessService", () => ({
  cancelHouseholdInvitation: jest.fn(),
  createHouseholdInvitation: jest.fn(),
  getHouseholdInvitations: jest.fn(),
  getHouseholdMembers: jest.fn(),
  getHouseholdMemberStatistics: jest.fn(),
  resendHouseholdInvitation: jest.fn(),
  setHouseholdMemberActive: jest.fn(),
  updateHouseholdMemberRole: jest.fn(),
  getHouseholdMemberTransactions: jest.fn(),
  updateHouseholdMemberProfile: jest.fn(),
}));

const householdMembers = (role) => [
  { userId: 1, fullName: "Current User", email: "current@example.com", role, active: true },
  { userId: 2, fullName: "Other Member", email: "other@example.com", role: "MEMBER", active: true },
];

const renderPage = async (role) => {
  getUser.mockReturnValue({ id: 1, householdId: 99 });
  getHouseholdMembers.mockResolvedValue(householdMembers(role));
  getHouseholdInvitations.mockResolvedValue([]);
  getHouseholdMemberStatistics.mockResolvedValue([]);
  const result = render(<MemoryRouter><PeopleAccess /></MemoryRouter>);
  await screen.findByText("People & Access");
  await waitFor(() => expect(getHouseholdMembers).toHaveBeenCalledWith(99));
  return result;
};

beforeEach(() => {
  jest.clearAllMocks();
  window.confirm = jest.fn(() => true);
});

describe("Invite People modal", () => {
  test("Primary Owner can open the modal and invite all supported roles", async () => {
    await renderPage("OWNER");
    fireEvent.click(await screen.findByRole("button", { name: /invite people/i }));

    const roleSelect = screen.getByLabelText("Invitation Role");
    expect(within(roleSelect).getByRole("option", { name: "Co-owner" })).toBeInTheDocument();
    expect(within(roleSelect).getByRole("option", { name: "Member" })).toBeInTheDocument();
    expect(within(roleSelect).getByRole("option", { name: "Viewer" })).toBeInTheDocument();
    expect(roleSelect).toHaveValue("CO_OWNER");
    expect(screen.getByText(/Can invite and manage invitations/)).toBeInTheDocument();
  });

  test("Co-owner can invite only Members and Viewers", async () => {
    await renderPage("CO_OWNER");
    fireEvent.click(await screen.findByRole("button", { name: /invite people/i }));

    const roleSelect = screen.getByLabelText("Invitation Role");
    expect(within(roleSelect).queryByRole("option", { name: "Co-owner" })).not.toBeInTheDocument();
    expect(within(roleSelect).getByRole("option", { name: "Member" })).toBeInTheDocument();
    expect(within(roleSelect).getByRole("option", { name: "Viewer" })).toBeInTheDocument();
    expect(roleSelect).toHaveValue("MEMBER");
    expect(screen.getByText(/Can access household features/)).toBeInTheDocument();
  });

  test.each(["MEMBER", "VIEWER"])("%s cannot see the Invite People action", async (role) => {
    await renderPage(role);
    expect(screen.queryByRole("button", { name: /invite people/i })).not.toBeInTheDocument();
  });

  test("role explanation updates when the selected role changes", async () => {
    await renderPage("OWNER");
    fireEvent.click(await screen.findByRole("button", { name: /invite people/i }));
    fireEvent.change(screen.getByLabelText("Invitation Role"), { target: { value: "VIEWER" } });
    expect(screen.getByText("Can view household information but cannot make changes.")).toBeInTheDocument();
  });

  test("invalid email is rejected without calling the invitation API", async () => {
    await renderPage("OWNER");
    fireEvent.click(await screen.findByRole("button", { name: /invite people/i }));
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "not-an-email" } });
    fireEvent.submit(screen.getByRole("button", { name: /send invite/i }).closest("form"));

    expect(await screen.findByText("Please enter a valid email address")).toBeInTheDocument();
    expect(createHouseholdInvitation).not.toHaveBeenCalled();
  });

  test("valid invitation submits the selected email and role", async () => {
    createHouseholdInvitation.mockResolvedValue({});
    await renderPage("OWNER");
    fireEvent.click(await screen.findByRole("button", { name: /invite people/i }));
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "new.member@example.com" } });
    fireEvent.change(screen.getByLabelText("Invitation Role"), { target: { value: "VIEWER" } });
    fireEvent.click(screen.getByRole("button", { name: /send invite/i }));

    await waitFor(() => expect(createHouseholdInvitation).toHaveBeenCalledWith(
      99, "new.member@example.com", "VIEWER"
    ));
    expect(await screen.findByText(/Invitation sent successfully to new.member@example.com/)).toBeInTheDocument();
  });
});
