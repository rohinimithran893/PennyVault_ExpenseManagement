package com.pennyvault.repository;

import com.pennyvault.entity.Account;
import com.pennyvault.entity.Transaction;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByAccount(Account account);

    List<Transaction> findByAccountInAndTransactionTypeIgnoreCaseOrderByTransactionDateDesc(
            List<Account> accounts, String transactionType);

    List<Transaction> findByTransactionDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );

    List<Transaction> findByAccountInAndTransactionDateBetweenAndTransactionTypeIgnoreCase(
            List<Account> accounts, LocalDate startDate, LocalDate endDate, String transactionType);


    @Query("""
            select a.user.id,
                   coalesce(sum(case when upper(t.transactionType) = 'EXPENSE' then t.amount else 0 end), 0),
                   count(t.id)
            from Transaction t
            join t.account a
            where a.user.id in :userIds
              and t.transactionDate between :startDate and :endDate
            group by a.user.id
            """)
    List<Object[]> findMonthlyMemberStatistics(
            @Param("userIds") List<Long> userIds,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

}