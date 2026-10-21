# Hướng dẫn Render FREE — Tiến Lên 4 người

Bản này dùng **một Web Service Free**, không disk, không database bên ngoài, không chọn gói trả phí. Bạn không cần cài Node hay chạy terminal để triển khai theo cách dưới đây.

## Bước 1 — Tải bản mới, giải nén

Tải `tien-len-4-nguoi-free.zip` được gửi trong chat. Chuột phải → Extract All / Giải nén tất cả. Mở thư mục vừa giải nén: thấy trực tiếp `package.json`, `package-lock.json`, `server.js`, `daily-scores.js`, `render.yaml`, thư mục `public`, `test` và các file còn lại.

Dùng bản ZIP Free mới, vì bản trước có cấu hình Starter và disk trả phí. Không tải ZIP nguyên khối lên GitHub.

## Bước 2 — Tạo tài khoản GitHub

1. Mở https://github.com/signup .
2. Nhập email, đặt mật khẩu và tên tài khoản theo màn hình.
3. Xác minh email và đăng nhập.
4. Không cần mua GitHub Pro; tài khoản cá nhân miễn phí là đủ.

## Bước 3 — Đưa game lên GitHub

1. Bấm dấu **+** phía trên → **New repository** (hoặc mở https://github.com/new).
2. Repository name: `tien-len-office`.
3. Chọn **Public** (công khai mã nguồn; bài trên tay và phòng đang chơi không nằm trong mã nguồn).
4. Không thêm README/gitignore mẫu vì bộ game đã có sẵn. Bấm **Create repository**.
5. Ở trang repository trống, bấm **uploading an existing file**. Nếu không thấy, dùng **Add file → Upload files**.
6. Trong thư mục đã giải nén, chọn **toàn bộ file và thư mục bên trong** rồi kéo vào vùng tải file của GitHub. Không kéo thư mục bọc bên ngoài, không kéo nguyên ZIP.
7. Đợi tải xong, nhập mô tả `Upload game Tien Len Free` và bấm **Commit changes**.
8. Kiểm tra trang repo: `package.json`, `server.js`, `daily-scores.js`, `render.yaml` phải xuất hiện ngay cấp gốc; `public` là một thư mục, bên trong có `index.html`, `client.js`, `style.css`.

Nếu đã tải bản trước: dùng **Add file → Upload files**, tải đè toàn bộ file bản Free mới và commit. Kiểm tra render.yaml đã là `plan: free`, không còn mục `disk` hay `DB_PATH=/var/data/...`.

## Bước 4 — Tạo tài khoản Render

1. Mở https://dashboard.render.com/register .
2. Chọn đăng ký/đăng nhập bằng **GitHub** nếu có, rồi xác nhận kết nối tài khoản.
3. Dùng workspace cá nhân miễn phí. Không nâng cấp workspace để chơi game này.
4. Nếu Render yêu cầu xác minh tài khoản, làm theo hướng dẫn chính thức. Không gửi mật khẩu/mã xác minh cho người khác. Chỉ tiếp tục khi màn hình tạo dịch vụ cho phép chọn Free.

## Bước 5 — Tạo Web Service miễn phí

1. Mở https://dashboard.render.com .
2. Bấm **New + → Web Service**. Chọn **Web Service**, không chọn Static Site.
3. Chọn kết nối repository GitHub. Nếu được hỏi cấp quyền, chọn riêng repo `tien-len-office` và xác nhận.
4. Chọn repo `tien-len-office`, bấm **Connect** nếu có nút này.
5. Điền cấu hình:

| Trường | Giá trị |
|---|---|
| Name | `tien-len-office` hoặc tên khác nếu đã bị dùng |
| Region | Singapore nếu danh sách có; nếu không, giữ vùng mặc định |
| Branch | `main` (hoặc đúng nhánh chứa mã nguồn của bạn) |
| Root Directory | **Để trống** nếu package.json ở cấp gốc |
| Language / Runtime | **Node** |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm start` |
| Instance Type / Compute Plan | **Free — $0** |

6. Mở **Environment Variables** và thêm `NODE_VERSION` = `24`. Có thể thêm `NODE_ENV` = `production`.
7. Nếu có **Health Check Path**, điền `/health`. Nếu chưa có, có thể đặt sau khi tạo trong Settings.
8. **Không thêm Disk, Postgres, Key Value hoặc dịch vụ nào khác. Không đặt DB_PATH=/var/data/game.sqlite. Không đặt PORT thủ công.**
9. Xem lại: compute plan phải là **Free**, không hiển thị phí thuê máy hàng tháng. Nếu đang là Starter hoặc gói có giá, đổi lại Free trước khi tiếp tục.
10. Bấm **Deploy Web Service / Create Web Service** theo tên nút đang hiển thị.

Tên nút có thể thay đổi theo giao diện Render; các giá trị cấu hình ở trên vẫn là phần cần đối chiếu. Cấu hình render.yaml mới cũng đã là Free, nhưng hướng dẫn này dùng tạo thủ công để bạn nhìn rõ gói $0.

## Bước 6 — Chờ Live và lấy link

1. Ở trang dịch vụ, mở **Events / Logs** để theo dõi build.
2. Đợi trạng thái **Live**. Dòng log thành công của game có nội dung “Tiến Lên đang chạy tại cổng ...”. Render tự cấp PORT.
3. Tìm URL `https://TEN-DICH-VU.onrender.com` ở trang dịch vụ, bấm mở.
4. Đây là link Internet thật của game, chỉ có sau khi deploy thành công. Tên thực tế do Render cấp, không tự chép một tên ví dụ rồi gửi cho bạn bè.
5. Bạn có thể tắt máy tính sau khi đã deploy; game chạy trên Render.

## Bước 7 — Mời 3 đồng nghiệp

1. Bạn mở link game, nhập tên, chọn ảnh nếu muốn → **Tạo phòng mới**.
2. Bấm **Sao chép link mời**. Link mời có dạng `https://TEN-THAT.onrender.com/room/ABC123` — đây chỉ là mẫu, dùng link game thực sự sao chép.
3. Gửi **cùng link phòng** cho 3 đồng nghiệp.
4. Mỗi người mở link trên điện thoại/trình duyệt của mình, nhập tên → **Vào phòng**. Họ không cần đăng ký tài khoản GitHub/Render.
5. Chủ phòng nhìn thấy **4/4 người** → **Bắt đầu ván**.
6. Ván sau chủ phòng bấm **Chơi ván tiếp**. Bảng điểm cộng dồn trong phiên/phòng hiện tại.

## Điểm ngày mới và giới hạn miễn phí

- Game đưa điểm về **0 trước ván đầu của ngày mới theo giờ Việt Nam (UTC+7)**. Không xóa điểm giữa ván đang chơi qua nửa đêm. Không cần Cron Job hay dịch vụ lịch trả phí.
- Render Free có thể ngủ sau **15 phút không có lưu lượng đến**, sau đó mất khoảng **một phút** để thức khi mở lại link.
- SQLite/phòng/bài/điểm trên ổ đĩa tạm **mất khi dịch vụ ngủ, restart hoặc redeploy**. Vì vậy **không đảm bảo giữ điểm đủ một ngày**; có thể mất nhiều lần trong ngày. Dùng để chơi vui theo buổi là phù hợp hơn.
- Nếu phòng cũ không còn: game đưa bạn về màn hình tạo phòng; bạn tạo phòng mới rồi gửi lại **link phòng mới** cho cả nhóm. **Link trang game .onrender.com vẫn giữ nguyên** nếu bạn không xóa/tạo lại dịch vụ hay đổi tên miền.
- Render cấp 750 giờ Free mỗi workspace/tháng, dùng chung cho các Web Service Free trong workspace. Vẫn có hạn mức băng thông và build. Xem Usage/Billing trong dashboard, không thêm dịch vụ/gói có phí nếu bạn chỉ muốn dùng Free. Nếu không thêm phương thức thanh toán, tài liệu Render nói rằng vượt hạn mức sẽ tạm dừng dịch vụ/build thay vì thu phần vượt hạn mức. Render có thể yêu cầu xác minh tài khoản theo trường hợp.
- Không cần dịch vụ giữ máy luôn thức; chấp nhận ngủ và tạo phòng mới khi chơi lại.

## Nếu lỗi

- **npm không thấy package.json / ENOENT:** file bị nằm trong thư mục bọc. Đưa nội dung ra cấp gốc GitHub, hoặc đặt Root Directory trỏ đúng thư mục đang chứa package.json.
- **npm ci báo thiếu lockfile:** tải thêm `package-lock.json` từ ZIP cùng bản, rồi deploy lại.
- **Không tìm thấy daily-scores.js:** chưa tải đủ bản Free. Upload file này ở cấp gốc và commit.
- **Lỗi node:sqlite / phiên bản Node:** kiểm tra Environment `NODE_VERSION=24`, deploy lại.
- **Lỗi ghi /var/data:** xóa biến `DB_PATH` cũ; bản Free không có disk. Deploy lại.
- **Mở link thấy đang tải:** đợi khoảng một phút vì server đang thức; không liên tục bấm tạo phòng.
- **Game chỉ một người / thiếu bạn:** cả nhóm phải dùng cùng link **/room/XXXXXX**, không mỗi người tự tạo phòng.
- **Phòng không tồn tại:** chủ phòng tạo phòng mới và gửi link mới, do server Free đã mất dữ liệu.
- **Người thứ năm:** phòng chỉ nhận đúng 4 người; không dùng tài khoản/máy khác để thay chỗ giữa phòng đã chơi.
- **Đã tạo gói trả phí ở lần trước:** việc upload YAML Free chưa tự đổi gói cho dịch vụ đã tạo thủ công. Vào dịch vụ **Settings → Instance Type/Compute → Free**, kiểm tra và gỡ disk/dịch vụ trả phí không dùng; hoặc xóa dịch vụ cũ khi không cần rồi tạo Web Service Free mới. Kiểm tra Billing vì thay cấu hình không hủy khoản đã phát sinh trước đó.

Tài liệu chính thức được đối chiếu ngày 21/10/2026:

- https://render.com/docs/your-first-deploy
- https://render.com/docs/deploy-node-express-app
- https://render.com/docs/free
- https://render.com/docs/blueprint-spec
