export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="admin-title">
        <div>
          <p className="eyebrow">ONI STUDIO / ADMIN</p>
          <h1>Đang tải dữ liệu...</h1>
          <p>Đang đồng bộ nội dung quản trị. Vui lòng chờ trong giây lát.</p>
        </div>
      </div>

      <div className="admin-grid">
        <div className="stat-card">
          <span>Đang tải</span>
          <strong>•••</strong>
        </div>
        <div className="stat-card">
          <span>Đang tải</span>
          <strong>•••</strong>
        </div>
        <div className="stat-card">
          <span>Đang tải</span>
          <strong>•••</strong>
        </div>
      </div>
    </div>
  );
}
