package com.pennyvault.repository;

import com.pennyvault.entity.Household;
import com.pennyvault.entity.Transaction;
import com.pennyvault.entity.TransactionShare;
import com.pennyvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionShareRepository extends JpaRepository<TransactionShare, Long> {
    List<TransactionShare> findByTransaction(Transaction transaction);
    List<TransactionShare> findByMember(User member);
    List<TransactionShare> findByHousehold(Household household);
    void deleteByTransaction(Transaction transaction);
}
