package com.pennyvault.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class HouseholdMembershipResponse {
    private Long householdId;
    private String householdName;
    private String role;
    private LocalDateTime joinedAt;
}
