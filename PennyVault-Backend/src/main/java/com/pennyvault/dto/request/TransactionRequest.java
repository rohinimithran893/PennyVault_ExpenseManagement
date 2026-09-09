package com.pennyvault.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionRequest {

    private Long accountId;
    private Long categoryId;
    private Long subcategoryId;

    private String description;
    private BigDecimal amount;
    private String transactionType;
    private LocalDate transactionDate;
}