"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  LoaderCircle,
  X,
} from "lucide-react";

type SnackbarKind = "success" | "error" | "loading" | "info";

type SnackbarItem = {
  id: number;
  kind: SnackbarKind;
  title: string;
  message?: string;
};

type PendingAction = {
  from: string;
  success: string;
  startedAt: number;
};

const STORAGE_KEY = "oni-admin-pending-action";
const MAX_SNACKBARS = 3;

function actionCopy(label: string) {
  const value = label.toLowerCase();

  if (value.includes("xóa") || value.includes("delete")) {
    return {
      loading: "Đang xóa dữ liệu…",
      success: "Đã xóa thành công.",
    };
  }

  if (value.includes("đăng nhập") || value.includes("login")) {
    return {
      loading: "Đang đăng nhập…",
      success: "Đăng nhập thành công.",
    };
  }

  if (value.includes("đăng xuất") || value.includes("logout")) {
    return {
      loading: "Đang đăng xuất…",
      success: "Đã đăng xuất.",
    };
  }

  if (
    value.includes("thêm") ||
    value.includes("tạo") ||
    value.includes("add") ||
    value.includes("create")
  ) {
    return {
      loading: "Đang tạo dữ liệu…",
      success: "Đã tạo thành công.",
    };
  }

  if (
    value.includes("lưu") ||
    value.includes("cập nhật") ||
    value.includes("save") ||
    value.includes("update")
  ) {
    return {
      loading: "Đang lưu thay đổi…",
      success: "Đã lưu thay đổi.",
    };
  }

  return {
    loading: "Đang xử lý…",
    success: "Thao tác đã hoàn tất.",
  };
}

function SnackbarIcon({ kind }: { kind: SnackbarKind }) {
  if (kind === "success") {
    return <CheckCircle2 size={19} aria-hidden="true" />;
  }

  if (kind === "error") {
    return <AlertTriangle size={19} aria-hidden="true" />;
  }

  if (kind === "loading") {
    return (
      <LoaderCircle
        className="admin-snackbar-spinner"
        size={19}
        aria-hidden="true"
      />
    );
  }

  return <Info size={19} aria-hidden="true" />;
}

export function AdminSnackbar() {
  const pathname = usePathname();
  const [items, setItems] = useState<SnackbarItem[]>([]);
  const idRef = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const remove = useCallback((id: number) => {
    const timer = timers.current.get(id);

    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }

    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearLoading = useCallback(() => {
    setItems((current) =>
      current.filter((item) => item.kind !== "loading"),
    );
  }, []);

  const show = useCallback(
    (
      kind: SnackbarKind,
      title: string,
      message?: string,
      duration?: number,
    ) => {
      const id = ++idRef.current;
      const item: SnackbarItem = { id, kind, title, message };

      setItems((current) => {
        const next = current.filter((entry) => entry.kind !== "loading");
        return [...next, item].slice(-MAX_SNACKBARS);
      });

      const timeout =
        duration ??
        (kind === "error"
          ? 6500
          : kind === "success"
            ? 4200
            : kind === "info"
              ? 4500
              : 15000);

      if (timeout > 0) {
        const timer = setTimeout(() => remove(id), timeout);
        timers.current.set(id, timer);
      }
    },
    [remove],
  );

  useEffect(() => {
    document.documentElement.classList.add("admin-snackbar-active");

    const scanNotices = (root: ParentNode) => {
      const notices: Element[] = [];

      if (
        root instanceof Element &&
        root.matches(".notice.error, .notice.success")
      ) {
        notices.push(root);
      }

      notices.push(
        ...Array.from(
          root.querySelectorAll(".notice.error, .notice.success"),
        ),
      );

      for (const notice of notices) {
        if (notice.getAttribute("data-admin-snackbar-seen") === "true") {
          continue;
        }

        const text = notice.textContent?.trim();
        if (!text) continue;

        notice.setAttribute("data-admin-snackbar-seen", "true");
        notice.setAttribute("aria-hidden", "true");

        sessionStorage.removeItem(STORAGE_KEY);

        if (notice.classList.contains("error")) {
          show("error", "Không thể hoàn tất", text);
        } else {
          show("success", "Thành công", text);
        }
      }
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          if (mutation.target.parentElement) {
            scanNotices(mutation.target.parentElement);
          }
          continue;
        }

        for (const node of Array.from(mutation.addedNodes)) {
          if (node instanceof Element) {
            scanNotices(node);
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    queueMicrotask(() => scanNotices(document));

    const handleAdminSubmit = (event: SubmitEvent) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (form.dataset.snackbarIgnore === "true") return;

      queueMicrotask(() => {
        if (event.defaultPrevented) return;

        const submitter =
          event.submitter instanceof HTMLElement ? event.submitter : null;
        const label =
          submitter?.textContent?.trim() ||
          submitter?.getAttribute("aria-label") ||
          "Thao tác";

        const copy = actionCopy(label);
        const pending: PendingAction = {
          from: window.location.pathname + window.location.search,
          success: copy.success,
          startedAt: Date.now(),
        };

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
        show("loading", copy.loading, "Vui lòng chờ trong giây lát.");
      });
    };

    document.addEventListener("submit", handleAdminSubmit);

    return () => {
      document.documentElement.classList.remove("admin-snackbar-active");
      observer.disconnect();
      document.removeEventListener("submit", handleAdminSubmit);
    };
  }, [show]);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    queueMicrotask(() => {
      try {
        const pending = JSON.parse(raw) as PendingAction;
        const current = window.location.pathname + window.location.search;
        const fresh = Date.now() - pending.startedAt < 20000;

        if (fresh && pending.from !== current) {
          sessionStorage.removeItem(STORAGE_KEY);
          clearLoading();
          show("success", "Thành công", pending.success);
        } else if (!fresh) {
          sessionStorage.removeItem(STORAGE_KEY);
          clearLoading();
        }
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    });
  }, [pathname, clearLoading, show]);

  useEffect(() => {
    const map = timers.current;

    return () => {
      for (const timer of map.values()) {
        clearTimeout(timer);
      }
      map.clear();
    };
  }, []);

  return (
    <div
      className="admin-snackbar-region"
      aria-live="polite"
      aria-atomic="false"
    >
      {items.map((item) => (
        <div
          className={`admin-snackbar admin-snackbar--${item.kind}`}
          key={item.id}
          role={item.kind === "error" ? "alert" : "status"}
        >
          <span className="admin-snackbar-icon">
            <SnackbarIcon kind={item.kind} />
          </span>

          <div className="admin-snackbar-copy">
            <strong>{item.title}</strong>
            {item.message && <p>{item.message}</p>}
          </div>

          {item.kind !== "loading" && (
            <button
              type="button"
              className="admin-snackbar-close"
              aria-label="Đóng thông báo"
              onClick={() => remove(item.id)}
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}

          {item.kind !== "loading" && (
            <span className="admin-snackbar-progress" aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  );
}
