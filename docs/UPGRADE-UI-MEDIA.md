# Cập nhật Oni Studio: UI & thư viện ảnh

## Áp dụng vào dự án đang dùng

1. Dừng `npm run dev` bằng Ctrl+C. Giải nén ZIP ra một thư mục riêng, không chép đè dự án thủ công.
2. Trong Supabase → SQL Editor, chạy **chỉ** nội dung `OniStudio/supabase/migrations/002_equipment_images.sql`. Cần đã có migration 001 từ bản cũ. Không chạy lại `seed.sql` trên dữ liệu đang sử dụng.
3. Mở PowerShell tại thư mục giải nén có `Apply-UI-Media-Update.ps1`, chạy:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Apply-UI-Media-Update.ps1 -TargetPath "D:\freetime\OniStudio" -StartDev
```

Đổi `-TargetPath` nếu dự án thực tế nằm ở `D:\freelancer\OniStudio` hoặc nơi khác. Script không tạo target khi thiếu, không hỏi giữa chừng và không ghi đè `.env.local`.

Script kiểm tra đúng project `oni-studio`, Node.js >=22, đường dẫn và SHA-256 của các file liên quan trước khi ghi. Nếu phát hiện source đã được bạn chỉnh khác với bản gốc, script **dừng trước khi sửa** và liệt kê file xung đột. Khi đó cần hợp nhất thay đổi trên chính source hiện tại; không tự xóa file để vượt qua kiểm tra.

Backup toàn bộ project (trừ node_modules, .next, .git và cache TypeScript) nằm tại thư mục `OniStudio-backups` cùng cấp với project. Script lưu file tiếng Việt bằng Base64 UTF-8, ghi UTF-8 không BOM, rồi chạy `npm ci`, `npm run typecheck`, `npm run lint`, `npm run build`. Chỉ mở dev server nếu mọi bước thành công và có `-StartDev`.

Nếu quality gate lỗi, script dừng, in đường dẫn backup. Khôi phục bằng cách dừng Node, đổi tên thư mục project hiện tại, chép bản backup về đúng vị trí rồi chạy `npm ci`. Backup chứa `.env.local` nếu trước đó có. Giữ file này riêng tư. Migration 002 là bổ sung; có thể giữ nguyên khi quay lại UI cũ.

## Chạy như dự án mới

Dùng thư mục `OniStudio` trong ZIP. Không có node_modules, .next hoặc khóa bí mật trong gói. Chạy `Setup-OniStudio.ps1 -TargetPath <đường dẫn đã giải nén>`. Điền `.env.local` theo README; trong Supabase mới chạy lần lượt 001, 002 rồi seed. Dự án vẫn chạy catalog mẫu khi chưa cấu hình Supabase, nhưng admin cần Supabase và quyền trong `admin_users`.

## Thao tác ảnh

- `/admin/equipment/new` hoặc `/admin/equipment/[id]`: chọn/kéo thả nhiều ảnh; tối đa 12 ảnh, 8 MB/ảnh, JPEG/PNG/WebP.
- Ảnh xem trước xuất hiện ngay; hàng đợi tải tối đa 3 ảnh cùng lúc. Tiến trình là lúc gửi lên máy chủ; sau đó hiển thị xử lý Cloudinary.
- Nắm biểu tượng kéo ở chân ảnh, thả lên ảnh muốn đổi vị trí. Trên mobile, kéo tới mép màn hình để cuộn. Có thể dùng nút trước/sau hoặc phím mũi tên trên tay nắm.
- Ảnh đầu là ảnh bìa. Đổi thứ tự chỉ được lưu vào database khi bấm **Lưu**.
- Khi còn ảnh tải hoặc ảnh lỗi, nút Lưu bị khóa. Thử lại từng ảnh lỗi hoặc bỏ ảnh đó.
- Bỏ ảnh gỡ liên kết khi lưu, **không xóa file gốc trên Cloudinary**. Rời trang trước khi lưu có thể để lại file chưa sử dụng trên Cloudinary.
- Trang sửa phòng dùng cùng bộ chọn ảnh. Gallery cho thêm tối đa 12 ảnh theo một bộ, dùng chung tiêu đề/danh mục; thứ tự trong bộ được lưu từ giá trị “Thứ tự” đã nhập. Thứ tự giữa các bộ dùng trường `sort_order`.
- Thiết bị và phòng công khai có thumbnail, phóng to, phím trái/phải, Escape và vuốt ảnh. Ảnh sản phẩm từ hãng là tham khảo; ảnh bạn upload có ưu tiên cao nhất.

## Chuyển trang và thiết kế

Nền trắng ngà / đen than / cobalt, Manrope hỗ trợ dấu tiếng Việt và tải từ máy chủ của bạn. Bố cục mobile riêng, ảnh lớn và hệ thống khoảng cách nhất quán. Link dùng Next.js navigation, báo trạng thái khi chờ, skeleton tại các trang danh sách và hiệu ứng hiện trang 220ms. Không trì hoãn click và không chiếm quyền cuộn; hỗ trợ reduced motion.

Các URL cũ được giữ nguyên: `/`, `/studios`, `/studios/[slug]`, `/equipment`, `/equipment/[slug]`, `/services`, `/pricing`, `/gallery`, `/about`, `/contact`; tiếng Anh thêm `/en`. Các route admin giữ nguyên.

## Supabase & Cloudinary

Migration 002 thêm `equipment.images` kiểu `text[]`, backfill ảnh đơn cũ, giới hạn 12 ảnh, đồng bộ `image_url` với ảnh đầu để hỗ trợ bản cũ. Giữ tài khoản, RLS, giá và dữ liệu khác. Không đưa mật khẩu hay service-role key vào frontend.

Các biến môi trường vẫn như trước: Supabase URL/publishable key, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Hai khóa cuối chỉ ở server. API upload vẫn yêu cầu phiên admin, kiểm tra nguồn yêu cầu, kích thước và chữ ký loại file.

Xem `QA-UI-MEDIA.md` để biết phạm vi kiểm tra và `CHANGED-FILES.md` để xem danh sách file.
