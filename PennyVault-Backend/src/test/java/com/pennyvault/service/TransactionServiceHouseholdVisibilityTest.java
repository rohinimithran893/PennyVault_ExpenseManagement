package com.pennyvault.service;

import com.pennyvault.entity.Household;
import com.pennyvault.entity.HouseholdMember;
import com.pennyvault.entity.HouseholdRole;
import com.pennyvault.entity.User;
import com.pennyvault.repository.AccountRepository;
import com.pennyvault.repository.CategoryRepository;
import com.pennyvault.repository.HouseholdMemberRepository;
import com.pennyvault.repository.SubcategoryRepository;
import com.pennyvault.repository.TransactionRepository;
import com.pennyvault.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TransactionServiceHouseholdVisibilityTest {

    private HouseholdMemberRepository householdMemberRepository;
    private TransactionService service;

    @BeforeEach
    void setUp() {
        householdMemberRepository = mock(HouseholdMemberRepository.class);
        service = new TransactionService(
                mock(TransactionRepository.class),
                mock(AccountRepository.class),
                mock(CategoryRepository.class),
                mock(SubcategoryRepository.class),
                mock(UserRepository.class),
                householdMemberRepository
        );
    }

    @Test
    void invitedUserSeesMembersOfJoinedHouseholdEvenWhenUserHouseholdPointsElsewhere() {
        User invitedUser = User.builder()
                .id(20L)
                .household(Household.builder().id(99L).build())
                .build();
        User owner = User.builder().id(10L).build();
        Household joinedHousehold = Household.builder().id(10L).build();

        HouseholdMember invitedMembership = HouseholdMember.builder()
                .household(joinedHousehold)
                .user(invitedUser)
                .memberRole(HouseholdRole.MEMBER)
                .active(true)
                .build();
        HouseholdMember ownerMembership = HouseholdMember.builder()
                .household(joinedHousehold)
                .user(owner)
                .memberRole(HouseholdRole.OWNER)
                .active(true)
                .build();

        when(householdMemberRepository.findAllByUser_Id(20L))
                .thenReturn(List.of(invitedMembership));
        when(householdMemberRepository.findAllByHousehold_IdAndActiveTrue(10L))
                .thenReturn(List.of(ownerMembership, invitedMembership));

        List<User> visibleUsers = service.getVisibleHouseholdUsers(invitedUser);

        assertEquals(List.of(20L, 10L), visibleUsers.stream().map(User::getId).toList());
    }

    @Test
    void inactiveMembershipDoesNotGrantAccessToThatHousehold() {
        User user = User.builder().id(20L).build();
        HouseholdMember inactiveMembership = HouseholdMember.builder()
                .household(Household.builder().id(10L).build())
                .user(user)
                .memberRole(HouseholdRole.MEMBER)
                .active(false)
                .build();

        when(householdMemberRepository.findAllByUser_Id(20L))
                .thenReturn(List.of(inactiveMembership));

        List<User> visibleUsers = service.getVisibleHouseholdUsers(user);

        assertEquals(List.of(20L), visibleUsers.stream().map(User::getId).toList());
    }
}
