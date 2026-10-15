package com.pennyvault.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record CategoryBudgetRequest(
    @NotNull @Positive Long categoryId,
    @NotNull @DecimalMin(value = "0.00", inclusive = true) BigDecimal budgetLimit
) {}