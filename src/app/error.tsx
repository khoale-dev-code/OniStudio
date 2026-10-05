"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="container empty-page">
      <h1>Chưa thể tải nội dung</h1>
      <p>
        Vui lòng thử lại hoặc liên hệ Oni qua Messenger. / Please try again.
      </p>
      <button className="button" onClick={reset}>
        Thử lại / Retry
      </button>
      <a className="button button-outline" href="https://m.me/onistudiovn">
        Messenger
      </a>
    </main>
  );
}
