package com.pennyvault.service;

import com.pennyvault.dto.response.HouseholdJoinRequestResponse;
import com.pennyvault.dto.response.HouseholdSearchResponse;

import java.util.List;

public interface HouseholdJoinRequestService {

    List<HouseholdSearchResponse> searchHouseholds(String name);

    HouseholdJoinRequestResponse requestToJoin(Long householdId, String requesterEmail);

    List<HouseholdJoinRequestResponse> getMyRequests(String requesterEmail);

    List<HouseholdJoinRequestResponse> getPendingRequests(Long householdId, String ownerEmail);

    HouseholdJoinRequestResponse approveRequest(Long requestId, String ownerEmail);

    HouseholdJoinRequestResponse rejectRequest(Long requestId, String ownerEmail);
}
