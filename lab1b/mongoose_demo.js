// Lab 1B Exercise 3: schema, CRUD and Questions 1-5.
require('dotenv').config({ path: require('path').join(__dirname, '.env'), quiet: true });
const mongoose = require('mongoose');
const { createHash } = require('node:crypto');
const assert = require('node:assert/strict');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, minlength: 2 },
  email: { type: String, required: true, unique: true, lowercase: true,
    match: /^[\w.-]+@[\w.-]+\.[a-z]{2,}$/i },
  age: { type: Number, min: 18, max: 100 },
  role: { type: String, enum: ['user', 'admin', 'manager'], default: 'user' },
  isActive: { type: Boolean, default: true },
  // Q1: exactly ten digits with the requested Vietnamese mobile prefixes.
  phone: { type: String, required: true, validate: {
    validator: value => /^0[35789]\d{8}$/.test(value),
    message: 'Phone must have 10 digits and start with 03, 05, 07, 08 or 09'
  } },
  isDeleted: { type: Boolean, default: false },
  password: { type: String, required: true }
}, { timestamps: true, toJSON: { virtuals: true } });

// Q2: virtual is included in JSON but is not stored in MongoDB.
userSchema.virtual('displayInfo').get(function() {
  return `${this.fullName} <${this.email}> [${this.role.toUpperCase()}]`;
});

// Q3: the query hook below also excludes soft-deleted users.
userSchema.statics.findActiveByRole = function(roleName) {
  return this.find({ role: roleName, isActive: true }).sort({ fullName: 1 });
};

// Q4: save() runs validation and the pre-save middleware.
userSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.isActive = false;
  return this.save();
};

// Q5: classroom hashing demonstration, not a production password scheme.
userSchema.pre('save', function() {
  if (this.isModified('password')) {
    this.password = `sha256:${createHash('sha256').update(this.password).digest('hex')}`;
    console.log(`[pre-save] Password transformed for ${this.email}`);
  }
});
userSchema.pre(/^find/, function() {
  this.where({ isDeleted: false });
});
const User = mongoose.model('User', userSchema);

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shop_mongoose_db',
    { serverSelectionTimeoutMS: 5000 });
  console.log(`Connected to MongoDB ${mongoose.connection.name}`);
  try {
    await User.init();
    // Reuse only these named demo records; no collection-wide reset.
    const samples = [
      ['Nguyen Van Hung', 'hung.nguyen@example.com', 'admin', true, '0912345678'],
      ['An Nguyen', 'an.lab1b@example.com', 'admin', true, '0312345678'],
      ['Bao Tran', 'bao.lab1b@example.com', 'admin', false, '0512345678'],
      ['Mai Tran', 'mai.lab1b@example.com', 'user', true, '0712345678']
    ];
    const users = [];
    for (const [fullName, email, role, isActive, phone] of samples) {
      const raw = await User.collection.findOne({ email });
      const user = raw ? User.hydrate(raw) : new User({ email });
      Object.assign(user, { fullName, role, isActive, phone, age: 22,
        isDeleted: false, password: 'LabDemoPassword123' });
      await user.save();
      users.push(user);
    }
    console.log('CRUD: CREATE / READ / UPDATE');
    const found = await User.findOne({ email: samples[0][1] });
    assert.ok(found);
    const updated = await User.findByIdAndUpdate(found._id, { age: 23 },
      { returnDocument: 'after', runValidators: true });
    console.log(`READ ${found.fullName}; UPDATE age=${updated.age}`);

    console.log('\nQ1 - Phone validation');
    try {
      await User.create({ fullName: 'Invalid Phone', email: 'invalid.lab1b@example.com',
        phone: '0123456789', password: 'demo', age: 22 });
      throw new Error('Invalid phone was unexpectedly accepted');
    } catch (error) {
      if (!(error instanceof mongoose.Error.ValidationError) || !error.errors.phone) throw error;
      console.log(`Expected validation error: ${error.errors.phone.message}`);
    }
    assert.equal(await User.collection.countDocuments({ email: 'invalid.lab1b@example.com' }), 0);
    for (const phone of ['0312345678', '0512345678', '0712345678', '0812345678', '0912345678']) {
      await new User({ fullName: 'Phone Test', email: 'test@example.com', phone,
        password: 'demo' }).validate();
    }
    console.log('All five allowed prefixes pass; invalid number is not stored.');

    console.log('\nQ2 - Virtual property in JSON');
    console.log(JSON.stringify({ fullName: users[0].toJSON().fullName,
      email: users[0].toJSON().email, role: users[0].toJSON().role,
      displayInfo: users[0].toJSON().displayInfo }, null, 2));
    assert.equal(users[0].toJSON().displayInfo, 'Nguyen Van Hung <hung.nguyen@example.com> [ADMIN]');
    assert.ok(!Object.hasOwn(await User.collection.findOne({ _id: users[0]._id }), 'displayInfo'));

    console.log('\nQ3 - Active admins sorted A-Z');
    const admins = await User.findActiveByRole('admin');
    console.table(admins.map(u => ({ fullName: u.fullName, role: u.role, isActive: u.isActive })));
    assert.ok(admins.every(u => u.role === 'admin' && u.isActive && !u.isDeleted));
    assert.deepEqual(admins.map(u => u.fullName), admins.map(u => u.fullName).sort());

    console.log('\nQ4 - Soft delete');
    const passwordBefore = users[3].password;
    await users[3].softDelete();
    const rawDeleted = await User.collection.findOne({ _id: users[3]._id });
    console.log({ email: rawDeleted.email, isDeleted: rawDeleted.isDeleted, isActive: rawDeleted.isActive });
    assert.equal(rawDeleted.isDeleted, true);
    assert.equal(rawDeleted.isActive, false);
    assert.equal(rawDeleted.password, passwordBefore);

    console.log('\nQ5 - Password middleware and automatic find filter');
    console.log(`Password stored with sha256 prefix: ${users[0].password.startsWith('sha256:')}`);
    console.log(`Password unchanged by soft delete: ${rawDeleted.password === passwordBefore}`);
    const visible = await User.find({ email: { $in: samples.map(s => s[1]) } });
    console.table(visible.map(u => ({ fullName: u.fullName, isDeleted: u.isDeleted })));
    assert.equal(visible.length, 3);
    assert.equal(await User.findById(users[3]._id), null);
    assert.equal(await User.findOne({ _id: users[3]._id, isDeleted: true }), null);
    console.log('Raw collection contains 4 demo users; find returns 3; findById of deleted user returns null.');
    console.log('\nAll Q1-Q5 checks passed.');
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { User, userSchema };
