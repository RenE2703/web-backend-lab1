// =====================================================================
// LAB 2 (LAB 1B) - HOMEWORK 2: MONGOOSE MANY-TO-MANY RELATIONSHIP (STUDENT & COURSE)
// Student: Đỗ Anh Tuấn (MSSV: 25560063) - Class: BCU
// Database: course_registration_db
// =====================================================================

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/course_registration_db';

// 1. Define Student Schema
const studentSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
  },
  { timestamps: true }
);

// 2. Define Course Schema
const courseSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    maxStudents: { type: Number, required: true, min: 1 },
    availableSlots: { type: Number, required: true, min: 0 },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
  },
  { timestamps: true }
);

const Student = mongoose.model('Student', studentSchema);
const Course = mongoose.model('Course', courseSchema);

/**
 * Requirement 1: enrollCourse(studentId, courseId)
 * - Checks if student is already enrolled.
 * - Checks if course still has availableSlots > 0.
 * - Adds courseId to Student.courses AND studentId to Course.students.
 * - Decreases availableSlots by 1.
 */
async function enrollCourse(studentId, courseId) {
  const student = await Student.findById(studentId);
  if (!student) throw new Error(`Student with ID ${studentId} not found.`);

  const course = await Course.findById(courseId);
  if (!course) throw new Error(`Course with ID ${courseId} not found.`);

  // Check 1: Is student already enrolled?
  const isAlreadyEnrolled = student.courses.some(cId => cId.equals(course._id));
  if (isAlreadyEnrolled) {
    throw new Error(`Student "${student.fullName}" is ALREADY enrolled in "${course.title}" (${course.courseCode}).`);
  }

  // Check 2: Does the course have available slots?
  if (course.availableSlots <= 0) {
    throw new Error(`Course "${course.title}" (${course.courseCode}) is FULL! Available slots: ${course.availableSlots}.`);
  }

  // Atomically update both documents
  await Student.findByIdAndUpdate(studentId, {
    $addToSet: { courses: courseId }
  });

  const updatedCourse = await Course.findByIdAndUpdate(
    courseId,
    {
      $addToSet: { students: studentId },
      $inc: { availableSlots: -1 }
    },
    { returnDocument: 'after' }
  );

  console.log(`[ENROLL SUCCESS] "${student.fullName}" enrolled in "${course.title}". Slots remaining: ${updatedCourse.availableSlots}`);
  return { student, course: updatedCourse };
}

/**
 * Requirement 2: dropCourse(studentId, courseId)
 * - Removes courseId from Student.courses array.
 * - Removes studentId from Course.students array.
 * - Restores 1 slot to course (availableSlots = availableSlots + 1).
 */
async function dropCourse(studentId, courseId) {
  const student = await Student.findById(studentId);
  if (!student) throw new Error(`Student with ID ${studentId} not found.`);

  const course = await Course.findById(courseId);
  if (!course) throw new Error(`Course with ID ${courseId} not found.`);

  const isEnrolled = student.courses.some(cId => cId.equals(course._id));
  if (!isEnrolled) {
    throw new Error(`Student "${student.fullName}" is NOT enrolled in "${course.title}". Cannot drop.`);
  }

  // Atomically remove from both sides and restore availableSlots
  await Student.findByIdAndUpdate(studentId, {
    $pull: { courses: courseId }
  });

  const updatedCourse = await Course.findByIdAndUpdate(
    courseId,
    {
      $pull: { students: studentId },
      $inc: { availableSlots: 1 }
    },
    { returnDocument: 'after' }
  );

  console.log(`[DROP SUCCESS] "${student.fullName}" dropped "${course.title}". Slots remaining: ${updatedCourse.availableSlots}`);
  return { student, course: updatedCourse };
}

async function runDemo() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB:', MONGO_URI);

  // Clear existing collections for a clean run
  await Student.deleteMany({});
  await Course.deleteMany({});

  // 1. Seed courses
  const webDev = await Course.create({
    courseCode: 'CS101',
    title: 'Web Application Development',
    maxStudents: 2,
    availableSlots: 2,
    students: []
  });

  const dbSys = await Course.create({
    courseCode: 'CS102',
    title: 'Advanced Database Systems',
    maxStudents: 1,
    availableSlots: 1,
    students: []
  });

  // 2. Seed students
  const tuan = await Student.create({
    fullName: 'Đỗ Anh Tuấn',
    email: 'tuan.do@example.com',
    courses: []
  });

  const binh = await Student.create({
    fullName: 'Nguyen Van Binh',
    email: 'binh.nguyen@example.com',
    courses: []
  });

  const cuc = await Student.create({
    fullName: 'Tran Thi Cuc',
    email: 'cuc.tran@example.com',
    courses: []
  });

  console.log('\n--- Initial Database State Seeded ---');
  console.log(`Courses created: ${webDev.title} (Cap: 2), ${dbSys.title} (Cap: 1)`);
  console.log(`Students created: ${tuan.fullName}, ${binh.fullName}, ${cuc.fullName}`);

  // Test 1: Successful enrollment
  console.log('\n--- Test 1: Valid Enrollments ---');
  await enrollCourse(tuan._id, webDev._id);
  await enrollCourse(binh._id, webDev._id);

  // Test 2: Duplicate enrollment rejection
  console.log('\n--- Test 2: Attempt Duplicate Enrollment ---');
  try {
    await enrollCourse(tuan._id, webDev._id);
  } catch (err) {
    console.log('[EXPECTED ERROR]', err.message);
  }

  // Test 3: Course full capacity rejection
  console.log('\n--- Test 3: Attempt Enrollment into Full Course ---');
  try {
    await enrollCourse(cuc._id, webDev._id);
  } catch (err) {
    console.log('[EXPECTED ERROR]', err.message);
  }

  // Test 4: Drop a course and restore slot
  console.log('\n--- Test 4: Drop Course and Restore Slot ---');
  await dropCourse(binh._id, webDev._id);

  // Test 5: New student now successfully enrolls in freed slot
  console.log('\n--- Test 5: Enroll into Freed Slot ---');
  await enrollCourse(cuc._id, webDev._id);

  // Test 6: Enroll student in multiple courses
  console.log('\n--- Test 6: Enroll in Multiple Courses ---');
  await enrollCourse(tuan._id, dbSys._id);

  // 3. Verification with Population
  console.log('\n======================================================');
  console.log('--- Final State: Populating Student Courses ---');
  const populatedStudents = await Student.find().populate('courses', 'courseCode title');
  for (const s of populatedStudents) {
    console.log(`Student: ${s.fullName} (${s.email})`);
    console.log(`  Enrolled Courses (${s.courses.length}):`, s.courses.map(c => `[${c.courseCode}] ${c.title}`));
  }

  console.log('\n--- Final State: Populating Course Students ---');
  const populatedCourses = await Course.find().populate('students', 'fullName email');
  for (const c of populatedCourses) {
    console.log(`Course: [${c.courseCode}] ${c.title} | Max: ${c.maxStudents} | Available: ${c.availableSlots}`);
    console.log(`  Enrolled Students (${c.students.length}):`, c.students.map(s => `${s.fullName} (${s.email})`));
  }

  await mongoose.disconnect();
  console.log('\nMongoDB connection closed.');
}

if (require.main === module) {
  runDemo().catch(err => {
    console.error('Mongoose demo error:', err);
    process.exitCode = 1;
  });
}

module.exports = { Student, Course, enrollCourse, dropCourse };
