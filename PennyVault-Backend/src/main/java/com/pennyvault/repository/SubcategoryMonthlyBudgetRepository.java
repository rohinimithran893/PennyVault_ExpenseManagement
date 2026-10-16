package com.pennyvault.repository;

import com.pennyvault.entity.Subcategory;
import com.pennyvault.entity.SubcategoryMonthlyBudget;
import com.pennyvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SubcategoryMonthlyBudgetRepository extends JpaRepository<SubcategoryMonthlyBudget, Long> {
    List<SubcategoryMonthlyBudget> findByUserAndBudgetMonth(User user, LocalDate budgetMonth);

    Optional<SubcategoryMonthlyBudget> findByUserAndSubcategoryAndBudgetMonth(
        User user, Subcategory subcategory, LocalDate budgetMonth);
}