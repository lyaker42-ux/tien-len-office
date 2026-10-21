# YÊU CẦU CODEX: HOÀN THIỆN GAME TIẾN LÊN 4 NGƯỜI

Bạn đang nhận một dự án có mã nguồn MVP chạy được. Hãy đọc `README.md`, `server.js`, `public/index.html`, `public/client.js`, `public/style.css`. **Ưu tiên giữ và sửa mã nguồn có sẵn; không chỉ tạo mockup.**

## Mục tiêu

Web game Tiến Lên cho đúng 4 đồng nghiệp, chia sẻ link phòng, nhập tên, chọn ảnh khuôn mặt (avatar), chấm điểm tự động và BXH, nhìn đẹp như game bài hiện đại với hoạt ảnh lá bài di chuyển, phát sáng lượt hiện tại và ăn mừng người thắng. Tên mọi người hiện trên bàn, mỗi người tự xem 13 lá bài của mình, server đảm bảo không lộ bài đối thủ.

## Luật cố định

- Ván đầu người có 3 bích phải đánh đầu và lượt đầu phải chứa 3 bích.
- Từ ván thứ hai, người về nhất ván vừa rồi đánh trước.
- Nhất +4, nhì +2, ba/tư +0.
- 3 bích chưa đánh khi kết thúc ván: -4.
- Thúi 2 cơ/rô: -4/lá; thúi 2 bích/chuồn: -2/lá.
- 'Trùm' là một thuật ngữ người dùng nói nhưng chưa xác minh ý nghĩa. **Đặt điểm thưởng/phạt trùm ở trạng thái chưa áp dụng** cho đến khi được xác nhận; không tự chế luật.
- Các luật chặt, cóng, thắng trắng, tới trắng, thúi hàng cần làm thành phần cấu hình rõ ràng.

## Tiêu chí nghiệm thu

1. `npm install && npm start` chạy được và một máy mở 4 tab (hoặc 4 thiết bị) vào cùng phòng.
2. 4 tên và avatar riêng hiển thị đúng. Không người thứ 5 nào vào được phòng đang đủ.
3. Ván đầu 3♠ ra trước; ván sau hạng nhất đi trước.
4. Chỉ người đến lượt được đánh, nước đánh phải hợp lệ theo luật.
5. Vòng chơi có kết thúc, xếp 4 thứ hạng chính xác, cập nhật BXH và phạt heo/3♠.
6. Ảnh đại diện không tràn khỏi khung; layout đẹp trên điện thoại và máy tính.
7. Hiệu ứng chia bài/đánh bài/thắng ván chạy mượt 60fps trên máy phổ thông, ưu tiên CSS transforms.
8. Viết test tự động cho logic luật và bảng điểm; chạy test/build trước khi bàn giao.
9. Hướng dẫn triển khai trên Render/Railway/VPS, sử dụng đúng `PORT` do hosting cấp, không hứa có link live nếu chưa deploy thật.

## Thứ tự ưu tiên

1. Sửa mọi lỗi game logic và các trường hợp kết thúc vòng.
2. Test server, kiểm tra không thể đánh bài không sở hữu.
3. Lưu BXH SQLite để dữ liệu không mất sau restart.
4. Hoạt ảnh đẹp, âm thanh tùy chọn, tối ưu responsive.
5. Bảo mật phòng, ổn định khi ngắt/kết nối lại.

Khi hoàn thành, giải thích tập tin đã sửa, kết quả test và cách chạy thật.
