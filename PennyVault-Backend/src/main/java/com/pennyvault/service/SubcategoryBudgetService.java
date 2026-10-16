package com.pennyvault.service;

import com.pennyvault.dto.request.SubcategoryBudgetsRequest;
import com.pennyvault.dto.response.SubcategoryBudgetItemResponse;
import com.pennyvault.dto.response.SubcategoryBudgetsResponse;
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
public class SubcategoryBudgetService {
    private final SubcategoryMonthlyBudgetRepository subcategoryBudgetRepository;
    private final CategoryMonthlyBudgetRepository categoryBudgetRepository;
    private final CategoryRepository categoryRepository;
    private final SubcategoryRepository subcategoryRepository;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public SubcategoryBudgetsResponse getForMonth(String userEmail, String monthValue, Long categoryId) {
        User user = findUser(userEmail);
        LocalDate month = parseMonth(monthValue);
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        CategoryMonthlyBudget parentBudget = categoryBudgetRepository
            .findByUserAndCategoryAndBudgetMonth(user, category, month).orElse(null);
        BigDecimal parentLimit = parentBudget == null ? BigDecimal.ZERO : parentBudget.getBudgetLimit();

        Map<Long, SubcategoryMonthlyBudget> savedBudgets = subcategoryBudgetRepository
            .findByUserAndBudgetMonth(user, month).stream()
            .filter(budget -> budget.getSubcategory().getCategory().getId().equals(categoryId))
            .collect(Collectors.toMap(budget -> budget.getSubcategory().getId(), Function.identity()));

        Map<Long, BigDecimal> spentBySubcategory = new HashMap<>();
        List<Account> accounts = accountRepository.findByUser(user);
        if (!accounts.isEmpty()) {
            transactionRepository.findByAccountInAndTransactionDateBetweenAndTransactionTypeIgnoreCase(
                accounts, month, YearMonth.from(month).atEndOfMonth(), "EXPENSE")
                .forEach(transaction -> {
                    if (transaction.getCategory() != null
                        && transaction.getCategory().getId().equals(categoryId)
                        && transaction.getSubcategory() != null) {
                        spentBySubcategory.merge(transaction.getSubcategory().getId(),
                            transaction.getAmount(), BigDecimal::add);
                    }
                });
        }

        List<SubcategoryBudgetItemResponse> items = subcategoryRepository.findByCategory(category).stream()
            .map(subcategory -> {
                SubcategoryMonthlyBudget budget = savedBudgets.get(subcategory.getId());
                return new SubcategoryBudgetItemResponse(
                    subcategory.getId(),
                    subcategory.getName(),
                    budget == null ? BigDecimal.ZERO : budget.getBudgetLimit(),
                    spentBySubcategory.getOrDefault(subcategory.getId(), BigDecimal.ZERO),
                    budget != null
                );
            })
            .toList();

        BigDecimal allocated = items.stream().filter(SubcategoryBudgetItemResponse::configured)
            .map(SubcategoryBudgetItemResponse::budgetLimit)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new SubcategoryBudgetsResponse(category.getId(), parentLimit, allocated, items);
    }

    @Transactional
    public SubcategoryBudgetsResponse saveForMonth(String userEmail, String monthValue,
                                                   SubcategoryBudgetsRequest request) {
        User user = findUser(userEmail);
        LocalDate month = parseMonth(monthValue);
        Category category = categoryRepository.findById(request.categoryId())
            .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        CategoryMonthlyBudget parentBudget = categoryBudgetRepository
            .findByUserAndCategoryAndBudgetMonth(user, category, month)
            .orElseThrow(() -> new IllegalArgumentException(
                "Set the parent category budget before configuring subcategory budgets."));

        List<Subcategory> allSubcategories = subcategoryRepository.findByCategory(category);
        Map<Long, Subcategory> byId = allSubcategories.stream()
            .collect(Collectors.toMap(Subcategory::getId, Function.identity()));
        Set<Long> submittedIds = request.subcategories().stream()
            .map(item -> item.subcategoryId())
            .collect(Collectors.toSet());
        if (submittedIds.size() != request.subcategories().size()
            || !submittedIds.equals(byId.keySet())) {
            throw new IllegalArgumentException(
                "Submit a budget limit for every existing subcategory exactly once.");
        }

        // Subcategory limits are independent spending caps. Their sum may be
        // lower than or higher than the parent category budget; the parent
        // budget is never changed automatically.
        for (var item : request.subcategories()) {
            Subcategory subcategory = byId.get(item.subcategoryId());
            SubcategoryMonthlyBudget budget = subcategoryBudgetRepository
                .findByUserAndSubcategoryAndBudgetMonth(user, subcategory, month)
                .orElseGet(() -> SubcategoryMonthlyBudget.builder()
                    .user(user)
                    .subcategory(subcategory)
                    .budgetMonth(month)
                    .build());
            budget.setBudgetLimit(item.budgetLimit());
            subcategoryBudgetRepository.save(budget);
        }

        return getForMonth(userEmail, monthValue, category.getId());
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