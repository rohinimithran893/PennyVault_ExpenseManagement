package com.pennyvault.dto.response;

import java.math.BigDecimal;

public record SubcategoryBudgetItemResponse(
    Long subcategoryId,
    String name,
    BigDecimal budgetLimit,
    BigDecimal spent,
    boolean configured
) {}