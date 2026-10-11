// =====================================================================
// LAB 2 (LAB 1B) - HOMEWORK 1: MANAGING ORDER TRANSACTIONS WITH SQL TRANSACTION INTEGRITY
// Student: Đỗ Anh Tuấn (MSSV: 25560063) - Class: BCU
// Database: store_transaction_db
// =====================================================================

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'ce1ecd59c0ea4e04814d29d38bee8eb1',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

async function setupDatabaseAndTables() {
  console.log('--- Setting up store_transaction_db schema ---');
  await pool.query(`
    CREATE DATABASE IF NOT EXISTS store_transaction_db;
    USE store_transaction_db;

    SET FOREIGN_KEY_CHECKS = 0;
    DROP TABLE IF EXISTS order_items;
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS customers;
    SET FOREIGN_KEY_CHECKS = 1;

    -- (1) customers table
    CREATE TABLE customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      balance DECIMAL(12, 2) NOT NULL
    );

    -- (2) products table
    CREATE TABLE products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_name VARCHAR(150) NOT NULL,
      price DECIMAL(12, 2) NOT NULL,
      stock INT NOT NULL
    );

    -- (3) orders table
    CREATE TABLE orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT NOT NULL,
      total_amount DECIMAL(12, 2) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );

    -- (4) order_items table
    CREATE TABLE order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      price DECIMAL(12, 2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Seed initial test records
    INSERT INTO customers (id, full_name, balance) VALUES
    (1, 'Do Anh Tuan', 50000000.00),
    (2, 'Nguyen Van LowBalance', 1000000.00);

    INSERT INTO products (id, product_name, price, stock) VALUES
    (1, 'Laptop Dell XPS 15', 35000000.00, 5),
    (2, 'Logitech MX Master 3S', 2500000.00, 10),
    (3, 'Keychron K2 Mechanical Keyboard', 2200000.00, 0);
  `);
  console.log('Database and tables initialized with sample seed data.');
}

/**
 * Executes a 5-step transaction:
 * 1. Check customer's balance >= order total AND product's stock >= quantity
 * 2. Deduct amount from customer's balance
 * 3. Deduct quantity from product's stock
 * 4. Insert new order record into orders
 * 5. Insert corresponding line items into order_items
 */
