package com.pennyvault.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class AccountResponse {

    private Long id;
    private String accountName;
    private String accountType;
    private BigDecimal balance;
    private String currency;
}