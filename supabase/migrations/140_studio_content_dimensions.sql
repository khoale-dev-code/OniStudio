-- 140_studio_content_dimensions.sql
-- Oni Studio room content + optional advanced dimensions.
-- Safe to run more than once.

begin;

-- Keep the legacy capacity column for migration safety, but the application no
-- longer reads, edits or displays it. A default lets new room inserts omit it.
alter table public.studios
  alter column capacity set default 1;

alter table public.studios
  add column if not exists width_m numeric(8,2),
  add column if not exists length_m numeric(8,2),
  add column if not exists height_m numeric(8,2),
  add column if not exists show_dimensions boolean not null default false,
  add column if not exists detail_content jsonb not null default
  '{
    "intro_title": {
      "vi": "Sẵn sàng cho buổi chụp",
      "en": "Ready for your session"
    },
    "intro_body": {
      "vi": "Miễn phí đèn flash studio và {led_count} đèn LED Nanlite 300B. Hỗ trợ setup ánh sáng theo layout mẫu. Xác nhận danh sách và số lượng thiết bị khi đặt phòng.",
      "en": "Studio flashes and {led_count} Nanlite 300B LED light(s) are included. Reference-layout lighting assistance is available. Confirm the equipment list and quantities when reserving."
    },
    "amenities": {
      "vi": "Phông & bối cảnh | Tường trắng vô cực · Phông giấy 11 × 2.7m · Phông vải trơn và loang\nPhụ kiện trong phòng | Bàn chụp sản phẩm · Ghế / sofa tạo dáng · Bục trắng · Máy thổi gió · Bàn ủi hơi nước · Móc / sào treo quần áo\nTạo hình ánh sáng | Beauty dish 40/60cm · Floppy · Chóa đèn, barndoor · Dù phản · Hắt sáng · Gel màu · Snoot · Ngàm Optical · C-stand\nSoftbox | Parabolic P120L · Octagon 60/120/150cm · Stripbox 30 × 120cm, 35 × 160cm · Softbox 60 × 90cm · Nanlite Cầu 60",
      "en": "Backdrops & sets | White infinity wall · 11 × 2.7m paper backdrops · Plain and mottled fabric backdrops\nStudio accessories | Product table · Posing chairs / sofa · White plinths · Wind machine · Garment steamer · Clothing rack\nLight shaping | 40/60cm beauty dish · Floppy · Reflectors and barndoors · Umbrellas · Bounce · Gels · Snoot · Optical mount · C-stands\nSoftboxes | Parabolic P120L · 60/120/150cm octagons · 30 × 120cm and 35 × 160cm strips · 60 × 90cm softbox · Nanlite lantern 60"
    },
    "rules_title": {
      "vi": "Quy định & lưu ý",
      "en": "House rules & notes"
    },
    "rules": {
      "vi": "Hỗ trợ makeup tối đa 1 giờ trước lịch, tại khu chung.\nKhu vực chờ: tối đa 4 người mỗi ê-kíp.\nThêm người: 50.000đ/người; sau 22:00: +50.000đ/giờ.\nĐèn LED tổng công suất trên 500W: +50.000đ/giờ.",
      "en": "Up to one hour of early makeup in the shared area.\nWaiting area: up to four people per crew.\nExtra person: 50,000 VND/person; after 10 pm: +50,000 VND/hour.\nLED use over 500W total: +50,000 VND/hour."
    },
    "note": {
      "vi": "Vui lòng trao đổi quy định đặt cọc, đổi/hủy lịch và hoàn tiền với Oni trước khi xác nhận.",
      "en": "Confirm deposit, rescheduling, cancellation and refund terms with Oni before booking."
    },
    "inquiry_title": {
      "vi": "Cùng lên lịch nhé?",
      "en": "Plan your next shoot?"
    },
    "inquiry_body": {
      "vi": "Gửi tên {room_name}, ngày chụp, thời lượng và nhu cầu thiết bị cho Oni để kiểm tra lịch.",
      "en": "Send Oni the room name ({room_name}), date, duration and equipment needs to check availability."
    }
  }'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'studios_width_m_valid'
      and conrelid = 'public.studios'::regclass
  ) then
    alter table public.studios
      add constraint studios_width_m_valid
      check (width_m is null or (width_m > 0 and width_m <= 1000));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'studios_length_m_valid'
      and conrelid = 'public.studios'::regclass
  ) then
    alter table public.studios
      add constraint studios_length_m_valid
      check (length_m is null or (length_m > 0 and length_m <= 1000));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'studios_height_m_valid'
      and conrelid = 'public.studios'::regclass
  ) then
    alter table public.studios
      add constraint studios_height_m_valid
      check (height_m is null or (height_m > 0 and height_m <= 1000));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'studios_detail_content_object'
      and conrelid = 'public.studios'::regclass
  ) then
    alter table public.studios
      add constraint studios_detail_content_object
      check (jsonb_typeof(detail_content) = 'object');
  end if;
end
$$;

analyze public.studios;
notify pgrst, 'reload schema';

commit;
