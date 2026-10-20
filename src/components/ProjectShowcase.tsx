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
// position into the detail layout and back. Projects come in groups
// (technical, consulting), each listed under its own heading; opening one
// replaces the whole gallery, and "Next" stays within that group.

export type ShowcaseProject = {
  id: string;
  title: string;
  description: string;
  year: number;
  html: string;
  image?: { src: string; width: number; height: number };
  // Shown after the cover in the detail view's carousel.
  gallery: { src: string; width: number; height: number; alt: string }[];
  demoURL?: string;
  repoURL?: string;
};

export type ShowcaseGroup = {
  id: string;
  label: string;
  projects: ShowcaseProject[];
};

type Props = {
  groups: ShowcaseGroup[];
};

const SPRING = { type: "spring", stiffness: 380, damping: 36 } as const;

// Detail-view content that isn't morphing in fades up just after the morph.
const FADE_IN = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: 0.15, ease: "easeOut" },
} as const;

export default function ProjectShowcase({ groups }: Props) {
  // `morph` is false when stepping through "Next": that project's gallery
  // row isn't on screen, so morphing from its stale position would fly in
  // from nowhere. It fades in instead.
  const [selection, setSelection] = useState<{ id: string; morph: boolean } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // Row to hand focus back to when the detail view closes.
  const returnFocusId = useRef<string | null>(null);

  const selectedId = selection?.id ?? null;
  const group = groups.find(g => g.projects.some(p => p.id === selectedId));
  const selected = group?.projects.find(p => p.id === selectedId) ?? null;

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
          {selected && group ? (
            <Detail
              key={selected.id}
              project={selected}
              morph={selection?.morph ?? true}
              next={group.projects[(group.projects.indexOf(selected) + 1) % group.projects.length]}
              onClose={close}
              onSelect={open}
            />
          ) : (
            <Gallery
              groups={groups}
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
  groups,
  onSelect,
  focusId,
}: {
  groups: ShowcaseGroup[];
  onSelect: (id: string) => void;
  focusId: string | null;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [canHover, setCanHover] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

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
    galleryRef.current
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

  const hovered = groups.flatMap(g => g.projects).find(p => p.id === hoveredId);

  return (
    <div ref={galleryRef} className="space-y-16" onPointerMove={canHover ? onPointerMove : undefined}>
      {groups.map(group => (
        <section key={group.id} aria-labelledby={`group-${group.id}`} className="space-y-4">
          <div className="flex flex-wrap gap-y-2 items-baseline justify-between">
            <h2 id={`group-${group.id}`} className="font-semibold text-black dark:text-white">
              {group.label}
            </h2>
            <span className="text-sm opacity-75">
              {group.projects.length} {group.projects.length === 1 ? "project" : "projects"}
            </span>
          </div>
          <ul
            className="border-t border-black/15 dark:border-white/20"
            onPointerLeave={() => setHoveredId(null)}
          >
            {group.projects.map((project, i) => {
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
        </section>
      ))}

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
  const backRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    backRef.current?.focus({ preventScroll: true });
  }, []);

  const fadeIn = FADE_IN;

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

      <Carousel project={project} morph={morph} />

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

// The cover followed by the project's gallery. Swipe or drag sideways,
// use the arrow buttons, or the ← / → keys; it wraps at both ends. The
// frame keeps the cover's `layoutId`, so the morph from the gallery row
// still lands on it. With no gallery the cover can still be dragged
// around and springs back, as before.
function Carousel({ project, morph }: { project: ShowcaseProject; morph: boolean }) {
  const fadeIn = FADE_IN;
  const frameRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = project.gallery.length + 1;
  const multiple = count > 1;

  function step(by: number) {
    setIndex(i => (i + by + count) % count);
  }

  useEffect(() => {
    if (!multiple) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [multiple, count]);

  // A swipe counts once it travels a sixth of the frame, or is flicked.
  function onDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
    if (!multiple) return;
    const threshold = (frameRef.current?.offsetWidth ?? 0) / 6;
    if (info.offset.x < -threshold || info.velocity.x < -500) step(1);
    else if (info.offset.x > threshold || info.velocity.x > 500) step(-1);
  }

  // Load the visible slide and its neighbours up front so a swipe never
  // lands on a blank frame; the rest load as they come near.
  const isNear = (i: number) => {
    const d = Math.abs(i - index);
    return Math.min(d, count - d) <= 1;
  };

  const caption = index === 0 ? "Cover" : project.gallery[index - 1].alt;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div>
      <motion.div
        ref={frameRef}
        layoutId={morph ? `image-${project.id}` : undefined}
        {...(morph ? {} : fadeIn)}
        role={multiple ? "region" : undefined}
        aria-roledescription={multiple ? "carousel" : undefined}
        aria-label={multiple ? `${project.title} images` : undefined}
        className="aspect-video rounded-xl overflow-hidden border border-black/15 dark:border-white/20 bg-stone-200 dark:bg-stone-800"
      >
        {/* Drag and slide offset sit on separate elements, and apart from the
            layoutId frame: all three drive `transform`, and sharing one
            element makes them fight. The drag layer springs back on release
            while the track below moves to the new slide. */}
        <motion.div
          drag={multiple ? "x" : true}
          dragConstraints={multiple ? undefined : frameRef}
          dragElastic={0.25}
          dragSnapToOrigin
          onDragEnd={onDragEnd}
          whileDrag={multiple ? { cursor: "grabbing" } : { scale: 1.04, rotate: -1.5, cursor: "grabbing" }}
          className={cn("size-full cursor-grab", multiple ? "touch-pan-y" : "touch-none")}
        >
          <motion.div
            className="flex size-full"
            animate={{ x: `${-index * 100}%` }}
          >
            <div
              role={multiple ? "group" : undefined}
              aria-roledescription={multiple ? "slide" : undefined}
              aria-label={multiple ? `1 of ${count}: cover` : undefined}
              aria-hidden={multiple && index !== 0 ? true : undefined}
              className="size-full shrink-0"
            >
              <Cover project={project} large />
            </div>
            {project.gallery.map((image, i) => (
              <div
                key={image.src}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 2} of ${count}`}
                aria-hidden={index !== i + 1 ? true : undefined}
                className="size-full shrink-0"
              >
                {/* Contain, not cover: slides and diagrams come in many
                    shapes and shouldn't lose their edges. */}
                <img
                  src={image.src}
                  width={image.width}
                  height={image.height}
                  alt={image.alt}
                  draggable={false}
                  loading={isNear(i + 1) ? "eager" : "lazy"}
                  decoding="async"
                  className="size-full object-contain select-none"
                />
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div {...fadeIn} className="mt-3 flex items-center gap-4 text-sm">
        {multiple ? (
          <>
            <p className="flex-1 min-w-0 truncate opacity-75" aria-live="polite">
              {caption}
            </p>
            <div className="flex shrink-0 items-center gap-1">
              <span className="mr-2 font-mono text-xs opacity-75" aria-hidden="true">
                {pad(index + 1)} / {pad(count)}
              </span>
              <CarouselButton label="Previous image" onClick={() => step(-1)}>&larr;</CarouselButton>
              <CarouselButton label="Next image" onClick={() => step(1)}>&rarr;</CarouselButton>
            </div>
          </>
        ) : (
          <p className="flex-1 font-mono text-xs opacity-75 text-center" aria-hidden="true">
            drag the preview
          </p>
        )}
      </motion.div>
    </div>
  );
}

function CarouselButton({ label, onClick, children }: { label: string; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="pressable grid size-8 place-items-center rounded-md border border-black/15 dark:border-white/20 cursor-pointer hover:border-black/30 dark:hover:border-white/40 hover:text-black dark:hover:text-white transition-colors duration-300"
    >
      {children}
    </button>
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
