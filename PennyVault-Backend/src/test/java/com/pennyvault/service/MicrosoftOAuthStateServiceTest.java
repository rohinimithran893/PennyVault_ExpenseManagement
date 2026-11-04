package com.pennyvault.service;

import com.pennyvault.entity.MicrosoftOAuthState;
import com.pennyvault.repository.MicrosoftOAuthStateRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MicrosoftOAuthStateServiceTest {

    @Mock
    private MicrosoftOAuthStateRepository stateRepository;

    @InjectMocks
    private MicrosoftOAuthStateService stateService;

    @Test
    void generateStateCreatesAndStoresHashedState() {

        ArgumentCaptor<MicrosoftOAuthState> captor =
                ArgumentCaptor.forClass(MicrosoftOAuthState.class);

        String rawState = stateService.generateState();

        verify(stateRepository).deleteByExpiresAtBefore(any(Instant.class));
        verify(stateRepository).save(captor.capture());

        MicrosoftOAuthState savedState = captor.getValue();

        assertNotNull(rawState);
        assertFalse(rawState.isBlank());

        assertNotEquals(rawState, savedState.getStateHash());
        assertEquals(64, savedState.getStateHash().length());

        assertNotNull(savedState.getCreatedAt());
        assertEquals(
                600,
                savedState.getExpiresAt().getEpochSecond()
                        - savedState.getCreatedAt().getEpochSecond()
        );
    }

    @Test
    void generateStateCreatesDifferentValuesForEachCall() {

        String firstState = stateService.generateState();
        String secondState = stateService.generateState();

        assertNotEquals(firstState, secondState);
    }

    @Test
    void validateAndConsumeStateReturnsTrueWhenStateExists() {

        when(stateRepository.deleteByStateHashAndExpiresAtAfter(
                anyString(), any(Instant.class)
        )).thenReturn(1L);

        boolean result = stateService.validateAndConsumeState("valid-state");

        assertTrue(result);

        verify(stateRepository).deleteByStateHashAndExpiresAtAfter(
                anyString(), any(Instant.class)
        );
    }

    @Test
    void validateAndConsumeStateReturnsFalseWhenStateDoesNotExist() {

        when(stateRepository.deleteByStateHashAndExpiresAtAfter(
                anyString(), any(Instant.class)
        )).thenReturn(0L);

        boolean result = stateService.validateAndConsumeState("invalid-state");

        assertFalse(result);
    }

    @Test
    void validateAndConsumeStateRejectsNullOrBlankState() {

        assertFalse(stateService.validateAndConsumeState(null));
        assertFalse(stateService.validateAndConsumeState(" "));

        verifyNoInteractions(stateRepository);
    }
}
