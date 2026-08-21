"use client";

import React from "react";
import FunctionDropdown from "./FunctionDropdown";
import { SpreadsheetFunction } from "@/data/functions";

interface ToolbarProps {
  onCommand: (command: string, value?: string) => void;
  onSelectFunction?: (func: SpreadsheetFunction) => void;
  activeFormats: Set<string>;
}

const fontSizes = ["10", "11", "12", "14", "16", "18", "20", "24", "28", "32", "36"];

export default function Toolbar({
  onCommand,
  onSelectFunction,
  activeFormats,
}: ToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="서식 툴바"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 12px",
        background: "var(--color-bg)",
        borderBottom: "1px solid var(--color-border)",
        flexShrink: 0,
        overflowX: "auto",
        flexWrap: "nowrap",
      }}
    >
      {/* Function Catalog Dropdown */}
      {onSelectFunction && (
        <>
          <FunctionDropdown onSelectFunction={onSelectFunction} />
          <div className="toolbar-divider" />
        </>
      )}

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
          minWidth: "110px",
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => onCommand("fontFamily", e.target.value)}
        aria-label="폰트 선택"
      >
        {[
          { label: "Inter (기본)", value: "Inter" },
          { label: "Noto Sans JP (일본어 고딕)", value: "'Noto Sans JP', sans-serif" },
          { label: "Noto Serif JP (일본어 명조)", value: "'Noto Serif JP', serif" },
          { label: "Meiryo (メイリオ)", value: "Meiryo, 'Noto Sans JP', sans-serif" },
          { label: "MS Gothic (ＭＳ ゴシック)", value: "'MS Gothic', 'Noto Sans JP', monospace" },
          { label: "MS Mincho (ＭＳ 明朝)", value: "'MS Mincho', 'Noto Serif JP', serif" },
          { label: "Yu Gothic (游ゴシック)", value: "'Yu Gothic', 'Noto Sans JP', sans-serif" },
          { label: "Hiragino Sans (ヒラギノ)", value: "'Hiragino Sans', 'Noto Sans JP', sans-serif" },
          { label: "Noto Sans KR (한국어)", value: "'Noto Sans KR', sans-serif" },
          { label: "Malgun Gothic (맑은 고딕)", value: "'Malgun Gothic', sans-serif" },
          { label: "Arial", value: "Arial" },
          { label: "Georgia", value: "Georgia" },
          { label: "Times New Roman", value: "'Times New Roman'" },
          { label: "Courier New", value: "'Courier New'" },
        ].map((f) => (
          <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
            {f.label}
          </option>
        ))}
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
        onMouseDown={(e) => e.stopPropagation()}
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

      {/* ── 셀 / 숫자 서식 섹션 (Number & Date Formats) ── */}

      {/* 쉼표 스타일 (000마다 콤마) */}
      <ToolbarButton
        id="toolbar-comma"
        label="쉼표 스타일 (1,000 단위 구분)"
        active={false}
        onClick={() => onCommand("formatComma")}
        aria-label="쉼표 스타일"
      >
        <span style={{ fontSize: "15px", fontWeight: 800, fontFamily: "sans-serif", lineHeight: 1 }}>,</span>
      </ToolbarButton>

      {/* 백분율 (%) */}
      <ToolbarButton
        id="toolbar-percent"
        label="백분율 (%)"
        active={false}
        onClick={() => onCommand("formatPercent")}
        aria-label="백분율"
      >
        <span style={{ fontSize: "13px", fontWeight: 700, fontFamily: "sans-serif" }}>%</span>
      </ToolbarButton>

      {/* 자릿수 하나 늘임 */}
      <ToolbarButton
        id="toolbar-increase-decimal"
        label="자릿수 하나 늘임 (.0 ➔ .00)"
        active={false}
        onClick={() => onCommand("increaseDecimal")}
        aria-label="자릿수 하나 늘임"
      >
        <IncreaseDecimalIcon />
      </ToolbarButton>

      {/* 자릿수 하나 줄임 */}
      <ToolbarButton
        id="toolbar-decrease-decimal"
        label="자릿수 하나 줄임 (.00 ➔ .0)"
        active={false}
        onClick={() => onCommand("decreaseDecimal")}
        aria-label="자릿수 하나 줄임"
      >
        <DecreaseDecimalIcon />
      </ToolbarButton>

      {/* 날짜 버튼 */}
      <ToolbarButton
        id="toolbar-date"
        label="날짜 서식 (YYYY-MM-DD)"
        active={false}
        onClick={() => onCommand("formatDate")}
        aria-label="날짜"
      >
        <span style={{ fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "3px" }}>
          <DateIcon />
          <span>날짜</span>
        </span>
      </ToolbarButton>

      {/* 시간 버튼 */}
      <ToolbarButton
        id="toolbar-time"
        label="시간 서식 (HH:MM:SS)"
        active={false}
        onClick={() => onCommand("formatTime")}
        aria-label="시간"
      >
        <span style={{ fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "3px" }}>
          <TimeIcon />
          <span>시간</span>
        </span>
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
        Excel 호환 수식 엔진 내장
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
      onMouseDown={(e) => {
        // 셀 선택 영역 포커스가 사라지지 않도록 브라우저 포커스 스틸 방지
        e.preventDefault();
      }}
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

function IncreaseDecimalIcon() {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" style={{ verticalAlign: "middle" }}>
      <text x="0" y="11" style={{ fontSize: "10px", fontWeight: 700, fontFamily: "sans-serif" }} fill="currentColor">
        .00
      </text>
      <path d="M17 4l-3 3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="14" y1="7" x2="18" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function DecreaseDecimalIcon() {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" style={{ verticalAlign: "middle" }}>
      <text x="0" y="11" style={{ fontSize: "10px", fontWeight: 700, fontFamily: "sans-serif" }} fill="currentColor">
        .0
      </text>
      <path d="M14 4l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="17" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function DateIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="2.5" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="1" y1="5.5" x2="13" y2="5.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="4" y1="1" x2="4" y2="3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="10" y1="1" x2="10" y2="3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function TimeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <polyline points="7,3.5 7,7 9.5,8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
