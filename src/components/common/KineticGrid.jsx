import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
} from "react";

// --------------------------------------------------
// TYPES / CONSTANTS
// --------------------------------------------------

const CELL_SIZE = 55;
const INFLUENCE_RADIUS = 260;
const MAX_WARP = 24;
const DOT_SPACING = 28;
const LERP_SPEED = 0.08;

const NODE_BASE_RADIUS = 1.8;
const NODE_ACTIVE_RADIUS = 3.2;

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function lerpN(a, b, t) {
  return a + (b - a) * t;
}

function lerpColor(base, active, t) {
  const r = Math.round(lerpN(base.r, active.r, t));
  const g = Math.round(lerpN(base.g, active.g, t));
  const b = Math.round(lerpN(base.b, active.b, t));
  const a = lerpN(base.a, active.a, t);

  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

export default function KineticGrid({
  children,
  className = "",
}) {
  const canvasRef = useRef(null);

  const mouseRef = useRef({
    x: -9999,
    y: -9999,
  });

  const targetMouseRef = useRef({
    x: -9999,
    y: -9999,
  });

  const ripplesRef = useRef([]);

  const rafRef = useRef(0);

  const sizeRef = useRef({
    w: 0,
    h: 0,
  });

  // --------------------------------------------------
  // DARK / LIGHT MODE
  // --------------------------------------------------

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(
        document.documentElement.classList.contains("dark")
      );
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // --------------------------------------------------
  // WARP GRID POINT
  // --------------------------------------------------

  const getWarpedPoint = useCallback(
    (
      gx,
      gy,
      col,
      row,
      mouse,
      ripples,
      cols,
      rows
    ) => {
      // Keep edges stable
      const edgeMargin = 1.5;

      const colPin = Math.min(
        col / edgeMargin,
        (cols - 1 - col) / edgeMargin,
        1
      );

      const rowPin = Math.min(
        row / edgeMargin,
        (rows - 1 - row) / edgeMargin,
        1
      );

      const pinFactor =
        colPin *
        colPin *
        rowPin *
        rowPin;

      // Distance from mouse
      const dx = gx - mouse.x;
      const dy = gy - mouse.y;

      const dist = Math.sqrt(
        dx * dx + dy * dy
      );

      const proximity =
        Math.max(
          0,
          1 - dist / INFLUENCE_RADIUS
        ) * pinFactor;

      // --------------------------------------------------
      // RIPPLE
      // --------------------------------------------------

      let rx = 0;
      let ry = 0;

      for (const ripple of ripples) {
        const rdx = gx - ripple.x;
        const rdy = gy - ripple.y;

        const rdist = Math.sqrt(
          rdx * rdx + rdy * rdy
        );

        const waveWidth = 55;

        const diff =
          rdist - ripple.radius;

        if (Math.abs(diff) < waveWidth) {
          const strength =
            (1 -
              Math.abs(diff) /
                waveWidth) *
            ripple.opacity *
            18 *
            pinFactor;

          const angle =
            Math.atan2(rdy, rdx);

          const sign =
            diff < 0 ? -1 : 1;

          rx +=
            Math.cos(angle) *
            strength *
            sign *
            -1;

          ry +=
            Math.sin(angle) *
            strength *
            sign *
            -1;
        }
      }

      // --------------------------------------------------
      // CURSOR WARP
      // --------------------------------------------------

      if (
        dist < INFLUENCE_RADIUS &&
        dist > 0 &&
        pinFactor > 0
      ) {
        const t =
          dist / INFLUENCE_RADIUS;

        const eased =
          t < 0.01
            ? 0
            : (1 - t) *
              (1 - t) *
              Math.min(
                1,
                dist / 60
              );

        const warpAmount =
          eased *
          MAX_WARP *
          pinFactor;

        const angle =
          Math.atan2(dy, dx);

        return {
          pt: {
            x:
              gx -
              Math.cos(angle) *
                warpAmount +
              rx,

            y:
              gy -
              Math.sin(angle) *
                warpAmount +
              ry,
          },

          proximity,
        };
      }

      return {
        pt: {
          x: gx + rx,
          y: gy + ry,
        },

        proximity,
      };
    },
    []
  );

  // --------------------------------------------------
  // DRAW
  // --------------------------------------------------

  const draw = useCallback(
    (now) => {
      const canvas =
        canvasRef.current;

      if (!canvas) return;

      const ctx =
        canvas.getContext("2d");

      if (!ctx) return;

      const {
        w: W,
        h: H,
      } = sizeRef.current;

      const mouse =
        mouseRef.current;

      const ripples =
        ripplesRef.current;

      // --------------------------------------------------
      // THEME
      // --------------------------------------------------

      const theme = isDark
        ? {
            // DARK MODE
            bg: "#0f172a",

            line: {
              r: 255,
              g: 255,
              b: 255,
              a: 0.015,
            },

            lineActive: {
              r: 37,
              g: 99,
              b: 235,
              a: 0.25,
            },

            node: {
              r: 255,
              g: 255,
              b: 255,
              a: 0.02,
            },

            nodeActive: {
              r: 37,
              g: 99,
              b: 235,
              a: 0.15,
            },

            glow: "37,99,235",

            ripple: "59,130,246",
          }
        : {
            // LIGHT MODE
            bg: "#f8fafc",

            line: {
              r: 15,
              g: 23,
              b: 42,
              a: 0.015,
            },

            lineActive: {
              r: 37,
              g: 99,
              b: 235,
              a: 0.15,
            },

            node: {
              r: 15,
              g: 23,
              b: 42,
              a: 0.05,
            },

            nodeActive: {
              r: 37,
              g: 99,
              b: 235,
              a: 0.15,
            },

            glow: "37,99,235",

            ripple: "59,130,246",
          };

      // --------------------------------------------------
      // CLEAR CANVAS
      // --------------------------------------------------

      ctx.clearRect(
        0,
        0,
        W,
        H
      );

      // --------------------------------------------------
      // BACKGROUND
      // --------------------------------------------------

    //   ctx.fillStyle = theme.bg;

    //   ctx.fillRect(
    //     0,
    //     0,
    //     W,
    //     H
    //   );

      // --------------------------------------------------
      // BACKGROUND DOTS
      // --------------------------------------------------

   ctx.fillStyle = isDark
  ? "rgba(255,255,255,0.02)"
  : "rgba(15,23,42,0.015)";

      for (
        let x = DOT_SPACING / 2;
        x < W;
        x += DOT_SPACING
      ) {
        for (
          let y = DOT_SPACING / 2;
          y < H;
          y += DOT_SPACING
        ) {
          ctx.beginPath();

          ctx.arc(
            x,
            y,
            0.7,
            0,
            Math.PI * 2
          );

          ctx.fill();
        }
      }

      // --------------------------------------------------
      // UPDATE RIPPLES
      // --------------------------------------------------

      for (
        let i = ripples.length - 1;
        i >= 0;
        i--
      ) {
        const ripple =
          ripples[i];

        const age =
          (now -
            ripple.born) /
          1000;

        ripple.radius =
          Math.max(
            0,
            age * 400
          );

        ripple.opacity =
          Math.max(
            0,
            1 - age * 0.5
          );

        if (
          ripple.opacity <= 0
        ) {
          ripples.splice(i, 1);
        }
      }

      // --------------------------------------------------
      // GRID SIZE
      // --------------------------------------------------

      const cols =
        Math.max(
          2,
          Math.ceil(
            W / CELL_SIZE
          )
        ) + 1;

      const rows =
        Math.max(
          2,
          Math.ceil(
            H / CELL_SIZE
          )
        ) + 1;

      const cellW =
        W / (cols - 1);

      const cellH =
        H / (rows - 1);

      const points = [];
      const proximity = [];

      // --------------------------------------------------
      // CREATE GRID POINTS
      // --------------------------------------------------

      for (
        let row = 0;
        row < rows;
        row++
      ) {
        points[row] = [];
        proximity[row] = [];

        for (
          let col = 0;
          col < cols;
          col++
        ) {
          const result =
            getWarpedPoint(
              col * cellW,
              row * cellH,
              col,
              row,
              mouse,
              ripples,
              cols,
              rows
            );

          points[row][col] =
            result.pt;

          proximity[row][col] =
            result.proximity;
        }
      }

      // --------------------------------------------------
      // DRAW GRID LINE
      // --------------------------------------------------

      const drawSegment = (
        p1,
        p2,
        pr1,
        pr2
      ) => {
        const average =
          (pr1 + pr2) / 2;

        const t =
          average *
          average *
          (3 - 2 * average);

        ctx.beginPath();

        ctx.moveTo(
          p1.x,
          p1.y
        );

        ctx.lineTo(
          p2.x,
          p2.y
        );

        ctx.strokeStyle =
          lerpColor(
            theme.line,
            theme.lineActive,
            t
          );

        ctx.lineWidth =
          lerpN(
            0.8,
            1.5,
            t
          );

        ctx.stroke();
      };

      ctx.lineCap = "butt";

      // Horizontal lines
      for (
        let row = 0;
        row < rows;
        row++
      ) {
        for (
          let col = 0;
          col < cols - 1;
          col++
        ) {
          drawSegment(
            points[row][col],
            points[row][col + 1],
            proximity[row][col],
            proximity[row][col + 1]
          );
        }
      }

      // Vertical lines
      for (
        let col = 0;
        col < cols;
        col++
      ) {
        for (
          let row = 0;
          row < rows - 1;
          row++
        ) {
          drawSegment(
            points[row][col],
            points[row + 1][col],
            proximity[row][col],
            proximity[row + 1][col]
          );
        }
      }

      // --------------------------------------------------
      // GRID NODES
      // --------------------------------------------------

      for (
        let row = 0;
        row < rows;
        row++
      ) {
        for (
          let col = 0;
          col < cols;
          col++
        ) {
          const point =
            points[row][col];

          const pr =
            proximity[row][col];

          const t =
            pr *
            pr *
            (3 - 2 * pr);

          const radius =
            lerpN(
              NODE_BASE_RADIUS,
              NODE_ACTIVE_RADIUS,
              t
            );

          // --------------------------------------------------
          // BLUE GLOW
          // --------------------------------------------------

          if (t > 0.3) {
            const glowRadius =
              radius +
              lerpN(
                0,
                6,
                (t - 0.3) /
                  0.7
              );

            const gradient =
              ctx.createRadialGradient(
                point.x,
                point.y,
                radius * 0.5,
                point.x,
                point.y,
                glowRadius
              );

            gradient.addColorStop(
              0,
              `rgba(${theme.glow},${(
                t * 0.12
              ).toFixed(3)})`
            );

            gradient.addColorStop(
              1,
              `rgba(${theme.glow},0)`
            );

            ctx.beginPath();

            ctx.arc(
              point.x,
              point.y,
              glowRadius,
              0,
              Math.PI * 2
            );

            ctx.fillStyle =
              gradient;

            ctx.fill();
          }

          // --------------------------------------------------
          // NODE
          // --------------------------------------------------

          ctx.beginPath();

          ctx.arc(
            point.x,
            point.y,
            radius,
            0,
            Math.PI * 2
          );

          ctx.fillStyle =
            lerpColor(
              theme.node,
              theme.nodeActive,
              t
            );

          ctx.fill();
        }
      }

      // --------------------------------------------------
      // RIPPLE RINGS
      // --------------------------------------------------

      for (const ripple of ripples) {
        const safeRadius =
          Math.max(
            0,
            ripple.radius
          );

        ctx.beginPath();

        ctx.arc(
          ripple.x,
          ripple.y,
          safeRadius,
          0,
          Math.PI * 2
        );

        ctx.strokeStyle =
          `rgba(${theme.ripple},${(
            ripple.opacity * 0.15
          ).toFixed(3)})`;

        ctx.lineWidth = 1.5;

        ctx.stroke();
      }
    },
    [getWarpedPoint, isDark]
  );

  // --------------------------------------------------
  // ANIMATION LOOP
  // --------------------------------------------------

  const animate = useCallback(
    function loop(now) {
      if (typeof document !== "undefined" && document.hidden) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const mouse = mouseRef.current;
      const target = targetMouseRef.current;

      mouse.x = lerpN(mouse.x, target.x, LERP_SPEED);
      mouse.y = lerpN(mouse.y, target.y, LERP_SPEED);

      draw(now);

      rafRef.current = requestAnimationFrame(loop);
    },
    [draw]
  );

  // --------------------------------------------------
  // SETUP
  // --------------------------------------------------

  useEffect(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) return;

    const setSize = () => {
      const width =
        window.innerWidth;

      const height =
        window.innerHeight;

      canvas.width = width;
      canvas.height = height;

      sizeRef.current = {
        w: width,
        h: height,
      };
    };

    setSize();

    window.addEventListener(
      "resize",
      setSize
    );

    // --------------------------------------------------
    // MOUSE MOVE
    // --------------------------------------------------

    const onMouseMove = (
      event
    ) => {
      targetMouseRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    // --------------------------------------------------
    // CLICK RIPPLE
    // --------------------------------------------------

    const onClick = (
      event
    ) => {
      ripplesRef.current.push({
        x: event.clientX,
        y: event.clientY,
        radius: 0,
        opacity: 1,
        born: performance.now(),
      });
    };

    window.addEventListener(
      "mousemove",
      onMouseMove
    );

    window.addEventListener(
      "click",
      onClick
    );

    rafRef.current =
      requestAnimationFrame(
        animate
      );

    // --------------------------------------------------
    // CLEANUP
    // --------------------------------------------------

    return () => {
      window.removeEventListener(
        "resize",
        setSize
      );

      window.removeEventListener(
        "mousemove",
        onMouseMove
      );

      window.removeEventListener(
        "click",
        onClick
      );

      if (rafRef.current) {
        cancelAnimationFrame(
          rafRef.current
        );
      }
    };
  }, [animate]);

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div
  className={`
    fixed
    inset-0
    z-[9999]
    pointer-events-none
    overflow-hidden
    ${className}
  `}
>
      <canvas
  ref={canvasRef}
  className="
    fixed
    inset-0
    h-full
    w-full
    z-[9999]
    pointer-events-none
  "
/>

      {children}
    </div>
  );
}