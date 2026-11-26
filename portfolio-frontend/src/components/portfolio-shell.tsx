import { Link, useLocation } from "@tanstack/react-router";
import { BriefcaseBusiness, Code2, FileCode2, Github, Home, Mail, NotebookPen, UserRound } from "lucide-react";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import mark from "@/assets/hemanshu-mark.png";

const items = [
  { id: "home", label: "Home", file: "Hero.tsx", icon: Home },
  { id: "about", label: "About", file: "About.tsx", icon: UserRound },
  { id: "work", label: "Work", file: "Work.tsx", icon: BriefcaseBusiness },
  { id: "blog", label: "Blog", file: "Blog.tsx", icon: NotebookPen },
  { id: "contact", label: "Contact", file: "Contact.tsx", icon: Mail },
] as const;

type SectionId = (typeof items)[number]["id"];

type ShellProps = {
  children: ReactNode;
  /**
   * For detail pages (blog post, project): the "open file" shown as the active
   * editor tab, plus which section it belongs to.
   */
  openFile?: { name: string; section: SectionId };
};

/** Section link: smooth-scrolls on the home page, navigates to /#section elsewhere. */
function SectionLink({ id, className, children, ...rest }: {
  id: SectionId;
  className: string;
  children: ReactNode;
  "aria-label"?: string;
  title?: string;
  "aria-current"?: "true";
}) {
  const isHome = useLocation({ select: (l) => l.pathname === "/" });
  if (!isHome) {
    return <Link to="/" hash={id} className={className} {...rest}>{children}</Link>;
  }
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return <a href={`#${id}`} onClick={onClick} className={className} {...rest}>{children}</a>;
}

export function PortfolioShell({ children, openFile }: ShellProps) {
  const [scrolledTo, setScrolledTo] = useState<SectionId>("home");
  const active: SectionId = openFile?.section ?? scrolledTo;
  const current = items.find((item) => item.id === active) ?? items[0];

  useEffect(() => {
    if (openFile) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 48) {
        setScrolledTo("contact");
        return;
      }
      const line = window.scrollY + window.innerHeight * 0.35;
      let next: SectionId = items[0].id;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top + window.scrollY <= line) next = item.id;
      }
      setScrolledTo(next);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [openFile]);

  const isActive = (id: SectionId) => !openFile && active === id;

  return (
    <div className="workspace min-h-screen bg-background text-foreground">
      <aside className="activity-bar fixed inset-y-0 left-0 z-50 hidden w-[60px] flex-col items-center border-r border-border bg-chrome/90 py-3 backdrop-blur-xl lg:flex">
        <SectionLink id="home" aria-label="Hemanshu Mahajan home" className="mb-5 grid size-10 place-items-center">
          <img src={mark} alt="Hemanshu Mahajan monogram" width={40} height={40} className="size-9 object-contain" />
        </SectionLink>
        <nav aria-label="Primary" className="flex w-full flex-1 flex-col items-center gap-1">
          {items.map(({ id, label, icon: Icon }) => (
            <SectionLink key={id} id={id} aria-label={label} title={label} {...(active === id ? { "aria-current": "true" as const } : {})} className={active === id ? "activity-link activity-link-active" : "activity-link"}>
              <Icon className="size-5" />
            </SectionLink>
          ))}
          <a href="https://github.com/hemanshumahajan" target="_blank" rel="noreferrer" aria-label="GitHub profile" title="GitHub" className="activity-link mt-auto">
            <Github className="size-5" />
          </a>
        </nav>
      </aside>

      <header className="tab-bar fixed inset-x-0 top-0 z-40 border-b border-border bg-chrome/80 backdrop-blur-xl lg:left-[60px]">
        <div className="tab-strip hidden h-11 items-stretch overflow-x-auto md:flex">
          {items.map(({ id, file, icon: Icon }) => (
            <SectionLink key={id} id={id} {...(isActive(id) ? { "aria-current": "true" as const } : {})} className={isActive(id) ? "editor-tab editor-tab-active" : "editor-tab"}>
              <Icon className="size-3.5" /> {file}
            </SectionLink>
          ))}
          {openFile && (
            <span className="editor-tab editor-tab-active" aria-current="page">
              <FileCode2 className="size-3.5" /> <span className="max-w-[260px] truncate">{openFile.name}</span>
            </span>
          )}
        </div>
        <div className="grid h-12 grid-cols-[minmax(0,1fr)_auto] items-center px-4 md:hidden">
          <div className="flex min-w-0 items-center gap-2 font-mono text-xs"><Code2 className="size-4 shrink-0 text-primary" /><span className="truncate">{openFile?.name ?? current.file}</span></div>
          <a href="https://github.com/hemanshumahajan" target="_blank" rel="noreferrer" aria-label="GitHub profile"><Github className="size-5" /></a>
        </div>
      </header>

      <main className="relative min-h-screen pb-24 pt-12 md:pt-11 lg:ml-[60px] lg:pb-16">{children}</main>

      <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-50 grid h-16 grid-cols-5 border-t border-border bg-chrome/95 px-2 backdrop-blur-xl md:hidden">
        {items.map(({ id, label, icon: Icon }) => (
          <SectionLink key={id} id={id} {...(active === id ? { "aria-current": "true" as const } : {})} className={active === id ? "mobile-nav-link text-primary" : "mobile-nav-link"}>
            <Icon className="size-5" /><span>{label}</span>
          </SectionLink>
        ))}
      </nav>

      <footer className="status-bar fixed bottom-0 left-0 right-0 z-40 hidden h-7 items-center justify-between border-t border-border bg-chrome/90 px-4 font-mono text-[11px] backdrop-blur-xl md:flex lg:left-[60px]">
        <span className="flex items-center gap-2"><span className="status-dot" />Available for opportunities</span>
        <span>{current.label} / Enterprise Software Developer (C#/.NET)</span>
      </footer>
    </div>
  );
}
