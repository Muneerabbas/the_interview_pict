import { Briefcase, Building2, IndianRupee, TrendingUp, Users } from "lucide-react";

/**
 * Server component on purpose -- every chart here is a div with an inline width,
 * so the dashboard itself ships no JavaScript. Only the branch lens and the
 * table below it are interactive.
 *
 * Colours are literal hex from the Claude Design palette rather than the
 * semantic tokens: app/globals.scss only hand-writes six of those (.bg-card,
 * .text-foreground and friends), so bg-card/50 or bg-chart-1 renders nothing.
 */

const CARD =
  "rounded-[18px] border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-800";
const SECTION_TITLE =
  "font-display text-[22px] font-extrabold tracking-[-0.03em] text-slate-900 dark:text-slate-100";
const SECTION_NOTE = "mt-1.5 text-[14.5px] text-slate-600 dark:text-slate-400";
const ACCENT = "bg-[#2447E8] dark:bg-[#8AA5FF]";

const BRANCH_STYLE = {
  ce: { bar: "bg-[#6B5DD3] dark:bg-[#CDC6F7]", chip: "#CDC6F7", ink: "#241E5C" },
  entc: { bar: "bg-[#C67A17] dark:bg-[#FFD9A8]", chip: "#FFD9A8", ink: "#5A3A0B" },
  it: { bar: "bg-[#2F8F63] dark:bg-[#BCE7CF]", chip: "#BCE7CF", ink: "#0C3A26" },
};

const lpa = (n) => `₹${Number(n).toFixed(2)} L`;

