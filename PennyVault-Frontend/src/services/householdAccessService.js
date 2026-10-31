import { apiRequest } from "./apiClient";

const readResponse = async (response) => {
  if (response.status === 204) return null;

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`
    );
  }

  return data;
};

const request = async (endpoint, options) =>
  readResponse(await apiRequest(endpoint, options));

export const getHouseholdMembers = (householdId) =>
  request(`/households/${householdId}/members`);

export const getHouseholdInvitations = (householdId) =>
  request(`/households/${householdId}/invitations`);

export const createHouseholdInvitation = (householdId, email, role) =>
  request(`/households/${householdId}/invitations`, {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });

export const resendHouseholdInvitation = (householdId, invitationId) =>
  request(`/households/${householdId}/invitations/${invitationId}/resend`, {
    method: "POST",
  });

export const cancelHouseholdInvitation = (householdId, invitationId) =>
  request(`/households/${householdId}/invitations/${invitationId}`, {
    method: "DELETE",
  });

export const updateHouseholdMemberRole = (householdId, userId, role) =>
  request(`/households/${householdId}/members/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });

export const setHouseholdMemberActive = (householdId, userId, active) =>
  request(
    `/households/${householdId}/members/${userId}/${active ? "reactivate" : "deactivate"}`,
    { method: "POST" }
  );

 
export const getHouseholdMemberStatistics = (householdId, month) =>
  request(`/households/${householdId}/members/statistics?month=${encodeURIComponent(month)}`);

export const getHouseholdMemberTransactions = (householdId, userId) =>
  request(`/households/${householdId}/members/${userId}/transactions`);

export const updateHouseholdMemberProfile = (householdId, userId, fullName) =>
  request(`/households/${householdId}/members/${userId}/profile`, {
    method: "PATCH",
    body: JSON.stringify({ fullName }),
  });
