package com.pennyvault.controller;

import com.pennyvault.dto.request.AddHouseholdMemberRequest;
import com.pennyvault.dto.response.HouseholdMemberResponse;
import com.pennyvault.service.HouseholdService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/household/members")
@RequiredArgsConstructor
public class HouseholdController {
    private final HouseholdService householdService;

    @GetMapping
    public ResponseEntity<List<HouseholdMemberResponse>> listMembers(Authentication authentication) {
        return ResponseEntity.ok(householdService.listMembers(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<HouseholdMemberResponse> addMember(@Valid @RequestBody AddHouseholdMemberRequest request, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(householdService.addMember(request, authentication.getName()));
    }
}
