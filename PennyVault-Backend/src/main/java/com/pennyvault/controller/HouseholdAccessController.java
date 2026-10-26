package com.pennyvault.controller;

import com.pennyvault.dto.request.AcceptHouseholdInvitationRequest;
import com.pennyvault.dto.request.CreateHouseholdInvitationRequest;
import com.pennyvault.dto.response.HouseholdInvitationResponse;
import com.pennyvault.dto.response.HouseholdMemberResponse;
import com.pennyvault.entity.HouseholdRole;
import com.pennyvault.service.HouseholdAccessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class HouseholdAccessController {

    private final HouseholdAccessService householdAccessService;

    @PostMapping("/api/households/{householdId}/invitations")
    @ResponseStatus(HttpStatus.CREATED)
    public HouseholdInvitationResponse createInvitation(
            @PathVariable Long householdId,
            @Valid @RequestBody CreateHouseholdInvitationRequest request) {
        return householdAccessService.createInvitation(householdId, request);
    }

    @GetMapping("/api/households/{householdId}/invitations")
    public List<HouseholdInvitationResponse> listInvitations(@PathVariable Long householdId) {
        return householdAccessService.listInvitations(householdId);
    }

    @PostMapping("/api/households/{householdId}/invitations/{invitationId}/resend")
    public HouseholdInvitationResponse resendInvitation(
            @PathVariable Long householdId, @PathVariable Long invitationId) {
        return householdAccessService.resendInvitation(householdId, invitationId);
    }

    @DeleteMapping("/api/households/{householdId}/invitations/{invitationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelInvitation(
            @PathVariable Long householdId, @PathVariable Long invitationId) {
        householdAccessService.cancelInvitation(householdId, invitationId);
    }

    @PostMapping("/api/household-invitations/accept")
    public HouseholdMemberResponse acceptInvitation(
            @Valid @RequestBody AcceptHouseholdInvitationRequest request) {
        return householdAccessService.acceptInvitation(request.getToken());
    }

    @GetMapping("/api/households/{householdId}/members")
    public List<HouseholdMemberResponse> listMembers(@PathVariable Long householdId) {
        return householdAccessService.listMembers(householdId);
    }

    @PostMapping("/api/households/{householdId}/members/{userId}/deactivate")
    public HouseholdMemberResponse deactivateMember(
            @PathVariable Long householdId, @PathVariable Long userId) {
        return householdAccessService.setMemberActive(householdId, userId, false);
    }

    @PostMapping("/api/households/{householdId}/members/{userId}/reactivate")
    public HouseholdMemberResponse reactivateMember(
            @PathVariable Long householdId, @PathVariable Long userId) {
        return householdAccessService.setMemberActive(householdId, userId, true);
    }

    @PatchMapping("/api/households/{householdId}/members/{userId}/role")
    public HouseholdMemberResponse updateMemberRole(
            @PathVariable Long householdId,
            @PathVariable Long userId,
            @RequestBody Map<String, HouseholdRole> request) {
        return householdAccessService.updateMemberRole(householdId, userId, request.get("role"));
    }
}
