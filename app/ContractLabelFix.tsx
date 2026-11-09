"use client";

import { useEffect } from "react";
import { useLanguage } from "./language";

const labels = {
  zh: {
    LAU_LONG_TERM: "长期住宅合同",
    TEMPORADA: "季节性 / 临时租赁合同",
    ROOM: "合租房间合同",
  },
  es: {
    LAU_LONG_TERM: "Contrato de vivienda habitual",
    TEMPORADA: "Contrato de temporada",
    ROOM: "Contrato de habitación",
  },
};

export default function ContractLabelFix() {
  const { language } = useLanguage();

  useEffect(() => {
    const languageLabels = labels[language];
    const translate = () => {
      document.querySelectorAll("option").forEach((option) => {
        const value = option.value.trim();
        const label = languageLabels[value as keyof typeof languageLabels];
        if (label && option.textContent !== label) option.textContent = label;
      });
      document.querySelectorAll("body *").forEach((node) => {
        if (node.children.length === 0) {
          const text = node.textContent?.trim();
          const label = text
            ? languageLabels[text as keyof typeof languageLabels]
            : undefined;
          if (label && node.textContent !== label) node.textContent = label;
        }
      });
    };
    translate();
    const observer = new MutationObserver(translate);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);
  return null;
}
