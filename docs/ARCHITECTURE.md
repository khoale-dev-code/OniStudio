# Kiến trúc Oni Studio

## 1. Yêu cầu

Landing page dẫn khách đến trang phòng/thiết bị rồi Messenger hoặc điện thoại. Không booking online, không thanh toán. Website VN/EN; admin tiếng Việt có Auth và RLS. Lưu dữ liệu Supabase, ảnh Cloudinary. Chạy được local khi chưa cấu hình dịch vụ.

## 2. Sitemap

`/`, `/studios`, `/studios/[slug]`, `/equipment`, `/equipment/[slug]`, `/services`, `/pricing`, `/gallery`, `/about`, `/contact`; bản tiếng Anh có tiền tố `/en`. Admin: `/admin/login`, `/admin`, `/admin/equipment`, `/admin/equipment/new`, `/admin/equipment/[id]`, `/admin/studios`, `/admin/studios/[id]`, `/admin/gallery`.

## 3. Design direction

Navy đậm làm nền hero/header/footer, các section nội dung trắng hoặc xám sáng. Accent kem từ palette được cung cấp. Hero dùng serif để tạo nét biên tập; phần còn lại dùng sans-serif dễ đọc tiếng Việt. Nhịp khoảng trắng thống nhất, card bo 10px, nút bo 6px. Mobile ưu tiên nội dung và CTA trước ảnh; menu drawer dùng native dialog, hỗ trợ Escape và focus. Các layout chuyển cột theo nội dung, không thu nhỏ nguyên desktop.

## 4. Component architecture

`Header`/`Footer`/`ContactCTA` dùng chung. `Hero`, `ServiceGrid`, `FAQ` phục vụ trang chủ và route liên quan. `StudioCard`, `EquipmentCard`, `EquipmentExplorer`, `GalleryGrid` phục vụ danh mục. Admin có form riêng và uploader. Data không gắn trong page; `catalog.ts` chọn nguồn Supabase hoặc local, `content.ts` và `site.ts` là nội dung chung. Hook không cần thiết không được thêm.

## 5. Data structure

| Bảng        | Cột chính                                                                                                                             | Quyền                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| studios     | slug, name, description JSONB {vi,en}, area, capacity, price, led_count, images[], published, sort_order                              | Public đọc mục công khai; admin ghi                  |
| equipment   | slug, name, category, description/specifications/unit JSONB {vi,en}, price nullable, included, status, image_url, featured, published | Public đọc mục công khai; admin CRUD                 |
| gallery     | title JSONB {vi,en}, category, image_url, published, sort_order                                                                       | Public đọc mục công khai; admin ghi                  |
| admin_users | user_id → auth.users                                                                                                                  | User chỉ đọc quyền của mình; chỉ SQL owner cấp quyền |

`is_admin()` là SECURITY DEFINER với search_path rỗng và tên schema rõ ràng. Không có đường dẫn tự cấp quyền. Database constraints và validation server đều kiểm tra dữ liệu cơ bản. Giá dùng số nguyên VND, null biểu thị cần báo giá; included không đồng nghĩa giá 0.

## 6. Luồng dữ liệu

Public Server Components → repository → Supabase anon client + RLS. Admin → Supabase cookie auth → server xác thực getUser → is_admin → action đã validate → RLS → revalidate layout. Upload → kiểm tra origin, auth và file → ký SHA1 trên server → Cloudinary → URL → lưu trong Supabase khi submit form. Secret không xuất ra client. Không cache thông tin xác thực công khai.

## 7. Giới hạn có chủ đích

Không kiểm kê số lượng hoặc lịch thiết bị theo ngày; “tình trạng” là trạng thái do admin cập nhật. Không giả ảnh công trình/thiết bị hoặc thành viên đội ngũ. Hero/room fallback là ảnh AI có nhãn. Giá gốc còn chỗ cần studio xác nhận đơn vị và thời lượng; xem README.

## Tài liệu tham khảo triển khai

- https://nextjs.org/docs/app/api-reference/file-conventions/proxy
- https://nextjs.org/docs/app/guides/authentication
- https://supabase.com/docs/guides/auth/server-side/creating-a-client
- https://cloudinary.com/documentation/upload_images#generating_authentication_signatures


## UI & Media update
- `use-media-upload.ts`: queue (3 concurrent XHR requests), preview URLs and cleanup, retry / abort.
- `ImageUpload`: pointer/touch drag with edge scrolling, keyboard and button reorder, hidden ordered URLs; parent save is disabled when incomplete and server validation also enforces this.
- `ProductGallery`: thumbnails, native modal, touch swiping and keyboard.
- `equipment-images.ts`: manufacturer fallback lookup; never writes over uploaded photos.
- `page-loading.tsx`: page-local Suspense fallback for index pages, not inherited by detail pages so notFound can retain 404.
- `NavLink`: native Next Link with useLinkStatus. No navigation timer or global click interception.
- `editorial.css`, `media.css`, `fonts.css`: visual tokens, responsive UI and locally hosted font subsets.
- `002_equipment_images.sql`: additive array column + legacy cover synchronization.
