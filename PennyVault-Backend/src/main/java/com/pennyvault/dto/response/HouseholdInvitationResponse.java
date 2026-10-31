package com.pennyvault.dto.response;

import com.pennyvault.entity.HouseholdInvitation;
import com.pennyvault.entity.HouseholdInvitationStatus;
import com.pennyvault.entity.HouseholdRole;

import java.time.LocalDateTime;

public record HouseholdInvitationResponse(
        Long id,
        Long householdId,
        String email,
        HouseholdRole role,
        HouseholdInvitationStatus status,
        LocalDateTime expiresAt,
        LocalDateTime createdAt,
        String invitationToken
) {
    public static HouseholdInvitationResponse from(HouseholdInvitation invitation, String rawToken) {
        return new HouseholdInvitationResponse(
                invitation.getId(),
                invitation.getHousehold().getId(),
                invitation.getEmail(),
                invitation.getMemberRole(),
                invitation.getStatus(),
                invitation.getExpiresAt(),
                invitation.getCreatedAt(),
                rawToken
        );
    }
}
