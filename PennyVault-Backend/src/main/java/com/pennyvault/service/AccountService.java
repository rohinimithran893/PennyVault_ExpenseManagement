package com.pennyvault.service;

import com.pennyvault.dto.request.AccountRequest;
import com.pennyvault.dto.response.AccountResponse;
import com.pennyvault.entity.Account;
import com.pennyvault.entity.AccountTemplate;
import com.pennyvault.entity.User;
import com.pennyvault.repository.AccountRepository;
import com.pennyvault.repository.AccountTemplateRepository;
import com.pennyvault.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final AccountTemplateRepository accountTemplateRepository;

    public List<AccountResponse> getAccountsByUser(String userEmail) {

        // Find the logged-in user
        User user = userRepository
            .findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        System.out.println("notes");
        System.out.println(user);

        // Find accounts belonging to this user
        List<Account> accounts = accountRepository.findByUser(user);
        System.out.println("accounts" + accounts);

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

    @Transactional
    public void createDefaultAccounts(User user) {

        List<AccountTemplate> templates = accountTemplateRepository.findAllByOrderByDisplayOrderAsc();
        List<Account> accounts = templates.stream()
                                    .map(template -> Account.builder()
                                    .user(user)
                                    .accountName(template.getAccountName())
                                    .accountType(template.getAccountType())
                                    .balance(BigDecimal.ZERO)
                                    .currency("INR")
                                    .build())
                                    .toList();
        accountRepository.saveAll(accounts);
    }

}
