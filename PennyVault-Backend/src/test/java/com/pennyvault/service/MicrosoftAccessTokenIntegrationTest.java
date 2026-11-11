package com.pennyvault.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * Opt-in live test. Set PENNYVAULT_MICROSOFT_GRAPH_INTEGRATION=true and provide
 * a connected Microsoft mailbox plus valid OAuth configuration before running.
 */
@SpringBootTest
@EnabledIfEnvironmentVariable(
        named = "PENNYVAULT_MICROSOFT_GRAPH_INTEGRATION",
        matches = "true"
)
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
