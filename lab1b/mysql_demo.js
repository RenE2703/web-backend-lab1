// Lab 1B - in-class Exercise 2, Questions 1-4 only.
require('dotenv').config({ path: require('path').join(__dirname, '.env'), quiet: true });
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'store_db',
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function setupDatabaseAndSeedData() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT NOT NULL,
      item_name VARCHAR(150) NOT NULL,
      price DECIMAL(12, 2) NOT NULL,
      quantity INT DEFAULT 0,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    )
  `);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const categories = [
      ['Food', 'Daily essentials'],
      ['Electronics', 'Gadgets, phones and computers'],
      ['Clothing', 'Apparel and fashion items'],
      ['Books', 'Educational and entertainment books'],
      ['Home & Living', 'Furniture and home appliances'],
      ['Sports & Outdoors', 'Sporting goods and outdoor equipment']
    ];
    const categoryIds = new Map();
    let addedCategories = 0;
    let addedItems = 0;
    let addedFood = false;
    for (const [name, description] of categories) {
      const [existing] = await connection.execute(
        'SELECT id FROM categories WHERE name = ? LIMIT 1', [name]
      );
      if (existing.length > 0) {
        categoryIds.set(name, existing[0].id);
      } else {
        const [result] = await connection.execute(
          'INSERT INTO categories (name, description) VALUES (?, ?)',
          [name, description]
        );
        categoryIds.set(name, result.insertId);
        addedCategories += 1;
        if (name === 'Food') addedFood = true;
      }
    }

    // Basic Exercise 2 SELECT and UPDATE, both using prepared statements.
    const [foodRows] = await connection.execute(
      'SELECT * FROM categories WHERE name = ?', ['Food']
    );
    console.log('Food category:', foodRows[0]);
    // Demonstrate UPDATE only on a row created by this run; preserve existing data.
    if (addedFood) {
      await connection.execute(
        'UPDATE categories SET description = ? WHERE id = ?',
        ['Food, beverages and fresh food', categoryIds.get('Food')]
      );
    }

    const items = [
      ['Food', 'Apple', 25000, 100],
      ['Food', 'Milk', 32000, 50],
      ['Food', 'Bread', 15000, 30],
      ['Electronics', 'Smartphone', 5500000, 15],
      ['Electronics', 'Wireless Mouse', 250000, 40],
      ['Electronics', 'Gaming Keyboard', 800000, 20],
      ['Clothing', 'T-Shirt', 120000, 60],
      ['Clothing', 'Jeans', 350000, 25],
      ['Books', 'Node.js Programming', 180000, 20],
      ['Home & Living', 'Desk Lamp', 150000, 35],
      ['Home & Living', 'Coffee Mug', 45000, 80]
    ];
    for (const [category, name, price, quantity] of items) {
      const categoryId = categoryIds.get(category);
      const [existing] = await connection.execute(
        'SELECT id FROM items WHERE category_id = ? AND item_name = ? LIMIT 1',
        [categoryId, name]
      );
      if (existing.length === 0) {
        await connection.execute(
          'INSERT INTO items (category_id, item_name, price, quantity) VALUES (?, ?, ?, ?)',
          [categoryId, name, price, quantity]
        );
        addedItems += 1;
      }
    }
    await connection.commit();
    console.log(`Sample data ready: added ${addedCategories} categories and ${addedItems} items.`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function searchItemsByKeyword(keyword) {
  const [rows] = await pool.execute(
    'SELECT id, item_name, price, quantity FROM items WHERE item_name LIKE ? ORDER BY item_name',
    [`%${keyword}%`]
  );
  return rows;
}

async function main() {
  try {
    await setupDatabaseAndSeedData();

    // Q1: Available items priced at least 500,000 VND, highest price first.
    const [filteredItems] = await pool.execute(`
      SELECT id, item_name, price, quantity
      FROM items
      WHERE price >= ? AND quantity > 0
      ORDER BY price DESC
    `, [500000]);
    console.log('\nQ1 - Available items priced >= 500,000 VND');
    console.table(filteredItems);

    // Q2: The search term is a bound value, never interpolated into SQL.
    for (const keyword of ['Gaming', 'Wireless']) {
      console.log(`\nQ2 - Items containing "${keyword}"`);
      console.table(await searchItemsByKeyword(keyword));
    }

    // Q3: Aggregate across every item, regardless of category.
    const [stockSummary] = await pool.execute(`
      SELECT SUM(quantity) AS total_stock,
             AVG(price) AS average_price,
             COUNT(*) AS total_items
      FROM items
    `);
    console.log('\nQ3 - Stock, average price, item count');
    console.table(stockSummary);

    // Q4: Keep only categories worth more than 10,000,000 VND in stock.
    const [categorySummary] = await pool.execute(`
      SELECT c.name AS category,
             COUNT(i.id) AS total_items,
             SUM(i.price * i.quantity) AS inventory_value
      FROM categories AS c
      JOIN items AS i ON i.category_id = c.id
      GROUP BY c.id, c.name
      HAVING SUM(i.price * i.quantity) > ?
      ORDER BY inventory_value DESC
    `, [10000000]);
    console.log('\nQ4 - Categories with inventory value > 10,000,000 VND');
    console.table(categorySummary);
  } finally {
    await pool.end();
  }
}

main().catch(error => {
  console.error('MySQL exercise failed:', error.message);
  process.exitCode = 1;
});
