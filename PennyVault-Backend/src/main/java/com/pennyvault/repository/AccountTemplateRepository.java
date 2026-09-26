package com.pennyvault.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pennyvault.entity.AccountTemplate;

@Repository
public interface AccountTemplateRepository
        extends JpaRepository<AccountTemplate, Long> {

    List<AccountTemplate> findAllByOrderByDisplayOrderAsc();
}
