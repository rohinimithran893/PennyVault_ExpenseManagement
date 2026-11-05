package com.pennyvault.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class MicrosoftAccessTokenIntegrationTest {

    @Autowired
    private MicrosoftAccessTokenService accessTokenService;

    @Test
    void shouldRetrieveAccessTokenUsingStoredRefreshToken() {
        String accessToken = accessTokenService.getAccessToken();

        assertNotNull(accessToken);
        assertFalse(accessToken.isBlank());
    }
}
