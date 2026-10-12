package com.pennyvault.service;

import com.pennyvault.dto.request.AddHouseholdMemberRequest;
import com.pennyvault.dto.response.HouseholdMemberResponse;
import com.pennyvault.entity.Household;
import com.pennyvault.entity.HouseholdMembership;
import com.pennyvault.entity.User;
import com.pennyvault.repository.HouseholdMembershipRepository;
import com.pennyvault.repository.HouseholdRepository;
import com.pennyvault.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HouseholdService {
    private final HouseholdRepository householdRepository;
    private final HouseholdMembershipRepository membershipRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createHouseholdForOwner(User owner) {
        if (householdRepository.findByOwner(owner).isPresent()) return;
        Household household = householdRepository.save(Household.builder().owner(owner).createdAt(LocalDateTime.now()).build());
        membershipRepository.save(HouseholdMembership.builder().household(household).user(owner).memberRole("OWNER").joinedAt(LocalDateTime.now()).build());
    }

    private Household getHouseholdFor(User user) {
        List<HouseholdMembership> memberships = membershipRepository.findByUser(user);
        HouseholdMembership joinedHousehold = memberships.stream()
            .filter(m -> !m.getHousehold().getOwner().getId().equals(user.getId()))
            .findFirst().orElse(null);
        if (joinedHousehold != null) return joinedHousehold.getHousehold();
        return householdRepository.findByOwner(user)
            .orElseThrow(() -> new RuntimeException("Household not found for user"));
    }

    @Transactional(readOnly = true)
    public List<HouseholdMemberResponse> listMembers(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Household household = getHouseholdFor(user);
        return membershipRepository.findByHousehold(household).stream()
            .sorted(Comparator.comparing(m -> m.getUser().getId()))
            .map(m -> HouseholdMemberResponse.builder()
                .id(m.getUser().getId()).fullName(m.getUser().getFullName())
                .email(m.getUser().getEmail()).role(m.getMemberRole())
                .currentUser(m.getUser().getId().equals(user.getId())).build())
            .toList();
    }

    @Transactional
    public HouseholdMemberResponse addMember(AddHouseholdMemberRequest request, String email) {
        User owner = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Household household = householdRepository.findByOwner(owner)
            .orElseThrow(() -> new RuntimeException("Only the household owner can add members"));
        User member = userRepository.findByEmailIgnoreCase(request.getEmail().trim())
            .orElseThrow(() -> new RuntimeException("This email is not registered yet. Ask the person to create an account first."));
        if (member.getId().equals(owner.getId())) throw new RuntimeException("You are already the household owner");
        if (membershipRepository.existsByHouseholdAndUser(household, member)) throw new RuntimeException("This person is already a household member");
        membershipRepository.save(HouseholdMembership.builder().household(household).user(member).memberRole("MEMBER").joinedAt(LocalDateTime.now()).build());
        return HouseholdMemberResponse.builder().id(member.getId()).fullName(member.getFullName())
            .email(member.getEmail()).role("MEMBER").currentUser(false).build();
    }

    @Transactional(readOnly = true)
    public Household getHouseholdForUser(User user) { return getHouseholdFor(user); }
}
