"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Locale } from "@/types/catalog";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function HomeHeroMotion({
  locale,
  spacesHref,
  equipmentHref,
  studioCount,
  equipmentCount,
  maxArea,
}: {
  locale: Locale;
  spacesHref: string;
  equipmentHref: string;
  studioCount: number;
  equipmentCount: number;
  maxArea: number | null;
}) {
  const root = useRef<HTMLElement>(null);
  const vi = locale === "vi";

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const lines = gsap.utils.toArray<HTMLElement>(
          ".home-hero-motion-line-inner",
          scope,
        );

        /*
          Do not animate with masked overflow.
          Vietnamese glyphs/diacritics can extend beyond the line box and get
          clipped, especially with large variable-font weights.
        */
        gsap.set(lines, {
          autoAlpha: 0,
          y: 42,
        });
        gsap.set(".home-hero-motion-kicker", { autoAlpha: 0, y: 12 });
        gsap.set(".home-hero-motion-lead", { autoAlpha: 0, y: 18 });
        gsap.set(".home-hero-motion-actions", { autoAlpha: 0, y: 18 });
        gsap.set(".home-hero-motion-stats", { autoAlpha: 0, y: 22 });

        const intro = gsap.timeline({
          defaults: { ease: "power3.out" },
        });

        intro
          .to(".home-hero-motion-kicker", {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
          })
          .to(
            lines,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              stagger: 0.1,
            },
            "-=0.18",
          )
          .to(
            ".home-hero-motion-lead",
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.58,
            },
            "-=0.42",
          )
          .to(
            ".home-hero-motion-actions",
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.54,
            },
            "-=0.4",
          )
          .to(
            ".home-hero-motion-stats",
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.58,
            },
            "-=0.34",
          );

        gsap.to(".home-hero-motion-orb--blue", {
          xPercent: 14,
          yPercent: -10,
          ease: "none",
          scrollTrigger: {
            trigger: scope,
            start: "top top",
            end: "bottom top",
            scrub: 1.1,
          },
        });

        gsap.to(".home-hero-motion-orb--gold", {
          xPercent: -10,
          yPercent: 13,
          ease: "none",
          scrollTrigger: {
            trigger: scope,
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
          },
        });

        gsap.to(".home-hero-motion-title", {
          yPercent: -3,
          ease: "none",
          scrollTrigger: {
            trigger: scope,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            ".home-hero-motion-line-inner",
            ".home-hero-motion-kicker",
            ".home-hero-motion-lead",
            ".home-hero-motion-actions",
            ".home-hero-motion-stats",
          ],
          { clearProps: "all" },
        );
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="home-hero-motion">
      <div className="home-hero-motion-orb home-hero-motion-orb--blue" />
      <div className="home-hero-motion-orb home-hero-motion-orb--gold" />
      <div className="home-hero-motion-grid" aria-hidden="true" />

      <div className="container home-hero-motion-inner">
        <p className="eyebrow home-hero-motion-kicker">
          ONI STUDIO · SAIGON
        </p>

        <h1 className="home-hero-motion-title">
          <span className="home-hero-motion-line">
            <span className="home-hero-motion-line-inner">
              {vi ? "Không gian mở." : "Open space."}
            </span>
          </span>

          <span className="home-hero-motion-line">
            <span className="home-hero-motion-line-inner">
              {vi ? "Cảm hứng riêng." : "Your own creative flow."}
            </span>
          </span>
        </h1>

        <div className="home-hero-motion-bottom">
          <p className="home-hero-motion-lead">
            {vi
              ? "Không gian chụp, thiết bị và thông tin cần thiết được trình bày thật gọn để bạn xem nhanh, chọn đúng và bắt đầu sáng tạo."
              : "Studio spaces, equipment and essential information are kept simple so you can scan faster, choose clearly and start creating."}
          </p>

          <div className="home-hero-motion-actions">
            <Link className="button button-accent" href={spacesHref}>
              {vi ? "Xem không gian" : "Explore spaces"}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>

            <Link className="button button-outline" href={equipmentHref}>
              {vi ? "Xem thiết bị" : "Browse equipment"}
            </Link>
          </div>
        </div>

        <div className="home-hero-motion-stats">
          <div>
            <strong>{String(studioCount).padStart(2, "0")}</strong>
            <span>{vi ? "không gian" : "spaces"}</span>
          </div>

          <div>
            <strong>{equipmentCount}</strong>
            <span>{vi ? "thiết bị" : "gear items"}</span>
          </div>

          <div>
            <strong>{maxArea ?? "—"}</strong>
            <span>{vi ? "m² lớn nhất" : "largest m²"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
