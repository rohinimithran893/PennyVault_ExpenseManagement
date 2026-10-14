package com.pennyvault.controller;

import com.pennyvault.dto.request.MonthlyBudgetRequest;
import com.pennyvault.dto.response.MonthlyBudgetResponse;
import com.pennyvault.service.MonthlyBudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class MonthlyBudgetController {
    private final MonthlyBudgetService monthlyBudgetService;

    @GetMapping
    public ResponseEntity<MonthlyBudgetResponse> getBudget(
            @RequestParam String month, Authentication authentication) {
        return ResponseEntity.ok(monthlyBudgetService.getForMonth(authentication.getName(), month));
    }

    @PutMapping
    public ResponseEntity<MonthlyBudgetResponse> saveBudget(
            @RequestParam String month,
            @Valid @RequestBody MonthlyBudgetRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(monthlyBudgetService.saveForMonth(authentication.getName(), month, request));
    }
}