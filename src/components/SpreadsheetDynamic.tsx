"use client";

import dynamic from "next/dynamic";
import React from "react";
import type { Sheet } from "@fortune-sheet/core";
import type { SpreadsheetWrapperHandle } from "./SpreadsheetWrapper";
import { DEFAULT_SHEETS } from "./SpreadsheetWrapper";

// Skeleton shown while FortuneSheet JS loads
function SheetSkeleton() {
  const cols = Array.from({ length: 10 });
  const rows = Array.from({ length: 20 });
  return (
    <div
      style={{
        flex: 1,
        overflow: "hidden",
        background: "var(--color-bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Column header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "40px repeat(10, 1fr)",
          gap: "1px",
          background: "var(--color-border-light)",
          padding: "1px",
          flexShrink: 0,
        }}
      >
        <div className="sheet-skeleton-cell sheet-skeleton-header" />
        {cols.map((_, i) => (
          <div key={i} className="sheet-skeleton-cell sheet-skeleton-header" />
        ))}
      </div>
      {/* Data rows */}
      {rows.map((_, r) => (
        <div
          key={r}
          style={{
            display: "grid",
            gridTemplateColumns: "40px repeat(10, 1fr)",
            gap: "1px",
            background: "var(--color-border-light)",
            padding: "0 1px 1px 1px",
          }}
        >
          <div className="sheet-skeleton-cell sheet-skeleton-header" style={{ animationDelay: `${r * 0.03}s` }} />
          {cols.map((_, c) => (
            <div
              key={c}
              className="sheet-skeleton-cell"
              style={{ animationDelay: `${(r * 10 + c) * 0.01}s` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Dynamically import SpreadsheetWrapper with SSR disabled
const SpreadsheetWrapper = dynamic(
  () => import("./SpreadsheetWrapper"),
  {
    ssr: false,
    loading: () => <SheetSkeleton />,
  }
);

interface Props {
  sheets: Sheet[];
  onDataChange: (sheets: Sheet[]) => void;
  wrapperRef: React.MutableRefObject<SpreadsheetWrapperHandle | null>;
}

export default function SpreadsheetDynamic({ sheets, onDataChange, wrapperRef }: Props) {
  return (
    <SpreadsheetWrapper
      sheets={sheets.length > 0 ? sheets : DEFAULT_SHEETS}
      onDataChange={onDataChange}
      wrapperRef={wrapperRef}
    />
  );
}

export { DEFAULT_SHEETS };
