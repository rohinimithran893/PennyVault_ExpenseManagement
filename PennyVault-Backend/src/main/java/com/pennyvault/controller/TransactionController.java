package com.pennyvault.controller;

import com.pennyvault.dto.request.TransactionRequest;
import com.pennyvault.dto.response.TransactionResponse;
import com.pennyvault.service.TransactionService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(@RequestBody TransactionRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        TransactionResponse response = transactionService.createTransaction(request, userEmail);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getTransactions(Authentication authentication) {

        String userEmail = authentication.getName();
        List<TransactionResponse> transactions =
                transactionService.getTransactionsByUser(
                        userEmail
                );

        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransactionById(@PathVariable Long id,
            Authentication authentication) {

        String userEmail = authentication.getName();
        TransactionResponse transaction =
                transactionService.getTransactionById(
                        id,
                        userEmail
                );

        return ResponseEntity.ok(transaction);
    }
}