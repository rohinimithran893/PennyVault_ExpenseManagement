package com.pennyvault.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddHouseholdMemberRequest {
    @NotBlank @Email
    private String email;
}
