import { Plus } from "lucide-react";
import { faqs } from "@/data/content";
import type { Locale } from "@/types/catalog";
export function FAQ({ locale }: { locale: Locale }) {
  return (
    <div className="faq-list">
      {faqs.map((faq, i) => (
        <details key={i}>
          <summary>
            {faq.q[locale]}
            <Plus size={18} />
          </summary>
          <p>{faq.a[locale]}</p>
        </details>
      ))}
    </div>
  );
}
