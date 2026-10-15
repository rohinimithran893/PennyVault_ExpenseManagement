package com.pennyvault.dto.response;

import java.math.BigDecimal;

public record CategoryBudgetResponse(
    Long categoryId,
    String name,
    String icon,
    String color,
    BigDecimal budgetLimit,
    BigDecimal spent,
    boolean configured
) {}