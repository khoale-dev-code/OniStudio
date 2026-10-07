"use client";

import { useActionState } from "react";
import { LockKeyhole, Mail } from "lucide-react";
import { login } from "@/app/admin/actions";

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(login, {});

  return (
    <form action={action} className="login-form-v2">
      <label className="form-field login-field-v2">
        <span>Email</span>
        <div className="login-input-shell">
          <Mail size={18} aria-hidden="true" />
          <input
            type="email"
            name="email"
            required
            autoComplete="username"
            maxLength={254}
            placeholder="admin@onistudio.vn"
          />
        </div>
      </label>

      <label className="form-field login-field-v2">
        <span>Mật khẩu</span>
        <div className="login-input-shell">
          <LockKeyhole size={18} aria-hidden="true" />
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            maxLength={256}
            placeholder="Nhập mật khẩu"
          />
        </div>
      </label>

      <button
        className="button login-submit-v2"
        disabled={pending || !configured}
      >
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </button>

      {state.error && (
        <p role="alert" className="notice error login-error-v2">
          {state.error}
        </p>
      )}
    </form>
  );
}
