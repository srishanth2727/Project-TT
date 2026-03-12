package com.library.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.library.model.Member;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    boolean existsByEmail(String email);
}
