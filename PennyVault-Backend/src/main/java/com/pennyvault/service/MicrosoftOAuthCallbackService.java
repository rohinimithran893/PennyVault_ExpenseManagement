package com.pennyvault.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MicrosoftOAuthCallbackService {

    private final MicrosoftOAuthStateService stateService;
    private final MicrosoftOAuthTokenService tokenService;

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

        // Token persistence and encryption are implemented in the next integration step.
        // Keep the token response server-side; never return it to the browser or log it.
        tokenService.exchangeAuthorizationCode(code);
    }
}
