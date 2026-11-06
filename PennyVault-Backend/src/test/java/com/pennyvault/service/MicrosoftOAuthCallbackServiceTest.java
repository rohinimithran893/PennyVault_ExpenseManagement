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

    @Mock
    private MicrosoftOAuthCredentialService credentialService;

    @InjectMocks
    private MicrosoftOAuthCallbackService callbackService;

    @Test
    void completeAuthorizationValidatesStateExchangesCodeAndStoresRefreshToken() {
        when(stateService.validateAndConsumeState("valid-state")).thenReturn(true);
        when(tokenService.exchangeAuthorizationCode("authorization-code"))
                .thenReturn(new MicrosoftOAuthTokenResponse(
                        "Bearer", "Mail.Send", 3600, 3600,
                        "access-token", "refresh-token"
                ));

        callbackService.completeAuthorization("authorization-code", "valid-state", null);

        verify(stateService).validateAndConsumeState("valid-state");
        verify(tokenService).exchangeAuthorizationCode("authorization-code");
        verify(credentialService).storeRefreshToken("refresh-token");
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

        verifyNoInteractions(tokenService, credentialService);
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
        verifyNoInteractions(tokenService, credentialService);
    }

    @Test
    void completeAuthorizationRejectsMissingCode() {
        when(stateService.validateAndConsumeState("valid-state")).thenReturn(true);

        assertThrows(
                IllegalArgumentException.class,
                () -> callbackService.completeAuthorization(null, "valid-state", null)
        );

        verifyNoInteractions(tokenService, credentialService);
    }
}
