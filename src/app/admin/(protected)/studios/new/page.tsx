import { StudioForm } from "@/components/admin/studio-form";

export default function NewStudioPage() {
  return (
    <>
      <div className="admin-title">
        <div>
          <p className="eyebrow">NEW ROOM</p>
          <h1>Thêm phòng studio</h1>
          <p>Tạo phòng mới, nhập giá thuê và bổ sung hình ảnh không gian thực tế.</p>
        </div>
      </div>
      <StudioForm />
    </>
  );
}
