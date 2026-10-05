> Báo cáo bản bàn giao đầu tiên. Kiểm tra mới nhất: [QA-UI-MEDIA.md](QA-UI-MEDIA.md).

# Kiểm tra bàn giao Oni Studio

Ngày kiểm tra: 04/10/2026. Dự án mới; không sửa dự án Windows hiện có của người dùng.

## Quality gates đã chạy

| Kiểm tra | Kết quả |
| --- | --- |
| `npm run typecheck` | PASS — Next type generation và TypeScript strict |
| `npm run lint` | PASS — ESLint, 0 lỗi/0 cảnh báo |
| `npm run build` | PASS — Next.js 16.3.8 production build |
| Mã hóa | 77 file văn bản kiểm tra UTF-8, không BOM, không ký tự lỗi U+FFFD |
| PowerShell | ASCII-safe; không BOM; không dùng `$Home`; validate target; backup ngoài project; env Base64; dừng nếu quality gate lỗi |

## Browser — Chromium + Playwright

78 lượt: 13 route ở 375, 430, 768, 1024, 1440 và 1920px. Tất cả HTTP 200, đúng 1 H1, không horizontal overflow, ảnh tải thành công. Kiểm tra ảnh lazy bằng cách kích hoạt tải và mở bảng giá gốc trước khi xác nhận, không nhầm ảnh chưa tải với ảnh lỗi. Không có lỗi JavaScript/hydration được ghi nhận.

Các route kiểm tra: `/`, `/studios`, `/studios/room-a`, `/equipment`, `/equipment/aputure-storm-400x`, `/services`, `/pricing`, `/gallery`, `/about`, `/contact`, `/admin/login`, `/en`, `/en/equipment`.

15 kiểm tra tương tác đạt:

- Mở menu mobile, đóng bằng Escape, chọn trang và đóng drawer.
- Tìm thiết bị, kết quả rỗng, xóa bộ lọc, lọc đèn LED.
- Chuyển VN → EN → VN: nội dung và `html lang` đồng bộ.
- Mở câu hỏi FAQ.
- Chặn khách chưa đăng nhập truy cập trang thêm thiết bị; chuyển đến login.
- API upload từ khách chưa đăng nhập trả 401; nguồn ngoài trả 403.
- Thiết bị không tồn tại trả 404.
- Phóng chữ 200% tại 1440px không gây tràn ngang.

Đã xem ảnh render trang chủ desktop và mobile. Ảnh chụp kèm trong `docs/preview-desktop.png`, `docs/preview-mobile.png`. Google Maps bên ngoài bị chặn chủ động trong môi trường QA; chưa xác nhận nội dung bản đồ/độ chính xác ghim.

## Database — kiểm tra cục bộ

14 kiểm tra đạt với PGlite (PostgreSQL chạy cục bộ), dùng auth schema giả lập để kiểm tra SQL/RLS:

- Migration chạy thành công; seed chạy lặp vẫn 3 phòng/26 thiết bị.
- Khách chỉ đọc bản ghi công khai, không tự cấp quyền admin.
- User thường không phải admin, không thêm/sửa thiết bị, không tự nâng quyền.
- Admin được nhận diện, đọc mục ẩn, thêm/sửa giá/xóa thiết bị.
- Database từ chối giá âm.

Đây không phải kiểm thử kết nối với Supabase Auth/PostgREST của tài khoản thật.

## Chưa thể xác minh trong môi trường này

- Đăng nhập bằng tài khoản Supabase thật, session refresh thực tế và CRUD qua giao diện với database của người dùng.
- Upload thực tế đến Cloudinary vì chưa có API key/secret.
- Native Windows PowerShell 5.1: đã rà soát source và encoding; chưa chạy trên Windows. Script sẽ tự chạy lại typecheck/lint/build trên máy người dùng.
- Browser khác Chromium và thiết bị vật lý.

Sau khi điền env, cần đăng nhập admin, thêm một thiết bị thử, upload ảnh, đổi giá, kiểm tra trang công khai rồi xóa mục thử. Xác nhận link Zalo/social và ảnh thật trước khi công khai website.
