// =====================================================================
// LAB 2 (LAB 1B) - HOMEWORK 3: READING INVOICE DATA FROM JSON, VALIDATING & SYNCING TO MONGOOSE
// Student: Đỗ Anh Tuấn (MSSV: 25560063) - Class: BCU
// Database: invoice_management_db | Collection: invoices
// =====================================================================

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/invoice_management_db';

// 1. Define Sub-schema for Item
const invoiceItemSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a non-negative number']
    }
  },
  { _id: false }
);

// 2. Define Main Schema for Invoice with strict validation rules
const invoiceSchema = new mongoose.Schema(
  {
    invoiceCode: {
      type: String,
      required: [true, 'Invoice code is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Invalid email format. Please provide a valid email address'
      ]
    },
    items: {
      type: [invoiceItemSchema],
      required: [true, 'Invoice items are required'],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: 'An invoice must contain at least one item'
      }
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: ['CreditCard', 'Momo', 'BankTransfer', 'Cash', 'PayPal', 'ZaloPay'],
        message: 'Payment method "{VALUE}" is not supported'
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual property to calculate total invoice amount dynamically
invoiceSchema.virtual('totalAmount').get(function () {
  if (!this.items || this.items.length === 0) return 0;
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

async function syncInvoicesFromJson() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully:', MONGO_URI);

    // Reset collection for a clean demonstration
    await Invoice.deleteMany({});
    console.log('Cleared previous invoices in collection.\n');

    // Step 1: Read the invoices.json file
    const jsonPath = path.join(__dirname, 'invoices.json');
    console.log(`Reading invoice data from file: ${jsonPath}`);
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const invoicesData = JSON.parse(rawData);
    console.log(`Parsed ${invoicesData.length} invoices from JSON file.\n`);

    // Step 2 & 3: Validate and insert the entire parsed array through the Mongoose model
    console.log('--- Validating and Inserting Invoices via Mongoose ---');
    const insertedInvoices = await Invoice.insertMany(invoicesData, {
      ordered: true,
      runValidators: true
    });
    console.log(`Successfully validated and inserted ${insertedInvoices.length} invoices into MongoDB!\n`);

    // Step 4: Display inserted invoices with computed totals
    console.log('=== Invoices Stored in MongoDB ===');
    const allInvoices = await Invoice.find();
    for (const inv of allInvoices) {
      console.log(`Invoice Code: ${inv.invoiceCode}`);
      console.log(`  Customer: ${inv.customerName} <${inv.customerEmail}>`);
      console.log(`  Payment Method: ${inv.paymentMethod}`);
      console.log(`  Items (${inv.items.length}):`);
      inv.items.forEach(item => {
        console.log(`    - ${item.productName}: ${item.quantity} x ${item.price.toLocaleString()} VND = ${(item.quantity * item.price).toLocaleString()} VND`);
      });
      console.log(`  -> Total Amount: ${inv.totalAmount.toLocaleString()} VND\n`);
    }

    // Step 5: Test validation rules with invalid sample cases
    console.log('--- Testing Validation Rules Against Invalid Data ---');

    // Test Case A: Invalid Email Format
    try {
      console.log('Attempting to insert invoice with invalid email...');
      await Invoice.create({
        invoiceCode: 'INV-ERR-001',
        customerName: 'Invalid User',
        customerEmail: 'not-an-email',
        items: [{ productName: 'USB Drive', quantity: 1, price: 100000 }],
        paymentMethod: 'Cash'
      });
    } catch (err) {
      console.log('  [VALIDATION CAUGHT]:', err.message);
    }

    // Test Case B: Empty Items Array
    try {
      console.log('Attempting to insert invoice with empty items array...');
      await Invoice.create({
        invoiceCode: 'INV-ERR-002',
        customerName: 'Empty Cart User',
        customerEmail: 'cart@example.com',
        items: [],
        paymentMethod: 'Momo'
      });
    } catch (err) {
      console.log('  [VALIDATION CAUGHT]:', err.message);
    }

    // Test Case C: Unsupported Payment Method
    try {
      console.log('Attempting to insert invoice with unsupported payment method...');
      await Invoice.create({
        invoiceCode: 'INV-ERR-003',
        customerName: 'Bitcoin User',
        customerEmail: 'btc@example.com',
        items: [{ productName: 'Mouse Pad', quantity: 1, price: 50000 }],
        paymentMethod: 'Cryptocurrency'
      });
    } catch (err) {
      console.log('  [VALIDATION CAUGHT]:', err.message);
    }

  } catch (error) {
    console.error('Error syncing invoices to MongoDB:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('\nMongoDB connection closed.');
  }
}

if (require.main === module) {
  syncInvoicesFromJson();
}

module.exports = { Invoice, syncInvoicesFromJson };
