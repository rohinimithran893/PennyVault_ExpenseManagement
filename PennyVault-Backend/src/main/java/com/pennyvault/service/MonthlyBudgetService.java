package com.pennyvault.service;

import com.pennyvault.dto.request.MonthlyBudgetRequest;
import com.pennyvault.dto.response.MonthlyBudgetResponse;
import com.pennyvault.entity.MonthlyBudget;
import com.pennyvault.entity.User;
import com.pennyvault.repository.MonthlyBudgetRepository;
import com.pennyvault.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;

@Service
@RequiredArgsConstructor
public class MonthlyBudgetService {
    private final MonthlyBudgetRepository monthlyBudgetRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public MonthlyBudgetResponse getForMonth(String userEmail, String monthValue) {
        User user = findUser(userEmail);
        LocalDate month = parseMonth(monthValue);
        return monthlyBudgetRepository.findByUserAndBudgetMonth(user, month)
            .map(budget -> new MonthlyBudgetResponse(monthValue, budget.getTotalLimit(), true))
            .orElseGet(() -> new MonthlyBudgetResponse(monthValue, java.math.BigDecimal.ZERO, false));
    }

    @Transactional
    public MonthlyBudgetResponse saveForMonth(String userEmail, String monthValue, MonthlyBudgetRequest request) {
        User user = findUser(userEmail);
        LocalDate month = parseMonth(monthValue);
        MonthlyBudget budget = monthlyBudgetRepository.findByUserAndBudgetMonth(user, month)
            .orElseGet(() -> MonthlyBudget.builder()
                .user(user)
                .budgetMonth(month)
                .build());
        budget.setTotalLimit(request.totalLimit());
        MonthlyBudget saved = monthlyBudgetRepository.save(budget);
        return new MonthlyBudgetResponse(monthValue, saved.getTotalLimit(), true);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private LocalDate parseMonth(String value) {
        try {
            return YearMonth.parse(value).atDay(1);
        } catch (DateTimeParseException | NullPointerException exception) {
            throw new IllegalArgumentException("Month must use YYYY-MM format");
        }
    }
}