package com.pennyvault.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MicrosoftAccessTokenServiceTest {

    @Mock
    private MicrosoftOAuthCredentialService credentialService;

    @Mock
    private MicrosoftOAuthTokenService tokenService;

    @InjectMocks
    private MicrosoftAccessTokenService accessTokenService;

    @Test
    void getAccessTokenRefreshesAndPersistsRotatedRefreshToken() {
        when(credentialService.getRefreshToken()).thenReturn("stored-refresh-token");
        when(tokenService.refreshAccessToken("stored-refresh-token"))
                .thenReturn(new MicrosoftOAuthTokenResponse(
                        "Bearer", "Mail.Send", 3600, 3600,
                        "new-access-token", "rotated-refresh-token"
                ));

        String accessToken = accessTokenService.getAccessToken();

        assertEquals("new-access-token", accessToken);
        verify(credentialService).getRefreshToken();
        verify(tokenService).refreshAccessToken("stored-refresh-token");
        verify(credentialService).storeRefreshToken("rotated-refresh-token");
    }

    @Test
    void getAccessTokenKeepsExistingRefreshTokenWhenMicrosoftDoesNotRotateIt() {
        when(credentialService.getRefreshToken()).thenReturn("stored-refresh-token");
        when(tokenService.refreshAccessToken("stored-refresh-token"))
                .thenReturn(new MicrosoftOAuthTokenResponse(
                        "Bearer", "Mail.Send", 3600, 3600,
                        "new-access-token", null
                ));

        String accessToken = accessTokenService.getAccessToken();

        assertEquals("new-access-token", accessToken);
        verify(credentialService, never()).storeRefreshToken(anyString());
    }
}
