package com.pennyvault.serviceimpl;

import com.pennyvault.dto.request.LoginRequest;
import com.pennyvault.dto.request.RegisterRequest;
import com.pennyvault.dto.response.LoginResponse;
import com.pennyvault.dto.response.UserResponse;
import com.pennyvault.entity.User;
import com.pennyvault.entity.Household;
import com.pennyvault.exception.EmailAlreadyExistsException;
import com.pennyvault.exception.InvalidCredentialsException;
import com.pennyvault.exception.UsernameAlreadyExistsException;
import com.pennyvault.repository.UserRepository;
import com.pennyvault.repository.HouseholdRepository;
import com.pennyvault.security.JwtService;
import com.pennyvault.service.AccountService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private HouseholdRepository householdRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AccountService accountService;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void registerNormalizesUsernameAndReturnsItInResponse() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Alice Example");
        request.setHouseholdName("Alice Household");
        request.setUsername("  Alice_01  ");
        request.setEmail("alice@example.com");
        request.setPassword("Password123");

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(userRepository.existsByUsername("alice_01")).thenReturn(false);
        when(passwordEncoder.encode("Password123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            savedUser.setId(42L);
            return savedUser;
        });
        when(householdRepository.save(any(Household.class))).thenAnswer(invocation -> {
            Household household = invocation.getArgument(0);
            household.setId(77L);
            return household;
        });

        UserResponse response = userService.register(request);

        assertEquals(42L, response.getId());
        assertEquals("alice_01", response.getUsername());
        assertEquals("alice@example.com", response.getEmail());
        assertEquals(77L, response.getHouseholdId());
        assertEquals("Alice Household", response.getHouseholdName());
        verify(householdRepository).save(any(Household.class));
        verify(accountService).createDefaultAccounts(any(User.class));
    }

    @Test
    void registerRejectsAnExistingUsername() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Alice Example");
        request.setUsername("Alice_01");
        request.setEmail("another@example.com");
        request.setPassword("Password123");

        when(userRepository.existsByEmail("another@example.com")).thenReturn(false);
        when(userRepository.existsByUsername("alice_01")).thenReturn(true);

        assertThrows(UsernameAlreadyExistsException.class, () -> userService.register(request));

        verify(userRepository, never()).save(any(User.class));
        verifyNoInteractions(accountService);
    }

    @Test
    void registerTranslatesDatabaseUsernameConstraintViolation() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Alice Example");
        request.setUsername("Alice_01");
        request.setEmail("alice@example.com");
        request.setPassword("Password123");

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(userRepository.existsByUsername("alice_01")).thenReturn(false);
        when(passwordEncoder.encode("Password123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenThrow(
                new DataIntegrityViolationException(
                        "duplicate key violates unique constraint uq_users_username"));

        assertThrows(UsernameAlreadyExistsException.class, () -> userService.register(request));
        verifyNoInteractions(accountService);
    }

    @Test
    void registerTranslatesDatabaseEmailConstraintViolation() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Alice Example");
        request.setUsername("Alice_01");
        request.setEmail("alice@example.com");
        request.setPassword("Password123");

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(userRepository.existsByUsername("alice_01")).thenReturn(false);
        when(passwordEncoder.encode("Password123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenThrow(
                new DataIntegrityViolationException(
                        "duplicate key violates unique constraint users_email_key"));

        assertThrows(EmailAlreadyExistsException.class, () -> userService.register(request));
        verifyNoInteractions(accountService);
    }

    @Test
    void loginAcceptsUsername() {
        User user = existingUser();
        LoginRequest request = new LoginRequest();
        request.setEmail("Alice_01");
        request.setPassword("Password123");

        when(userRepository.findByUsername("alice_01")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password123", "encoded-password")).thenReturn(true);
        when(jwtService.generateToken("alice@example.com")).thenReturn("test-token");

        LoginResponse response = userService.login(request);

        assertEquals("test-token", response.getToken());
        assertEquals("alice_01", response.getUser().getUsername());
        verify(userRepository).findByUsername("alice_01");
    }

    @Test
    void existingUserCanStillLoginByEmailAndReceivesEmailBasedToken() {
        User legacyUser = existingUser();
        // This represents a username backfilled by V11 for a pre-existing account.
        legacyUser.setUsername("alice_7");
        LoginRequest request = new LoginRequest();
        request.setEmail("alice@example.com");
        request.setPassword("Password123");

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(legacyUser));
        when(passwordEncoder.matches("Password123", "encoded-password")).thenReturn(true);
        when(jwtService.generateToken("alice@example.com")).thenReturn("test-token");

        LoginResponse response = userService.login(request);

        assertEquals("test-token", response.getToken());
        assertEquals("alice@example.com", response.getUser().getEmail());
        assertEquals("alice_7", response.getUser().getUsername());
        verify(userRepository).findByEmail("alice@example.com");
        verify(jwtService).generateToken("alice@example.com");
    }

    @Test
    void loginRejectsIncorrectPassword() {
        LoginRequest request = new LoginRequest();
        request.setEmail("alice_01");
        request.setPassword("wrong-password");

        when(userRepository.findByUsername("alice_01")).thenReturn(Optional.of(existingUser()));
        when(passwordEncoder.matches("wrong-password", "encoded-password")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> userService.login(request));

        verify(jwtService, never()).generateToken(any(String.class));
    }

    private User existingUser() {
        return User.builder()
                .id(7L)
                .fullName("Alice Example")
                .username("alice_01")
                .email("alice@example.com")
                .password("encoded-password")
                .role("PRIMARY_OWNER")
                .status("ACTIVE")
                .build();
    }
}
