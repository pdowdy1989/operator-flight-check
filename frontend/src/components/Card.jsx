export default function Card({
  title,
  eyebrow,
  description,
  children,
  className = "",
}) {
  return (
    <article
      className={`rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] p-5 shadow-card backdrop-blur sm:p-6 ${className}`}
    >
      {eyebrow ? (
        <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-orange-800">
          {eyebrow}
        </span>
      ) : null}
      {title ? <h2 className="mt-4 text-2xl font-semibold text-slate-950">{title}</h2> : null}
      {description ? <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p> : null}
      <div className={title || eyebrow || description ? "mt-6" : ""}>{children}</div>
    </article>
  );
}
