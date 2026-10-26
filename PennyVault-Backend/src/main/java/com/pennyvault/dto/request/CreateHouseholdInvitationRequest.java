package com.pennyvault.dto.request;

import com.pennyvault.entity.HouseholdRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateHouseholdInvitationRequest {
    @NotBlank
    @Email
    private String email;

    @NotNull
    private HouseholdRole role;
}
