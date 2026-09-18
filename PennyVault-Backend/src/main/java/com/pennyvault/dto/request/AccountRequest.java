package com.pennyvault.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data //used for banking
public class AccountRequest {

    private String accountName;
    private String accountType;
    private BigDecimal balance;
    private String currency;
}