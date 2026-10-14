package com.pennyvault.repository;

import com.pennyvault.entity.MonthlyBudget;
import com.pennyvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface MonthlyBudgetRepository extends JpaRepository<MonthlyBudget, Long> {
    Optional<MonthlyBudget> findByUserAndBudgetMonth(User user, LocalDate budgetMonth);
}