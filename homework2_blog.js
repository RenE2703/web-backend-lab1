// =====================================================================
// LAB 1 - HOMEWORK 2: BUILD AND MANAGE A BLOG SYSTEM ON MONGODB
// Student: Đỗ Anh Tuấn (MSSV: 25560063) - Class: BCU
// Database: blog_db | Collection: posts
// =====================================================================

// 1. Switch to blog_db database
db = db.getSiblingDB("blog_db");

// Reset collection for a clean, reproducible execution
db.posts.drop();

// 2. Insert at least 3 posts with embedded objects and arrays
db.posts.insertMany([
  {
    title: "Mastering Node.js and Express",
    category: "Tech",
    views: 150,
    author: {
      name: "Do Anh Tuan",
      email: "erenererophu@gmail.com"
    },
    tags: ["nodejs", "express", "backend"],
    comments: [
      {
        user: "Nguyen Van A",
        content: "Great tutorial on Express architecture!",
        created_at: new Date("2026-10-01T08:30:00Z")
      },
      {
        user: "Tran Thi B",
        content: "Very clear explanation of middleware.",
        created_at: new Date("2026-10-02T10:15:00Z")
      }
    ]
  },
  {
    title: "Understanding Relational vs NoSQL Databases",
    category: "Tech",
    views: 85,
    author: {
      name: "Le Van C",
      email: "levanc@example.com"
    },
    tags: ["database", "mysql", "mongodb"],
    comments: [
      {
        user: "Pham Van D",
        content: "Helped me choose MongoDB for my startup project.",
        created_at: new Date("2026-10-03T14:20:00Z")
      }
    ]
  },
  {
    title: "Building Microservices with Node.js and Docker",
    category: "Tech",
    views: 220,
    author: {
      name: "Do Anh Tuan",
      email: "erenererophu@gmail.com"
    },
    tags: ["nodejs", "microservices", "docker"],
    comments: [
      {
        user: "Hoang Van E",
        content: "Docker containerization section is top notch.",
        created_at: new Date("2026-10-04T09:00:00Z")
      }
    ]
  },
  {
    title: "Productivity Habits for Modern Developers",
    category: "Life",
    views: 310,
    author: {
      name: "Vu Thi F",
      email: "vuthif@example.com"
    },
    tags: ["productivity", "career", "lifestyle"],
    comments: [
      {
        user: "Do Anh Tuan",
        content: "Time-blocking technique changed my daily routine.",
        created_at: new Date("2026-10-05T16:45:00Z")
      }
    ]
  }
]);

print("=== 1. Initial Posts Inserted ===");
printjson(db.posts.find({}, { title: 1, category: 1, views: 1, "author.name": 1 }).toArray());

// 3. Query 1: Find posts in 'Tech' category AND with views of 100 or more
print("\n=== Query 1: Posts in 'Tech' category AND views >= 100 ===");
const query1Result = db.posts.find(
  {
    category: "Tech",
    views: { $gte: 100 }
  },
  {
    title: 1,
    category: 1,
    views: 1,
    author: 1,
    tags: 1
  }
).toArray();
printjson(query1Result);

// 4. Query 2: Find all posts tagged with 'nodejs'
print("\n=== Query 2: Posts tagged with 'nodejs' ===");
const query2Result = db.posts.find(
  { tags: "nodejs" },
  { title: 1, category: 1, tags: 1, views: 1 }
).toArray();
printjson(query2Result);

// 5. Update: Add a new comment to comments array of a specific post by title ($push)
// and increment its views count by 1 ($inc)
print("\n=== Update: Add comment and increment views for 'Mastering Node.js and Express' ===");
db.posts.updateOne(
  { title: "Mastering Node.js and Express" },
  {
    $push: {
      comments: {
        user: "Bui Van G",
        content: "Awesome read! Keep sharing more backend tips.",
        created_at: new Date()
      }
    },
    $inc: { views: 1 }
  }
);

// Verify update result
const updatedPost = db.posts.findOne(
  { title: "Mastering Node.js and Express" },
  { title: 1, views: 1, comments: 1 }
);
printjson(updatedPost);

// 6. Aggregation: Calculate total number of views (totalViews) and total number of posts (totalPosts), grouped by category
print("\n=== Aggregation: Views and Posts grouped by category ===");
const aggregationResult = db.posts.aggregate([
  {
    $group: {
      _id: "$category",
      totalViews: { $sum: "$views" },
      totalPosts: { $sum: 1 }
    }
  },
  {
    $sort: { totalViews: -1 }
  }
]).toArray();
printjson(aggregationResult);
