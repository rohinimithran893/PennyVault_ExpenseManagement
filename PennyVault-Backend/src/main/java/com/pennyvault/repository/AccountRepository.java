package com.pennyvault.repository;

import com.pennyvault.entity.Account;
import com.pennyvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AccountRepository extends JpaRepository<Account, Long> {

    List<Account> findByUser(User user);

}