async function processOrderTransaction(customerId, itemsToPurchase) {
  const conn = await pool.getConnection();
  await conn.query('USE store_transaction_db;');

  try {
    console.log(`\n======================================================`);
    console.log(`[START TRANSACTION] Customer ID: ${customerId}`);
    await conn.beginTransaction();

    // Step 1: Check customer balance and stock availability
    const [custRows] = await conn.execute(
      'SELECT id, full_name, balance FROM customers WHERE id = ? FOR UPDATE',
      [customerId]
    );
    if (custRows.length === 0) {
      throw new Error(`Customer with ID ${customerId} not found.`);
    }
    const customer = custRows[0];
    const customerBalance = Number(customer.balance);

    let orderTotal = 0;
    const resolvedItems = [];

    for (const item of itemsToPurchase) {
      const [prodRows] = await conn.execute(
        'SELECT id, product_name, price, stock FROM products WHERE id = ? FOR UPDATE',
        [item.productId]
      );
      if (prodRows.length === 0) {
        throw new Error(`Product with ID ${item.productId} not found.`);
      }
      const product = prodRows[0];
      const productPrice = Number(product.price);
      const productStock = Number(product.stock);

      if (productStock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.product_name}" (ID ${product.id}). ` +
          `Available: ${productStock}, requested: ${item.quantity}.`
        );
      }

      const lineTotal = productPrice * item.quantity;
      orderTotal += lineTotal;

      resolvedItems.push({
        productId: product.id,
        productName: product.product_name,
        price: productPrice,
        quantity: item.quantity,
        lineTotal
      });
    }

    console.log(`Step 1: Validation check`);
    console.log(`  Customer: ${customer.full_name} | Balance: ${customerBalance.toLocaleString()} VND`);
    console.log(`  Order Total: ${orderTotal.toLocaleString()} VND`);

    if (customerBalance < orderTotal) {
      throw new Error(
        `Insufficient balance for customer "${customer.full_name}". ` +
        `Current balance: ${customerBalance.toLocaleString()} VND, Required: ${orderTotal.toLocaleString()} VND.`
      );
    }
    console.log(`  -> Balance and stock checks passed!`);

    // Step 2: Deduct amount from customer's balance
    console.log(`Step 2: Deducting ${orderTotal.toLocaleString()} VND from customer balance...`);
    await conn.execute(
      'UPDATE customers SET balance = balance - ? WHERE id = ?',
      [orderTotal, customerId]
    );

    // Step 3: Deduct quantity from product stock
    console.log(`Step 3: Deducting purchased quantities from product stock...`);
    for (const item of resolvedItems) {
      await conn.execute(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
      console.log(`  - Decremented stock of "${item.productName}" by ${item.quantity}`);
    }

    // Step 4: Insert new order record into orders
    console.log(`Step 4: Inserting new order record into orders...`);
    const [orderResult] = await conn.execute(
      'INSERT INTO orders (customer_id, total_amount, created_at) VALUES (?, ?, NOW())',
      [customerId, orderTotal]
    );
    const orderId = orderResult.insertId;
    console.log(`  - Created order ID: ${orderId}`);

    // Step 5: Insert corresponding line item(s) into order_items
    console.log(`Step 5: Inserting line items into order_items...`);
    for (const item of resolvedItems) {
      await conn.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.price]
      );
      console.log(`  - Added line item: Order ${orderId} | Product ${item.productId} (${item.productName}) x${item.quantity}`);
    }

    // If all steps succeed: commit transaction
    await conn.commit();
    console.log(`[COMMIT] Transaction completed successfully for Order ID ${orderId}!`);
    return { success: true, orderId, orderTotal };

  } catch (error) {
    // If any error occurs: rollback safely
    await conn.rollback();
    console.error(`[ROLLBACK] Transaction failed and rolled back safely!`);
    console.error(`Reason: ${error.message}`);
    return { success: false, error: error.message };
  } finally {
    conn.release();
  }
}

async function displayCurrentState() {
  const [customers] = await pool.query('SELECT * FROM store_transaction_db.customers');
  const [products] = await pool.query('SELECT * FROM store_transaction_db.products');
  const [orders] = await pool.query('SELECT * FROM store_transaction_db.orders');
  const [orderItems] = await pool.query('SELECT * FROM store_transaction_db.order_items');

  console.log('\n--- Current Database Snapshot ---');
  console.log('Customers:');
  console.table(customers);
  console.log('Products:');
  console.table(products);
  console.log('Orders:');
  console.table(orders);
  console.log('Order Items:');
  console.table(orderItems);
}

async function main() {
  try {
    await setupDatabaseAndTables();
    await displayCurrentState();

    // Case 1: SUCCESSFUL TRANSACTION
    console.log('\n>>> TEST CASE 1: Successful Order');
    console.log('Customer 1 purchases 1x Laptop Dell XPS 15 and 2x Logitech MX Master 3S.');
    await processOrderTransaction(1, [
      { productId: 1, quantity: 1 }, // 35,000,000
      { productId: 2, quantity: 2 }  // 5,000,000 -> Total = 40,000,000
    ]);
    await displayCurrentState();

    // Case 2: FAILED TRANSACTION (Insufficient balance -> Rollback)
    console.log('\n>>> TEST CASE 2: Failed Order Due to Insufficient Balance');
    console.log('Customer 2 (Balance: 1,000,000) tries to buy 1x Laptop Dell XPS 15 (35,000,000).');
    await processOrderTransaction(2, [
      { productId: 1, quantity: 1 }
    ]);
    await displayCurrentState();

    // Case 3: FAILED TRANSACTION (Out of stock -> Rollback)
    console.log('\n>>> TEST CASE 3: Failed Order Due to Out of Stock');
    console.log('Customer 1 tries to buy 1x Keychron K2 (Stock is 0).');
    await processOrderTransaction(1, [
      { productId: 3, quantity: 1 }
    ]);
    await displayCurrentState();

  } catch (err) {
    console.error('Fatal error in transaction demo:', err);
  } finally {
    await pool.end();
    console.log('\nMySQL connection closed.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { processOrderTransaction, setupDatabaseAndTables };
