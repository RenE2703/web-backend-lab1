-- =====================================================================
-- LAB 1 - HOMEWORK 1: DESIGN A LIBRARY MANAGEMENT DATABASE
-- Student: Đỗ Anh Tuấn (MSSV: 25560063) - Class: BCU
-- Database: library_db
-- =====================================================================

DROP DATABASE IF EXISTS library_db;
CREATE DATABASE library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE library_db;

-- 1. Create authors table (DDL)
CREATE TABLE authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_name VARCHAR(100) NOT NULL,
    nationality VARCHAR(50) NOT NULL
);

-- 2. Create books table (DDL)
CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    author_id INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    publish_year INT NOT NULL,
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);

-- 3. Create borrow_records table (DDL)
CREATE TABLE borrow_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    borrower_name VARCHAR(100) NOT NULL,
    borrow_date DATE NOT NULL,
    return_date DATE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- 4. Insert sample records (at least 3 records per table)
INSERT INTO authors (author_name, nationality) VALUES
('Robert C. Martin', 'American'),
('Martin Fowler', 'British'),
('Kyle Simpson', 'American'),
('Nguyen Nhat Anh', 'Vietnamese');

INSERT INTO books (title, author_id, category, publish_year) VALUES
('Clean Code', 1, 'Software Engineering', 2008),
('Refactoring', 2, 'Software Engineering', 1999),
('You Don''t Know JS', 3, 'Programming', 2015),
('Clean Architecture', 1, 'Software Engineering', 2017),
('Mat Biec', 4, 'Literature', 1990);

INSERT INTO borrow_records (book_id, borrower_name, borrow_date, return_date) VALUES
(1, 'Do Anh Tuan', '2026-10-01', '2026-10-15'),
(2, 'Nguyen Van B', '2026-10-03', '2026-10-17'),
(3, 'Tran Thi C', '2026-10-05', NULL),
(4, 'Le Van D', '2026-10-07', '2026-10-21');

-- 5. Verification query: display all data from individual tables
SELECT * FROM authors;
SELECT * FROM books;
SELECT * FROM borrow_records;

-- 6. SQL JOIN query across all 3 tables
-- Displays: Book Title, Author Name, Borrower Name, and Borrow Date
SELECT 
    b.title AS 'Book Title',
    a.author_name AS 'Author Name',
    br.borrower_name AS 'Borrower Name',
    br.borrow_date AS 'Borrow Date'
FROM borrow_records br
INNER JOIN books b ON br.book_id = b.id
INNER JOIN authors a ON b.author_id = a.id
ORDER BY br.borrow_date ASC;
