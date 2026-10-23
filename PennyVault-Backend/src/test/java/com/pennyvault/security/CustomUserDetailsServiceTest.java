package com.pennyvault.security;

import com.pennyvault.entity.User;
import com.pennyvault.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService userDetailsService;

    @Test
    void loadsExistingUserByEmailForJwtProtectedRequests() {
        User legacyUser = User.builder()
                .id(7L)
                .fullName("Alice Example")
                .email("alice@example.com")
                .username("alice_7")
                .password("encoded-password")
                .role("PRIMARY_OWNER")
                .status("ACTIVE")
                .build();
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(legacyUser));

        UserDetails details = userDetailsService.loadUserByUsername("alice@example.com");

        assertEquals("alice@example.com", details.getUsername());
        assertEquals("encoded-password", details.getPassword());
        assertEquals("ROLE_PRIMARY_OWNER", details.getAuthorities().iterator().next().getAuthority());
        verify(userRepository).findByEmail("alice@example.com");
    }

    @Test
    void rejectsUnknownEmailForJwtProtectedRequests() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> userDetailsService.loadUserByUsername("missing@example.com"));
    }
}
