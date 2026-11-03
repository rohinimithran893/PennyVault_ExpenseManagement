package com.pennyvault.repository;

import com.pennyvault.entity.HouseholdMember;
import com.pennyvault.entity.HouseholdRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HouseholdMemberRepository extends JpaRepository<HouseholdMember, Long> {

    Optional<HouseholdMember> findByHousehold_IdAndUser_Id(Long householdId, Long userId);

    List<HouseholdMember> findAllByHousehold_IdOrderByJoinedAtAsc(Long householdId);

    List<HouseholdMember> findAllByUser_Id(Long userId);

    boolean existsByHousehold_IdAndUser_Id(Long householdId, Long userId);

    boolean existsByHousehold_IdAndUser_IdAndActiveTrue(Long householdId, Long userId);

    boolean existsByHousehold_IdAndUser_IdAndMemberRole(
            Long householdId,
            Long userId,
            HouseholdRole memberRole
    );
}
