package com.pennyvault.controller;

import com.pennyvault.dto.request.CategoryBudgetRequest;
import com.pennyvault.dto.response.CategoryBudgetResponse;
import com.pennyvault.service.CategoryBudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets/categories")
@RequiredArgsConstructor
public class CategoryBudgetController {
    private final CategoryBudgetService categoryBudgetService;

    @GetMapping
    public ResponseEntity<List<CategoryBudgetResponse>> getCategoryBudgets(
            @RequestParam String month, Authentication authentication) {
        return ResponseEntity.ok(
            categoryBudgetService.getForMonth(authentication.getName(), month));
    }

    @PutMapping
    public ResponseEntity<CategoryBudgetResponse> saveCategoryBudget(
            @RequestParam String month,
            @Valid @RequestBody CategoryBudgetRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
            categoryBudgetService.saveForMonth(authentication.getName(), month, request));
    }
}