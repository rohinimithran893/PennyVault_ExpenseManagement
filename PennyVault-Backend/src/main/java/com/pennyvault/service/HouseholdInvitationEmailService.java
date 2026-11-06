package com.pennyvault.service;

import com.pennyvault.entity.HouseholdRole;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.http.MediaType;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class HouseholdInvitationEmailService {

    private final JavaMailSender mailSender;

    private final RestClient resendClient = RestClient.builder()
            .baseUrl("https://api.resend.com")
            .build();

    @Value("${app.mail.resend-api-key:}")
    private String resendApiKey;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public void sendInvitation(String recipient, String householdName, String token, HouseholdRole role) {
        String acceptanceLink = UriComponentsBuilder.fromUriString(frontendUrl)
                .path("/accept-invitation")
                .queryParam("token", token)
                .build()
                .encode()
                .toUriString();

        String subject = "You're invited to join " + householdName + " on PennyVault";
        String body = "You have been invited to join " + householdName + " on PennyVault as a "
                + role.name().toLowerCase() + ".\n\n"
                + "Accept your invitation using the link below:\n"
                + acceptanceLink + "\n\n"
                + "This invitation expires in 7 days. If you were not expecting this invitation, "
                + "you can safely ignore this email.";

        if (!StringUtils.hasText(fromAddress)) {
            throw new IllegalStateException("MAIL_FROM must be configured before sending invitations.");
        }

        // Use the HTTPS API on Render because its free services block outbound SMTP ports.
        if (StringUtils.hasText(resendApiKey)) {
            resendClient.post()
                    .uri("/emails")
                    .header("Authorization", "Bearer " + resendApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "from", fromAddress,
                            "to", List.of(recipient),
                            "subject", subject,
                            "text", body
                    ))
                    .retrieve()
                    .toBodilessEntity();
            return;
        }

        // Keep Gmail/SMTP available for local development.
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(recipient);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}
