package com.pennyvault.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record MonthlyBudgetRequest(
    @NotNull
    @DecimalMin(value = "0.00", inclusive = true)
    BigDecimal totalLimit
) {}