import { useEffect, useMemo, useState } from "react";
import { AutoSize } from "./AutoSize";
import { onMessageHandlers } from "../websocket";

export default function Player(props: { script: string; onExit(): void }) {
  const sections = useMemo(() => {
    let accumulatedTime = 0;
    return props.script
      .trim()
      .split(/\n{2,}/)
      .map((section) => {
        const [duration = "0", content = "-"] = section.split("\n", 2);
        const result = {
          time: accumulatedTime,
          duration: parseInt(duration, 10),
          content,
        };
        accumulatedTime += result.duration;
        return result;
      });
  }, [props.script]);

  const [page, setPage] = useState(0);
  useEffect(() => {
    const onMessage = (message: string) => {
      setPage(parseInt(message, 10));
    };
    onMessageHandlers.add(onMessage);
    return () => {
      onMessageHandlers.delete(onMessage);
    };
  }, []);

  const currentSection = sections[page - 1];

  const [startTimer, setStartTimer] = useState(false);
  const [time, setTime] = useState(0);
  useEffect(() => {
    if (!startTimer) return;
    const timerId = setInterval(() => {
      setTime((time) => time + 1);
    }, 1000);
    return () => {
      clearInterval(timerId);
    };
  }, [startTimer]);

  useEffect(() => {
    const callback = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setPage((previous) => previous - 1);
      if (e.key === "ArrowRight") setPage((previous) => previous + 1);
      if (e.key === " ") setStartTimer((previous) => !previous);
      if (e.key === "Escape") props.onExit();
    };
    window.addEventListener("keydown", callback);
    return () => {
      window.removeEventListener("keydown", callback);
    };
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "max-content minmax(0, 1fr) max-content",
        width: "100%",
        height: "100%",
      }}
    >
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: (() => {
              if (!currentSection) return "0%";
              const progress =
                (time - currentSection.time) /
                (currentSection.duration || Infinity);
              return `${Math.max(0, Math.min(progress, 1)) * 100}%`;
            })(),
            height: "100%",
            backgroundColor: "#afa",
            zIndex: -1,
          }}
        ></div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            fontSize: "32px",
            gap: "10px",
            fontWeight: "bold",
          }}
        >
          <div>
            {Math.floor(time / 60)
              .toString()
              .padStart(2, "0")}
            :{(time % 60).toString().padStart(2, "0")}
          </div>
          {(() => {
            if (!currentSection) return;
            if (time < currentSection.time)
              return (
                <div style={{ color: "#0c0" }}>
                  -{currentSection.time - time}
                </div>
              );
            if (time > currentSection.time + currentSection.duration)
              return (
                <div style={{ color: "#f00" }}>
                  +{time - currentSection.time - currentSection.duration}
                </div>
              );
          })()}
        </div>
      </div>
      <AutoSize text={currentSection?.content ?? ""} />
      <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
        <button
          style={{ fontSize: "24px" }}
          type="button"
          onClick={props.onExit}
        >
          x
        </button>
        <button
          style={{ fontSize: "24px" }}
          type="button"
          onClick={() => {
            setStartTimer((previous) => !previous);
          }}
        >
          {!startTimer ? "Play" : "Pause"}
        </button>
        <button
          style={{ fontSize: "24px" }}
          type="button"
          onClick={() => {
            setTime(0);
            setStartTimer(false);
          }}
        >
          Reset
        </button>
        <button
          style={{ fontSize: "24px" }}
          type="button"
          onClick={() => {
            setPage(page - 1);
          }}
        >
          ←
        </button>
        <button
          style={{ fontSize: "24px" }}
          type="button"
          onClick={() => {
            setPage(page + 1);
          }}
        >
          →
        </button>
        <div style={{ fontSize: "24px" }}>
          {page} / {sections.length}
        </div>
      </div>
    </div>
  );
}
