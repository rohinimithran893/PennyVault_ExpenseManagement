package com.pennyvault.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MicrosoftAccessTokenService {

    private final MicrosoftOAuthCredentialService credentialService;
    private final MicrosoftOAuthTokenService tokenService;

    /**
     * Obtains a short-lived access token for the next Microsoft Graph request.
     * Refresh tokens are rotated and persisted whenever Microsoft returns a replacement.
     */
    public String getAccessToken() {
        String currentRefreshToken = credentialService.getRefreshToken();

        MicrosoftOAuthTokenResponse response =
                tokenService.refreshAccessToken(currentRefreshToken);

        if (response.refreshToken() != null && !response.refreshToken().isBlank()) {
            credentialService.storeRefreshToken(response.refreshToken());
        }

        return response.accessToken();
    }
}
