package com.pennyvault.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SubcategoryBudgetsRequest(
    @NotNull @Positive Long categoryId,
    @NotNull @NotEmpty List<@Valid SubcategoryBudgetItemRequest> subcategories
) {}