package com.library.controller;

import com.library.model.Admin;
import com.library.model.Book;
import com.library.model.Member;
import com.library.model.Transaction;
import com.library.repository.AdminRepository;
import com.library.repository.BookRepository;
import com.library.repository.MemberRepository;
import com.library.repository.TransactionRepository;
import com.library.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // For Vite React frontend development
public class LibraryController {

    @Autowired
    private BookRepository bookRepository;
    @Autowired
    private MemberRepository memberRepository;
    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private AdminRepository adminRepository;
    @Autowired
    private JwtUtil jwtUtil;

    // --- INIT ---
    @GetMapping("/init")
    public ResponseEntity<?> initApp() {
        if (adminRepository.count() == 0) {
            Admin admin = new Admin();
            admin.setUsername("admin");
            admin.setPassword("admin123");
            adminRepository.save(admin);
        }
        return ResponseEntity
                .ok(Map.of("message", "App initialized. Default admin credential established if none existed"));
    }

    // --- AUTH ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");

        // No password check required as per new request
        if (username != null && !username.trim().isEmpty()) {
            String token = jwtUtil.generateToken(username);
            return ResponseEntity.ok(Map.of("success", true, "message", "Welcome " + username, "token", token));
        } else {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Username is required"));
        }
    }

    // --- STATS (DASHBOARD) ---
    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        long totalBooks = bookRepository.count();
        long totalMembers = memberRepository.count();
        long activeIssues = transactionRepository.findByReturnDateIsNull().size();

        Map<String, Long> stats = new HashMap<>();
        stats.put("totalBooks", totalBooks);
        stats.put("totalMembers", totalMembers);
        stats.put("activeIssues", activeIssues);

        return ResponseEntity.ok(stats);
    }

    // --- BOOKS ---
    @GetMapping("/books")
    public List<Book> getAllBooks(@RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) {
            return bookRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(search, search);
        }
        return bookRepository.findAll();
    }

    @PostMapping("/books")
    public Book addBook(@RequestBody Book book) {
        book.setAvailableCopies(book.getTotalCopies());
        return bookRepository.save(book);
    }

    @DeleteMapping("/books/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable Long id) {
        bookRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // --- MEMBERS ---
    @GetMapping("/members")
    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    @PostMapping("/members")
    public ResponseEntity<?> addMember(@RequestBody Member member) {
        if (memberRepository.existsByEmail(member.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
        }
        return ResponseEntity.ok(memberRepository.save(member));
    }

    // --- TRANSACTIONS ---
    @GetMapping("/transactions/issued")
    public List<Transaction> getIssuedBooks() {
        return transactionRepository.findByReturnDateIsNull();
    }

    @PostMapping("/transactions/issue")
    public ResponseEntity<?> issueBook(@RequestBody Map<String, Long> payload) {
        Long bookId = payload.get("bookId");
        Long memberId = payload.get("memberId");

        Optional<Book> bookOpt = bookRepository.findById(bookId);
        Optional<Member> memberOpt = memberRepository.findById(memberId);

        if (bookOpt.isEmpty() || memberOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid Book or Member ID"));
        }

        Book book = bookOpt.get();
        if (book.getAvailableCopies() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Book is out of stock"));
        }

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        Transaction trans = new Transaction();
        trans.setBook(book);
        trans.setMember(memberOpt.get());
        trans.setIssueDate(LocalDate.now());
        trans.setDueDate(LocalDate.now().plusDays(14));
        return ResponseEntity.ok(transactionRepository.save(trans));
    }

    @PostMapping("/transactions/return/{id}")
    public ResponseEntity<?> returnBook(@PathVariable Long id) {
        Optional<Transaction> tOpt = transactionRepository.findById(id);
        if (tOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Transaction not found"));
        }

        Transaction t = tOpt.get();
        if (t.getReturnDate() != null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Book already returned"));
        }

        t.setReturnDate(LocalDate.now());

        // Calculate fine (Rs 5 per day late)
        if (t.getReturnDate().isAfter(t.getDueDate())) {
            long daysLate = ChronoUnit.DAYS.between(t.getDueDate(), t.getReturnDate());
            t.setFine((double) (daysLate * 5));
        }

        Book book = t.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        return ResponseEntity.ok(transactionRepository.save(t));
    }
}
