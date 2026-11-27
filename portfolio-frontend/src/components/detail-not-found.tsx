import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PortfolioShell } from "@/components/portfolio-shell";

export function DetailNotFound({ section, what }: { section: "blog" | "work"; what: string }) {
  return (
    <PortfolioShell openFile={{ name: "404.log", section }}>
      <div className="detail-page detail-empty">
        <p className="file-path">error: {what} not found</p>
        <h1>This {what} doesn&apos;t exist.</h1>
        <p>It may have been moved, unpublished, or the link is mistyped.</p>
        <Link to="/" hash={section} className="text-link"><ArrowLeft /> Back to {section === "blog" ? "writing" : "work"}</Link>
      </div>
    </PortfolioShell>
  );
}
