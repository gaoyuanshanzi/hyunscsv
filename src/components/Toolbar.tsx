"use client";

import React from "react";

interface ToolbarProps {
  onCommand: (command: string, value?: string) => void;
  activeFormats: Set<string>;
}

const fontSizes = ["10", "11", "12", "14", "16", "18", "20", "24", "28", "32", "36"];

export default function Toolbar({ onCommand, activeFormats }: ToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="서식 툴바"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "2px",
        padding: "4px 12px",
        background: "var(--color-bg)",
        borderBottom: "1px solid var(--color-border)",
        flexShrink: 0,
        overflowX: "auto",
        flexWrap: "nowrap",
      }}
    >
      {/* Font family */}
      <select
        id="toolbar-font-family"
        className="btn btn-ghost"
        style={{
          fontSize: "12px",
          padding: "4px 8px",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-sm)",
          background: "var(--color-bg)",
          color: "var(--color-text-primary)",
          cursor: "pointer",
          minWidth: "100px",
        }}
        onChange={(e) => onCommand("fontFamily", e.target.value)}
        aria-label="폰트 선택"
      >
        {["Inter", "Arial", "Courier New", "Georgia", "Times New Roman"].map(
          (f) => (
            <option key={f} value={f} style={{ fontFamily: f }}>
              {f}
            </option>
          )
        )}
      </select>

      {/* Font size */}
      <select
        id="toolbar-font-size"
        className="btn btn-ghost"
        style={{
          fontSize: "12px",
          padding: "4px 8px",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-sm)",
          background: "var(--color-bg)",
          color: "var(--color-text-primary)",
          cursor: "pointer",
          width: "64px",
        }}
        defaultValue="12"
        onChange={(e) => onCommand("fontSize", e.target.value)}
        aria-label="폰트 크기"
      >
        {fontSizes.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <div className="toolbar-divider" />

      {/* Bold */}
      <ToolbarButton
        id="toolbar-bold"
        label="굵게 (Ctrl+B)"
        active={activeFormats.has("bold")}
        onClick={() => onCommand("bold")}
        aria-label="굵게"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <text
            x="2"
            y="11"
            style={{ fontSize: "13px", fontWeight: 800, fontFamily: "serif" }}
            fill="currentColor"
          >
            B
          </text>
        </svg>
      </ToolbarButton>

      {/* Italic */}
      <ToolbarButton
        id="toolbar-italic"
        label="기울임 (Ctrl+I)"
        active={activeFormats.has("italic")}
        onClick={() => onCommand("italic")}
        aria-label="기울임"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <text
            x="3"
            y="11"
            style={{ fontSize: "13px", fontStyle: "italic", fontFamily: "serif" }}
            fill="currentColor"
          >
            I
          </text>
        </svg>
      </ToolbarButton>

      {/* Underline */}
      <ToolbarButton
        id="toolbar-underline"
        label="밑줄 (Ctrl+U)"
        active={activeFormats.has("underline")}
        onClick={() => onCommand("underline")}
        aria-label="밑줄"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <text
            x="2"
            y="10"
            style={{
              fontSize: "12px",
              textDecoration: "underline",
              fontFamily: "sans-serif",
            }}
            fill="currentColor"
          >
            U
          </text>
          <line x1="2" y1="13" x2="12" y2="13" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </ToolbarButton>

      <div className="toolbar-divider" />

      {/* Align Left */}
      <ToolbarButton
        id="toolbar-align-left"
        label="왼쪽 정렬"
        active={activeFormats.has("alignLeft")}
        onClick={() => onCommand("alignLeft")}
        aria-label="왼쪽 정렬"
      >
        <AlignLeftIcon />
      </ToolbarButton>

      {/* Align Center */}
      <ToolbarButton
        id="toolbar-align-center"
        label="가운데 정렬"
        active={activeFormats.has("alignCenter")}
        onClick={() => onCommand("alignCenter")}
        aria-label="가운데 정렬"
      >
        <AlignCenterIcon />
      </ToolbarButton>

      {/* Align Right */}
      <ToolbarButton
        id="toolbar-align-right"
        label="오른쪽 정렬"
        active={activeFormats.has("alignRight")}
        onClick={() => onCommand("alignRight")}
        aria-label="오른쪽 정렬"
      >
        <AlignRightIcon />
      </ToolbarButton>

      <div className="toolbar-divider" />

      {/* Wrap text */}
      <ToolbarButton
        id="toolbar-wrap"
        label="텍스트 줄바꿈"
        active={activeFormats.has("wrap")}
        onClick={() => onCommand("wrap")}
        aria-label="텍스트 줄바꿈"
      >
        <WrapIcon />
      </ToolbarButton>

      <div className="toolbar-divider" />

      {/* Text color */}
      <label
        htmlFor="toolbar-text-color"
        data-tooltip="글자 색상"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "3px",
          padding: "5px 8px",
          borderRadius: "var(--radius-sm)",
          cursor: "pointer",
          transition: "background 0.15s",
        }}
        className="btn-ghost"
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--color-bg-secondary)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "transparent")
        }
        aria-label="글자 색상"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <text x="1" y="11" style={{ fontSize: "12px", fontWeight: 700 }} fill="currentColor">A</text>
        </svg>
        <input
          id="toolbar-text-color"
          type="color"
          defaultValue="#212529"
          style={{ width: "16px", height: "12px", border: "none", padding: 0, cursor: "pointer", borderRadius: "2px" }}
          onChange={(e) => onCommand("textColor", e.target.value)}
          title="글자 색상"
        />
      </label>

      {/* BG color */}
      <label
        htmlFor="toolbar-bg-color"
        data-tooltip="셀 배경색"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "3px",
          padding: "5px 8px",
          borderRadius: "var(--radius-sm)",
          cursor: "pointer",
          transition: "background 0.15s",
        }}
        className="btn-ghost"
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--color-bg-secondary)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "transparent")
        }
        aria-label="셀 배경색"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="1" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <rect x="3" y="3" width="8" height="6" fill="currentColor" opacity="0.3" rx="0.5" />
        </svg>
        <input
          id="toolbar-bg-color"
          type="color"
          defaultValue="#ffffff"
          style={{ width: "16px", height: "12px", border: "none", padding: 0, cursor: "pointer", borderRadius: "2px" }}
          onChange={(e) => onCommand("bgColor", e.target.value)}
          title="셀 배경색"
        />
      </label>

      <div className="toolbar-divider" />

      {/* Merge cells */}
      <ToolbarButton
        id="toolbar-merge"
        label="셀 병합"
        active={false}
        onClick={() => onCommand("merge")}
        aria-label="셀 병합"
      >
        <MergeIcon />
      </ToolbarButton>

      {/* Formula hint */}
      <div style={{ flex: 1 }} />
      <div
        style={{
          fontSize: "11px",
          color: "var(--color-text-muted)",
          padding: "0 8px",
          whiteSpace: "nowrap",
        }}
      >
        수식: =SUM, =IF, =VLOOKUP 지원
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────── */

interface ToolbarButtonProps {
  id: string;
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  "aria-label": string;
}

function ToolbarButton({ id, label, active, onClick, children, "aria-label": ariaLabel }: ToolbarButtonProps) {
  return (
    <button
      id={id}
      type="button"
      className={`btn btn-ghost${active ? " active" : ""}`}
      onClick={onClick}
      data-tooltip={label}
      aria-label={ariaLabel}
      aria-pressed={active}
      style={{ padding: "5px 8px" }}
    >
      {children}
    </button>
  );
}

function AlignLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <line x1="1" y1="3" x2="13" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1" y1="6" x2="9" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1" y1="9" x2="13" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1" y1="12" x2="7" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AlignCenterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <line x1="1" y1="3" x2="13" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1" y1="9" x2="13" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3" y1="12" x2="11" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AlignRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <line x1="1" y1="3" x2="13" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="6" x2="13" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1" y1="9" x2="13" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7" y1="12" x2="13" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function WrapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <line x1="1" y1="3" x2="13" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M1 7h8a2 2 0 0 1 0 4H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 9l-2 2 2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MergeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="8" y="1" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="1" y="8" width="12" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.1" />
    </svg>
  );
}
