package com.pennyvault.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class TransactionShareResponse {
    private Long memberId;
    private String memberName;
    private String memberEmail;
    private BigDecimal shareAmount;
}
