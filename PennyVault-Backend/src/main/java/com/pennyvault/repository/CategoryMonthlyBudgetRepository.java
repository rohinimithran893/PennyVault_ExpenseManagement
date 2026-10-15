package com.pennyvault.repository;

import com.pennyvault.entity.CategoryMonthlyBudget;
import com.pennyvault.entity.Category;
import com.pennyvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CategoryMonthlyBudgetRepository extends JpaRepository<CategoryMonthlyBudget, Long> {
    List<CategoryMonthlyBudget> findByUserAndBudgetMonth(User user, LocalDate budgetMonth);

    Optional<CategoryMonthlyBudget> findByUserAndCategoryAndBudgetMonth(
        User user, Category category, LocalDate budgetMonth);
}