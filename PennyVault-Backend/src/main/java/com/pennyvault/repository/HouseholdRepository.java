package com.pennyvault.repository;

import com.pennyvault.entity.Household;
import com.pennyvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface HouseholdRepository extends JpaRepository<Household, Long> {
    Optional<Household> findByOwner(User owner);
}
