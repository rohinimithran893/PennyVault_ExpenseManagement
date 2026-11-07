package com.pennyvault.service;

import com.pennyvault.entity.HouseholdRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.Mockito.*;

class HouseholdInvitationEmailServiceTest {

    private MicrosoftGraphEmailService graphEmailService;
    private HouseholdInvitationEmailService invitationEmailService;

    @BeforeEach
    void setUp() {
        graphEmailService = mock(MicrosoftGraphEmailService.class);
        invitationEmailService = new HouseholdInvitationEmailService(graphEmailService);
        ReflectionTestUtils.setField(
                invitationEmailService,
                "frontendUrl",
                "http://localhost:3000"
        );
    }

    @Test
    void sendInvitationSendsPlainTextEmailThroughMicrosoftGraph() {
        invitationEmailService.sendInvitation(
                "member@example.com",
                "My Household",
                "invite-token-123",
                HouseholdRole.MEMBER
        );

        verify(graphEmailService).sendEmail(
                eq("member@example.com"),
                eq("You're invited to join My Household on PennyVault"),
                argThat(body -> body.contains("You have been invited to join My Household on PennyVault as a member.")
                        && body.contains("http://localhost:3000/accept-invitation?token=invite-token-123")
                        && body.contains("This invitation expires in 7 days.")
                        && body.contains("you can safely ignore this email.")),
                eq(false)
        );
        verifyNoMoreInteractions(graphEmailService);
    }

    @Test
    void sendInvitationUsesRoleNameInInvitationBody() {
        invitationEmailService.sendInvitation(
                "viewer@example.com",
                "Family",
                "viewer-token",
                HouseholdRole.VIEWER
        );

        verify(graphEmailService).sendEmail(
                eq("viewer@example.com"),
                eq("You're invited to join Family on PennyVault"),
                argThat(body -> body.contains("as a viewer.")),
                eq(false)
        );
    }
}
