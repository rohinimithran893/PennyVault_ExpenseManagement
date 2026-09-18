package com.pennyvault.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class TransactionResponse {

    private Long id;

    private String description;

    private BigDecimal amount;

    private String transactionType;

    private LocalDate transactionDate;

    private String category;

    private String subcategory;

    private String account;
}