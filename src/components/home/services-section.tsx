import {
  Camera,
  Video,
  Lightbulb,
  Radio,
  Sparkles,
  Aperture,
} from "lucide-react";
import { services } from "@/data/content";
import type { Locale } from "@/types/catalog";
const icons = [Aperture, Camera, Video, Lightbulb, Radio, Sparkles];
export function ServiceGrid({ locale }: { locale: Locale }) {
  return (
    <div className="service-grid">
      {services.map((s, i) => {
        const Icon = icons[i];
        return (
          <article className="service-card" key={s.id}>
            <div className="service-top">
              <Icon size={25} strokeWidth={1.3} />
              <span>0{i + 1}</span>
            </div>
            <h3>{s[locale]}</h3>
            <p>{s.description[locale]}</p>
          </article>
        );
      })}
    </div>
  );
}
