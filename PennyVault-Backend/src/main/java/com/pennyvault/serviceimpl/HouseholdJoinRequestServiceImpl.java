package com.pennyvault.serviceimpl;

import com.pennyvault.dto.response.HouseholdJoinRequestResponse;
import com.pennyvault.dto.response.HouseholdSearchResponse;
import com.pennyvault.entity.Household;
import com.pennyvault.entity.HouseholdJoinRequest;
import com.pennyvault.entity.HouseholdMembership;
import com.pennyvault.entity.User;
import com.pennyvault.repository.HouseholdJoinRequestRepository;
import com.pennyvault.repository.HouseholdMembershipRepository;
import com.pennyvault.repository.HouseholdRepository;
import com.pennyvault.repository.UserRepository;
import com.pennyvault.service.HouseholdJoinRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HouseholdJoinRequestServiceImpl implements HouseholdJoinRequestService {

    private static final String PENDING = "PENDING";
    private static final String APPROVED = "APPROVED";
    private static final String REJECTED = "REJECTED";

    private final HouseholdJoinRequestRepository requestRepository;
    private final HouseholdRepository householdRepository;
    private final HouseholdMembershipRepository membershipRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<HouseholdSearchResponse> searchHouseholds(String name) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Household name is required");
        }

        return householdRepository.findByNameContainingIgnoreCase(name.trim())
                .stream()
                .map(household -> new HouseholdSearchResponse(household.getId(), household.getName()))
                .toList();
    }

    @Override
    @Transactional
    public HouseholdJoinRequestResponse requestToJoin(Long householdId, String requesterEmail) {
        User requester = getUserByEmail(requesterEmail);
        Household household = getHousehold(householdId);

        if (membershipRepository.existsByHouseholdIdAndUserId(householdId, requester.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You are already a member of this household");
        }

        if (household.getOwnerUserId().equals(requester.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already own this household");
        }

        if (requestRepository.findByHouseholdIdAndRequesterUserIdAndStatus(
                householdId, requester.getId(), PENDING).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have a pending request for this household");
        }

        HouseholdJoinRequest request = HouseholdJoinRequest.builder()
                .householdId(householdId)
                .requesterUserId(requester.getId())
                .status(PENDING)
                .requestedAt(LocalDateTime.now())
                .build();

        return toResponse(requestRepository.save(request));
    }

    @Override
    @Transactional(readOnly = true)
    public List<HouseholdJoinRequestResponse> getMyRequests(String requesterEmail) {
        User requester = getUserByEmail(requesterEmail);
        return requestRepository.findByRequesterUserIdOrderByRequestedAtDesc(requester.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<HouseholdJoinRequestResponse> getPendingRequests(Long householdId, String ownerEmail) {
        Household household = getHousehold(householdId);
        User owner = getUserByEmail(ownerEmail);
        requireOwner(household, owner);

        return requestRepository.findByHouseholdIdAndStatusOrderByRequestedAtAsc(householdId, PENDING)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public HouseholdJoinRequestResponse approveRequest(Long requestId, String ownerEmail) {
        HouseholdJoinRequest request = getRequest(requestId);
        Household household = getHousehold(request.getHouseholdId());
        User owner = getUserByEmail(ownerEmail);
        requireOwner(household, owner);
        requirePending(request);

        User requester = userRepository.findById(request.getRequesterUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Requesting user not found"));

        if (!membershipRepository.existsByHouseholdIdAndUserId(household.getId(), requester.getId())) {
            membershipRepository.save(HouseholdMembership.builder()
                    .householdId(household.getId())
                    .userId(requester.getId())
                    .role("MEMBER")
                    .joinedAt(LocalDateTime.now())
                    .build());
        }

        // Do not overwrite users.household_id: it remains the legacy/default household.
        // Memberships are now represented independently, so users can join multiple households.
        request.setStatus(APPROVED);
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewedByUserId(owner.getId());
        return toResponse(requestRepository.save(request));
    }

    @Override
    @Transactional
    public HouseholdJoinRequestResponse rejectRequest(Long requestId, String ownerEmail) {
        HouseholdJoinRequest request = getRequest(requestId);
        Household household = getHousehold(request.getHouseholdId());
        User owner = getUserByEmail(ownerEmail);
        requireOwner(household, owner);
        requirePending(request);

        request.setStatus(REJECTED);
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewedByUserId(owner.getId());
        return toResponse(requestRepository.save(request));
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private Household getHousehold(Long householdId) {
        return householdRepository.findById(householdId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Household not found"));
    }

    private HouseholdJoinRequest getRequest(Long requestId) {
        return requestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Join request not found"));
    }

    private void requireOwner(Household household, User user) {
        if (!household.getOwnerUserId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the Primary Owner can review join requests");
        }
    }

    private void requirePending(HouseholdJoinRequest request) {
        if (!PENDING.equals(request.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This join request has already been reviewed");
        }
    }

    private HouseholdJoinRequestResponse toResponse(HouseholdJoinRequest request) {
        Household household = getHousehold(request.getHouseholdId());
        User requester = userRepository.findById(request.getRequesterUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Requesting user not found"));

        return new HouseholdJoinRequestResponse(
                request.getId(),
                household.getId(),
                household.getName(),
                requester.getId(),
                requester.getFullName(),
                requester.getEmail(),
                request.getStatus(),
                request.getRequestedAt(),
                request.getReviewedAt(),
                request.getReviewedByUserId());
    }
}
