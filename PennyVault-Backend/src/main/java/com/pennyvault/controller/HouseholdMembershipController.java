package com.pennyvault.controller;

import com.pennyvault.dto.response.HouseholdMembershipResponse;
import com.pennyvault.service.HouseholdMembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/households/memberships")
@RequiredArgsConstructor
public class HouseholdMembershipController {

    private final HouseholdMembershipService membershipService;

    @GetMapping("/mine")
    public List<HouseholdMembershipResponse> getMyMemberships(Authentication authentication) {
        return membershipService.getMyMemberships(authentication.getName());
    }

    @DeleteMapping("/{householdId}")
    public ResponseEntity<Void> leaveHousehold(
            @PathVariable Long householdId, Authentication authentication) {
        membershipService.leaveHousehold(householdId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
