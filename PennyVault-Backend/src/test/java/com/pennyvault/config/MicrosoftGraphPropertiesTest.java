package com.pennyvault.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class MicrosoftGraphPropertiesTest {

    @Autowired
    private MicrosoftGraphProperties graphProperties;

    @Test
    void shouldLoadMicrosoftGraphProperties() {

        assertNotNull(graphProperties);

        assertNotNull(graphProperties.clientId());
        assertFalse(graphProperties.clientId().isBlank());

        assertNotNull(graphProperties.clientSecret());
        assertFalse(graphProperties.clientSecret().isBlank());

        assertEquals("consumers", graphProperties.tenant());
        assertEquals("http://localhost:8080/oauth2/callback", graphProperties.redirectUri());
        assertEquals("pennyvault.family@outlook.com", graphProperties.senderEmail());

        assertNotNull(graphProperties.scopes());
        assertTrue(graphProperties.scopes().contains("Mail.Send"));
    }
}
