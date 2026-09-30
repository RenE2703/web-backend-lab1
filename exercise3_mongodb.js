// 1. Switch to the shop_db database
// (In interactive Mongo Shell: use shop_db)
db = db.getSiblingDB("shop_db");

// 2. Insert 2 order documents into the orders collection (insertOne / insertMany)
db.orders.insertMany([
  {
    order_code: "ORD-2026-001",
    customer_name: "Nguyen Van A",
    customer_email: "nguyenvana@gmail.com",
    total_amount: 37500000,
    status: "completed",
    items: [
      { product_name: "Laptop Dell XPS 15", quantity: 1, price: 35000000 },
      { product_name: "Logitech MX Master 3S Mouse", quantity: 1, price: 2500000 }
    ],
    created_at: new Date()
  },
  {
    order_code: "ORD-2026-002",
    customer_name: "Tran Thi B",
    customer_email: "tranthib@gmail.com",
    total_amount: 2200000,
    status: "pending",
    items: [
      { product_name: "Keychron K2 Mechanical Keyboard", quantity: 1, price: 2200000 }
    ],
    created_at: new Date()
  }
]);

// 3. Query documents (Find)
// Find orders with status 'completed'
console.log("=== Basic Requirement: Find completed orders ===");
console.log(db.orders.find({ status: "completed" }).toArray());

// 4. Update an order's status (Update)
db.orders.updateOne(
  { order_code: "ORD-2026-002" },
  { $set: { status: "processing" } }
);

// Extended requirement: Array queries and aggregation in MongoDB
// 1. Q1 (Insert varied data)
db.orders.insertMany([
  {
    order_code: "ORD-2026-003",
    status: "completed",
    total_amount: 5500000,
    items: [
      { product_name: "Product 1", quantity: 1, price: 1000000 },
      { product_name: "Product 2", quantity: 1, price: 2000000 },
      { product_name: "Product 3", quantity: 1, price: 2500000 }
    ],
    created_at: new Date()
  },
  {
    order_code: "ORD-2026-004",
    status: "cancelled",
    total_amount: 0,
    items: [],
    created_at: new Date()
  }
]);

// 2. Q2 (Conditional & nested-document queries)
console.log("=== Extended Q2: Orders >= 5,000,000 and completed ===");
console.log(db.orders.find({ total_amount: { $gte: 5000000 }, status: "completed" }).toArray());

console.log("=== Extended Q2: Orders with Logitech MX Master 3S Mouse ===");
console.log(db.orders.find({ "items.product_name": "Logitech MX Master 3S Mouse" }).toArray());

// 3. Q3 (Array update)
db.orders.updateOne(
  { order_code: "ORD-2026-002" },
  { 
    $push: { items: { product_name: "XL Gaming Mouse Pad", quantity: 1, price: 200000 } },
    $inc: { total_amount: 200000 }
  }
);
console.log("=== Extended Q3: Updated ORD-2026-002 ===");
console.log(db.orders.findOne({ order_code: "ORD-2026-002" }));

// 4. Q4 (Aggregation Framework statistics)
console.log("=== Extended Q4: Total revenue from completed orders ===");
console.log(db.orders.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: null, totalRevenue: { $sum: "$total_amount" } } }
]).toArray());

console.log("=== Extended Q4: Orders count grouped by status ===");
console.log(db.orders.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
]).toArray());
