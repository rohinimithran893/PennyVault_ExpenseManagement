package com.pennyvault.service;

import com.pennyvault.dto.request.CreateHouseholdInvitationRequest;
import com.pennyvault.entity.*;
import com.pennyvault.repository.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class HouseholdAccessServicePermissionMatrixTest {
    private static final Long HOUSEHOLD_ID = 10L;
    private static final Long ACTOR_ID = 20L;
    private static final Long INVITATION_ID = 30L;

    private HouseholdRepository householdRepository;
    private HouseholdMemberRepository memberRepository;
    private HouseholdInvitationRepository invitationRepository;
    private UserRepository userRepository;
    private AccountRepository accountRepository;
    private TransactionRepository transactionRepository;
    private HouseholdMembershipService membershipService;
    private HouseholdInvitationEmailService emailService;
    private HouseholdAccessService service;
    private User actor;
    private Household household;

    record MatrixCase(HouseholdRole caller, HouseholdRole invited, boolean allowed) {
        @Override public String toString() {
            return caller + " -> " + invited + " (allowed=" + allowed + ")";
        }
    }

    static Stream<MatrixCase> roleMatrix() {
        return Stream.of(HouseholdRole.values())
                .flatMap(caller -> Stream.of(HouseholdRole.values())
                        .map(invited -> new MatrixCase(caller, invited, mayInvite(caller, invited))));
    }

    private static boolean mayInvite(HouseholdRole caller, HouseholdRole invited) {
        return caller == HouseholdRole.OWNER
                ? invited == HouseholdRole.CO_OWNER || invited == HouseholdRole.MEMBER || invited == HouseholdRole.VIEWER
                : caller == HouseholdRole.CO_OWNER
                    && (invited == HouseholdRole.MEMBER || invited == HouseholdRole.VIEWER);
    }

    @BeforeEach
    void setUp() {
        householdRepository = mock(HouseholdRepository.class);
        memberRepository = mock(HouseholdMemberRepository.class);
        invitationRepository = mock(HouseholdInvitationRepository.class);
        userRepository = mock(UserRepository.class);
        accountRepository = mock(AccountRepository.class);
        transactionRepository = mock(TransactionRepository.class);
        membershipService = mock(HouseholdMembershipService.class);
        emailService = mock(HouseholdInvitationEmailService.class);

        service = new HouseholdAccessService(
                householdRepository, memberRepository, invitationRepository, userRepository,
                accountRepository, transactionRepository, membershipService, emailService
        );
        actor = User.builder().id(ACTOR_ID).email("actor@example.com").build();
        household = Household.builder().id(HOUSEHOLD_ID).name("Family").build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("actor@example.com", "password")
        );
        when(userRepository.findByEmail("actor@example.com")).thenReturn(Optional.of(actor));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @ParameterizedTest(name = "create: {0}")
    @MethodSource("roleMatrix")
    void createInvitationEnforcesCallerAndInvitedRoleMatrix(MatrixCase testCase) {
        mockCallerRole(testCase.caller());
        CreateHouseholdInvitationRequest request = new CreateHouseholdInvitationRequest();
        request.setEmail("invitee@example.com");
        request.setRole(testCase.invited());
        when(userRepository.findByEmail("invitee@example.com")).thenReturn(Optional.empty());
        when(invitationRepository.findAllByHousehold_IdOrderByCreatedAtDesc(HOUSEHOLD_ID)).thenReturn(List.of());
        when(invitationRepository.existsByHousehold_IdAndEmailIgnoreCaseAndStatus(
                HOUSEHOLD_ID, "invitee@example.com", HouseholdInvitationStatus.PENDING)).thenReturn(false);
        when(householdRepository.findById(HOUSEHOLD_ID)).thenReturn(Optional.of(household));
        when(invitationRepository.save(any(HouseholdInvitation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        if (testCase.allowed()) {
            assertDoesNotThrow(() -> service.createInvitation(HOUSEHOLD_ID, request));
            verify(invitationRepository).save(argThat(invitation ->
                    invitation.getMemberRole() == testCase.invited()
                            && invitation.getInvitedBy().equals(actor)));
            verify(emailService).sendInvitation(
                    eq("invitee@example.com"), eq("Family"), anyString(), eq(testCase.invited()));
        } else {
            if (testCase.caller() == HouseholdRole.OWNER || testCase.caller() == HouseholdRole.CO_OWNER) {
                assertThrows(IllegalArgumentException.class,
                        () -> service.createInvitation(HOUSEHOLD_ID, request));
            } else {
                assertThrows(AccessDeniedException.class,
                        () -> service.createInvitation(HOUSEHOLD_ID, request));
            }
            verify(invitationRepository, never()).save(any());
            verifyNoInteractions(emailService);
        }
    }

    @ParameterizedTest(name = "resend: {0}")
    @MethodSource("roleMatrix")
    void resendInvitationEnforcesCallerInvitedRoleAndOwnershipMatrix(MatrixCase testCase) {
        mockCallerRole(testCase.caller());
        HouseholdInvitation invitation = invitation(testCase.invited(), ACTOR_ID);
        when(invitationRepository.findById(INVITATION_ID)).thenReturn(Optional.of(invitation));
        when(invitationRepository.save(any(HouseholdInvitation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        boolean allowed = testCase.caller() == HouseholdRole.OWNER
                || (testCase.caller() == HouseholdRole.CO_OWNER
                    && (testCase.invited() == HouseholdRole.MEMBER || testCase.invited() == HouseholdRole.VIEWER));
        if (testCase.caller() == HouseholdRole.CO_OWNER && allowed) {
            // Co-owners may only manage invitations they personally created.
            assertDoesNotThrow(() -> service.resendInvitation(HOUSEHOLD_ID, INVITATION_ID));
            verify(emailService).sendInvitation(eq("invitee@example.com"), eq("Family"), anyString(), eq(testCase.invited()));
        } else if (allowed) {
            assertDoesNotThrow(() -> service.resendInvitation(HOUSEHOLD_ID, INVITATION_ID));
            verify(emailService).sendInvitation(eq("invitee@example.com"), eq("Family"), anyString(), eq(testCase.invited()));
        } else {
            assertThrows(AccessDeniedException.class,
                    () -> service.resendInvitation(HOUSEHOLD_ID, INVITATION_ID));
            verify(invitationRepository, never()).save(any());
            verifyNoInteractions(emailService);
        }
    }

    @ParameterizedTest(name = "cancel: {0}")
    @MethodSource("roleMatrix")
    void cancelInvitationEnforcesCallerInvitedRoleAndOwnershipMatrix(MatrixCase testCase) {
        mockCallerRole(testCase.caller());
        HouseholdInvitation invitation = invitation(testCase.invited(), ACTOR_ID);
        when(invitationRepository.findById(INVITATION_ID)).thenReturn(Optional.of(invitation));

        boolean allowed = testCase.caller() == HouseholdRole.OWNER
                || (testCase.caller() == HouseholdRole.CO_OWNER
                    && (testCase.invited() == HouseholdRole.MEMBER || testCase.invited() == HouseholdRole.VIEWER));
        if (allowed) {
            assertDoesNotThrow(() -> service.cancelInvitation(HOUSEHOLD_ID, INVITATION_ID));
            assertEquals(HouseholdInvitationStatus.CANCELLED, invitation.getStatus());
            verify(invitationRepository).save(invitation);
        } else {
            assertThrows(AccessDeniedException.class,
                    () -> service.cancelInvitation(HOUSEHOLD_ID, INVITATION_ID));
            verify(invitationRepository, never()).save(any());
        }
    }

    @org.junit.jupiter.api.Test
    void primaryOwnerCanManageInvitationsCreatedByOtherMembers() {
        mockCallerRole(HouseholdRole.OWNER);
        HouseholdInvitation invitation = invitation(HouseholdRole.CO_OWNER, 99L);
        when(invitationRepository.findById(INVITATION_ID)).thenReturn(Optional.of(invitation));
        when(invitationRepository.save(any(HouseholdInvitation.class)))
                .thenAnswer(invocationCall -> invocationCall.getArgument(0));

        assertDoesNotThrow(() -> service.resendInvitation(HOUSEHOLD_ID, INVITATION_ID));
        invitation.setStatus(HouseholdInvitationStatus.PENDING);
        assertDoesNotThrow(() -> service.cancelInvitation(HOUSEHOLD_ID, INVITATION_ID));

        verify(emailService).sendInvitation(
                eq("invitee@example.com"), eq("Family"), anyString(), eq(HouseholdRole.CO_OWNER));
        verify(invitationRepository, times(2)).save(invitation);
    }

    @ParameterizedTest(name = "co-owner cannot manage another creator's invitation: {0}")
    @MethodSource("coOwnerManageableRoles")
    void coOwnerCannotResendOrCancelInvitationCreatedBySomeoneElse(HouseholdRole invitedRole) {
        mockCallerRole(HouseholdRole.CO_OWNER);
        HouseholdInvitation invitation = invitation(invitedRole, 99L);
        when(invitationRepository.findById(INVITATION_ID)).thenReturn(Optional.of(invitation));

        assertThrows(AccessDeniedException.class,
                () -> service.resendInvitation(HOUSEHOLD_ID, INVITATION_ID));
        assertThrows(AccessDeniedException.class,
                () -> service.cancelInvitation(HOUSEHOLD_ID, INVITATION_ID));
        verify(invitationRepository, never()).save(any());
        verifyNoInteractions(emailService);
    }

    static Stream<HouseholdRole> coOwnerManageableRoles() {
        return Stream.of(HouseholdRole.MEMBER, HouseholdRole.VIEWER);
    }

    private void mockCallerRole(HouseholdRole role) {
        if (role == HouseholdRole.OWNER || role == HouseholdRole.CO_OWNER) {
            HouseholdMember membership = HouseholdMember.builder().memberRole(role).active(true).build();
            when(membershipService.requireRole(HOUSEHOLD_ID, ACTOR_ID,
                    HouseholdRole.OWNER, HouseholdRole.CO_OWNER)).thenReturn(membership);
        } else {
            when(membershipService.requireRole(HOUSEHOLD_ID, ACTOR_ID,
                    HouseholdRole.OWNER, HouseholdRole.CO_OWNER))
                    .thenThrow(new AccessDeniedException("User does not have the required household role"));
        }
    }

    private HouseholdInvitation invitation(HouseholdRole invitedRole, Long creatorId) {
        User creator = User.builder().id(creatorId).email("creator@example.com").build();
        return HouseholdInvitation.builder()
                .id(INVITATION_ID)
                .household(household)
                .invitedBy(creator)
                .email("invitee@example.com")
                .memberRole(invitedRole)
                .tokenHash("existing-hash")
                .status(HouseholdInvitationStatus.PENDING)
                .createdAt(LocalDateTime.now().minusHours(1))
                .updatedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(2))
                .build();
    }
}
