# Giao diện Bảng giá Oni Studio

## File thay đổi

Sửa `src/app/(site)/pricing/page.tsx`.

Tạo mới:
- `src/components/pricing/room-rate-card.tsx`
- `src/components/pricing/equipment-rates.tsx`
- `src/components/pricing/pricing-notes.tsx`
- `src/data/pricing.ts`
- `src/styles/pricing.css`
- `docs/UPGRADE-PRICING.md`

## Tính năng

Thẻ phòng dễ so sánh diện tích, sức chứa, thiết bị đi kèm và giá. Phòng có diện tích lớn hơn được nhấn màu xanh. Giá phòng và thiết bị lấy từ getCatalog(), tiếp tục sử dụng Supabase và admin hiện có.

Thiết bị có ảnh thu nhỏ, tìm kiếm không dấu, lọc nhóm và chuyển giữa thuê thêm/kèm phòng. Ảnh Cloudinary do admin tải lên được ưu tiên. Ảnh tham khảo từ hãng có chú thích. Giữ nguyên dữ liệu giá và đơn vị; thời lượng thuê cần được xác nhận trực tiếp.

Phụ phí được trình bày riêng; các điều khoản hiện có được chuyển vào src/data/pricing.ts. Bảng giá ảnh gốc có thể mở bằng chuột/bàn phím, có lưu ý tham khảo vì đây là ảnh tĩnh.

Trang dùng Server Component; chỉ bộ lọc có state phía client. CSS riêng, không thêm dependency. Hỗ trợ VN/EN, reduced motion, mobile/tablet/desktop.

## Áp dụng bản vá

Dành cho dự án Oni Studio sau bản nâng cấp UI/media v3. Dừng dev server bằng Ctrl+C, lưu script vào D:\Downloads và chạy:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "D:\Downloads\Update-OniStudio-Pricing.ps1" -TargetPath "D:\freetime\OniStudio" -StartDev
```

Script ASCII-safe, nội dung UTF-8 nhúng Base64, ghi UTF-8 không BOM. Manifest có object gốc với thuộc tính files, tránh lỗi mảng ConvertFrom-Json trên PowerShell 5.1.

Script kiểm tra target/checksum/xung đột trước khi ghi. Backup ngoài project tại D:\freetime\OniStudio-backups\<thời-gian>-pricing-<id>. Nếu source đã được tự sửa, script dừng và liệt kê file để merge; không ghi đè thay đổi chưa biết.

Dùng node_modules hiện có; npm ci chỉ khi thiếu dependency. Chạy typecheck, lint, build trước khi StartDev. Nếu gate thất bại, backup được giữ lại và script thông báo đường dẫn. Không thay schema, tài khoản hoặc dữ liệu Supabase; không chạy migration/seed.

## URL

- http://localhost:3000/pricing
- http://localhost:3000/en/pricing

## Kiểm tra

Typecheck, ESLint và production build đạt.

VN/EN ở 375, 430, 768, 1024, 1440 và 1920px: 12 kiểm tra đạt; một h1, không tràn ngang/ảnh lỗi. 15 kiểm tra tương tác đạt: tìm không dấu, giá, lọc/đổi hình thức thuê, trạng thái rỗng, reset, liên kết chi tiết, bảng giá gốc, bàn phím, menu/mobile, VN/EN, chữ 200% và reduced motion. Không phát hiện lỗi JavaScript/hydration.

Kiểm tra dùng dữ liệu danh mục nội bộ; chưa kiểm thử Supabase trực tiếp vì không có credentials. Script được kiểm tra cú pháp, giải mã, ghi và SHA-256 bằng PowerShell 7 Linux, kèm mô phỏng cách trả mảng của PowerShell 5.1. Chưa chạy trên Windows PowerShell 5.1 thực tế.
