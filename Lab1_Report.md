# Lab 1 - In-class exercises

**Sinh viên:** Đỗ Anh Tuấn

**MSSV:** 25560063

**Lớp:** BCU

Phạm vi: Section 4 của `Lab1.pdf`, gồm Exercise 1-3 và các yêu cầu mở rộng. Không bao gồm Section 5 (homework).

## Exercise 1 - Node.js backend

Mã nguồn ở [`lab1-backend/`](lab1-backend/). Dự án dùng Express và dotenv, mặc định chạy cổng 5000.

| GET endpoint | Kết quả |
| --- | --- |
| `/` | Thông báo chào mừng, trạng thái và thời gian |
| `/api/health` | Trạng thái và thời gian hoạt động của server |
| `/api/greeting` | Thông tin sinh viên dưới dạng JSON |

## Exercise 2 - MySQL

Script [`exercise2_mysql.sql`](exercise2_mysql.sql) tạo `ecommerce_db`, các bảng `users`, `products`, `orders`, `order_items` và dữ liệu mẫu. Script có khóa ngoại, ràng buộc số lượng mua lớn hơn 0 và các câu truy vấn Q1-Q4: thêm đơn hàng, lọc sản phẩm theo giá, báo cáo JOIN, thống kê doanh thu và số đơn theo người dùng.

Khi chạy trên cơ sở dữ liệu thử riêng, script tạo 3 người dùng và 3 đơn hàng. Truy vấn Q2 tìm được `USB-C Hub` (850.000 VND); tổng doanh thu đơn hoàn thành là 37.200.000 VND.

## Exercise 3 - MongoDB

Script [`exercise3_mongodb.js`](exercise3_mongodb.js) tạo `shop_db.orders`, thêm dữ liệu mẫu, tìm và cập nhật đơn hàng, rồi thực hiện Q1-Q4 về dữ liệu mảng và thống kê.

Khi chạy trên cơ sở dữ liệu thử riêng, có 4 đơn hàng. Đơn `ORD-2026-002` có tổng giá trị 2.400.000 VND sau khi thêm sản phẩm; doanh thu đơn hoàn thành là 43.000.000 VND.

## Chạy lại

Xem hướng dẫn trong [`README.md`](README.md). Script MySQL xóa và tạo lại database `ecommerce_db` mỗi khi chạy; script MongoDB thêm dữ liệu mẫu nên chạy một lần trên cơ sở dữ liệu mới.

**GitHub:** https://github.com/RenE2703/web-backend-lab1
