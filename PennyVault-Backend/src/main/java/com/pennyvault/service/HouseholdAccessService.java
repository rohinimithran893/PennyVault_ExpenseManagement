package com.pennyvault.service;

import com.pennyvault.dto.request.CreateHouseholdInvitationRequest;
import com.pennyvault.dto.response.HouseholdInvitationResponse;
import com.pennyvault.dto.response.HouseholdMemberResponse;
import com.pennyvault.entity.*;
import com.pennyvault.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class HouseholdAccessService {

    private static final int TOKEN_BYTES = 32;
    private static final int INVITATION_VALID_DAYS = 7;

    private final HouseholdRepository householdRepository;
    private final HouseholdMemberRepository memberRepository;
    private final HouseholdInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final HouseholdMembershipService membershipService;
    private final SecureRandom secureRandom = new SecureRandom();

    public HouseholdInvitationResponse createInvitation(Long householdId, CreateHouseholdInvitationRequest request) {
        User actor = currentUser();
        membershipService.requirePrimaryOwner(householdId, actor.getId());

        HouseholdRole role = request.getRole();
        if (role == null || role == HouseholdRole.OWNER) {
            throw new IllegalArgumentException("Invitations cannot assign the Primary Owner role");
        }

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (userRepository.findByEmail(email).filter(user ->
                memberRepository.existsByHousehold_IdAndUser_Id(householdId, user.getId())).isPresent()) {
            throw new IllegalArgumentException("This user is already a member of the household");
        }
        if (invitationRepository.existsByHousehold_IdAndEmailIgnoreCaseAndStatus(
                householdId, email, HouseholdInvitationStatus.PENDING)) {
            throw new IllegalArgumentException("A pending invitation already exists for this email");
        }

        Household household = householdRepository.findById(householdId)
                .orElseThrow(() -> new IllegalArgumentException("Household was not found"));
        String rawToken = newToken();
        LocalDateTime now = LocalDateTime.now();
        HouseholdInvitation invitation = HouseholdInvitation.builder()
                .household(household)
                .invitedBy(actor)
                .email(email)
                .memberRole(role)
                .tokenHash(hashToken(rawToken))
                .status(HouseholdInvitationStatus.PENDING)
                .createdAt(now)
                .updatedAt(now)
                .expiresAt(now.plusDays(INVITATION_VALID_DAYS))
                .build();
        invitationRepository.save(invitation);
        return HouseholdInvitationResponse.from(invitation, rawToken);
    }

    public List<HouseholdInvitationResponse> listInvitations(Long householdId) {
        User actor = currentUser();
        membershipService.requirePrimaryOwner(householdId, actor.getId());
        LocalDateTime now = LocalDateTime.now();
        List<HouseholdInvitation> invitations = invitationRepository.findAllByHousehold_IdOrderByCreatedAtDesc(householdId);
        invitations.stream()
                .filter(invitation -> invitation.getStatus() == HouseholdInvitationStatus.PENDING
                        && !invitation.getExpiresAt().isAfter(now))
                .forEach(invitation -> {
                    invitation.setStatus(HouseholdInvitationStatus.EXPIRED);
                    invitation.setUpdatedAt(now);
                });
        invitationRepository.saveAll(invitations);
        return invitations.stream().map(invitation -> HouseholdInvitationResponse.from(invitation, null)).toList();
    }

    public HouseholdInvitationResponse resendInvitation(Long householdId, Long invitationId) {
        User actor = currentUser();
        membershipService.requirePrimaryOwner(householdId, actor.getId());
        HouseholdInvitation invitation = findInvitation(householdId, invitationId);
        if (invitation.getStatus() != HouseholdInvitationStatus.PENDING
                && invitation.getStatus() != HouseholdInvitationStatus.EXPIRED) {
            throw new IllegalArgumentException("Only pending or expired invitations can be resent");
        }
        String rawToken = newToken();
        LocalDateTime now = LocalDateTime.now();
        invitation.setTokenHash(hashToken(rawToken));
        invitation.setStatus(HouseholdInvitationStatus.PENDING);
        invitation.setExpiresAt(now.plusDays(INVITATION_VALID_DAYS));
        invitation.setUpdatedAt(now);
        return HouseholdInvitationResponse.from(invitationRepository.save(invitation), rawToken);
    }

    public void cancelInvitation(Long householdId, Long invitationId) {
        User actor = currentUser();
        membershipService.requirePrimaryOwner(householdId, actor.getId());
        HouseholdInvitation invitation = findInvitation(householdId, invitationId);
        if (invitation.getStatus() != HouseholdInvitationStatus.PENDING) {
            throw new IllegalArgumentException("Only pending invitations can be cancelled");
        }
        invitation.setStatus(HouseholdInvitationStatus.CANCELLED);
        invitation.setUpdatedAt(LocalDateTime.now());
        invitationRepository.save(invitation);
    }

    public HouseholdMemberResponse acceptInvitation(String rawToken) {
        User actor = currentUser();
        HouseholdInvitation invitation = invitationRepository.findByTokenHash(hashToken(rawToken.trim()))
                .orElseThrow(() -> new BadCredentialsException("Invitation token is invalid"));
        LocalDateTime now = LocalDateTime.now();
        if (invitation.getStatus() != HouseholdInvitationStatus.PENDING) {
            throw new IllegalArgumentException("This invitation is no longer pending");
        }
        if (!invitation.getExpiresAt().isAfter(now)) {
            invitation.setStatus(HouseholdInvitationStatus.EXPIRED);
            invitation.setUpdatedAt(now);
            invitationRepository.save(invitation);
            throw new IllegalArgumentException("This invitation has expired");
        }
        if (!actor.getEmail().equalsIgnoreCase(invitation.getEmail())) {
            throw new AccessDeniedException("Sign in with the email address that received the invitation");
        }
        if (memberRepository.existsByHousehold_IdAndUser_Id(
                invitation.getHousehold().getId(), actor.getId())) {
            throw new IllegalArgumentException("You are already a member of this household");
        }

        HouseholdMember member = HouseholdMember.builder()
                .household(invitation.getHousehold())
                .user(actor)
                .memberRole(invitation.getMemberRole())
                .active(true)
                .joinedAt(now)
                .build();
        memberRepository.save(member);
        invitation.setStatus(HouseholdInvitationStatus.ACCEPTED);
        invitation.setAcceptedAt(now);
        invitation.setUpdatedAt(now);
        invitationRepository.save(invitation);
        return HouseholdMemberResponse.from(member);
    }

    @Transactional(readOnly = true)
    public List<HouseholdMemberResponse> listMembers(Long householdId) {
        User actor = currentUser();
        membershipService.requireMembership(householdId, actor.getId());
        return memberRepository.findAllByHousehold_IdOrderByJoinedAtAsc(householdId)
                .stream().map(HouseholdMemberResponse::from).toList();
    }

    public HouseholdMemberResponse setMemberActive(Long householdId, Long targetUserId, boolean active) {
        User actor = currentUser();
        membershipService.requirePrimaryOwner(householdId, actor.getId());
        HouseholdMember target = memberRepository.findByHousehold_IdAndUser_Id(householdId, targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("Household member was not found"));
        if (target.getMemberRole() == HouseholdRole.OWNER) {
            throw new IllegalArgumentException("The Primary Owner cannot be deactivated");
        }
        target.setActive(active);
        target.setDeactivatedAt(active ? null : LocalDateTime.now());
        return HouseholdMemberResponse.from(memberRepository.save(target));
    }

    public HouseholdMemberResponse updateMemberRole(Long householdId, Long targetUserId, HouseholdRole role) {
        User actor = currentUser();
        membershipService.requirePrimaryOwner(householdId, actor.getId());
        if (role == null || role == HouseholdRole.OWNER) {
            throw new IllegalArgumentException("The Primary Owner role cannot be assigned or changed");
        }
        HouseholdMember target = memberRepository.findByHousehold_IdAndUser_Id(householdId, targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("Household member was not found"));
        if (target.getMemberRole() == HouseholdRole.OWNER) {
            throw new IllegalArgumentException("The Primary Owner role cannot be changed");
        }
        target.setMemberRole(role);
        return HouseholdMemberResponse.from(memberRepository.save(target));
    }

    private HouseholdInvitation findInvitation(Long householdId, Long invitationId) {
        HouseholdInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new IllegalArgumentException("Invitation was not found"));
        if (!invitation.getHousehold().getId().equals(householdId)) {
            throw new IllegalArgumentException("Invitation was not found in this household");
        }
        return invitation;
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication is required");
        }
        Object principal = authentication.getPrincipal();
        String email = principal instanceof UserDetails details
                ? details.getUsername() : authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Authenticated user was not found"));
    }

    private String newToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }
}
