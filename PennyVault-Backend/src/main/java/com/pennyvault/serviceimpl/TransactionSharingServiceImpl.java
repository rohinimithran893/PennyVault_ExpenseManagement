package com.pennyvault.serviceimpl;

import com.pennyvault.dto.response.SharedTransactionResponse;
import com.pennyvault.entity.*;
import com.pennyvault.repository.*;
import com.pennyvault.service.TransactionSharingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionSharingServiceImpl implements TransactionSharingService {

    private final TransactionRepository transactionRepository;
    private final TransactionShareRepository shareRepository;
    private final HouseholdMembershipRepository membershipRepository;
    private final HouseholdRepository householdRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void shareTransaction(Long transactionId, Long householdId, String userEmail) {
        User user = getUser(userEmail);
        Household household = getHousehold(householdId);
        requireMember(householdId, user.getId());

        Transaction transaction = getTransaction(transactionId);
        if (transaction.getAccount() == null || transaction.getAccount().getUser() == null
                || !transaction.getAccount().getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the transaction owner can share it");
        }

        if (shareRepository.findByTransactionIdAndHouseholdIdAndRevokedAtIsNull(transactionId, householdId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This transaction is already shared with the household");
        }

        shareRepository.save(TransactionShare.builder()
                .transactionId(transactionId)
                .householdId(household.getId())
                .sharedByUserId(user.getId())
                .sharedAt(LocalDateTime.now())
                .build());
    }

    @Override
    @Transactional
    public void revokeShare(Long transactionId, Long householdId, String userEmail) {
        User user = getUser(userEmail);
        Transaction transaction = getTransaction(transactionId);
        if (transaction.getAccount() == null || transaction.getAccount().getUser() == null
                || !transaction.getAccount().getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the transaction owner can revoke sharing");
        }

        TransactionShare share = shareRepository
                .findByTransactionIdAndHouseholdIdAndRevokedAtIsNull(transactionId, householdId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Active transaction share not found"));
        share.setRevokedAt(LocalDateTime.now());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SharedTransactionResponse> getSharedTransactions(Long householdId, String userEmail) {
        User user = getUser(userEmail);
        getHousehold(householdId);
        requireMember(householdId, user.getId());

        return shareRepository.findByHouseholdIdAndRevokedAtIsNullOrderBySharedAtDesc(householdId).stream()
                .map(share -> transactionRepository.findById(share.getTransactionId())
                        .map(transaction -> toResponse(transaction, share.getSharedAt()))
                        .orElse(null))
                .filter(response -> response != null)
                .toList();
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private Household getHousehold(Long id) {
        return householdRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Household not found"));
    }

    private Transaction getTransaction(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
    }

    private void requireMember(Long householdId, Long userId) {
        if (!membershipRepository.existsByHouseholdIdAndUserId(householdId, userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You must be a household member to access its shared transactions");
        }
    }

    private SharedTransactionResponse toResponse(Transaction transaction, LocalDateTime sharedAt) {
        return SharedTransactionResponse.builder()
                .id(transaction.getId())
                .categoryId(transaction.getCategory().getId())
                .subcategoryId(transaction.getSubcategory() != null ? transaction.getSubcategory().getId() : null)
                .category(transaction.getCategory().getName())
                .subcategory(transaction.getSubcategory() != null ? transaction.getSubcategory().getName() : null)
                .description(transaction.getDescription())
                .amount(transaction.getAmount())
                .transactionType(transaction.getTransactionType())
                .transactionDate(transaction.getTransactionDate())
                .sharedAt(sharedAt)
                .build();
    }
}
