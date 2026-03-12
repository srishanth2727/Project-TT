package com.library.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.library.model.Book;
import com.library.model.Member;
import com.library.model.Transaction;
import com.library.model.Admin;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(String title, String author);
}
