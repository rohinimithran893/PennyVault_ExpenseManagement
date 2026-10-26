package com.pennyvault.repository;

import com.pennyvault.entity.HouseholdInvitation;
import com.pennyvault.entity.HouseholdInvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HouseholdInvitationRepository extends JpaRepository<HouseholdInvitation, Long> {

    Optional<HouseholdInvitation> findByTokenHash(String tokenHash);

    List<HouseholdInvitation> findAllByHousehold_IdOrderByCreatedAtDesc(Long householdId);

    boolean existsByHousehold_IdAndEmailIgnoreCaseAndStatus(
            Long householdId, String email, HouseholdInvitationStatus status);
}
