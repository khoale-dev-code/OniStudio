"use client";

import { useActionState } from "react";
import {
  addEquipmentUnits,
  deleteEquipmentUnit,
  saveEquipmentUnit,
} from "@/app/admin/actions";
import { inventoryStatusLabels } from "@/data/site";
import { inventorySummary } from "@/lib/equipment";
import { Boxes, CheckCircle2, Clock3, PauseCircle, Plus, Save, Wrench } from "lucide-react";
import { DeleteForm } from "./delete-form";
import type { EquipmentUnit } from "@/types/catalog";

type InventoryTone = "total" | "available" | "rented" | "maintenance" | "unavailable";

function UnitRow({
  equipmentId,
  unit,
}: {
  equipmentId: string;
  unit: EquipmentUnit;
}) {
  const [state, action, pending] = useActionState(
    saveEquipmentUnit.bind(null, equipmentId, unit.id),
    {},
  );

  return (
    <article className="inventory-unit-card">
      <form action={action} className="inventory-unit-form">
        <label className="form-field">
          <span>Mã / nhãn</span>
          <input
            name="label"
            defaultValue={unit.label}
            required
            maxLength={80}
          />
        </label>

        <label className="form-field">
          <span>Tình trạng</span>
          <select name="status" defaultValue={unit.status}>
            {Object.entries(inventoryStatusLabels).map(([key, label]) => (
              <option value={key} key={key}>
                {label.vi}
              </option>
            ))}
          </select>
        </label>

        <div className="inventory-unit-actions">
          <button className="button button-small inventory-save-button" disabled={pending}>
            <Save size={16} aria-hidden="true" />
            <span>{pending ? "Đang lưu..." : "Lưu"}</span>
          </button>
        </div>

        {state.error && (
          <p className="notice error inventory-message" role="alert">
            {state.error}
          </p>
        )}

        {state.success && (
          <p className="notice success inventory-message" role="status">
            {state.success}
          </p>
        )}
      </form>

      <div className="inventory-unit-delete">
        <DeleteForm
          action={deleteEquipmentUnit.bind(null, equipmentId, unit.id)}
          label={`thiết bị vật lý ${unit.label}`}
        />
      </div>
    </article>
  );
}

export function InventoryManager({
  equipmentId,
  units,
}: {
  equipmentId: string;
  units: EquipmentUnit[];
}) {
  const [state, action, pending] = useActionState(
    addEquipmentUnits.bind(null, equipmentId),
    {},
  );
  const summary = inventorySummary(units);

  const summaryCards: {
    key: InventoryTone;
    label: string;
    value: number;
    icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  }[] = [
    { key: "total", label: "Tổng", value: summary.total, icon: Boxes },
    { key: "available", label: "Sẵn sàng", value: summary.available, icon: CheckCircle2 },
    { key: "rented", label: "Đang cho thuê", value: summary.rented, icon: Clock3 },
    { key: "maintenance", label: "Bảo trì", value: summary.maintenance, icon: Wrench },
    { key: "unavailable", label: "Tạm ngừng", value: summary.unavailable, icon: PauseCircle },
  ];

  return (
    <section className="inventory-panel inventory-panel--enhanced" aria-labelledby="inventory-heading">
      <div className="inventory-heading">
        <div>
          <p className="eyebrow">INVENTORY</p>
          <h2 id="inventory-heading">Số lượng & tình trạng từng thiết bị</h2>
          <p className="muted">
            Mỗi dòng là một thiết bị vật lý. Tổng số lượng được tính tự động từ
            danh sách bên dưới.
          </p>
        </div>
      </div>

      <div className="inventory-summary inventory-summary-grid">
        {summaryCards.map((item) => {
          const Icon = item.icon;
          return (
            <article className={`inventory-stat-card inventory-stat-card--${item.key}`} key={item.key}>
              <div className={`inventory-stat-icon inventory-stat-icon--${item.key}`} aria-hidden="true">
                <Icon size={20} strokeWidth={2.15} />
              </div>
              <div className="inventory-stat-content">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            </article>
          );
        })}
      </div>

      <div className="inventory-add-shell">
        <div className="inventory-add-head">
          <h3>Thêm nhanh số lượng</h3>
          <p className="muted">Thêm từ 1 đến 50 thiết bị vật lý mỗi lần.</p>
        </div>

        <form action={action} className="inventory-add-form">
          <label className="form-field">
            <span>Số lượng</span>
            <input
              type="number"
              name="count"
              min="1"
              max="50"
              step="1"
              required
              defaultValue="1"
            />
          </label>

          <label className="form-field">
            <span>Tình trạng ban đầu</span>
            <select name="status" defaultValue="available">
              {Object.entries(inventoryStatusLabels).map(([key, label]) => (
                <option value={key} key={key}>
                  {label.vi}
                </option>
              ))}
            </select>
          </label>

          <button className="button inventory-add-button" disabled={pending}>
            <Plus size={18} aria-hidden="true" />
            <span>{pending ? "Đang thêm..." : "Thêm vào tồn kho"}</span>
          </button>
        </form>
      </div>

      {state.error && (
        <p className="notice error" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="notice success" role="status">
          {state.success}
        </p>
      )}

      <div className="inventory-list">
        {units.map((unit) => (
          <UnitRow key={unit.id} equipmentId={equipmentId} unit={unit} />
        ))}
        {!units.length && (
          <p className="notice">
            Chưa khai báo số lượng. Hãy thêm thiết bị vật lý để theo dõi đang
            cho thuê, bảo trì hoặc sẵn sàng.
          </p>
        )}
      </div>
    </section>
  );
}
