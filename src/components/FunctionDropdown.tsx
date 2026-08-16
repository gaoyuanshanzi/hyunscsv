"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  SPREADSHEET_FUNCTIONS,
  FORMULA_CATEGORIES,
  SpreadsheetFunction,
} from "@/data/functions";

interface FunctionDropdownProps {
  onSelectFunction: (func: SpreadsheetFunction) => void;
}

export default function FunctionDropdown({ onSelectFunction }: FunctionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Filtered functions list
  const filteredFunctions = useMemo(() => {
    return SPREADSHEET_FUNCTIONS.filter((fn) => {
      const matchCategory =
        selectedCategory === "전체" || fn.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        fn.name.toLowerCase().includes(query) ||
        fn.description.toLowerCase().includes(query) ||
        fn.syntax.toLowerCase().includes(query);
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleSelect = (fn: SpreadsheetFunction) => {
    onSelectFunction(fn);
    setCopiedName(fn.name);
    setTimeout(() => {
      setCopiedName(null);
      setIsOpen(false);
    }, 600);
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
      {/* Ribbon Trigger Button */}
      <button
        id="btn-formula-dropdown"
        type="button"
        className={`btn btn-secondary ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "5px 10px",
          fontSize: "12px",
          fontWeight: 600,
          background: isOpen ? "var(--color-accent-light)" : "var(--color-bg)",
          color: isOpen ? "var(--color-accent)" : "var(--color-text-primary)",
          borderColor: isOpen ? "var(--color-accent)" : "var(--color-border)",
          borderRadius: "var(--radius-sm)",
          cursor: "pointer",
        }}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        title="사용 가능한 함수 목록 보기"
      >
        <span
          style={{
            fontFamily: "serif",
            fontStyle: "italic",
            fontWeight: 800,
            color: "var(--color-accent)",
            fontSize: "13px",
          }}
        >
          fx
        </span>
        <span>함수 목록</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          style={{
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.15s ease",
          }}
        >
          <path
            d="M2 3.5L5 6.5L8 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="사용 가능한 함수 목록"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: "0",
            width: "380px",
            maxHeight: "480px",
            background: "#ffffff",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          {/* Header & Search */}
          <div
            style={{
              padding: "12px 14px 8px 14px",
              borderBottom: "1px solid #f1f5f9",
              background: "#fafafa",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    fontFamily: "serif",
                    fontStyle: "italic",
                    fontWeight: 700,
                    color: "var(--color-accent)",
                    fontSize: "14px",
                  }}
                >
                  fx
                </span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>
                  지원 함수 목록
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    background: "#e2e8f0",
                    color: "#475569",
                    padding: "1px 6px",
                    borderRadius: "10px",
                  }}
                >
                  {filteredFunctions.length}개
                </span>
              </div>
              <span style={{ fontSize: "11px", color: "#64748b" }}>
                클릭 시 삽입/복사
              </span>
            </div>

            {/* Search Input */}
            <div style={{ position: "relative" }}>
              <input
                id="function-search-input"
                type="text"
                placeholder="함수 이름 또는 설명 검색 (예: SUM, 조건...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  padding: "7px 10px 7px 28px",
                  fontSize: "12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  outline: "none",
                  background: "#ffffff",
                  color: "#0f172a",
                }}
              />
              <svg
                width="13"
                height="13"
                viewBox="0 0 16 16"
                fill="none"
                style={{
                  position: "absolute",
                  left: "9px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                }}
              >
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10.5 10.5L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* Category Filter Pills */}
            <div
              style={{
                display: "flex",
                gap: "4px",
                overflowX: "auto",
                paddingTop: "8px",
                paddingBottom: "2px",
                scrollbarWidth: "none",
              }}
            >
              {["전체", ...FORMULA_CATEGORIES].map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: "3px 8px",
                      fontSize: "11px",
                      borderRadius: "12px",
                      border: "none",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      background: isActive ? "var(--color-accent)" : "#e2e8f0",
                      color: isActive ? "#ffffff" : "#475569",
                      fontWeight: isActive ? 600 : 500,
                      transition: "all 0.12s ease",
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Functions List */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "6px",
              maxHeight: "330px",
            }}
          >
            {filteredFunctions.length === 0 ? (
              <div
                style={{
                  padding: "30px 10px",
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: "12px",
                }}
              >
                검색 결과가 없습니다.
              </div>
            ) : (
              filteredFunctions.map((fn) => {
                const isJustCopied = copiedName === fn.name;
                return (
                  <div
                    key={fn.name}
                    onClick={() => handleSelect(fn)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      marginBottom: "4px",
                      background: isJustCopied ? "#f0fdf4" : "transparent",
                      border: isJustCopied ? "1px solid #86efac" : "1px solid transparent",
                      transition: "background 0.12s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isJustCopied) e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      if (!isJustCopied) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "3px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: "13px",
                            color: "var(--color-accent)",
                            fontFamily: "monospace",
                          }}
                        >
                          {fn.name}
                        </span>
                        <span
                          style={{
                            fontSize: "10px",
                            padding: "1px 5px",
                            background: "#f1f5f9",
                            color: "#64748b",
                            borderRadius: "4px",
                          }}
                        >
                          {fn.category}
                        </span>
                      </div>
                      {isJustCopied ? (
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#16a34a",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                          }}
                        >
                          ✓ 삽입됨
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: "10px",
                            color: "#94a3b8",
                            fontFamily: "monospace",
                          }}
                        >
                          {fn.example}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: "11px",
                        color: "#334155",
                        marginBottom: "4px",
                        lineHeight: 1.4,
                      }}
                    >
                      {fn.description}
                    </div>

                    <div
                      style={{
                        fontSize: "10px",
                        fontFamily: "monospace",
                        color: "#64748b",
                        background: "#f8fafc",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        border: "1px dashed #cbd5e1",
                      }}
                    >
                      구문: {fn.syntax}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
