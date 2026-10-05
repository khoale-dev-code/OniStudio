"use client";

import { useState } from "react";

function normalizeDigits(value: string) {
  const digits = value.replace(/[^\d]/g, "").slice(0, 10);
  return digits.replace(/^0+(?=\d)/, "");
}

function displayVnd(raw: string) {
  if (!raw) return "";
  const amount = Number(raw);
  if (!Number.isFinite(amount)) return "";
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(amount);
}

export function VndInput({
  name,
  defaultValue,
  placeholder = "250.000",
}: {
  name: string;
  defaultValue?: number | null;
  placeholder?: string;
}) {
  const [raw, setRaw] = useState(
    defaultValue === null || defaultValue === undefined
      ? ""
      : String(defaultValue),
  );
  const formatted = displayVnd(raw);

  return (
    <div className="money-input">
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={formatted}
        placeholder={placeholder}
        aria-label="Giá thuê bằng Việt Nam đồng"
        onChange={(event) => setRaw(normalizeDigits(event.target.value))}
      />
      <span aria-hidden="true">VNĐ</span>
      <input type="hidden" name={name} value={raw} />
    </div>
  );
}
