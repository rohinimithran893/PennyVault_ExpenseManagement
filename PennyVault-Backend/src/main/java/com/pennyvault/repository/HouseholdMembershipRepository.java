package com.pennyvault.repository;

import com.pennyvault.entity.HouseholdMembership;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HouseholdMembershipRepository extends JpaRepository<HouseholdMembership, Long> {

    boolean existsByHouseholdIdAndUserId(Long householdId, Long userId);

    Optional<HouseholdMembership> findByHouseholdIdAndUserId(Long householdId, Long userId);

    List<HouseholdMembership> findByUserIdOrderByJoinedAtAsc(Long userId);

    void deleteByHouseholdIdAndUserId(Long householdId, Long userId);
}
