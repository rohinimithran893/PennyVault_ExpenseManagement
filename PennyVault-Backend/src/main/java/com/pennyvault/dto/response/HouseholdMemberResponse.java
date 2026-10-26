package com.pennyvault.dto.response;

import com.pennyvault.entity.HouseholdMember;
import com.pennyvault.entity.HouseholdRole;

import java.time.LocalDateTime;

public record HouseholdMemberResponse(
        Long userId,
        String fullName,
        String email,
        HouseholdRole role,
        boolean active,
        LocalDateTime joinedAt,
        LocalDateTime deactivatedAt
) {
    public static HouseholdMemberResponse from(HouseholdMember member) {
        return new HouseholdMemberResponse(
                member.getUser().getId(),
                member.getUser().getFullName(),
                member.getUser().getEmail(),
                member.getMemberRole(),
                member.isActive(),
                member.getJoinedAt(),
                member.getDeactivatedAt()
        );
    }
}
