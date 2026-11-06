package com.pennyvault.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.source.MapConfigurationPropertySource;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MicrosoftGraphPropertiesTest {

    @Test
    void bindsMicrosoftGraphPropertiesFromApplicationConfiguration() {
        MapConfigurationPropertySource source = new MapConfigurationPropertySource(Map.of(
                "app.microsoft.graph.client-id", "ci-client-id",
                "app.microsoft.graph.client-secret", "ci-client-secret",
                "app.microsoft.graph.tenant", "consumers",
                "app.microsoft.graph.redirect-uri", "http://localhost:8080/oauth2/callback",
                "app.microsoft.graph.sender-email", "ci-mailbox@example.com",
                "app.microsoft.graph.scopes", "openid profile offline_access Mail.Send",
                "app.microsoft.graph.encryption-key", "Y2ktdGVzdC1rZXktdmFsdWU="
        ));

        MicrosoftGraphProperties properties = new Binder(source)
                .bind("app.microsoft.graph", Bindable.of(MicrosoftGraphProperties.class))
                .orElseThrow();

        assertEquals("ci-client-id", properties.clientId());
        assertEquals("ci-client-secret", properties.clientSecret());
        assertEquals("consumers", properties.tenant());
        assertEquals("http://localhost:8080/oauth2/callback", properties.redirectUri());
        assertEquals("ci-mailbox@example.com", properties.senderEmail());
        assertTrue(properties.scopes().contains("Mail.Send"));
        assertEquals("Y2ktdGVzdC1rZXktdmFsdWU=", properties.encryptionKey());
    }
}
