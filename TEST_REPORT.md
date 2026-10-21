# Kết quả kiểm thử — 21/10/2026

Môi trường kiểm tra: Windows, Node.js 24.19.0, Chromium headless. Đọc toàn bộ 7 file dự án ban đầu và CODEX_PROMPT.md trước khi sửa.

- `npm test`: 12/12 bài kiểm thử đạt. Bao gồm 100 ván mô phỏng trọn vẹn, mỗi ván xếp đủ 4 hạng và đối chiếu điểm.
- `npm run build`: đạt; kiểm tra cú pháp server, game, rules, store và client (frontend thuần, không có bundler).
- `npm run test:browser`: đạt với 4 browser context riêng, tên/ảnh đại diện riêng, một điện thoại 390 px, các chiều rộng 320/360/390/600/768 px không tràn ngang, tải lại trang giữ bài, chơi trọn ván bằng nút giao diện, lưu 4 dòng điểm, ván sau người nhất đi trước. Kiểm tra cả hiệu ứng bật, giảm chuyển động và âm thanh tùy chọn; không có lỗi JavaScript.
- Kiểm tra Socket.IO thật: người thứ 5 bị chặn, chỉ chủ phòng được bắt đầu, không nhận bài đối thủ/token trong state công khai, không đánh được lá không sở hữu, phiên mới vô hiệu cửa sổ cũ, một kết nối không giữ hai chỗ, hết giờ tự mở 3♠.
- SQLite: ghi điểm không trùng khi lưu cùng ván hai lần, đóng/mở DB vẫn còn phòng, điểm và mã phiên; socket cũ không được coi là còn kết nối sau khôi phục.
- npm audit khi cài: không có lỗ hổng được báo trong 100 package đã kiểm tra.

Ảnh đối chiếu trên máy: test-results/mobile-390.png, desktop.png, winner.png. Ảnh này không có trong gói mã nguồn để GitHub upload gọn.

Giới hạn xác minh: chưa triển khai Render hoặc kiểm tra qua mạng Internet/4 điện thoại thật. Hiệu ứng chủ yếu dùng transform/opacity và có chế độ giảm chuyển động, nhưng chưa đo và không cam kết 60 fps trên mọi điện thoại. Chưa áp dụng trùm/cóng/tới trắng/thúi hàng. SQLite cần disk bền vững để giữ dữ liệu trên hosting. Bản cập nhật Free đã bỏ gói Starter/disk, thêm HUONG_DAN_RENDER_FREE.md.


Cập nhật bản Free:

- Render YAML đã dùng plan free, không disk/DB_PATH.
- Thêm kiểm thử ranh giới 00:00 giờ Việt Nam (17:00 UTC), reset đúng một lần mỗi ngày và giữ ván qua nửa đêm.
- Kiểm thử Socket.IO xác nhận điểm cũ reset trước khi chủ phòng bắt đầu ván ngày mới.
- Kiểm thử trình duyệt mô phỏng phòng bị mất sau restart: tự về màn hình tạo phòng và tạo phòng mới thành công.
- Chưa triển khai vào tài khoản Render của người dùng; không có link live được cấp sẵn.
