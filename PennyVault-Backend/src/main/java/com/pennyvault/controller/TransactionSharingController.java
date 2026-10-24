package com.pennyvault.controller;

import com.pennyvault.dto.response.SharedTransactionResponse;
import com.pennyvault.service.TransactionSharingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TransactionSharingController {

    private final TransactionSharingService sharingService;

    @PostMapping("/api/transactions/{transactionId}/shares/{householdId}")
    public ResponseEntity<Void> shareTransaction(
            @PathVariable Long transactionId,
            @PathVariable Long householdId,
            Authentication authentication) {
        sharingService.shareTransaction(transactionId, householdId, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/api/transactions/{transactionId}/shares/{householdId}")
    public ResponseEntity<Void> revokeShare(
            @PathVariable Long transactionId,
            @PathVariable Long householdId,
            Authentication authentication) {
        sharingService.revokeShare(transactionId, householdId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/households/{householdId}/shared-transactions")
    public List<SharedTransactionResponse> getSharedTransactions(
            @PathVariable Long householdId,
            Authentication authentication) {
        return sharingService.getSharedTransactions(householdId, authentication.getName());
    }
}
