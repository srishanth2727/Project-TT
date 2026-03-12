package com.library.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.library.model.Transaction;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByReturnDateIsNull();
}
