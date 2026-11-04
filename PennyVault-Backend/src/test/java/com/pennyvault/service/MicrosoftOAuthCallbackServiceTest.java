package com.pennyvault.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MicrosoftOAuthCallbackServiceTest {

    @Mock
    private MicrosoftOAuthStateService stateService;

    @Mock
    private MicrosoftOAuthTokenService tokenService;

    @InjectMocks
    private MicrosoftOAuthCallbackService callbackService;

    @Test
    void completeAuthorizationValidatesStateBeforeExchangingCode() {
        when(stateService.validateAndConsumeState("valid-state")).thenReturn(true);

        callbackService.completeAuthorization("authorization-code", "valid-state", null);

        verify(stateService).validateAndConsumeState("valid-state");
        verify(tokenService).exchangeAuthorizationCode("authorization-code");
    }

    @Test
    void completeAuthorizationRejectsInvalidStateWithoutExchangingCode() {
        when(stateService.validateAndConsumeState("invalid-state")).thenReturn(false);

        assertThrows(
                IllegalArgumentException.class,
                () -> callbackService.completeAuthorization(
                        "authorization-code", "invalid-state", null
                )
        );

        verifyNoInteractions(tokenService);
    }

    @Test
    void completeAuthorizationConsumesStateWhenUserDeclinesConsent() {
        when(stateService.validateAndConsumeState("valid-state")).thenReturn(true);

        assertThrows(
                IllegalArgumentException.class,
                () -> callbackService.completeAuthorization(
                        null, "valid-state", "access_denied"
                )
        );

        verify(stateService).validateAndConsumeState("valid-state");
        verifyNoInteractions(tokenService);
    }

    @Test
    void completeAuthorizationRejectsMissingCode() {
        when(stateService.validateAndConsumeState("valid-state")).thenReturn(true);

        assertThrows(
                IllegalArgumentException.class,
                () -> callbackService.completeAuthorization(null, "valid-state", null)
        );

        verifyNoInteractions(tokenService);
    }
}
