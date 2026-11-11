package com.pennyvault.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MicrosoftGraphEmailService {

    private static final String SEND_MAIL_ENDPOINT = "https://graph.microsoft.com/v1.0/me/sendMail";

    private final RestClient.Builder restClientBuilder;
    private final MicrosoftAccessTokenService accessTokenService;

    /**
     * Sends an email through the signed-in Microsoft mailbox.
     * A successful return means Microsoft Graph accepted the message (HTTP 202).
     */
    public void sendEmail(String recipient, String subject, String content, boolean html) {
        if (recipient == null || recipient.isBlank()) {
            throw new IllegalArgumentException("Email recipient must not be blank.");
        }
        if (subject == null || subject.isBlank()) {
            throw new IllegalArgumentException("Email subject must not be blank.");
        }
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Email content must not be blank.");
        }

        String accessToken = accessTokenService.getAccessToken();

        Map<String, Object> message = Map.of(
                "subject", subject,
                "body", Map.of(
                        "contentType", html ? "HTML" : "Text",
                        "content", content
                ),
                "toRecipients", List.of(
                        Map.of("emailAddress", Map.of("address", recipient))
                )
        );

        Map<String, Object> requestBody = Map.of(
                "message", message,
                "saveToSentItems", true
        );

        try {
            restClientBuilder.build()
                    .post()
                    .uri(SEND_MAIL_ENDPOINT)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException exception) {
            // Do not expose provider response bodies or credentials to callers/logs.
            throw new IllegalStateException("Microsoft Graph could not accept the email.", exception);
        }
    }
}
