package com.pennyvault.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HouseholdMemberResponse {
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private boolean currentUser;
}
