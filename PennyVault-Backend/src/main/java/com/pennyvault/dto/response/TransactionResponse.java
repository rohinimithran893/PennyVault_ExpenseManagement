package com.pennyvault.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class TransactionResponse {

    private Long id;

    private Long accountId;

    private Long categoryId;

    private Long subcategoryId;

    private String account;

    private String category;

    private String subcategory;

    private String description;

    private BigDecimal amount;

    private String transactionType;

    private LocalDate transactionDate;

    private String assignmentMode;
    private List<TransactionShareResponse> shares;

    

   
}