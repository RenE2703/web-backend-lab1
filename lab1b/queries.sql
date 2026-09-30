-- Lab 1B, in-class Exercise 2: run these after `npm start` in lab1b/.
USE store_db;

-- Q1: In-stock items from 500,000 VND upward, highest price first.
SELECT id, item_name, price, quantity
FROM items
WHERE price >= 500000 AND quantity > 0
ORDER BY price DESC;

-- Q2: Both requested keyword searches. Node.js binds each term with `?`.
SELECT id, item_name, price, quantity
FROM items
WHERE item_name LIKE '%Gaming%'
ORDER BY item_name;

SELECT id, item_name, price, quantity
FROM items
WHERE item_name LIKE '%Wireless%'
ORDER BY item_name;

-- Q3: Totals across the complete items table.
SELECT SUM(quantity) AS total_stock,
       AVG(price) AS average_price,
       COUNT(*) AS total_items
FROM items;

-- Q4: Item count and stock value for categories above 10,000,000 VND.
SELECT c.name AS category,
       COUNT(i.id) AS total_items,
       SUM(i.price * i.quantity) AS inventory_value
FROM categories AS c
JOIN items AS i ON i.category_id = c.id
GROUP BY c.id, c.name
HAVING SUM(i.price * i.quantity) > 10000000
ORDER BY inventory_value DESC;
