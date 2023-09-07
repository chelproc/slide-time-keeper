import { useState } from "react";
import ReadPage from "./read";
import CapturePage from "./capture";

export default function App() {
  const [page, setPage] = useState<"read" | "capture">("read");

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "max-content minmax(0, 1fr)",
        height: "100%",
      }}
    >
      <div>
        <button type="button" onClick={() => setPage("read")}>
          Read
        </button>
        <button type="button" onClick={() => setPage("capture")}>
          Capture
        </button>
      </div>
      <div>
        {(() => {
          if (page === "read") return <ReadPage />;
          if (page === "capture") return <CapturePage />;
        })()}
      </div>
    </div>
  );
}
