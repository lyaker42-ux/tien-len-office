# Tiến Lên Office Club — 4 người

Game thật dùng Express + Socket.IO. Một người tạo phòng, gửi **link phòng** cho 3 đồng nghiệp; mỗi người nhập tên, thêm ảnh nếu muốn và vào cùng bàn. Chỉ chủ phòng bấm bắt đầu, cần đủ 4 người đang kết nối.

## Triển khai miễn phí để 4 người cùng chơi

Bản này đã đổi sang **Render Free**, không disk và không dịch vụ trả phí. Đọc **[HUONG_DAN_RENDER_FREE.md](HUONG_DAN_RENDER_FREE.md)**: hướng dẫn từ tạo tài khoản, upload GitHub, điền từng ô Render đến lấy link mời.

Cấu hình nhanh: Web Service, Node 24, Build `npm ci && npm run build`, Start `npm start`, Root Directory để trống, Compute Plan **Free**, không DB_PATH, không disk. `render.yaml` cũng đã là `plan: free`.

Chưa có link công khai cho đến khi bạn triển khai thành công. Khi Render báo Live, mở URL được cấp → tạo phòng → sao chép link mời gửi 3 đồng nghiệp. Bạn không cần giữ máy cá nhân chạy.

Điểm reset **trước ván đầu ngày mới theo giờ Việt Nam**, không cắt ngang ván. Render Free mất dữ liệu khi ngủ/restart/redeploy nên điểm/phòng có thể mất sớm hơn một ngày. Khi đó game cho tạo phòng mới và gửi lại link mời; địa chỉ trang game trên Render vẫn còn. Không đảm bảo giữ đủ điểm trong ngày bằng SQLite tạm.

## Chạy và kiểm thử trên máy

Cài Node.js **24 LTS** (tối thiểu 22.13 vì dùng SQLite tích hợp). Không còn hỗ trợ Node 20 của bản MVP.

```sh
npm ci
npm test
npm run build
npm start
```

Mở http://localhost:3000. Thử 4 người bằng 4 tab mới mở độc lập hoặc 4 trình duyệt. Không dùng Duplicate Tab vì trình duyệt có thể sao chép phiên người chơi. Phiên riêng theo tab giúp 4 tab không tự nhận cùng chỗ.

Kiểm thử giao diện tự động:

```sh
npx playwright install chromium
npm run test:browser
```

Ảnh kiểm thử xuất tại `test-results/`. Có thể đặt biến CHROMIUM_PATH nếu dùng trình duyệt có sẵn. Dự án HTML/CSS/JS thuần, lệnh build kiểm tra cú pháp; không có bước đóng gói frontend.

Cùng Wi-Fi/LAN: giữ server chạy, dùng IPv4 máy chủ ở lệnh `ipconfig`, mở `http://IP_MAY_CHU:3000` trên điện thoại và cho phép Node qua firewall mạng riêng. Link LAN chỉ dùng trong mạng đó, không thay thế link Render.

## Luật đang áp dụng

- 52 lá, mỗi người 13 lá; 3 < ... < A < 2; bích < chuồn < rô < cơ.
- Ván đầu bắt buộc bộ mở chứa 3♠. Ván sau người nhất ván trước mở bài.
- Lẻ, đôi, sám, tứ quý, sảnh ít nhất 3 lá, đôi thông ít nhất 3 đôi. Sảnh/đôi thông không chứa 2. Bộ cùng loại, cùng độ dài so lá cao nhất.
- **Bỏ lượt là bỏ cả vòng**, chỉ được vào lại sau khi bàn mở vòng mới. Chỉ đánh/chặt khi đến lượt; không chặt ngoài lượt.
- 3 đôi thông chặt một heo. Tứ quý chặt một heo, đôi heo và 3 đôi thông. Từ 4 đôi thông chặt một/đôi heo, 3 đôi thông và tứ quý. Đôi thông cùng độ dài cao hơn được đè; không tự chặt mọi đôi thông dài hơn/ngắn hơn.
- Khi mọi đối thủ còn chơi đã bỏ, người đánh cuối mở vòng mới. Nếu người đó đã hết bài, người tiếp theo còn bài mở vòng mới.
- Chơi đến khi có 3 người hết bài; người cuối hạng tư. Nhất +4, nhì +2, ba/tư +0. Còn 3♠ phạt -4; 2 cơ/rô -4 mỗi lá; 2 bích/chuồn -2 mỗi lá. Phạt trên bài còn tay lúc ván kết thúc.
- `rules.js → DEFAULT_RULES`: `cuts=true`; `instantWin=false` (tới/thắng trắng), `cong=false`, `rottenGroups=false` (thúi hàng), `trum=false`. Các luật false chưa được triển khai, không chỉ đổi thành true để dùng. Trùm giữ chưa áp dụng theo yêu cầu, không tự đoán nghĩa.
- Mỗi lượt 60 giây. Hết giờ server tự bỏ vòng nếu trên bàn có bài; nếu phải mở vòng thì đánh một lá nhỏ nhất (3♠ cho lượt đầu ván đầu). Áp dụng cả khi người chơi mất kết nối để tránh kẹt bàn.

