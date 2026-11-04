package com.pennyvault.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.microsoft.graph")
public record MicrosoftGraphProperties(
        String clientId,
        String clientSecret,
        String tenant,
        String redirectUri,
        String senderEmail,
        String scopes,
        String encryptionKey
) {
}
