package com.library.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.library.model.Admin;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByUsernameAndPassword(String username, String password);
}
