package com.pennyvault.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record SubcategoryBudgetItemRequest(
    @NotNull @Positive Long subcategoryId,
    @NotNull @DecimalMin(value = "0.00", inclusive = true) BigDecimal budgetLimit
) {}