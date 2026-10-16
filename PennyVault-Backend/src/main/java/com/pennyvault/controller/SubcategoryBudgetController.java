package com.pennyvault.controller;

import com.pennyvault.dto.request.SubcategoryBudgetsRequest;
import com.pennyvault.dto.response.SubcategoryBudgetsResponse;
import com.pennyvault.service.SubcategoryBudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budgets/subcategories")
@RequiredArgsConstructor
public class SubcategoryBudgetController {
    private final SubcategoryBudgetService subcategoryBudgetService;

    @GetMapping
    public ResponseEntity<SubcategoryBudgetsResponse> getSubcategoryBudgets(
            @RequestParam String month,
            @RequestParam Long categoryId,
            Authentication authentication) {
        return ResponseEntity.ok(subcategoryBudgetService.getForMonth(
            authentication.getName(), month, categoryId));
    }

    @PutMapping
    public ResponseEntity<SubcategoryBudgetsResponse> saveSubcategoryBudgets(
            @RequestParam String month,
            @Valid @RequestBody SubcategoryBudgetsRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(subcategoryBudgetService.saveForMonth(
            authentication.getName(), month, request));
    }
}