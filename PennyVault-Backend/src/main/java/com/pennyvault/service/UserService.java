package com.pennyvault.service;

import com.pennyvault.dto.request.LoginRequest;
import com.pennyvault.dto.request.RegisterRequest;
import com.pennyvault.dto.response.LoginResponse;
import com.pennyvault.dto.response.UserResponse;

public interface UserService {

    UserResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

}