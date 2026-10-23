package com.pennyvault.dto.response;

import java.time.LocalDateTime;

public record HouseholdJoinRequestResponse(
        Long id,
        Long householdId,
        String householdName,
        Long requesterUserId,
        String requesterFullName,
        String requesterEmail,
        String status,
        LocalDateTime requestedAt,
        LocalDateTime reviewedAt,
        Long reviewedByUserId
) {
}
