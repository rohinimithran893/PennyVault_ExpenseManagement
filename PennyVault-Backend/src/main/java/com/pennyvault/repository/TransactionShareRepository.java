package com.pennyvault.repository;

import com.pennyvault.entity.TransactionShare;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionShareRepository extends JpaRepository<TransactionShare, Long> {

    Optional<TransactionShare> findByTransactionIdAndHouseholdIdAndRevokedAtIsNull(
            Long transactionId, Long householdId);

    List<TransactionShare> findByHouseholdIdAndRevokedAtIsNullOrderBySharedAtDesc(Long householdId);

    List<TransactionShare> findByHouseholdIdAndSharedByUserIdAndRevokedAtIsNull(
            Long householdId, Long sharedByUserId);
}
