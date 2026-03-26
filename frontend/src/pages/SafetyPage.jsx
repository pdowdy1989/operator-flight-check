import { useState, useCallback, useMemo } from "react";
import PageWrapper from "../components/layout/PageWrapper";
import Button from "../components/ui/Button";
import { checklistSections } from "../utils/mockSafetyChecklist";

export default function SafetyPage() {
  // Build initial checked state: { [sectionId-itemIndex]: false }
  const [checked, setChecked] = useState(() => {
    const init = {};
    checklistSections.forEach((section) => {
      section.items.forEach((_, i) => {
        init[`${section.id}-${i}`] = false;
      });
    });
    return init;
  });

  const totalItems = useMemo(
    () => checklistSections.reduce((sum, s) => sum + s.items.length, 0),
    []
  );

  const completedItems = useMemo(
    () => Object.values(checked).filter(Boolean).length,
    [checked]
  );

  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const toggle = useCallback((key) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const reset = useCallback(() => {
    setChecked((prev) => {
      const cleared = {};
      Object.keys(prev).forEach((k) => { cleared[k] = false; });
      return cleared;
    });
  }, []);

  return (
    <PageWrapper
      title="Safety Checklist"
      subtitle="Complete before every flight"
      action={
        <Button variant="secondary" size="sm" onClick={reset} aria-label="Reset all checklist items">
          Reset
        </Button>
      }
    >
      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-border shadow-card p-4 mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-text-primary">
            {completedItems} / {totalItems} completed
          </span>
          <span
            className={`text-sm font-bold ${
              progress === 100 ? "text-status-green-text" : "text-brand-orange"
            }`}
          >
            {progress}%
          </span>
        </div>
        <div className="w-full bg-surface-secondary rounded-full h-2.5 overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              progress === 100 ? "bg-status-green" : "bg-brand-orange"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {progress === 100 && (
          <p className="text-sm text-status-green-text font-semibold mt-2">
            ✓ All checks complete — cleared for launch!
          </p>
        )}
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-4">
        {checklistSections.map((section) => {
          const sectionChecked = section.items.filter((_, i) => checked[`${section.id}-${i}`]).length;
          const sectionDone = sectionChecked === section.items.length;

          return (
            <div
              key={section.id}
              className={`bg-white rounded-2xl border shadow-card overflow-hidden ${
                sectionDone ? "border-status-green" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h2 className="font-bold text-text-primary">{section.title}</h2>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    sectionDone
                      ? "bg-status-green-bg text-status-green-text"
                      : "bg-surface-secondary text-text-muted"
                  }`}
                >
                  {sectionChecked}/{section.items.length}
                </span>
              </div>
              <ul className="divide-y divide-border" role="list">
                {section.items.map((item, i) => {
                  const key = `${section.id}-${i}`;
                  const isChecked = checked[key];
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isChecked}
                        onClick={() => toggle(key)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-secondary min-h-[44px]"
                      >
                        {/* Checkbox */}
                        <span
                          className={[
                            "flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
                            isChecked
                              ? "bg-status-green border-status-green"
                              : "border-border bg-white",
                          ].join(" ")}
                          aria-hidden="true"
                        >
                          {isChecked && (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </span>
                        <span
                          className={`text-sm ${
                            isChecked ? "line-through text-text-muted" : "text-text-primary"
                          }`}
                        >
                          {item}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </PageWrapper>
  );
}
