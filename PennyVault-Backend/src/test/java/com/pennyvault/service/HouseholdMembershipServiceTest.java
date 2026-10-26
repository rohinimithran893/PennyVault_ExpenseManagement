package com.pennyvault.service;

import com.pennyvault.entity.Household;
import com.pennyvault.entity.HouseholdMember;
import com.pennyvault.entity.HouseholdRole;
import com.pennyvault.entity.User;
import com.pennyvault.repository.HouseholdMemberRepository;
import com.pennyvault.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class HouseholdMembershipServiceTest {

    private HouseholdMemberRepository membershipRepository;
    private HouseholdMembershipService service;

    @BeforeEach
    void setUp() {
        membershipRepository = mock(HouseholdMemberRepository.class);
        service = new HouseholdMembershipService(membershipRepository, mock(UserRepository.class));
    }

    @Test
    void requireMembershipReturnsMembershipForHouseholdUserPair() {
        HouseholdMember membership = membership(HouseholdRole.MEMBER);
        when(membershipRepository.findByHousehold_IdAndUser_Id(10L, 20L))
                .thenReturn(Optional.of(membership));

        assertSame(membership, service.requireMembership(10L, 20L));
    }

    @Test
    void requireMembershipDeniesUsersOutsideHousehold() {
        when(membershipRepository.findByHousehold_IdAndUser_Id(10L, 20L))
                .thenReturn(Optional.empty());

        assertThrows(AccessDeniedException.class, () -> service.requireMembership(10L, 20L));
    }

    @Test
    void requireRoleDeniesMemberWhenOwnerRoleIsRequired() {
        HouseholdMember membership = membership(HouseholdRole.MEMBER);
        when(membershipRepository.findByHousehold_IdAndUser_Id(10L, 20L))
                .thenReturn(Optional.of(membership));

        assertThrows(
                AccessDeniedException.class,
                () -> service.requireRole(10L, 20L, HouseholdRole.OWNER)
        );
    }

    @Test
    void requireRoleAllowsMatchingRole() {
        HouseholdMember membership = membership(HouseholdRole.OWNER);
        when(membershipRepository.findByHousehold_IdAndUser_Id(10L, 20L))
                .thenReturn(Optional.of(membership));

        assertSame(membership, service.requirePrimaryOwner(10L, 20L));
    }

    private HouseholdMember membership(HouseholdRole role) {
        return HouseholdMember.builder()
                .id(1L)
                .household(Household.builder().id(10L).build())
                .user(User.builder().id(20L).build())
                .memberRole(role)
                .build();
    }
}
