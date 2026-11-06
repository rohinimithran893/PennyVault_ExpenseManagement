package com.pennyvault.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MicrosoftOAuthCallbackService {

    private final MicrosoftOAuthStateService stateService;
    private final MicrosoftOAuthTokenService tokenService;
    private final MicrosoftOAuthCredentialService credentialService;

    public void completeAuthorization(String code, String state, String providerError) {
        if (!stateService.validateAndConsumeState(state)) {
            throw new IllegalArgumentException("Invalid or expired Microsoft OAuth state.");
        }

        if (providerError != null && !providerError.isBlank()) {
            throw new IllegalArgumentException("Microsoft authorization was declined.");
        }

        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Microsoft authorization code is missing.");
        }

        MicrosoftOAuthTokenResponse tokenResponse =
                tokenService.exchangeAuthorizationCode(code);

        credentialService.storeRefreshToken(tokenResponse.refreshToken());
    }
}
