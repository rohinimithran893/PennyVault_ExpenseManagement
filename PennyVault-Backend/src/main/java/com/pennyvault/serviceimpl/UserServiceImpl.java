package com.pennyvault.serviceimpl;

import com.pennyvault.dto.request.LoginRequest;
import com.pennyvault.dto.request.RegisterRequest;
import com.pennyvault.dto.response.LoginResponse;
import com.pennyvault.dto.response.UserResponse;
import com.pennyvault.entity.User;
import com.pennyvault.exception.EmailAlreadyExistsException;
import com.pennyvault.exception.UsernameAlreadyExistsException;
import com.pennyvault.exception.InvalidCredentialsException;
import com.pennyvault.repository.UserRepository;
import com.pennyvault.security.JwtService;
import com.pennyvault.service.AccountService;
import com.pennyvault.service.UserService;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AccountService accountService;

    @Override
    public UserResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        String username = request.getUsername().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByUsername(username)) {
            throw new UsernameAlreadyExistsException("Username already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .username(username)
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))  // we'll encrypt later
                .role("PRIMARY_OWNER")
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);
        accountService.createDefaultAccounts(savedUser);
        return mapToResponse(savedUser);
    }

    @Override
    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());

        return LoginResponse.builder().token(token).user(mapToResponse(user)).build();
    }

    private UserResponse mapToResponse(User user) {

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }
}