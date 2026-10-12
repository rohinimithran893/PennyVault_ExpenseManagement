package com.pennyvault.service;

import com.pennyvault.dto.request.TransactionRequest;
import com.pennyvault.dto.response.TransactionResponse;
import com.pennyvault.dto.response.TransactionShareResponse;
import com.pennyvault.entity.*;
import com.pennyvault.repository.*;
import lombok.RequiredArgsConstructor;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
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
    private final HouseholdService householdService;
    private final HouseholdMembershipRepository membershipRepository;
    private final TransactionShareRepository shareRepository;

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request, String userEmail) {
        User user = findUser(userEmail);
        Account account = accountRepository.findById(request.getAccountId()).orElseThrow(() -> new RuntimeException("Account not found"));
        verifyAccountOwner(account, user);
        Category category = categoryRepository.findById(request.getCategoryId()).orElseThrow(() -> new RuntimeException("Category not found"));
        Subcategory subcategory = subcategoryRepository.findById(request.getSubcategoryId()).orElseThrow(() -> new RuntimeException("Subcategory not found"));
        if (!subcategory.getCategory().getId().equals(category.getId())) throw new RuntimeException("Selected subcategory does not belong to the selected category");
        validateTransactionType(request.getTransactionType());
        Transaction transaction = Transaction.builder().account(account).category(category).subcategory(subcategory)
            .description(request.getDescription()).amount(request.getAmount()).transactionType(request.getTransactionType())
            .transactionDate(request.getTransactionDate()).build();
        Transaction saved = transactionRepository.save(transaction);
        saveShares(saved, request, user);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByUser(String userEmail) {
        User user = findUser(userEmail);
        Map<Long, Transaction> visible = new LinkedHashMap<>();
        accountRepository.findByUser(user).forEach(account -> transactionRepository.findByAccount(account).forEach(t -> visible.put(t.getId(), t)));
        shareRepository.findByMember(user).forEach(share -> visible.put(share.getTransaction().getId(), share.getTransaction()));
        return visible.values().stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long transactionId, String userEmail) {
        User user = findUser(userEmail);
        Transaction transaction = transactionRepository.findById(transactionId).orElseThrow(() -> new RuntimeException("Transaction not found"));
        if (!isOwner(transaction, user) && shareRepository.findByTransaction(transaction).stream().noneMatch(s -> s.getMember().getId().equals(user.getId()))) {
            throw new RuntimeException("You do not have permission to access this transaction");
        }
        return mapToResponse(transaction);
    }

    @Transactional
    public TransactionResponse updateTransaction(Long transactionId, TransactionRequest request, String userEmail) {
        User user = findUser(userEmail);
        Transaction transaction = transactionRepository.findById(transactionId).orElseThrow(() -> new RuntimeException("Transaction not found"));
        if (!isOwner(transaction, user)) throw new RuntimeException("You do not have permission to update this transaction");
        Account account = accountRepository.findById(request.getAccountId()).orElseThrow(() -> new RuntimeException("Account not found"));
        verifyAccountOwner(account, user);
        Category category = categoryRepository.findById(request.getCategoryId()).orElseThrow(() -> new RuntimeException("Category not found"));
        Subcategory subcategory = subcategoryRepository.findById(request.getSubcategoryId()).orElseThrow(() -> new RuntimeException("Subcategory not found"));
        if (!subcategory.getCategory().getId().equals(category.getId())) throw new RuntimeException("Selected subcategory does not belong to the selected category");
        validateTransactionType(request.getTransactionType());
        transaction.setAccount(account); transaction.setCategory(category); transaction.setSubcategory(subcategory);
        transaction.setDescription(request.getDescription()); transaction.setAmount(request.getAmount());
        transaction.setTransactionType(request.getTransactionType()); transaction.setTransactionDate(request.getTransactionDate());
        Transaction saved = transactionRepository.save(transaction);
        if (request.getAssignmentMode() != null || request.getMemberIds() != null) saveShares(saved, request, user);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteTransaction(Long transactionId, String userEmail) {
        User user = findUser(userEmail);
        Transaction transaction = transactionRepository.findById(transactionId).orElseThrow(() -> new RuntimeException("Transaction not found"));
        if (!isOwner(transaction, user)) throw new RuntimeException("You are not authorized to delete this transaction");
        transactionRepository.delete(transaction);
    }

    private void saveShares(Transaction transaction, TransactionRequest request, User creator) {
        if (request.getAssignmentMode() == null && request.getMemberIds() == null) return;
        shareRepository.deleteByTransaction(transaction);
        String mode = request.getAssignmentMode() == null ? "ONE_MEMBER" : request.getAssignmentMode().toUpperCase(Locale.ROOT);
        List<Long> ids = request.getMemberIds() == null ? List.of() : request.getMemberIds().stream().filter(Objects::nonNull).distinct().toList();
        if (!mode.equals("ONE_MEMBER") && !mode.equals("SPLIT_EQUALLY")) throw new RuntimeException("Assignment mode must be ONE_MEMBER or SPLIT_EQUALLY");
        if (mode.equals("ONE_MEMBER") && ids.size() != 1) throw new RuntimeException("Select exactly one household member");
        if (ids.isEmpty()) throw new RuntimeException("Select at least one household member");
        Household household = householdService.getHouseholdForUser(creator);
        List<HouseholdMembership> memberships = membershipRepository.findByHousehold(household);
        Map<Long, User> allowed = new HashMap<>();
        memberships.forEach(m -> allowed.put(m.getUser().getId(), m.getUser()));
        if (ids.stream().anyMatch(id -> !allowed.containsKey(id))) throw new RuntimeException("Selected people must belong to your household");
        BigDecimal total = transaction.getAmount().setScale(2, RoundingMode.HALF_UP);
        BigDecimal share = mode.equals("ONE_MEMBER") ? total : total.divide(BigDecimal.valueOf(ids.size()), 2, RoundingMode.DOWN);
        BigDecimal assigned = BigDecimal.ZERO;
        for (int i = 0; i < ids.size(); i++) {
            BigDecimal amount = i == ids.size() - 1 ? total.subtract(assigned) : share;
            assigned = assigned.add(amount);
            shareRepository.save(TransactionShare.builder().transaction(transaction).household(household).member(allowed.get(ids.get(i))).shareAmount(amount).assignmentMode(mode).build());
        }
    }

    private TransactionResponse mapToResponse(Transaction t) {
        List<TransactionShare> shares = shareRepository.findByTransaction(t);
        String mode = shares.isEmpty() ? null : shares.get(0).getAssignmentMode();
        return TransactionResponse.builder().id(t.getId()).accountId(t.getAccount().getId())
            .categoryId(t.getCategory().getId()).subcategoryId(t.getSubcategory() != null ? t.getSubcategory().getId() : null)
            .account(t.getAccount().getAccountName()).category(t.getCategory().getName())
            .subcategory(t.getSubcategory() != null ? t.getSubcategory().getName() : null)
            .description(t.getDescription()).amount(t.getAmount()).transactionType(t.getTransactionType())
            .transactionDate(t.getTransactionDate()).assignmentMode(mode)
            .shares(shares.stream().map(s -> TransactionShareResponse.builder().memberId(s.getMember().getId())
                .memberName(s.getMember().getFullName()).memberEmail(s.getMember().getEmail()).shareAmount(s.getShareAmount()).build()).toList())
            .build();
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }
    private boolean isOwner(Transaction transaction, User user) {
        return transaction.getAccount().getUser().getId().equals(user.getId());
    }
    private void verifyAccountOwner(Account account, User user) {
        if (!account.getUser().getId().equals(user.getId())) throw new RuntimeException("You do not have permission to use this account");
    }
    private void validateTransactionType(String type) {
        if (!"INCOME".equalsIgnoreCase(type) && !"EXPENSE".equalsIgnoreCase(type)) throw new RuntimeException("Transaction type must be INCOME or EXPENSE");
    }
}