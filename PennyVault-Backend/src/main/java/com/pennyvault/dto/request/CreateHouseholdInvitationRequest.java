package com.pennyvault.dto.request;

import com.pennyvault.entity.HouseholdRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateHouseholdInvitationRequest {

    @NotBlank(message = "Email Address is required")
    @Email(message = "Please enter a valid email address")
    private String email;

    @NotNull(message = "Member role is required")
    private HouseholdRole role;
}
