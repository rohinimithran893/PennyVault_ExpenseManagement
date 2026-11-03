package com.pennyvault.service;

import com.pennyvault.entity.HouseholdRole;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class HouseholdInvitationEmailService {

    private final JavaMailSender mailSender;

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

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(recipient);
        message.setSubject("You're invited to join " + householdName + " on PennyVault");
        message.setText(
                "You have been invited to join " + householdName + " on PennyVault as a "
                        + role.name().toLowerCase() + ".\n\n"
                        + "Accept your invitation using the link below:\n"
                        + acceptanceLink + "\n\n"
                        + "This invitation expires in 7 days. If you were not expecting this invitation, "
                        + "you can safely ignore this email."
        );
        mailSender.send(message);
    }
}
