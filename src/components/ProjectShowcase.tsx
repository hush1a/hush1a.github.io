import { useEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
  useMotionValue,
  useSpring,
} from "motion/react";
import { cn } from "@lib/utils";

// Project gallery for /projects: hover a title for a cursor-following
// preview, click to expand it in place. The title and thumbnail share a
// `layoutId` between the two views, so motion morphs them from their row
// position into the detail layout and back.

export type ShowcaseProject = {
  id: string;
  title: string;
  description: string;
  year: number;
  html: string;
  image?: { src: string; width: number; height: number };
  demoURL?: string;
  repoURL?: string;
};

type Props = {
  projects: ShowcaseProject[];
};

const SPRING = { type: "spring", stiffness: 380, damping: 36 } as const;

export default function ProjectShowcase({ projects }: Props) {
  // `morph` is false when stepping through "Next": that project's gallery
  // row isn't on screen, so morphing from its stale position would fly in
  // from nowhere. It fades in instead.
  const [selection, setSelection] = useState<{ id: string; morph: boolean } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // Row to hand focus back to when the detail view closes.
  const returnFocusId = useRef<string | null>(null);

  const selectedId = selection?.id ?? null;
  const selected = projects.find(p => p.id === selectedId) ?? null;

  // Bring the section top into view before the swap rather than after:
  // motion snapshots positions during React's commit, so scrolling first
  // keeps the layout animation's start point accurate.
  function scrollToTop() {
    const top = rootRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 96) window.scrollBy({ top: top - 96, behavior: "instant" });
  }

  function open(id: string, morph = true) {
    scrollToTop();
    returnFocusId.current = id;
    setSelection({ id, morph });
  }

  function close() {
    setSelection(null);
  }

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  return (
    <MotionConfig transition={SPRING} reducedMotion="user">
      <LayoutGroup>
        <div ref={rootRef}>
          {selected ? (
            <Detail
              key={selected.id}
              project={selected}
              morph={selection?.morph ?? true}
              next={projects[(projects.indexOf(selected) + 1) % projects.length]}
              onClose={close}
              onSelect={open}
            />
          ) : (
            <Gallery
              projects={projects}
              onSelect={open}
              focusId={returnFocusId.current}
            />
          )}
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}

