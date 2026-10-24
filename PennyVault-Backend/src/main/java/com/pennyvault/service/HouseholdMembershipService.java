package com.pennyvault.service;

import com.pennyvault.dto.response.HouseholdMembershipResponse;

import java.util.List;

public interface HouseholdMembershipService {
    List<HouseholdMembershipResponse> getMyMemberships(String userEmail);
    void leaveHousehold(Long householdId, String userEmail);
}
