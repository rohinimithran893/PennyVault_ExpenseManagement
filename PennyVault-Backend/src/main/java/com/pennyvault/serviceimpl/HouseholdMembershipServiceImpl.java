package com.pennyvault.serviceimpl;

import com.pennyvault.dto.response.HouseholdMembershipResponse;
import com.pennyvault.entity.Household;
import com.pennyvault.entity.HouseholdMembership;
import com.pennyvault.entity.User;
import com.pennyvault.repository.HouseholdMembershipRepository;
import com.pennyvault.repository.HouseholdRepository;
import com.pennyvault.repository.TransactionShareRepository;
import com.pennyvault.repository.UserRepository;
import com.pennyvault.service.HouseholdMembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HouseholdMembershipServiceImpl implements HouseholdMembershipService {

    private final HouseholdMembershipRepository membershipRepository;
    private final HouseholdRepository householdRepository;
    private final TransactionShareRepository shareRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<HouseholdMembershipResponse> getMyMemberships(String userEmail) {
        User user = getUser(userEmail);
        return membershipRepository.findByUserIdOrderByJoinedAtAsc(user.getId()).stream()
                .map(membership -> {
                    Household household = householdRepository.findById(membership.getHouseholdId())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Household not found"));
                    return new HouseholdMembershipResponse(
                            household.getId(), household.getName(), membership.getRole(), membership.getJoinedAt());
                })
                .toList();
    }

    @Override
    @Transactional
    public void leaveHousehold(Long householdId, String userEmail) {
        User user = getUser(userEmail);
        Household household = householdRepository.findById(householdId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Household not found"));

        HouseholdMembership membership = membershipRepository.findByHouseholdIdAndUserId(householdId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "You are not a member of this household"));

        if (household.getOwnerUserId().equals(user.getId()) || "OWNER".equals(membership.getRole())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The household owner cannot leave their household");
        }

        // Leaving revokes this user's active shares to that household.
        shareRepository.findByHouseholdIdAndSharedByUserIdAndRevokedAtIsNull(householdId, user.getId())
                .forEach(share -> share.setRevokedAt(LocalDateTime.now()));
        membershipRepository.delete(membership);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
