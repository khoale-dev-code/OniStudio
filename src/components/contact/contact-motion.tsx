"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function ContactMotion() {
  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const scope = document.querySelector(".contact-refresh");
    if (!scope) return;
    const elements = gsap.utils.toArray<HTMLElement>(
      ".contact-v3-hero-copy, .contact-v3-hero-note, .contact-v3-quick-grid, .contact-v3-map-head, .contact-v3-map-frame, .contact-v3-map-aside",
      scope,
    );
    elements.forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 26 }, {
        opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 93%", once: true },
      });
    });
    gsap.fromTo(".contact-refresh-orbit path", { strokeDasharray: "0 360" }, {
      strokeDasharray: "165 360", duration: 1.8, ease: "power2.inOut",
      scrollTrigger: { trigger: ".contact-refresh-logo-wrap", start: "top 92%", once: true },
    });
  });
  return null;
}
