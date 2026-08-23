"use client";

import { useEffect } from "react";

const labels: Record<string, string> = {
  LAU_LONG_TERM: "长期住宅合同",
  TEMPORADA: "季节性 / 临时租赁合同",
  ROOM: "合租房间合同",
};

export default function ContractLabelFix() {
  useEffect(() => {
    const translate = () => {
      document.querySelectorAll("option").forEach((option) => {
        const value = option.value.trim();
        const label = labels[value];
        if (label && option.textContent !== label) option.textContent = label;
      });
      document.querySelectorAll("body *").forEach((node) => {
        if (node.children.length === 0) {
          const text = node.textContent?.trim();
          const label = text ? labels[text] : undefined;
          if (label && node.textContent !== label) node.textContent = label;
        }
      });
    };
    translate();
    const observer = new MutationObserver(translate);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