/** The one repeated primitive: a track with a proportional fill. */
function Bar({ value, max, className = ACCENT }) {
  const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 1.5 : 0) : 0;
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.07]">
      <div className={`h-full rounded-full ${className}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatTile({ Icon, value, label, note }) {
  return (
    <div className={`${CARD} p-5`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#CDC6F7] text-[#241E5C]">
        <Icon size={20} />
      </span>
      <p className="mt-4 font-display text-[30px] font-extrabold tabular-nums tracking-[-0.035em] text-slate-900 dark:text-slate-100">
        {value}
      </p>
      <p className="mt-1 text-[14px] font-semibold text-slate-700 dark:text-slate-300">{label}</p>
      {note ? (
        <p className="mt-0.5 font-mono text-[11px] text-slate-500">{note}</p>
      ) : null}
    </div>
  );
}

function RankList({ title, note, items, render, max, barClass }) {
  // Scale against the true peak: this list is sorted by package, so items[0] is
  // not necessarily the largest headcount and using it made every bar full width.
  const peak = items.length ? Math.max(...items.map(max)) : 0;
  return (
    <div className={`${CARD} p-5`}>
      <h3 className="text-[14px] font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mb-4 mt-0.5 font-mono text-[11px] uppercase tracking-[0.1em] text-slate-500">
        {note}
      </p>
      <ol className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={`${item.company}-${item.lpa}-${item.total}`}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="truncate text-[13.5px] font-medium text-slate-700 dark:text-slate-300">
                {item.company}
              </span>
              <span className="shrink-0 font-mono text-[11.5px] font-semibold tabular-nums text-slate-500">
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

export default function PlacementCharts({ stats }) {
  const { headline, branches, postgrad, bands, groups, gender, branch } = stats;
  const maxBand = Math.max(...bands.map((b) => b.offers));
  const accentBar = branch ? BRANCH_STYLE[branch].bar : ACCENT;

  return (
    <div className="flex flex-col gap-10">
      {/* Headline */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatTile
          Icon={Briefcase}
          value={headline.offers}
          label="Offers"
          note={gender ? `${gender.male} male · ${gender.female} female` : `across ${headline.drives} drives`}
        />
        <StatTile Icon={TrendingUp} value={lpa(headline.medianLpa)} label="Median package" note="half sit below this" />
        <StatTile Icon={IndianRupee} value={lpa(headline.meanLpa)} label="Mean package" note="pulled up by the tail" />
        <StatTile Icon={TrendingUp} value={lpa(headline.maxLpa)} label="Highest package" note={headline.maxCompany} />
        <StatTile Icon={Building2} value={headline.employers} label="Companies" note={`${headline.drives} separate drives`} />
        {gender ? (
          <StatTile
            Icon={Users}
            value={`${gender.femaleShare}%`}
            label="Female share"
            note={`${gender.female} of ${headline.offers} offers`}
          />
        ) : (
          <StatTile Icon={IndianRupee} value={lpa(headline.minLpa)} label="Lowest package" note="the floor for this branch" />
        )}
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
            <div
              key={band.label}
              className="grid grid-cols-[68px_1fr_92px] items-center gap-3 sm:grid-cols-[84px_1fr_110px] sm:gap-4"
            >
              <span className="text-right font-mono text-[11.5px] tabular-nums text-slate-500">
                {band.label}
              </span>
              <Bar value={band.offers} max={maxBand} className={accentBar} />
              <span className="font-mono text-[11.5px] tabular-nums text-slate-500">
                <b className="font-bold text-slate-800 dark:text-slate-200">{band.offers}</b> · {band.share}%
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Branches -- the all-branch view only; under a lens the whole page is the branch. */}
      {branches ? (
        <section>
          <h2 className={SECTION_TITLE}>By branch</h2>
          <p className={SECTION_NOTE}>
            Averages are weighted by headcount, not by drive. Pick a branch above to read the whole
            page through it.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((b) => (
              <div key={b.key} className={`${CARD} p-5`}>
                <h3 className="flex items-center gap-2 text-[14px] font-bold text-slate-900 dark:text-slate-100">
                  <span className={`h-2.5 w-2.5 rounded-full ${BRANCH_STYLE[b.key].bar}`} />
                  {b.label}
                </h3>
                <p className="mt-3 font-display text-[24px] font-extrabold tabular-nums tracking-[-0.03em] text-slate-900 dark:text-slate-100">
                  {b.offers}
                  <span className="ml-2 font-sans text-[11.5px] font-medium text-slate-500">
                    offers · {b.share}%
                  </span>
                </p>
                <div className="my-4">
                  <Bar value={b.offers} max={headline.offers} className={BRANCH_STYLE[b.key].bar} />
                </div>
                <dl className="grid grid-cols-2 gap-y-2 font-mono text-[11.5px]">
                  <dt className="text-slate-500">Average</dt>
                  <dd className="text-right font-bold tabular-nums text-slate-800 dark:text-slate-200">{lpa(b.avgLpa)}</dd>
                  <dt className="text-slate-500">Median</dt>
                  <dd className="text-right font-bold tabular-nums text-slate-800 dark:text-slate-200">{lpa(b.medianLpa)}</dd>
                  <dt className="text-slate-500">Highest</dt>
                  <dd className="text-right font-bold tabular-nums text-slate-800 dark:text-slate-200">{lpa(b.maxLpa)}</dd>
                </dl>
              </div>
            ))}
          </div>

          {postgrad.offers > 0 ? (
            <p className="mt-3 text-[13px] text-slate-500">
              A further {postgrad.offers} offers went to M.Tech students and are counted in the
              totals but not in the three branch cards above.
            </p>
          ) : null}
        </section>
      ) : null}

      {/* Recruiters */}
      <section>
        <h2 className={SECTION_TITLE}>Who actually hired</h2>
        <p className={SECTION_NOTE}>The largest ten drives account for a third of every offer made.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <RankList
            title="Largest by headcount"
            note="Offers made in a single drive"
            items={stats.topByHeadcount}
            max={(i) => i.total}
            render={(i) => `${i.total} · ${lpa(i.lpa)}`}
            barClass={accentBar}
          />
          <RankList
            title="Highest package"
            note="Bar width shows how many took it"
            items={stats.topByPackage}
            max={(i) => i.total}
            render={(i) => `${lpa(i.lpa)} · ${i.total}`}
            barClass="bg-[#2F8F63] dark:bg-[#8FD9B4]"
          />
        </div>
      </section>

      {/* Splits */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className={`${CARD} p-5`}>
          <h3 className="text-[14px] font-bold text-slate-900 dark:text-slate-100">Group I vs Group II</h3>
          <p className="mb-4 mt-0.5 font-mono text-[11px] uppercase tracking-[0.1em] text-slate-500">
            The report splits recruiters at the 5 LPA line
          </p>
          <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full">
            <div
              className={`h-full rounded-l-full ${accentBar}`}
              style={{ width: `${(groups.I.offers / headline.offers) * 100}%` }}
            />
            <div
              className="h-full rounded-r-full bg-slate-300 dark:bg-white/20"
              style={{ width: `${(groups.II.offers / headline.offers) * 100}%` }}
            />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-[12px]">
            <div>
              <dt className="text-slate-500">Group I &mdash; above 5 LPA</dt>
              <dd className="mt-1 font-mono font-bold tabular-nums text-slate-800 dark:text-slate-200">
                {groups.I.offers} offers · {groups.I.drives} drives · {lpa(groups.I.avgLpa)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Group II &mdash; below 5 LPA</dt>
              <dd className="mt-1 font-mono font-bold tabular-nums text-slate-800 dark:text-slate-200">
                {groups.II.offers} offers · {groups.II.drives} drives · {lpa(groups.II.avgLpa)}
              </dd>
            </div>
          </dl>
        </div>

        {gender ? (
          <div className={`${CARD} p-5`}>
            <h3 className="text-[14px] font-bold text-slate-900 dark:text-slate-100">Gender split</h3>
            <p className="mb-4 mt-0.5 font-mono text-[11px] uppercase tracking-[0.1em] text-slate-500">
              Across all {headline.offers} offers
            </p>
            <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full">
              <div className={`h-full rounded-l-full ${ACCENT}`} style={{ width: `${(gender.male / headline.offers) * 100}%` }} />
              <div
                className="h-full rounded-r-full bg-[#6B5DD3] dark:bg-[#CDC6F7]"
                style={{ width: `${(gender.female / headline.offers) * 100}%` }}
              />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-[12px]">
              <div>
                <dt className="flex items-center gap-2 text-slate-500">
                  <span className={`h-2.5 w-2.5 rounded-full ${ACCENT}`} /> Male
                </dt>
                <dd className="mt-1 font-mono font-bold tabular-nums text-slate-800 dark:text-slate-200">
                  {gender.male} · {(100 - gender.femaleShare).toFixed(1)}%
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#6B5DD3] dark:bg-[#CDC6F7]" /> Female
                </dt>
                <dd className="mt-1 font-mono font-bold tabular-nums text-slate-800 dark:text-slate-200">
                  {gender.female} · {gender.femaleShare}%
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className={`${CARD} flex flex-col justify-center p-5`}>
            <h3 className="text-[14px] font-bold text-slate-900 dark:text-slate-100">No gender split here</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
              The Training &amp; Placement Report prints male and female counts per drive, never per
              branch, so this view has no honest figure to show. Switch back to{" "}
              <b className="font-semibold text-slate-700 dark:text-slate-300">All branches</b> for it.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
