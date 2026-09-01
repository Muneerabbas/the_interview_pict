import { AlertTriangle, Briefcase, Building2, IndianRupee, TrendingUp, Users } from "lucide-react";

/**
 * Server component on purpose -- every chart here is a div with an inline width
 * or one inline SVG, so the whole dashboard ships no JavaScript. Only the table
 * below it is interactive.
 *
 * Colours are literal slate and blue utilities rather than the semantic tokens:
 * app/globals.scss only hand-writes six of those (.bg-card, .text-foreground and
 * friends), so bg-card/50 or bg-chart-1 would silently render nothing.
 */

const CARD =
  "rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900";
const SECTION_TITLE =
  "text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100";
const SECTION_NOTE = "mt-1 text-sm text-slate-500 dark:text-slate-400";

const BRANCH_STYLE = {
  ce: { bar: "bg-blue-600 dark:bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
  entc: { bar: "bg-amber-600 dark:bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  it: { bar: "bg-emerald-600 dark:bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  pg: { bar: "bg-violet-600 dark:bg-violet-500", text: "text-violet-600 dark:text-violet-400" },
};

const lpa = (n) => `₹${Number(n).toFixed(2)} L`;

/** The one repeated primitive: a track with a proportional fill. */
function Bar({ value, max, className = "bg-blue-600 dark:bg-blue-500" }) {
  const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 1.5 : 0) : 0;
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
      <div className={`h-full rounded-full ${className}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatTile({ Icon, value, label, note }) {
  return (
    <div className={`${CARD} p-5`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50">
        <Icon className="text-blue-600 dark:text-blue-400" size={20} />
      </span>
      <p className="mt-4 text-3xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-slate-100">
        {value}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</p>
      {note ? <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{note}</p> : null}
    </div>
  );
}

function RankList({ title, note, items, render, max, barClass }) {
  // Scale against the true peak: this list is sorted by package, so items[0] is
  // not necessarily the largest headcount and using it made every bar full width.
  const peak = items.length ? Math.max(...items.map(max)) : 0;
  return (
    <div className={`${CARD} p-5`}>
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mb-4 mt-0.5 text-xs text-slate-500 dark:text-slate-400">{note}</p>
      <ol className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={`${item.company}-${item.lpa}-${item.total}`}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                {item.company}
              </span>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                {render(item)}
              </span>
            </div>
            <Bar value={max(item)} max={peak} className={barClass} />
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Package (sqrt scale, the distribution is heavily right-skewed) x headcount. */
function Scatter({ points }) {
  const W = 800;
  const H = 380;
  const PAD = { top: 16, right: 24, bottom: 44, left: 46 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxLpa = 56;
  const maxTotal = 32;
  const x = (v) => PAD.left + (Math.sqrt(v) / Math.sqrt(maxLpa)) * innerW;
  const y = (v) => PAD.top + innerH - (v / maxTotal) * innerH;

  const xTicks = [0, 5, 10, 15, 20, 30, 40, 50];
  const yTicks = [0, 10, 20, 30];

  // Draw the big drives first so the small ones land on top and stay clickable.
  const ordered = [...points].sort((a, b) => b.total - a.total);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label="Every recruiting drive plotted by package against number of offers made. The top-right of the chart is empty: no company both pays a high package and hires in volume."
        >
          {yTicks.map((t) => (
            <g key={`y${t}`}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(t)}
                y2={y(t)}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 10}
                y={y(t) + 4}
                textAnchor="end"
                className="fill-slate-400 dark:fill-slate-500"
                fontSize="11"
              >
                {t}
              </text>
            </g>
          ))}

          {xTicks.map((t) => (
            <text
              key={`x${t}`}
              x={x(t)}
              y={H - PAD.bottom + 20}
              textAnchor="middle"
              className="fill-slate-400 dark:fill-slate-500"
              fontSize="11"
            >
              {t}
            </text>
          ))}

          <text
            x={PAD.left + innerW / 2}
            y={H - 8}
            textAnchor="middle"
            className="fill-slate-500 dark:fill-slate-400"
            fontSize="11"
          >
            Package (LPA)
          </text>
          <text
            transform={`translate(13 ${PAD.top + innerH / 2}) rotate(-90)`}
            textAnchor="middle"
            className="fill-slate-500 dark:fill-slate-400"
            fontSize="11"
          >
            Offers in drive
          </text>

          {ordered.map((p) => (
            <g key={`${p.company}-${p.group}`} className={BRANCH_STYLE[p.lead]?.text || BRANCH_STYLE.pg.text}>
              <circle
                cx={x(p.lpa)}
                cy={y(p.total)}
                r={3 + Math.sqrt(p.total)}
                fill="currentColor"
                fillOpacity="0.55"
                stroke="currentColor"
                strokeWidth="1"
              >
                {/* Native tooltip -- no JS, works on hover and for screen readers. */}
                <title>{`${p.company} — ${lpa(p.lpa)}, ${p.total} offer${p.total === 1 ? "" : "s"}`}</title>
              </circle>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export default function PlacementCharts({ stats }) {
  const { headline, branches, postgrad, bands, groups, gender, incompleteRows } = stats;
  const maxBand = Math.max(...bands.map((b) => b.offers));
  const corrected = branches.filter((b) => Math.abs(b.avgLpa - b.printedAvgLpa) >= 0.01);

  return (
    <div className="flex flex-col gap-10">
      {/* Headline */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatTile Icon={Briefcase} value={headline.offers} label="Offers" note={`${gender.male} male · ${gender.female} female`} />
        <StatTile Icon={IndianRupee} value={lpa(headline.meanLpa)} label="Mean package" note="Across every offer" />
        <StatTile Icon={TrendingUp} value={lpa(headline.medianLpa)} label="Median package" note="Half the year sits below this" />
        <StatTile Icon={TrendingUp} value={lpa(headline.maxLpa)} label="Highest package" note={headline.maxCompany} />
        <StatTile Icon={Building2} value={headline.employers} label="Companies" note={`${headline.drives} separate drives`} />
        <StatTile Icon={Users} value={`${gender.femaleShare}%`} label="Female share" note={`${gender.female} of ${headline.offers} offers`} />
      </section>

      {/* Distribution */}
      <section>
        <h2 className={SECTION_TITLE}>Where the packages actually land</h2>
        <p className={SECTION_NOTE}>
          The mean of {lpa(headline.meanLpa)} is pulled up by a thin tail. The median of{" "}
          {lpa(headline.medianLpa)} is the number to plan around.
        </p>
        <div className={`${CARD} mt-4 flex flex-col gap-3 p-5`}>
          {bands.map((band) => (
            <div key={band.label} className="grid grid-cols-[68px_1fr_92px] items-center gap-3 sm:grid-cols-[84px_1fr_110px] sm:gap-4">
              <span className="text-right text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400">
                {band.label}
              </span>
              <Bar value={band.offers} max={maxBand} />
              <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
                <b className="font-semibold text-slate-800 dark:text-slate-200">{band.offers}</b> · {band.share}%
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Branches */}
      <section>
        <h2 className={SECTION_TITLE}>By branch</h2>
        <p className={SECTION_NOTE}>
          Averages are weighted by headcount, not by drive.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <div key={branch.key} className={`${CARD} p-5`}>
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                <span className={`h-2.5 w-2.5 rounded-full ${BRANCH_STYLE[branch.key].bar}`} />
                {branch.label}
              </h3>
              <p className="mt-3 text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {branch.offers}
                <span className="ml-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  offers · {branch.share}%
                </span>
              </p>
              <div className="my-4">
                <Bar value={branch.offers} max={headline.offers} className={BRANCH_STYLE[branch.key].bar} />
              </div>
              <dl className="grid grid-cols-2 gap-y-2 text-xs">
                <dt className="text-slate-500 dark:text-slate-400">Average</dt>
                <dd className="text-right font-semibold tabular-nums text-slate-800 dark:text-slate-200">{lpa(branch.avgLpa)}</dd>
                <dt className="text-slate-500 dark:text-slate-400">Median</dt>
                <dd className="text-right font-semibold tabular-nums text-slate-800 dark:text-slate-200">{lpa(branch.medianLpa)}</dd>
                <dt className="text-slate-500 dark:text-slate-400">Highest</dt>
                <dd className="text-right font-semibold tabular-nums text-slate-800 dark:text-slate-200">{lpa(branch.maxLpa)}</dd>
              </dl>
            </div>
          ))}
        </div>

        {postgrad.offers > 0 ? (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            A further {postgrad.offers} offers went to M.Tech students and are counted in the
            totals but not in the three branch cards above.
          </p>
        ) : null}

        {incompleteRows.length && corrected.length ? (
          <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <div className="text-sm leading-relaxed">
              <p className="font-semibold">These differ from the printed report</p>
              <p className="mt-1">
                Row {incompleteRows[0].sr} ({incompleteRows[0].company}) has blank per-branch salary
                cells in the source, so the report&apos;s own printed averages come out low. Figures
                here are recomputed from headcount × package:{" "}
                {corrected.map((b, i) => (
                  <span key={b.key}>
                    {i > 0 ? ", " : ""}
                    <b>{b.short}</b> {b.avgLpa.toFixed(2)} (printed {b.printedAvgLpa.toFixed(2)})
                  </span>
                ))}
                . Every other figure matches the report exactly.
              </p>
            </div>
          </div>
        ) : null}
      </section>

      {/* Scatter */}
      <section>
        <h2 className={SECTION_TITLE}>Every drive, plotted</h2>
        <p className={SECTION_NOTE}>
          One dot per drive, sized by offers and coloured by the branch that took the most seats.
          The top-right is empty &mdash; no company both pays well and hires in volume.
        </p>
        <div className={`${CARD} mt-4 p-5`}>
          <div className="mb-4 flex flex-wrap items-center gap-4">
            {branches.map((b) => (
              <span key={b.key} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span className={`h-2.5 w-2.5 rounded-full ${BRANCH_STYLE[b.key].bar}`} />
                {b.short}-majority drive
              </span>
            ))}
            <span className="text-xs text-slate-400 dark:text-slate-500">Hover a dot for detail</span>
          </div>
          <Scatter points={stats.scatter} />
        </div>
      </section>

      {/* Recruiters */}
      <section>
        <h2 className={SECTION_TITLE}>Who actually hired</h2>
        <p className={SECTION_NOTE}>
          The largest ten drives account for a third of every offer made.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <RankList
            title="Largest by headcount"
            note="Offers made in a single drive"
            items={stats.topByHeadcount}
            max={(i) => i.total}
            render={(i) => `${i.total} · ${lpa(i.lpa)}`}
            barClass="bg-blue-600 dark:bg-blue-500"
          />
          <RankList
            title="Highest package"
            note="Bar width shows how many took it"
            items={stats.topByPackage}
            max={(i) => i.total}
            render={(i) => `${lpa(i.lpa)} · ${i.total}`}
            barClass="bg-emerald-600 dark:bg-emerald-500"
          />
        </div>
      </section>

      {/* Splits */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className={`${CARD} p-5`}>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Group I vs Group II</h3>
          <p className="mb-4 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            The report splits recruiters at the 5 LPA line
          </p>
          <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full">
            <div className="h-full rounded-l-full bg-blue-600 dark:bg-blue-500" style={{ width: `${(groups.I.offers / headline.offers) * 100}%` }} />
            <div className="h-full rounded-r-full bg-slate-300 dark:bg-slate-700" style={{ width: `${(groups.II.offers / headline.offers) * 100}%` }} />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Group I &mdash; above 5 LPA</dt>
              <dd className="mt-1 font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                {groups.I.offers} offers · {groups.I.drives} drives · {lpa(groups.I.avgLpa)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Group II &mdash; below 5 LPA</dt>
              <dd className="mt-1 font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                {groups.II.offers} offers · {groups.II.drives} drives · {lpa(groups.II.avgLpa)}
              </dd>
            </div>
          </dl>
        </div>

        <div className={`${CARD} p-5`}>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Gender split</h3>
          <p className="mb-4 mt-0.5 text-xs text-slate-500 dark:text-slate-400">Across all {headline.offers} offers</p>
          <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full">
            <div className="h-full rounded-l-full bg-blue-600 dark:bg-blue-500" style={{ width: `${(gender.male / headline.offers) * 100}%` }} />
            <div className="h-full rounded-r-full bg-violet-600 dark:bg-violet-500" style={{ width: `${(gender.female / headline.offers) * 100}%` }} />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600 dark:bg-blue-500" /> Male
              </dt>
              <dd className="mt-1 font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                {gender.male} · {(100 - gender.femaleShare).toFixed(1)}%
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-violet-600 dark:bg-violet-500" /> Female
              </dt>
              <dd className="mt-1 font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                {gender.female} · {gender.femaleShare}%
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
