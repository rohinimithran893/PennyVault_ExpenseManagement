package com.pennyvault.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class SharedTransactionResponse {
    private Long id;
    private Long categoryId;
    private Long subcategoryId;
    private String category;
    private String subcategory;
    private String description;
    private BigDecimal amount;
    private String transactionType;
    private LocalDate transactionDate;
    private LocalDateTime sharedAt;
}
