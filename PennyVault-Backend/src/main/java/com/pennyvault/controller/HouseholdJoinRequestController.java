package com.pennyvault.controller;

import com.pennyvault.dto.response.HouseholdJoinRequestResponse;
import com.pennyvault.dto.response.HouseholdSearchResponse;
import com.pennyvault.service.HouseholdJoinRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/households")
@RequiredArgsConstructor
public class HouseholdJoinRequestController {

    private final HouseholdJoinRequestService joinRequestService;

    @GetMapping("/search")
    public List<HouseholdSearchResponse> searchHouseholds(@RequestParam String name) {
        return joinRequestService.searchHouseholds(name);
    }

    @PostMapping("/{householdId}/join-requests")
    public ResponseEntity<HouseholdJoinRequestResponse> requestToJoin(
            @PathVariable Long householdId, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(joinRequestService.requestToJoin(householdId, authentication.getName()));
    }

    @GetMapping("/join-requests/mine")
    public List<HouseholdJoinRequestResponse> getMyRequests(Authentication authentication) {
        return joinRequestService.getMyRequests(authentication.getName());
    }

    @GetMapping("/{householdId}/join-requests/pending")
    public List<HouseholdJoinRequestResponse> getPendingRequests(
            @PathVariable Long householdId, Authentication authentication) {
        return joinRequestService.getPendingRequests(householdId, authentication.getName());
    }

    @PostMapping("/join-requests/{requestId}/approve")
    public HouseholdJoinRequestResponse approveRequest(
            @PathVariable Long requestId, Authentication authentication) {
        return joinRequestService.approveRequest(requestId, authentication.getName());
    }

    @PostMapping("/join-requests/{requestId}/reject")
    public HouseholdJoinRequestResponse rejectRequest(
            @PathVariable Long requestId, Authentication authentication) {
        return joinRequestService.rejectRequest(requestId, authentication.getName());
    }
}
