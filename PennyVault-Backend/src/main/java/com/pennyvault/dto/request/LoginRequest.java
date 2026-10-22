package com.pennyvault.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data //Used for signin
public class LoginRequest {

    @NotBlank(message = "Username or email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}