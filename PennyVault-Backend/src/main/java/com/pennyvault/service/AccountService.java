package com.pennyvault.service;

import com.pennyvault.dto.request.AccountRequest;
import com.pennyvault.dto.response.AccountResponse;
import com.pennyvault.entity.Account;
import com.pennyvault.entity.User;
import com.pennyvault.repository.AccountRepository;
import com.pennyvault.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public List<AccountResponse> getAccountsByUser(String userEmail) {

        // Find the logged-in user
        User user = userRepository
            .findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Find accounts belonging to this user
        List<Account> accounts = accountRepository.findByUser(user);

        // Convert Account entities to AccountResponse DTOs
        return accounts.stream().map(this::mapToResponse).toList();
    }

    private AccountResponse mapToResponse(Account account) {
        return AccountResponse.builder()
            .id(account.getId())
            .accountName(account.getAccountName())
            .accountType(account.getAccountType())
            .balance(account.getBalance())
            .currency(account.getCurrency())
            .build();
    }

}
