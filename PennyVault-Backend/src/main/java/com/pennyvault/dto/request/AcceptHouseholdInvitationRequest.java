package com.pennyvault.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AcceptHouseholdInvitationRequest {
    @NotBlank
    private String token;
}
