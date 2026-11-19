import { useEffect, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionValue,
  useSpring,
} from "motion/react";

// Project list for /projects: entries grouped by kind (technical, consulting),
// each row linking to the project's own page. Hovering a row floats a preview
// beside the cursor. The project itself is rendered in full only on
// /projects/<id>, so there is a single detail view to maintain.

export type ShowcaseProject = {
  id: string;
  title: string;
  description: string;
  year: number;
  image?: { src: string; width: number; height: number };
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

export default function ProjectShowcase({ groups }: Props) {
  return (
    <MotionConfig transition={SPRING} reducedMotion="user">
      <ProjectList groups={groups} />
    </MotionConfig>
  );
}

function ProjectList({ groups }: { groups: ShowcaseGroup[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // The preview is portalled; createPortal has no server equivalent, so it
  // waits for the first client render.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 300, damping: 30, mass: 0.6 });

  // The pointer type is read from the event rather than from
  // `matchMedia("(hover: hover) and (pointer: fine)")`: that query reports
  // false in environments that do have a mouse (headless Chrome, some VMs and
  // remote desktops, device emulation), which silently dropped the preview.
  function onPointerMove(e: PointerEvent) {
    if (e.pointerType !== "mouse") return;
    x.set(e.clientX);
    y.set(e.clientY);
  }

  function onRowEnter(e: PointerEvent, id: string) {
    if (e.pointerType !== "mouse") return;
    if (hoveredId === null) {
      springX.jump(e.clientX);
      springY.jump(e.clientY);
    }
    setHoveredId(id);
  }

  const hovered = groups.flatMap(g => g.projects).find(p => p.id === hoveredId);

  return (
    <div className="space-y-16" onPointerMove={onPointerMove}>
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
                  <a
                    href={`/projects/${project.id}`}
                    onPointerEnter={e => onRowEnter(e, project.id)}
                    className="group w-full flex items-center gap-4 sm:gap-6 py-6 text-left cursor-pointer outline-offset-4 transition-opacity duration-300"
                    style={{ opacity: dimmed ? 0.35 : 1 }}
                  >
                    <span className="font-mono text-xs opacity-75 w-6 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <span className="block flex-1 min-w-0">
                      <span className="block w-fit text-2xl sm:text-4xl font-semibold tracking-tight text-black dark:text-white">
                        <span className="block transition-transform duration-300 ease-out group-hover:translate-x-2">
                          {project.title}
                        </span>
                      </span>
                      <span className="block mt-1 text-sm line-clamp-2 sm:line-clamp-1">
                        {project.description}
                      </span>
                    </span>

                    <span className="hidden sm:block font-mono text-xs opacity-75 shrink-0">
                      {project.year}
                    </span>

                    <span className="block w-20 sm:w-28 aspect-4/3 shrink-0 overflow-hidden rounded-md border border-black/15 dark:border-white/20">
                      <Cover project={project} />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {/* Portalled to <body>: the page's `.animate` wrapper keeps a CSS
          `translate`, which would make it the containing block for a fixed
          child and offset the preview from the cursor. `mounted` is only
          true after the first client render, so this never runs during SSR. */}
      {mounted && createPortal(
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

// Screenshot when the entry has one, otherwise a typographic placeholder
// so the list still works before screenshots are added.
function Cover({ project }: { project: ShowcaseProject }) {
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

  return (
    <span
      className="relative size-full flex items-end p-[8%] select-none bg-stone-200 dark:bg-stone-800 text-black/70 dark:text-white/80"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
        backgroundSize: "10px 10px",
      }}
    >
      <span className="absolute inset-0 bg-linear-to-t from-stone-200 via-stone-200/80 to-stone-200/40 dark:from-stone-800 dark:via-stone-800/80 dark:to-stone-800/40" />
      <span className="relative font-mono font-semibold leading-none tracking-tighter text-[0.6rem] sm:text-xs">
        <span className="text-orange-600 dark:text-orange-300">~/</span>
        {project.id}
      </span>
    </span>
  );
}