function Gallery({
  projects,
  onSelect,
  focusId,
}: {
  projects: ShowcaseProject[];
  onSelect: (id: string) => void;
  focusId: string | null;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [canHover, setCanHover] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  // The floating preview only makes sense with a real pointer; touch
  // devices get the inline thumbnails instead.
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setCanHover(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setCanHover(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!focusId) return;
    listRef.current
      ?.querySelector<HTMLButtonElement>(`[data-project="${CSS.escape(focusId)}"]`)
      ?.focus({ preventScroll: true });
  }, [focusId]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 300, damping: 30, mass: 0.6 });

  function onPointerMove(e: PointerEvent) {
    x.set(e.clientX);
    y.set(e.clientY);
  }

  function onRowEnter(e: PointerEvent, id: string) {
    if (hoveredId === null) {
      springX.jump(e.clientX);
      springY.jump(e.clientY);
    }
    setHoveredId(id);
  }

  const hovered = projects.find(p => p.id === hoveredId);

  return (
    <div onPointerMove={canHover ? onPointerMove : undefined}>
      <ul
        ref={listRef}
        className="border-t border-black/15 dark:border-white/20"
        onPointerLeave={() => setHoveredId(null)}
      >
        {projects.map((project, i) => {
          const dimmed = hoveredId !== null && hoveredId !== project.id;
          return (
            <li key={project.id} className="border-b border-black/15 dark:border-white/20">
              <button
                type="button"
                data-project={project.id}
                onClick={() => onSelect(project.id)}
                onPointerEnter={e => onRowEnter(e, project.id)}
                aria-label={`${project.title}: show details`}
                className="group w-full flex items-center gap-4 sm:gap-6 py-6 text-left cursor-pointer outline-offset-4 transition-opacity duration-300"
                style={{ opacity: dimmed ? 0.35 : 1 }}
              >
                <span className="font-mono text-xs opacity-75 w-6 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="block flex-1 min-w-0">
                  <motion.span
                    layoutId={`title-${project.id}`}
                    className="block w-fit text-2xl sm:text-4xl font-semibold tracking-tight text-black dark:text-white"
                  >
                    <span className="block transition-transform duration-300 ease-out group-hover:translate-x-2">
                      {project.title}
                    </span>
                  </motion.span>
                  <span className="block mt-1 text-sm line-clamp-2 sm:line-clamp-1">
                    {project.description}
                  </span>
                </span>

                <span className="hidden sm:block font-mono text-xs opacity-75 shrink-0">
                  {project.year}
                </span>

                <motion.span
                  layoutId={`image-${project.id}`}
                  className="block w-20 sm:w-28 aspect-4/3 shrink-0 overflow-hidden rounded-md border border-black/15 dark:border-white/20"
                >
                  <Cover project={project} />
                </motion.span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Portalled to <body>: the page's `.animate` wrapper keeps a CSS
          `translate`, which would make it the containing block for a fixed
          child and offset the preview from the cursor. canHover is only set
          after mount, so this never runs during SSR. */}
      {canHover && createPortal(
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-0 z-40 w-72 aspect-4/3"
          style={{ x: springX, y: springY, translateX: "16px", translateY: "-50%" }}
        >
          <AnimatePresence>
            {hovered && (
              <motion.div
                key={hovered.id}
                className="absolute inset-0 overflow-hidden rounded-lg border border-black/15 dark:border-white/20 shadow-xl shadow-black/10 dark:shadow-black/40"
                initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Cover project={hovered} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>,
        document.body,
      )}
    </div>
  );
}

function Detail({
  project,
  morph,
  next,
  onClose,
  onSelect,
}: {
  project: ShowcaseProject;
  morph: boolean;
  next: ShowcaseProject;
  onClose: () => void;
  onSelect: (id: string, morph?: boolean) => void;
}) {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    backRef.current?.focus({ preventScroll: true });
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay: 0.15, ease: "easeOut" },
  } as const;

  return (
    <div className="space-y-8">
      <motion.div {...fadeIn} transition={{ duration: 0.25 }}>
        <button
          ref={backRef}
          type="button"
          onClick={onClose}
          className="pressable group flex items-center gap-1.5 text-sm cursor-pointer hover:text-black dark:hover:text-white"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">&larr;</span>
          All projects
          <kbd className="ml-2 font-mono text-xs opacity-75">esc</kbd>
        </button>
      </motion.div>

      <div className="space-y-2">
        <motion.h2
          layoutId={morph ? `title-${project.id}` : undefined}
          {...(morph ? {} : fadeIn)}
          className="text-4xl sm:text-6xl font-semibold tracking-tight text-black dark:text-white"
        >
          {project.title}
        </motion.h2>
        <motion.div {...fadeIn} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="font-mono text-xs opacity-75">{project.year}</span>
          {project.demoURL && <ExternalLink href={project.demoURL}>demo</ExternalLink>}
          {project.repoURL && <ExternalLink href={project.repoURL}>repo</ExternalLink>}
        </motion.div>
      </div>

      {/* Drag stays inside this box and springs back on release. layoutId and
          drag sit on separate elements: both drive `transform`, and sharing
          one element makes the layout animation fight the drag offset. */}
      <div ref={constraintsRef} className="relative -mx-2 sm:-mx-8 p-2 sm:p-8">
        <motion.div
          layoutId={morph ? `image-${project.id}` : undefined}
          {...(morph ? {} : fadeIn)}
          className="aspect-16/10 rounded-xl overflow-hidden border border-black/15 dark:border-white/20"
        >
          <motion.div
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.25}
            dragSnapToOrigin
            whileDrag={{ scale: 1.04, rotate: -1.5, cursor: "grabbing" }}
            className="size-full cursor-grab touch-none"
          >
            <Cover project={project} large />
          </motion.div>
        </motion.div>
        <motion.p {...fadeIn} className="mt-3 font-mono text-xs opacity-75 text-center" aria-hidden="true">
          drag the preview
        </motion.p>
      </div>

      <motion.article {...fadeIn} dangerouslySetInnerHTML={{ __html: project.html }} />

      <motion.div
        {...fadeIn}
        className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-black/15 dark:border-white/20 text-sm"
      >
        <a
          href={`/projects/${project.id}`}
          className="underline underline-offset-2 decoration-black/15 dark:decoration-white/30 hover:text-black dark:hover:text-white transition-colors duration-300"
        >
          Open full page
        </a>
        {next.id !== project.id && (
          <button
            type="button"
            onClick={() => onSelect(next.id, false)}
            className="pressable group flex items-center gap-1.5 cursor-pointer hover:text-black dark:hover:text-white"
          >
            Next: <span className="font-semibold">{next.title}</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
          </button>
        )}
      </motion.div>
    </div>
  );
}

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-2 decoration-black/15 dark:decoration-white/30 hover:text-black dark:hover:text-white transition-colors duration-300"
    >
      {children}
    </a>
  );
}

// Screenshot when the entry has one, otherwise a typographic placeholder
// so the gallery still works before screenshots are added.
function Cover({ project, large = false }: { project: ShowcaseProject; large?: boolean }) {
  if (project.image) {
    return (
      <img
        src={project.image.src}
        width={project.image.width}
        height={project.image.height}
        alt=""
        draggable={false}
        loading="lazy"
        decoding="async"
        className="size-full object-cover select-none"
      />
    );
  }

  // Spans throughout: the small cover renders inside the gallery's row
  // <button>, which only allows phrasing content.
  return (
    <span
      className="relative size-full flex items-end p-[8%] select-none bg-stone-200 dark:bg-stone-800 text-black/70 dark:text-white/80"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
        backgroundSize: large ? "20px 20px" : "10px 10px",
      }}
    >
      <span className="absolute inset-0 bg-linear-to-t from-stone-200 via-stone-200/80 to-stone-200/40 dark:from-stone-800 dark:via-stone-800/80 dark:to-stone-800/40" />
      <span
        className={cn(
          "relative font-mono font-semibold leading-none tracking-tighter",
          large ? "text-5xl sm:text-7xl" : "text-[0.6rem] sm:text-xs",
        )}
      >
        <span className="text-orange-600 dark:text-orange-300">~/</span>
        {project.id}
      </span>
    </span>
  );
}
