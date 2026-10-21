# Bản tải lên bằng các file rời

Bản này đã được điều chỉnh để KHÔNG CẦN tạo hoặc kéo thả thư mục public/test.

1. GitHub → Add file → Upload files → choose your files.
2. Mở D:\chatbotdigital\TIEN_LEN_UPLOAD_DE_DANG.
3. Chọn toàn bộ file trong đó rồi Open. Bấm Commit changes.
4. Các file cùng tên trên GitHub sẽ được thay bằng bản mới này. Các file index.html/client.js/style.css nằm cùng cấp với server.js là ĐÚNG cho bản này.
5. Render → New → Web Service → kết nối repo tien-len-office.
6. Branch main; Root Directory để trống; Runtime Node; Build npm ci && npm run build; Start npm start; Instance Free ($0); thêm Environment NODE_VERSION=24.
7. Không disk, không database ngoài, không DB_PATH. Bấm Deploy Web Service.
8. Đợi Live → mở URL .onrender.com được cấp → tạo phòng → sao chép link mời gửi 3 người.

Render Free có thể mất phòng/điểm khi ngủ/restart/redeploy. Tạo phòng mới rồi gửi lại link mời nếu phòng mất. Điểm reset trước ván đầu ngày mới theo giờ Việt Nam. Link trang game giữ nguyên.

Tài liệu: https://render.com/docs/free và https://render.com/docs/deploy-node-express-app .
