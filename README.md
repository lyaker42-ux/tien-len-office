# Tiến Lên Office Club — BẢN FILE RỜI, RENDER FREE

Bản này đặt tất cả file cùng cấp để tải lên GitHub dễ dàng. Không cần thư mục public/test.

Xem HUONG_DAN_RENDER_FREE.md để triển khai. Không dùng hướng dẫn cấu trúc thư mục từ bản cũ.

Chạy: npm ci, npm test, npm run build, npm start. Node 24.
Kiểm thử trình duyệt: npx playwright install chromium rồi npm run test:browser.

Server chỉ công khai index.html, client.js, style.css; không phục vụ toàn bộ thư mục nguồn hoặc DB.

Game 4 người, Socket.IO, SQLite tạm, bảng điểm theo phòng, reset trước ván đầu ngày mới theo giờ Việt Nam. Render Free có thể mất dữ liệu nhiều lần/ngày khi ngủ/restart/redeploy.
