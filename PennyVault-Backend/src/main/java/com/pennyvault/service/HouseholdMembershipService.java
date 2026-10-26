package com.pennyvault.service;

import com.pennyvault.entity.HouseholdMember;
import com.pennyvault.entity.HouseholdRole;
import com.pennyvault.entity.User;
import com.pennyvault.repository.HouseholdMemberRepository;
import com.pennyvault.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HouseholdMembershipService {

    private final HouseholdMemberRepository householdMemberRepository;
    private final UserRepository userRepository;

    public HouseholdMember requireMembership(Long householdId, Long userId) {
        return householdMemberRepository.findByHousehold_IdAndUser_Id(householdId, userId)
                .orElseThrow(() -> new AccessDeniedException(
                        "User is not a member of this household"
                ));
    }

    public HouseholdMember requireRole(
            Long householdId,
            Long userId,
            HouseholdRole... allowedRoles
    ) {
        HouseholdMember membership = requireMembership(householdId, userId);
        for (HouseholdRole allowedRole : allowedRoles) {
            if (membership.getMemberRole() == allowedRole) {
                return membership;
            }
        }
        throw new AccessDeniedException("User does not have the required household role");
    }

    public HouseholdMember requirePrimaryOwner(Long householdId, Long userId) {
        return requireRole(householdId, userId, HouseholdRole.OWNER);
    }

    public List<HouseholdMember> getMembersForHousehold(Long householdId, Long requestingUserId) {
        requireMembership(householdId, requestingUserId);
        return householdMemberRepository.findAllByHousehold_IdOrderByJoinedAtAsc(householdId);
    }

    public HouseholdMember requireCurrentUserMembership(Long householdId) {
        User currentUser = getCurrentUser();
        return requireMembership(householdId, currentUser.getId());
    }

    public HouseholdMember requireCurrentUserRole(Long householdId, HouseholdRole... allowedRoles) {
        User currentUser = getCurrentUser();
        return requireRole(householdId, currentUser.getId(), allowedRoles);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication is required");
        }

        Object principal = authentication.getPrincipal();
        String email;
        if (principal instanceof UserDetails userDetails) {
            email = userDetails.getUsername();
        } else {
            email = authentication.getName();
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Authenticated user was not found"));
    }
}
