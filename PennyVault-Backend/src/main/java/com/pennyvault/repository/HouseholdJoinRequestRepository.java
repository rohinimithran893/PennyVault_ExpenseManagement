package com.pennyvault.repository;

import com.pennyvault.entity.HouseholdJoinRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HouseholdJoinRequestRepository extends JpaRepository<HouseholdJoinRequest, Long> {

    List<HouseholdJoinRequest> findByHouseholdIdAndStatusOrderByRequestedAtAsc(
            Long householdId, String status);

    List<HouseholdJoinRequest> findByRequesterUserIdOrderByRequestedAtDesc(Long requesterUserId);

    Optional<HouseholdJoinRequest> findByHouseholdIdAndRequesterUserIdAndStatus(
            Long householdId, Long requesterUserId, String status);
}
