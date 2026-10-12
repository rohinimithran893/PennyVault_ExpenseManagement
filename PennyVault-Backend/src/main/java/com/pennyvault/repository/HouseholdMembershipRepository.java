package com.pennyvault.repository;

import com.pennyvault.entity.Household;
import com.pennyvault.entity.HouseholdMembership;
import com.pennyvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface HouseholdMembershipRepository extends JpaRepository<HouseholdMembership, Long> {
    List<HouseholdMembership> findByUser(User user);
    List<HouseholdMembership> findByHousehold(Household household);
    Optional<HouseholdMembership> findByHouseholdAndUser(Household household, User user);
    boolean existsByHouseholdAndUser(Household household, User user);
}
