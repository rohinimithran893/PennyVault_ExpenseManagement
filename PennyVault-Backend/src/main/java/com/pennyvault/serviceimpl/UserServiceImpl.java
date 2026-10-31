package com.pennyvault.serviceimpl;

import com.pennyvault.dto.request.LoginRequest;
import com.pennyvault.dto.request.RegisterRequest;
import com.pennyvault.dto.response.LoginResponse;
import com.pennyvault.dto.response.UserResponse;
import com.pennyvault.entity.User;
import com.pennyvault.entity.Household;
import com.pennyvault.exception.EmailAlreadyExistsException;
import com.pennyvault.exception.UsernameAlreadyExistsException;
import com.pennyvault.exception.InvalidCredentialsException;
import com.pennyvault.repository.UserRepository;
import com.pennyvault.repository.HouseholdRepository;
import com.pennyvault.repository.HouseholdMemberRepository;
import com.pennyvault.entity.HouseholdMember;
import com.pennyvault.entity.HouseholdRole;
import com.pennyvault.security.JwtService;
import com.pennyvault.service.AccountService;
import com.pennyvault.service.UserService;
import lombok.RequiredArgsConstructor;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final HouseholdRepository householdRepository;
    private final HouseholdMemberRepository householdMemberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AccountService accountService;

    @Override
    @Transactional
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
                .password(passwordEncoder.encode(request.getPassword()))
                .role("PRIMARY_OWNER")
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // The pre-checks improve feedback, but only the database unique constraints
        // can prevent duplicates when registrations happen concurrently.
        final User savedUser;
        try {
            savedUser = userRepository.save(user);
        } catch (DataIntegrityViolationException exception) {
            throw translateDuplicateRegistration(exception);
        }

        LocalDateTime now = LocalDateTime.now();
        Household household = Household.builder()
                .ownerUserId(savedUser.getId())
                .name(request.getHouseholdName().trim())
                .createdAt(now)
                .updatedAt(now)
                .build();
        Household savedHousehold = householdRepository.save(household);

        savedUser.setHousehold(savedHousehold);
        savedUser.setUpdatedAt(now);
        User associatedUser = userRepository.save(savedUser);

        householdMemberRepository.save(HouseholdMember.builder()
                .household(savedHousehold)
                .user(associatedUser)
                .memberRole(HouseholdRole.OWNER)
                .active(true)
                .joinedAt(now)
                .build());

        accountService.createDefaultAccounts(associatedUser);
        return mapToResponse(associatedUser);
    }

    private RuntimeException translateDuplicateRegistration(DataIntegrityViolationException exception) {
        String details = exception.getMostSpecificCause() == null
                ? exception.getMessage()
                : exception.getMostSpecificCause().getMessage();
        String normalizedDetails = details == null ? "" : details.toLowerCase(Locale.ROOT);

        if (normalizedDetails.contains("username")) {
            return new UsernameAlreadyExistsException("Username already exists");
        }
        if (normalizedDetails.contains("email")) {
            return new EmailAlreadyExistsException("Email already exists");
        }

        // Do not misreport unrelated integrity failures as duplicate registration.
        return exception;
    }

    @Override
    public LoginResponse login(LoginRequest request) {

        String identifier = request.getEmail().trim();
        User user = (identifier.contains("@")
                ? userRepository.findByEmail(identifier)
                : userRepository.findByUsername(identifier.toLowerCase(Locale.ROOT)))
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid credentials");
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
                .householdId(user.getHousehold() == null ? null : user.getHousehold().getId())
                .householdName(user.getHousehold() == null ? null : user.getHousehold().getName())
                .build();
    }
}