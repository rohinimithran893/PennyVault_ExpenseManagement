package com.pennyvault.service;

import com.pennyvault.dto.request.CategoryBudgetRequest;
import com.pennyvault.dto.response.CategoryBudgetResponse;
import com.pennyvault.entity.*;
import com.pennyvault.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryBudgetService {
    private final CategoryMonthlyBudgetRepository categoryBudgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CategoryBudgetResponse> getForMonth(String userEmail, String monthValue) {
        User user = findUser(userEmail);
        LocalDate month = parseMonth(monthValue);
        LocalDate monthEnd = YearMonth.from(month).atEndOfMonth();

        Map<Long, CategoryMonthlyBudget> budgets = categoryBudgetRepository
            .findByUserAndBudgetMonth(user, month).stream()
            .collect(Collectors.toMap(b -> b.getCategory().getId(), Function.identity()));

        List<Account> accounts = accountRepository.findByUser(user);
        Map<Long, BigDecimal> spentByCategory = new HashMap<>();
        if (!accounts.isEmpty()) {
            transactionRepository
                .findByAccountInAndTransactionDateBetweenAndTransactionTypeIgnoreCase(
                    accounts, month, monthEnd, "EXPENSE")
                .forEach(transaction -> {
                    if (transaction.getCategory() != null) {
                        Long categoryId = transaction.getCategory().getId();
                        spentByCategory.merge(categoryId, transaction.getAmount(), BigDecimal::add);
                    }
                });
        }

        return categoryRepository.findAll().stream()
            .map(category -> {
                CategoryMonthlyBudget budget = budgets.get(category.getId());
                return new CategoryBudgetResponse(
                    category.getId(),
                    category.getName(),
                    category.getIcon(),
                    category.getColor(),
                    budget == null ? BigDecimal.ZERO : budget.getBudgetLimit(),
                    spentByCategory.getOrDefault(category.getId(), BigDecimal.ZERO),
                    budget != null
                );
            })
            .toList();
    }

    @Transactional
    public CategoryBudgetResponse saveForMonth(String userEmail, String monthValue,
                                               CategoryBudgetRequest request) {
        User user = findUser(userEmail);
        LocalDate month = parseMonth(monthValue);
        Category category = categoryRepository.findById(request.categoryId())
            .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        CategoryMonthlyBudget budget = categoryBudgetRepository
            .findByUserAndCategoryAndBudgetMonth(user, category, month)
            .orElseGet(() -> CategoryMonthlyBudget.builder()
                .user(user)
                .category(category)
                .budgetMonth(month)
                .build());
        budget.setBudgetLimit(request.budgetLimit());
        categoryBudgetRepository.save(budget);

        BigDecimal spent = BigDecimal.ZERO;
        List<Account> accounts = accountRepository.findByUser(user);
        if (!accounts.isEmpty()) {
            spent = transactionRepository
                .findByAccountInAndTransactionDateBetweenAndTransactionTypeIgnoreCase(
                    accounts, month, YearMonth.from(month).atEndOfMonth(), "EXPENSE")
                .stream()
                .filter(transaction -> transaction.getCategory() != null
                    && transaction.getCategory().getId().equals(category.getId()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        return new CategoryBudgetResponse(category.getId(), category.getName(), category.getIcon(),
            category.getColor(), budget.getBudgetLimit(), spent, true);
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