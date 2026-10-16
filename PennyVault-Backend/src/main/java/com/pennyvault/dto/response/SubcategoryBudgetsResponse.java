package com.pennyvault.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record SubcategoryBudgetsResponse(
    Long categoryId,
    BigDecimal parentBudgetLimit,
    BigDecimal allocatedSubcategoryTotal,
    List<SubcategoryBudgetItemResponse> subcategories
) {}