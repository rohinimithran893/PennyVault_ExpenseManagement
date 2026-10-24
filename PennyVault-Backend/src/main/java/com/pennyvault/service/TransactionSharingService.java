package com.pennyvault.service;

import com.pennyvault.dto.response.TransactionResponse;

import java.util.List;

public interface TransactionSharingService {
    void shareTransaction(Long transactionId, Long householdId, String userEmail);
    void revokeShare(Long transactionId, Long householdId, String userEmail);
    List<TransactionResponse> getSharedTransactions(Long householdId, String userEmail);
}
