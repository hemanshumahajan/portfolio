import { useQuery } from "@tanstack/react-query";
import { Github } from "lucide-react";
import { getGithubStats } from "@/lib/api";

// Neutral placeholder while loading or if GitHub is unavailable — never invented activity.
const emptyWeeks = Array.from({ length: 52 }, () => Array.from({ length: 7 }, () => 0));

const formatMetric = (value: number | null | undefined) =>
  value === null || value === undefined
    ? "—"
    : new Intl.NumberFormat("en", {
        notation: value >= 10_000 ? "compact" : "standard",
        maximumFractionDigits: 1,
      }).format(value);

export function GithubPanel({ full = false }: { full?: boolean }) {
  // Served and cached (1h) by the ASP.NET Core backend, so visitors never hit GitHub directly.
  const { data } = useQuery({
    queryKey: ["github-stats"],
    queryFn: getGithubStats,
    staleTime: 10 * 60_000,
    retry: 1,
  });

  const allWeeks = data?.weeks.length ? data.weeks : emptyWeeks;
  const weeks = full ? allWeeks : allWeeks.slice(-26);

  return (
    <section className={`terminal-panel ${full ? "terminal-panel-wide" : ""}`} aria-label="GitHub activity">
      <div className="terminal-titlebar">
        <span className="dot dot-red" />
        <span className="dot dot-amber" />
        <span className="dot dot-green" />
        <span className="ml-2">output — github-stats</span>
        <Github className="ml-auto size-4" />
      </div>
      <div className="stats-grid">
        <div><strong>{formatMetric(data?.followers)}</strong><span>followers</span></div>
        <div><strong>{formatMetric(data?.publicRepos)}</strong><span>public repos</span></div>
        <div><strong>{formatMetric(data?.commits)}</strong><span>public commits</span></div>
        <div><strong>{formatMetric(data?.estimatedLines)}</strong><span>estimated lines</span></div>
        <div><strong>{formatMetric(data?.stars)}</strong><span>stars earned</span></div>
      </div>
      <div className="heatmap-wrap">
        <div className="heatmap" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(8px, 1fr))` }}>
          {weeks.flatMap((days, wi) =>
            days.map((level, di) => (
              <span key={`${wi}-${di}`} className={`heat heat-${Math.min(level, 4)}`} title={`${level} contribution level`} />
            )),
          )}
        </div>
      </div>
      <div className="heat-legend">
        {data?.totalContributions != null && (
          <span className="mr-auto">{formatMetric(data.totalContributions)} contributions in the last year</span>
        )}
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => <i key={level} className={`heat heat-${level}`} />)}
        <span>More</span>
      </div>
    </section>
  );
}
