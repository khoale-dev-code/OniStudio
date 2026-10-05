"use client";

import { useActionState } from "react";
import type { ActionState } from "@/types/catalog";

export function DeleteForm({
  action,
  label,
  buttonLabel,
  confirmMessage,
  className,
}: {
  action: (state: ActionState) => Promise<ActionState>;
  label: string;
  buttonLabel?: string;
  confirmMessage?: string;
  className?: string;
}) {
  const [state, submit, pending] = useActionState(action, {});

  return (
    <form
      action={submit}
      className={className}
      onSubmit={(event) => {
        const message =
          confirmMessage ||
          `Xóa ${label}? Bản ghi sẽ bị xóa khỏi website. Ảnh gốc trên Cloudinary được giữ lại.`;
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      <button className="button danger-button" disabled={pending} type="submit">
        {pending ? "Đang xóa…" : buttonLabel || `Xóa ${label}`}
      </button>
      {state.error && (
        <p role="alert" className="notice error">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="notice success">
          {state.success}
        </p>
      )}
    </form>
  );
}
