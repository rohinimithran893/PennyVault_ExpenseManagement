package com.pennyvault.dto.response;

import java.math.BigDecimal;

public record HouseholdMemberStatisticsResponse(
        Long userId,
        BigDecimal spentThisMonth,
        long transactionCount
) {
}
