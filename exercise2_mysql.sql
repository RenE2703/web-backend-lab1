-- 1. Create the database
CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

-- 2. Create the users table (DDL)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create the products table (DDL)
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Insert sample data (DML - INSERT)
INSERT INTO users (full_name, email, password_hash, role) VALUES
('Nguyen Van Admin', 'admin@gmail.com', 'hashed_pwd_123', 'admin'),
('Tran Thi User', 'user@gmail.com', 'hashed_pwd_456', 'user');

INSERT INTO products (title, price, stock, category) VALUES
('Laptop Dell XPS 15', 35000000.00, 10, 'Electronics'),
('Keychron K2', 2200000.00, 25, 'Accessories'),
('Logitech MX Master 3S', 2500000.00, 15, 'Accessories');

-- Extended requirement
-- 1. Extend the Database Structure (DDL)
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 2. Data Manipulation & SQL Queries
-- Q1 (Insert sample data)
INSERT INTO orders (user_id, total_amount, status) VALUES
(1, 35000000.00, 'completed'),
(2, 4700000.00, 'pending'),
(2, 2200000.00, 'completed');

INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 35000000.00),
(2, 2, 1, 2200000.00),
(2, 3, 1, 2500000.00),
(3, 2, 1, 2200000.00);

-- Q2 (Filter & search products)
SELECT * FROM products WHERE price BETWEEN 100000 AND 1000000 ORDER BY price DESC;

-- Q3 (Table joins - JOIN)
SELECT o.id AS 'Order ID', u.full_name AS 'Customer Name', p.title AS 'Product Name', oi.quantity AS 'Quantity', oi.price AS 'Unit Price', o.status AS 'Order Status'
FROM orders o
INNER JOIN users u ON o.user_id = u.id
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id;

-- Q4 (Revenue statistics - GROUP BY & AGGREGATE)
SELECT SUM(total_amount) AS 'Total Revenue' FROM orders WHERE status = 'completed';
SELECT user_id, COUNT(*) AS 'Number of Orders' FROM orders GROUP BY user_id;
