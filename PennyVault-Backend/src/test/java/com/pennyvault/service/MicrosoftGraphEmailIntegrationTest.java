package com.pennyvault.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * Opt-in live test. Set PENNYVAULT_MICROSOFT_GRAPH_INTEGRATION=true and provide
 * valid Microsoft Graph OAuth configuration before running this test.
 */
@SpringBootTest
@EnabledIfEnvironmentVariable(
        named = "PENNYVAULT_MICROSOFT_GRAPH_INTEGRATION",
        matches = "true"
)
class MicrosoftGraphEmailIntegrationTest {

    @Autowired
    private MicrosoftGraphEmailService graphEmailService;

    @Value("${app.microsoft.graph.sender-email}")
    private String senderEmail;

    @Test
    void shouldSendRealEmailThroughMicrosoftGraph() {
        assertNotNull(senderEmail);
        assertFalse(senderEmail.isBlank());

        graphEmailService.sendEmail(
                senderEmail,
                "PennyVault - Microsoft Graph Email Test",
                "This is a test email sent successfully through "
                        + "Microsoft Graph from PennyVault.",
                false
        );
    }
}