## Lưu điểm và kết nối lại

SQLite lưu cả bảng điểm từng ván và toàn bộ phòng sau mỗi thao tác, kèm bài riêng và mã phiên. Giao diện chỉ nhận bài của chính người đó. Dữ liệu BXH gắn với **phòng và chỗ ngồi**, không phải bảng toàn cầu theo tên; hai người trùng tên vẫn có điểm riêng.

- Tải lại đúng tab: tự quay lại chỗ, giữ bài và điểm.
- Đóng tab rồi mở lại link trên cùng trình duyệt: bấm **Khôi phục chỗ của tôi trên máy này**. Nếu thử nhiều người trên cùng trình duyệt, nút này nhớ chỗ cuối cùng đã vào cho phòng đó; giữ nguyên 4 tab để chơi thử.
- Thiết bị/trình duyệt khác không tự có quyền nhận lại chỗ cũ. Không xóa dữ liệu trang khi đang chơi.
- Cửa sổ mới nhận cùng phiên sẽ thay thế và ngắt cửa sổ cũ. Mã phiên được server sinh, không thể tự chọn mã khi tạo phòng.
- Không thay người giữa phòng đã chơi; người thứ năm bị từ chối. Link phòng là lời mời riêng, chỉ gửi cho nhóm bạn. Không có tài khoản/password hoặc xác thực danh tính ngoài mã phiên.
- Một server/instance duy nhất, không scale ngang với SQLite. Nếu DB còn trên máy cá nhân hoặc hosting có disk bền vững, restart khôi phục phòng/bài/điểm. Riêng Render Free: DB bị mất khi ngủ/restart/redeploy, cần tạo phòng mới. Đồng hồ lượt được tính lại 60 giây. Nếu không ai vào, bộ đếm vẫn chạy và tự đánh theo luật timeout.
- Quản trị viên hosting có quyền đọc DB và mã phiên; không công khai DB. Sao lưu toàn bộ SQLite (gồm WAL nếu server còn chạy), tốt nhất dừng dịch vụ hoặc dùng SQLite backup API trước khi copy. Khôi phục disk cũ có thể khôi phục cả phòng đang chơi cũ.

## Những gì đã thay đổi

- `rules.js`: nhận dạng bộ, luật đè/chặt, cấu hình và tính điểm thuần, có thể kiểm thử.
- `game.js`: sửa bỏ vòng, người về nhất giữ lượt, đóng ván và quyền riêng tư bài.
- `server.js`: xác thực socket đang giữ phiên, kiểm tra payload, giới hạn tần suất, timeout, lắng nghe 0.0.0.0 và PORT hosting cấp.
- `store.js`: giao dịch SQLite lưu phòng/điểm nguyên tử, khóa ván/người chống ghi điểm hai lần.
- `public/`: hiệu ứng chia bài và bay từ ghế vào bàn, sáng lượt, bảng mừng thắng/pháo giấy, âm thanh tùy chọn, giảm chuyển động, bố cục điện thoại, avatar, nút khôi phục chỗ.
- `test/`: luật, tính điểm, 100 ván mô phỏng, Socket.IO 4 người, dung lượng phòng, quyền chủ phòng, phiên thay thế, SQLite và timeout; bài kiểm thử Chromium chơi trọn ván qua nút giao diện.
- `render.yaml`, `package-lock.json`: cấu hình triển khai lặp lại được. Không cần chứa thư viện trong ZIP.

## Tài liệu hosting chính thức

- Node/Express: https://render.com/docs/deploy-node-express-app
- WebSocket: https://render.com/docs/websocket
- Disk bền vững (gói trả phí): https://render.com/docs/disks
- Giới hạn gói Free: https://render.com/docs/free

Nếu deploy lỗi: xem Logs, kiểm tra Node 24, file package.json nằm đúng root, Build/Start đúng như trên, DB_PATH nằm trong disk đã mount. Không dùng Static Site vì game cần máy chủ WebSocket chạy liên tục.
