import { useState } from "react";
import { useLocalStorage } from "react-use";
import Player from "./Player";

export default function ReadPage() {
  const [mode, setMode] = useState<"edit" | "play">("edit");
  const [script, setScript] = useLocalStorage("slide-time-keeper-script", "");

  if (mode === "edit") {
    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <textarea
          value={script}
          onChange={(event) => setScript(event.target.value)}
          style={{
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            padding: "10px",
          }}
        />
        <button
          type="button"
          onClick={() => setMode("play")}
          style={{ position: "absolute", bottom: "25px", right: "25px" }}
        >
          Play
        </button>
      </div>
    );
  }

  return (
    <Player
      script={script ?? ""}
      onExit={() => {
        setMode("edit");
      }}
    />
  );
}
