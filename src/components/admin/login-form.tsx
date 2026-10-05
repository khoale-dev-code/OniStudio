"use client";
import { useActionState } from "react";
import { login } from "@/app/admin/actions";
export function LoginForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action}>
      <label className="form-field">
        <span>Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="username"
          maxLength={254}
        />
      </label>
      <label className="form-field">
        <span>Mật khẩu</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          maxLength={256}
        />
      </label>
      <button className="button" disabled={pending || !configured}>
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </button>
      {state.error && (
        <p role="alert" className="notice error">
          {state.error}
        </p>
      )}
    </form>
  );
}
