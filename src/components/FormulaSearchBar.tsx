"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { SPREADSHEET_FUNCTIONS, SpreadsheetFunction } from "@/data/functions";

interface FormulaSearchBarProps {
  onSelectFunction: (func: SpreadsheetFunction) => void;
}

export default function FormulaSearchBar({ onSelectFunction }: FormulaSearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [insertedFunc, setInsertedFunc] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter functions based on query
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // If query is empty, show popular functions
      return SPREADSHEET_FUNCTIONS.filter((f) => f.category === "자주 쓰는 함수").slice(0, 6);
    }
    return SPREADSHEET_FUNCTIONS.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.syntax.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (func: SpreadsheetFunction) => {
    onSelectFunction(func);
    setInsertedFunc(func.name);
    setIsOpen(false);
    setTimeout(() => {
      setInsertedFunc(null);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
      setIsOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(matches.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + matches.length) % Math.max(matches.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (matches.length > 0 && matches[selectedIndex]) {
        handleSelect(matches[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {/* Search Input Box */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: "8px",
            fontSize: "12px",
            color: "#64748b",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
          }}
        >
          🔍
        </span>
        <input
          ref={inputRef}
          id="global-formula-search-input"
          type="text"
          placeholder="함수 검색 (예: SUM, IF, VLOOKUP...)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          style={{
            height: "28px",
            padding: "0 28px 0 26px",
            fontSize: "12px",
            borderRadius: "6px",
            border: "1px solid var(--color-border)",
            background: "var(--color-bg-secondary)",
            color: "var(--color-text-primary)",
            outline: "none",
            width: "230px",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
          onFocusCapture={(e) => {
            e.currentTarget.style.borderColor = "var(--color-accent)";
            e.currentTarget.style.background = "#ffffff";
            e.currentTarget.style.boxShadow = "0 0 0 2px var(--color-accent-light)";
            e.currentTarget.style.width = "270px";
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.background = "var(--color-bg-secondary)";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.width = "230px";
          }}
        />

        {/* Clear query button */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            style={{
              position: "absolute",
              right: "6px",
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "13px",
              padding: "2px",
              lineHeight: 1,
            }}
            aria-label="검색어 지우기"
          >
            ✕
          </button>
        )}
      </div>

      {/* Inserted Feedback Badge */}
      {insertedFunc && (
        <div
          style={{
            position: "absolute",
            left: "100%",
            marginLeft: "8px",
            background: "#16a34a",
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: "4px",
            whiteSpace: "nowrap",
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          ✓ {insertedFunc} 삽입됨
        </div>
      )}

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: "0",
            width: "360px",
            maxHeight: "360px",
            overflowY: "auto",
            background: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            zIndex: 1200,
            padding: "4px",
          }}
        >
          <div
            style={{
              padding: "4px 8px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#64748b",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{query ? `"${query}" 검색 결과` : "추천 자주 쓰는 함수"}</span>
            <span style={{ fontSize: "10px", fontWeight: 400 }}>Enter 또는 클릭하여 삽입</span>
          </div>

          {matches.length === 0 ? (
            <div
              style={{
                padding: "16px",
                textAlign: "center",
                fontSize: "12px",
                color: "#94a3b8",
              }}
            >
              일치하는 함수가 없습니다.
            </div>
          ) : (
            matches.map((func, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={func.name}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(func)}
                  style={{
                    padding: "7px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    background: isSelected ? "var(--color-accent-light)" : "transparent",
                    borderLeft: isSelected ? "3px solid var(--color-accent)" : "3px solid transparent",
                    transition: "all 0.1s ease",
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "2px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "13px",
                          color: isSelected ? "var(--color-accent)" : "#0f172a",
                          fontFamily: "monospace",
                        }}
                      >
                        {func.name}
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
                        {func.category}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "var(--color-accent)",
                        fontWeight: 600,
                        background: "#eff6ff",
                        padding: "1px 6px",
                        borderRadius: "3px",
                      }}
                    >
                      삽입 ↵
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: "11px",
                      color: "#475569",
                      lineHeight: 1.35,
                      marginBottom: "3px",
                    }}
                  >
                    {func.description}
                  </div>

                  <div
                    style={{
                      fontSize: "10px",
                      fontFamily: "monospace",
                      color: "#64748b",
                      background: "#f8fafc",
                      padding: "2px 5px",
                      borderRadius: "3px",
                    }}
                  >
                    예시: {func.example}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
