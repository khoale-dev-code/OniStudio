import { MessageCircle, Phone } from "lucide-react";
import { site } from "@/data/site";
import type { Locale } from "@/types/catalog";
export function ContactActions({
  locale,
  compact = false,
}: {
  locale: Locale;
  compact?: boolean;
}) {
  return (
    <div className="button-row">
      <a
        className="button"
        href={site.messenger}
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle size={18} />
        {locale === "vi" ? "Nhắn Oni Studio" : "Message Oni Studio"}
      </a>
      {!compact &&
        (site.zalo ? (
          <a
            className="button button-outline"
            href={site.zalo}
            target="_blank"
            rel="noopener noreferrer"
          >
            Zalo
          </a>
        ) : (
          <a className="button button-outline" href={`tel:${site.phoneHref}`}>
            <Phone size={17} />
            {site.phone}
          </a>
        ))}
    </div>
  );
}
