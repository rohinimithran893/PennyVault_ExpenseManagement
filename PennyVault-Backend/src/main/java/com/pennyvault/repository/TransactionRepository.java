package com.pennyvault.repository;

import com.pennyvault.entity.Account;
import com.pennyvault.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByAccount(Account account);

    List<Transaction> findByTransactionDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );

}