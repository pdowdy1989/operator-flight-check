import { useMemo, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import { useToast } from "../context/ToastContext";
import { checklistSections } from "../utils/mockSafetyChecklist";

function buildInitialState() {
  return checklistSections.reduce((accumulator, section) => {
    section.items.forEach((item) => {
      accumulator[`${section.id}:${item}`] = false;
    });
    return accumulator;
  }, {});
}

export default function SafetyChecklistPage() {
  const [checkedItems, setCheckedItems] = useState(buildInitialState);
  const { showToast } = useToast();

  const totals = useMemo(() => {
    const totalItems = Object.keys(checkedItems).length;
    const completedItems = Object.values(checkedItems).filter(Boolean).length;
    const percent = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

    return { totalItems, completedItems, percent };
  }, [checkedItems]);

  const toggleItem = (key) => {
    setCheckedItems((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const resetChecklist = () => {
    setCheckedItems(buildInitialState());
    showToast({
      title: "Checklist reset",
      description: "Pre-flight items were cleared for a new mission.",
    });
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card
          eyebrow="Pre-Flight"
          title="Safety checklist"
          description="Use a consistent pre-flight review so critical preparation steps are not missed before launch."
        >
          <div className="space-y-5">
            <div className="rounded-3xl bg-[linear-gradient(135deg,#10233B,#0F172A)] p-5 text-slate-100 shadow-[0_20px_40px_rgba(15,23,42,0.2)]">
              <p className="text-xs uppercase tracking-[0.25em] text-sky-300">Progress</p>
              <p className="mt-3 text-4xl font-semibold text-white">{totals.percent}%</p>
              <p className="mt-2 text-sm text-slate-300">
                {totals.completedItems} of {totals.totalItems} items completed.
              </p>
            </div>

            <div className="rounded-3xl border border-white/80 bg-white/78 px-5 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                Ready state
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {totals.completedItems === totals.totalItems ? "Checklist complete" : "Review in progress"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Complete every section before launch so your mission starts with a clean, repeatable process.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() =>
                  showToast({
                    title: "Checklist saved",
                    description: "This is where saved pre-flight readiness records can plug in later.",
                  })
                }
              >
                Save progress
              </Button>
              <Button variant="secondary" onClick={resetChecklist}>
                Reset checklist
              </Button>
            </div>
          </div>
        </Card>

        <Card
          eyebrow="Operational Habit"
          title="Critical steps before takeoff"
          description="Organized by the way many pilots actually think in the field: site, aircraft, mission, then crew and safety."
        >
          <div className="space-y-5">
            {checklistSections.map((section) => (
              <section key={section.id} className="rounded-3xl border border-white/80 bg-white/84 px-5 py-5 shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
                <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
                <div className="mt-4 space-y-3">
                  {section.items.map((item) => {
                    const key = `${section.id}:${item}`;
                    const checked = checkedItems[key];

                    return (
                      <label
                        key={key}
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl px-3 py-3 transition ${
                          checked
                            ? "border border-emerald-100 bg-[linear-gradient(180deg,rgba(236,253,245,1),rgba(220,252,231,0.72))]"
                            : "border border-transparent bg-slate-50/85 hover:border-cyan-100 hover:bg-cyan-50/80"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleItem(key)}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-tide focus:ring-sky-400"
                        />
                        <span className={`text-sm leading-7 ${checked ? "text-slate-900" : "text-slate-600"}`}>
                          {item}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
