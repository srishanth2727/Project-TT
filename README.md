# Library Management System

## 1. Project Overview
The **Library Management System** is a software application designed to manage the core functions of a library. The primary purpose of this system is to handle book inventory, manage members, process book issuing and returning, and calculate fines for late submissions.

### Real-world Use Cases:
- **Schools and Colleges**: To manage books provided to students and track their return dates.
- **Public Libraries**: Handling thousands of books, managing members' subscriptions, and logging issues/returns.
- **Corporate Libraries**: Helping employees borrow domain-specific technical books.

## 2. Features & Functional Requirements
- **Admin Login & Authentication:** Secured through **JWT (JSON Web Tokens)** logic.
- **Visual Dashboard:** Embedded React Recharts for visualization of current metrics (stats, books, issues).
- **Book Management:** Add new books, view books.
- **Member Management:** Register new students or members and list members.
- **Issue and Return Books:** Easy transaction flow to issue a book to a member and record its return.
- **Fine Calculation:** Automatically calculates late fees based on the overdue period.
- **Availability Status:** Real-time checking of how many copies of a book are currently available.

## 3. Technology Stack
- **Backend Framework:** Java Spring Boot 3
- **Database:** PostgreSQL (Relational Database)
- **Frontend Framework:** React (managed by Vite) with HTML, CSS, JavaScript, and Recharts.
- **Orchestration:** Docker & Docker Compose

## 4. System Design

### Automatic Data Setup
- Upon hitting the `/api/init` endpoint or the homepage loading successfully, the system establishes a default admin account of `username: admin` and `password: admin123`.

## 5. Setup & Execution Steps (DOCKER)

The absolute easiest way to run this application is through **Docker**.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Step-by-Step Execution
1. Open a terminal to the root directory `LibraryManagementSystem`.
2. Run the command:
   ```bash
   docker-compose up --build
   ```
3. Docker will automatically pull Postgres, start the database, download Maven dependencies, compile the Java Backend, build the React UI, and host it via Nginx.
4. **Access the Application**:
   - The React UI Dashboard will be exposed at: `http://localhost:5173`
   - The Spring Boot Backend API will be mapped to: `http://localhost:8080/api`
   - The PostgreSQL instance is available on: `localhost:5432`

## 6. Manual Execution Steps (Without Docker)

### Prerequisites
- Java 17+, Node.js, and PostgreSQL running locally.
- Make sure to create a db in postgres named `library_db` with `postgres/postgres` credentials.

**1. Backend Setup**
1. Navigate to the `backend` directory.
2. Run `mvn spring-boot:run` or hit Run securely inside your IDE.

**2. Frontend Setup**
1. Navigate to the `frontend` directory.
2. Run `npm install` to install all dependencies (including recharts).
3. Run `npm run dev` to start Vite.

## 7. Conclusion & Future Enhancements
### Summary
This project acts as an impeccable full-stack (Spring Boot + React + PostgreSQL + Docker + JWT) demonstration, containing real enterprise features packaged together in an easily reproducible orchestration layout.

## Architecture Diagram
The following image shows the high-level architecture for this project (UI, backend layers, database design, and flow):

![Architecture Diagram](frontend/public/assets/architecture_diagram.svg)
