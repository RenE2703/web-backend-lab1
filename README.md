# Web Backend & Database Lab Portfolio (Lab 1 & Lab 1b)

![Node.js](https://img.shields.io/badge/Node.js-v22.20.0-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21-black?logo=express)
![MySQL](https://img.shields.io/badge/MySQL-8.4.9-00758F?logo=mysql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-9.0.2-47A248?logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-8.19-880000?logo=mongoose)
![Render](https://img.shields.io/badge/Render-Live%20Production-46E3B7?logo=render&logoColor=black)
![Tests](https://img.shields.io/badge/Automated%20Tests-100%25%20Passed-brightgreen)

**Sinh viên thực hiện:** Đỗ Anh Tuấn  
**Mã số sinh viên (MSSV):** 25560063  
**Lớp:** BCU  
**Email:** erenererophu@gmail.com  
**Repository:** [https://github.com/RenE2703/web-backend-lab1](https://github.com/RenE2703/web-backend-lab1)  
**Cloud Live Endpoint:** [https://web-backend-lab1-25560063.onrender.com/api/greeting](https://web-backend-lab1-25560063.onrender.com/api/greeting)

---

## 🚀 Kiểm Thử Tự Động Một Chạm (One-Click Verification)

Toàn bộ các yêu cầu bài tập của cả **Lab 1 và Lab 1b** đều được tích hợp sẵn trong bộ kiểm thử tự động `scripts/verify_all_homework.js`. Chỉ cần 1 câu lệnh duy nhất từ thư mục gốc:

```powershell
$env:NODE_PATH = "D:\lab-web\lab1b\node_modules;D:\lab-web\lab1-backend\node_modules"
node scripts/verify_all_homework.js
```

**Kết quả kiểm thử tự động kỳ vọng:**
```text
┌────────────────────────────────────────────────────────┬─────────┐
│ Homework Suite Description                             │ Status  │
├────────────────────────────────────────────────────────┼─────────┤
│ Lab 1 HW 1: MySQL Library DB Schema & 3-Table INNER JOIN │ PASSED  │
│ Lab 1 HW 2: MongoDB Blog System (NoSQL CRUD & Aggregation) │ PASSED  │
│ Lab 1 HW 3: Render Cloud Deployment Live Health Check  │ PASSED  │
│ Lab 1b HW 1: SQL Order Transaction Integrity (ACID Commit & Rollback) │ PASSED  │
│ Lab 1b HW 2: Mongoose Many-to-Many Course Registration │ PASSED  │
│ Lab 1b HW 3: Invoices JSON Sync & Strict Schema Validation │ PASSED  │
└────────────────────────────────────────────────────────┴─────────┘
✔ ALL 6 HOMEWORK SUITES PASSED 100%! EXCELLENT!
```

---

## 📁 Cấu Trúc Báo Cáo Nộp Bài (Word Documents)

1. **[Báo Cáo Đồ Án Hợp Nhất (Master Portfolio - Lab 1 & Lab 1b)](Lab1_Lab1b_Master_Portfolio_25560063_DoAnhTuan.docx)**
   - Dung lượng: ~7.0 MB.
   - Bao gồm đầy đủ: Lab 1 In-Class (Ex 1-3), Lab 1b In-Class (Ex 2-3), và toàn bộ 6 bài Lab 1 & Lab 1b Homework với phân tích chuyên sâu.
2. **[Báo Cáo Bài Tập Về Nhà Độc Lập (Lab 1 & Lab 1b Homework Report)](Lab1_Lab1b_Homework_25560063_DoAnhTuan.docx)**
   - Dung lượng: ~1.88 MB.
   - Chuyên biệt cho 6 bài tập về nhà với 23 minh chứng giao diện thực tế (99.9% Native UI).

---

## 📑 Danh Mục Bài Tập Về Nhà (Homework Modules)

### 1. Lab 1 - Homework 1: Thiết kế Cơ sở dữ liệu Thư viện (MySQL)
- **Mã nguồn:** [`homework1_library.sql`](homework1_library.sql)
- **Kiến trúc:** Database `library_db` chuẩn hóa 3NF gồm 3 bảng `authors`, `books`, `borrow_records`. Ràng buộc khóa ngoại `FOREIGN KEY ... ON DELETE CASCADE`.
- **Thực thi:**
  ```powershell
  Get-Content homework1_library.sql -Raw | mysql --defaults-extra-file="%LOCALAPPDATA%/WebBackendLab/mysql-client.ini" --table
  ```

### 2. Lab 1 - Homework 2: Hệ thống Blog NoSQL trên MongoDB
- **Mã nguồn:** [`homework2_blog.js`](homework2_blog.js)
- **Kiến trúc:** Database `blog_db`, collection `posts`. Áp dụng mô hình Embedding (`author`, `tags`, `comments`).
- **Thực thi:**
  ```powershell
  mongosh mongodb://127.0.0.1:27017/blog_db --quiet --file homework2_blog.js
  ```

### 3. Lab 1 - Homework 3: Triển khai Ứng dụng Node.js lên Render.com
- **Mã nguồn:** [`lab1-backend/`](lab1-backend/)
- **Production URL:** `https://web-backend-lab1-25560063.onrender.com/api/greeting`
- **Bộ sưu tập Postman:** [`docs/postman_collection.json`](docs/postman_collection.json)

### 4. Lab 1b - Homework 1: Quản lý Giao dịch Đơn hàng (SQL Transaction ACID)
- **Mã nguồn:** [`lab1b/homework_sql_transaction.js`](lab1b/homework_sql_transaction.js)
- **Kiến trúc:** Database `store_transaction_db` (InnoDB). Quy trình giao dịch 5 bước nghiêm ngặt: Kiểm tra điều kiện -> Trừ ví khách -> Giảm tồn kho -> Tạo đơn hàng -> Tạo chi tiết đơn.
- **Thực thi:**
  ```powershell
  cd lab1b; node homework_sql_transaction.js
  ```

### 5. Lab 1b - Homework 2: Mongoose Many-to-Many (Đăng ký Học phần)
- **Mã nguồn:** [`lab1b/homework_many_to_many.js`](lab1b/homework_many_to_many.js)
- **Kiến trúc:** Quan hệ M:N hai chiều giữa `Student` và `Course`. Kiểm soát `availableSlots`, bắt ngoại lệ đăng ký trùng lặp và hết chỗ, hàm `dropCourse()` tự động phục hồi slot.
- **Thực thi:**
  ```powershell
  cd lab1b; node homework_many_to_many.js
  ```

### 6. Lab 1b - Homework 3: Đồng bộ và Validate Hóa đơn từ JSON
- **Dữ liệu nguồn:** [`lab1b/invoices.json`](lab1b/invoices.json)
- **Mã nguồn:** [`lab1b/homework_json_to_mongoose.js`](lab1b/homework_json_to_mongoose.js)
- **Kiến trúc:** `invoiceSchema` với validation Email regex, items array non-empty, paymentMethod enum, và virtual property `totalAmount`.
- **Thực thi:**
  ```powershell
  cd lab1b; node homework_json_to_mongoose.js
  ```

---

## 🛠️ Bài Làm Trên Lớp (In-Class Labs)
- **Lab 1 Exercise 1 (Express API):** [`lab1-backend/`](lab1-backend/)
- **Lab 1 Exercise 2 (MySQL E-Commerce):** [`exercise2_mysql.sql`](exercise2_mysql.sql)
- **Lab 1 Exercise 3 (MongoDB Orders):** [`exercise3_mongodb.js`](exercise3_mongodb.js)
- **Lab 1b Exercise 2 (MySQL Pool & CRUD):** [`lab1b/mysql_demo.js`](lab1b/mysql_demo.js)
- **Lab 1b Exercise 3 (Mongoose ODM):** [`lab1b/mongoose_demo.js`](lab1b/mongoose_demo.js)
