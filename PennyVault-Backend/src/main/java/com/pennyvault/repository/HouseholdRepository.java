package com.pennyvault.repository;

import com.pennyvault.entity.Household;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HouseholdRepository extends JpaRepository<Household, Long> {

    List<Household> findByNameContainingIgnoreCase(String name);
}
