package com.pennyvault.service;

import com.pennyvault.dto.request.TransactionRequest;
import com.pennyvault.dto.response.TransactionResponse;
import com.pennyvault.entity.Account;
import com.pennyvault.entity.Category;
import com.pennyvault.entity.Subcategory;
import com.pennyvault.entity.Transaction;
import com.pennyvault.entity.User;
import com.pennyvault.repository.AccountRepository;
import com.pennyvault.repository.CategoryRepository;
import com.pennyvault.repository.SubcategoryRepository;
import com.pennyvault.repository.TransactionRepository;
import com.pennyvault.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TransactionService {

private final TransactionRepository transactionRepository;
private final AccountRepository accountRepository;
private final CategoryRepository categoryRepository;
private final SubcategoryRepository subcategoryRepository;
private final UserRepository userRepository;


    public TransactionResponse createTransaction(TransactionRequest request, String userEmail) {

        // Step 1: Find logged-in user
        User user = userRepository
            .findByEmail(userEmail)
            .orElseThrow(() ->
                    new RuntimeException("User not found")
            );


        // Step 2: Find account
        Account account = accountRepository
            .findById(request.getAccountId())
            .orElseThrow(() ->
                    new RuntimeException("Account not found")
            );

        // Step 3: Verify account belongs to logged-in user
        if (!account.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                "You do not have permission to use this account"
            );
        }

        // Step 4: Find category
        Category category = categoryRepository
            .findById(request.getCategoryId())
            .orElseThrow(() ->
                    new RuntimeException("Category not found")
            );

        // Step 5: Find subcategory
        Subcategory subcategory = subcategoryRepository
            .findById(request.getSubcategoryId())
            .orElseThrow(() ->
                    new RuntimeException("Subcategory not found")
            );

        // Step 6: Verify subcategory belongs to category
        if (!subcategory
            .getCategory()
            .getId()
            .equals(category.getId())) {

            throw new RuntimeException(
                "Selected subcategory does not belong to the selected category"
            );
        }

        // Step 7: Validate transaction type
        validateTransactionType(request.getTransactionType());

        // Step 8: Create transaction
        Transaction transaction = Transaction.builder()
            .account(account)
            .category(category)
            .subcategory(subcategory)
            .description(request.getDescription())
            .amount(request.getAmount())
            .transactionType(request.getTransactionType())
            .transactionDate(request.getTransactionDate())
            .build();

        // Step 9: Save transaction
        Transaction savedTransaction = transactionRepository.save(transaction);

        // Step 10: Convert to response DTO
        return mapToResponse(savedTransaction);
    }

    private void validateTransactionType(String transactionType) {
        if (!"INCOME".equalsIgnoreCase(transactionType) && !"EXPENSE".equalsIgnoreCase(transactionType)) {
            throw new RuntimeException("Transaction type must be INCOME or EXPENSE");
        }
    }

    private TransactionResponse mapToResponse( Transaction transaction) {
        return TransactionResponse.builder()
            .id(transaction.getId())
            .accountId(transaction.getAccount().getId())
            .categoryId(transaction.getCategory().getId())
            .subcategoryId(transaction.getSubcategory() != null ? transaction.getSubcategory().getId() : null)
            .account(transaction.getAccount().getAccountName())
            .category(transaction.getCategory().getName())
            .subcategory(transaction.getSubcategory() != null
                            ? transaction.getSubcategory().getName() : null )
            .description(transaction.getDescription())
            .amount(transaction.getAmount())
            .transactionType(transaction.getTransactionType())
            .transactionDate(transaction.getTransactionDate())
            .build();
    }

    public List<TransactionResponse> getTransactionsByUser(String userEmail) {

        User user = userRepository
            .findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<Account> accounts = accountRepository.findByUser(user);

        return accounts.stream()
            .flatMap(account -> transactionRepository.findByAccount(account).stream())
            .map(this::mapToResponse)
            .toList();
    }

    public TransactionResponse getTransactionById(Long transactionId, String userEmail) {

        User user = userRepository
            .findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction transaction = transactionRepository
            .findById(transactionId)
            .orElseThrow(() ->
                    new RuntimeException("Transaction not found")
            );

        if (!transaction
            .getAccount()
            .getUser()
            .getId()
            .equals(user.getId())) {

        throw new RuntimeException("You do not have permission to access this transaction");
    }
    return mapToResponse(transaction);
    }

    public TransactionResponse updateTransaction(Long transactionId, TransactionRequest request, String userEmail) {

        // Step 1: Find logged-in user
        User user = userRepository
                .findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Step 2: Find transaction
        Transaction transaction = transactionRepository
                .findById(transactionId)
                .orElseThrow(() ->
                        new RuntimeException("Transaction not found"));

        // Step 3: Verify transaction belongs to logged-in user
        if (!transaction.getAccount().getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "You do not have permission to update this transaction");
        }

        // Step 4: Find account
        Account account = accountRepository
                .findById(request.getAccountId())
                .orElseThrow(() ->
                        new RuntimeException("Account not found"));

        // Step 5: Verify account belongs to logged-in user
        if (!account.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "You do not have permission to use this account");
        }

        // Step 6: Find category
        Category category = categoryRepository
                .findById(request.getCategoryId())
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));

        // Step 7: Find subcategory
        Subcategory subcategory = subcategoryRepository
                .findById(request.getSubcategoryId())
                .orElseThrow(() ->
                        new RuntimeException("Subcategory not found"));

        // Step 8: Verify subcategory belongs to category
        if (!subcategory.getCategory().getId().equals(category.getId())) {
            throw new RuntimeException(
                    "Selected subcategory does not belong to the selected category");
        }

        // Step 9: Validate transaction type
        validateTransactionType(request.getTransactionType());

        // Step 10: Update transaction
        transaction.setAccount(account);
        transaction.setCategory(category);
        transaction.setSubcategory(subcategory);
        transaction.setDescription(request.getDescription());
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType(request.getTransactionType());
        transaction.setTransactionDate(request.getTransactionDate());

        // Step 11: Save updated transaction
        Transaction updatedTransaction = transactionRepository.save(transaction);

        // Step 12: Convert to response DTO
        return mapToResponse(updatedTransaction);
    }

    @Transactional
    public void deleteTransaction(Long transactionId, String userEmail) {
        Transaction transaction = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
        if (!transaction.getAccount().getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("You are not authorized to delete this transaction");
        }
        transactionRepository.delete(transaction);
    }

}
