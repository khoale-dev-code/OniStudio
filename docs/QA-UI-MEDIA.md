# Kiểm tra UI & Media — 05/10/2026

## Quality gate cuối cùng

| Lệnh | Kết quả |
| --- | --- |
| npm run typecheck | PASS — TypeScript strict |
| npm run lint | PASS — 0 lỗi, 0 cảnh báo ESLint |
| npm run build | PASS — Next.js 16.3.8 production |

Không bỏ qua TypeScript hoặc ESLint. Route kiểm thử tạm đã được gỡ trước production build. Lỗi TypeScript ở thao tác kéo ảnh và cache type của route thử nghiệm đã được sửa; các lệnh đã chạy lại thành công.

## Trình duyệt

78 lượt kiểm tra trên production build: 13 route × 375, 430, 768, 1024, 1440, 1920px. Không tràn ngang, mỗi trang đúng một H1, ảnh tải thành công, không ghi nhận lỗi JavaScript/hydration. Bao gồm VN/EN, trang chi tiết, liên hệ và đăng nhập admin. Font tiếng Việt được phục vụ từ thư mục public/fonts.

15 tương tác công khai đạt: menu mobile/Escape, điều hướng, tìm kiếm/bộ lọc, chuyển ngữ, FAQ, phóng chữ 200%, kiểm soát truy cập admin/API, 404 cho thiết bị không tồn tại. Loading đã được giới hạn ở trang danh sách để không làm mất mã 404 của trang chi tiết.

25 kiểm tra media đạt trên trình duyệt với phản hồi upload giả lập: tải đồng thời tối đa 3 ảnh; chặn Lưu khi tải/lỗi; thử lại; giữ thứ tự khi phản hồi về khác thứ tự; kéo bằng chuột và cảm ứng; phím mũi tên; giới hạn 12 ảnh; file không hỗ trợ; kéo file vào vùng upload; bỏ ảnh đang tải; thumbnail; xem lớn/Escape/phím chuyển ảnh; layout admin tại 6 chiều rộng.

## Database

20 kiểm tra trên PGlite/PostgreSQL cục bộ, với auth schema mô phỏng: migration/seed, chạy lại migration 002, backfill ảnh cũ, lưu thứ tự và ảnh bìa, tương thích image_url cũ, bỏ hết ảnh, giới hạn 12 ảnh, quyền đọc/ghi và ngăn user tự cấp quyền admin.

## Phạm vi chưa kiểm chứng trực tiếp

- Chưa kết nối project Supabase và Cloudinary thật của chủ studio. Luồng upload UI dùng phản hồi giả lập; cần xác nhận upload/lưu/reload bằng tài khoản admin trên môi trường đã cấu hình của bạn.
- Responsive được kiểm tra bằng Chromium viewport và touch emulation, chưa chạy trên thiết bị iOS/Safari vật lý.
- PowerShell được kiểm tra tĩnh, ASCII, UTF-8/no-BOM, hash và Base64 round-trip. Môi trường hiện tại không có Windows PowerShell 5.1 để chạy toàn bộ script; script sẽ chạy đủ quality gate trên máy Windows khi áp dụng.

Báo cáo máy: qa-ui-media-public.json, qa-ui-media-interactions.json, qa-ui-media-database.json. preview-admin-media.png minh họa component bằng fixture kiểm thử, không phải phiên admin Supabase thật.
