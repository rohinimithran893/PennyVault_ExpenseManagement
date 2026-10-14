package com.pennyvault.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MonthlyBudgetResponse(
    String month,
    BigDecimal totalLimit,
    boolean configured
) {}