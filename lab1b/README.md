# Lab 1B - In-class Exercise 2 (Q1-Q4)

This folder contains only the MySQL `mysql2` exercise and Questions 1-4. The script creates the `categories` and `items` tables if needed, then inserts sample categories and items only when their names are missing. It preserves existing rows and uses prepared statements for data changes and keyword search. It follows the PDF's sample data and adds one `Gaming Keyboard` row so both requested Q2 keywords have a match.

## Run

1. Start MySQL and create the database if needed: `CREATE DATABASE IF NOT EXISTS store_db;`
2. In this folder, run `npm ci`.
3. Copy `.env.example` to `.env` and fill in your local MySQL credentials.
4. Run `npm start`.

The `queries.sql` file contains the corresponding SQL for checking each result in MySQL Workbench or the MySQL CLI.
Running `npm start` again does not duplicate sample rows or overwrite existing prices, quantities, or category descriptions. Q1-Q4 query all rows in the two tables, so results may include your own data as well as the sample data.

## Q1-Q4 explanations

- **Q1 - Filter and sort:** `WHERE` keeps items with a price of at least 500,000 VND and positive stock. `ORDER BY price DESC` puts the most expensive matching item first.
- **Q2 - Keyword search:** `searchItemsByKeyword` binds `%Gaming%` and `%Wireless%` as prepared statement parameters, so the keyword does not become SQL syntax. `LIKE` matches either word anywhere in the product name.
- **Q3 - Aggregate:** `SUM(quantity)` totals all units in stock, `AVG(price)` computes the mean listed price, and `COUNT(*)` counts item rows. These functions operate on the full `items` table because there is no filter.
- **Q4 - Category statistics:** Joining `items` to `categories` lets each item contribute to its category's item count and inventory value. `GROUP BY` makes one result per category, and `HAVING` retains only categories whose `SUM(price * quantity)` exceeds 10,000,000 VND.

The source code, terminal output, and `queries.sql` results can be captured as the screenshots requested in the lab sheet when MySQL is running locally.
