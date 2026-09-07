package com.pennyvault.controller;

import com.pennyvault.dto.request.LoginRequest;
import com.pennyvault.dto.request.RegisterRequest;
import com.pennyvault.dto.response.LoginResponse;
import com.pennyvault.dto.response.UserResponse;
import com.pennyvault.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        return userService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return userService.login(request);
    }
}