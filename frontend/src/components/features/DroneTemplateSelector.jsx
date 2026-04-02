import Input from "../ui/Input";

const BRAND_ORDER = ["DJI", "Autel", "Skydio", "Parrot", "Freefly", "Yuneec", "Other"];

function startCase(value) {
  return value
    ?.split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function matchesBrand(template, selectedBrand) {
  if (!selectedBrand || selectedBrand === "All") {
    return true;
  }

  if (selectedBrand === "Other") {
    return !BRAND_ORDER.slice(0, -1).includes(template.brand);
  }

  return template.brand === selectedBrand;
}

export default function DroneTemplateSelector({
  templates,
  selectedBrand,
  searchValue,
  selectedTemplateId,
  onBrandChange,
  onSearchChange,
  onSelectTemplate,
  onSelectCustom,
}) {
  const brands = ["All", ...BRAND_ORDER.filter((brand) => brand !== "Other" || templates.some((template) => matchesBrand(template, "Other")))];
  const filteredTemplates = templates.filter((template) => {
    if (!matchesBrand(template, selectedBrand)) {
      return false;
    }

    if (!searchValue?.trim()) {
      return true;
    }

    const query = searchValue.trim().toLowerCase();
    const haystack = [template.brand, template.model, template.category, ...(template.useCaseTags ?? [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fast Setup</p>
          <h3 className="mt-1 text-base font-bold text-white">Select brand, select model, done</h3>
          <p className="mt-1 text-sm text-slate-300">Common drones should take two or three clicks with thresholds auto-filled instantly.</p>
        </div>
      </div>

      <div className="mt-4">
        <Input
          label="Search drone"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search drone..."
        />
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium text-slate-200">Select brand</p>
        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => {
            const active = brand === selectedBrand;
            return (
              <button
                key={brand}
                type="button"
                onClick={() => onBrandChange(brand)}
                className={[
                  "rounded-full border px-4 py-2 text-sm font-semibold transition",
                  active
                    ? "border-ped-orange bg-ped-orange text-white"
                    : "border-white/10 bg-black/20 text-slate-200 hover:border-white/20 hover:text-white",
                ].join(" ")}
              >
                {brand}
              </button>
            );
          })}
          <button
            type="button"
            onClick={onSelectCustom}
            className="rounded-full border border-dashed border-white/15 bg-black/20 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-ped-orange hover:text-white"
          >
            Other
          </button>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium text-slate-200">Select model</p>
        {filteredTemplates.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {filteredTemplates.map((template) => {
              const active = template.id === selectedTemplateId;

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => onSelectTemplate(template)}
                  className={[
                    "rounded-2xl border px-4 py-3 text-left transition",
                    active
                      ? "border-ped-orange bg-ped-orange/10 ring-1 ring-ped-orange"
                      : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{template.model}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {template.brand} · {template.weightG} g
                      </p>
                    </div>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-200">
                      {startCase(template.category)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                    <span>Wind {template.recommendedWindGreen}/{template.recommendedWindCaution} mph</span>
                    <span>Gust {template.recommendedGustGreen}/{template.recommendedGustCaution} mph</span>
                    <span>{template.maxFlightTimeMin} min</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-slate-400">
            No models match the current brand or search. Choose another brand or use a custom manual setup.
          </div>
        )}
      </div>
    </div>
  );
}
