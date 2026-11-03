package com.pennyvault.service;

import com.pennyvault.dto.response.HouseholdMemberStatisticsResponse;
import com.pennyvault.entity.HouseholdMember;
import com.pennyvault.repository.HouseholdMemberRepository;
import com.pennyvault.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HouseholdMemberStatisticsService {

    private final HouseholdMembershipService membershipService;
    private final HouseholdMemberRepository householdMemberRepository;
    private final TransactionRepository transactionRepository;

    public List<HouseholdMemberStatisticsResponse> getMonthlyStatistics(Long householdId, String monthValue) {
        membershipService.requireCurrentUserMembership(householdId);
        List<HouseholdMember> members =
                householdMemberRepository.findAllByHousehold_IdOrderByJoinedAtAsc(householdId);

        if (members.isEmpty()) {
            return List.of();
        }

        YearMonth month;
        try {
            month = monthValue == null || monthValue.isBlank()
                    ? YearMonth.now()
                    : YearMonth.parse(monthValue);
        } catch (DateTimeParseException exception) {
            throw new IllegalArgumentException("Month must use YYYY-MM format");
        }

        List<Long> userIds = members.stream()
                .map(member -> member.getUser().getId())
                .toList();

        Map<Long, HouseholdMemberStatisticsResponse> statisticsByUserId = new HashMap<>();
        List<Object[]> rows = transactionRepository.findMonthlyMemberStatistics(
                userIds,
                month.atDay(1),
                month.atEndOfMonth()
        );

        for (Object[] row : rows) {
            Long userId = ((Number) row[0]).longValue();
            BigDecimal spent = row[1] instanceof BigDecimal amount ? amount : new BigDecimal(row[1].toString());
            long transactionCount = ((Number) row[2]).longValue();
            statisticsByUserId.put(
                    userId,
                    new HouseholdMemberStatisticsResponse(userId, spent, transactionCount)
            );
        }

        List<HouseholdMemberStatisticsResponse> response = new ArrayList<>();
        for (HouseholdMember member : members) {
            Long userId = member.getUser().getId();
            response.add(statisticsByUserId.getOrDefault(
                    userId,
                    new HouseholdMemberStatisticsResponse(userId, BigDecimal.ZERO, 0)
            ));
        }
        return response;
    }
}
