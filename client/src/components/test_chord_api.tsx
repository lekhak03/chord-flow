import { useEffect, useRef } from "react";

export default function TestChordAPI() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.scales-chords.com/api.js";
    script.async = true;
    script.onload = () => {
      if (containerRef.current) {
        const ins = document.createElement("ins");
        ins.className = "scales_chords_api";
        ins.setAttribute("chord", "Cmaj");
        ins.setAttribute("instrument", "guitar");
        ins.setAttribute("output", "sound");
        ins.setAttribute("width", "100px");
        ins.setAttribute("height", "150px");
        ins.setAttribute("nolink", "true");
        containerRef.current.appendChild(ins);

        // Initialize it
        (window as any).ScalesChords?.initAll();
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Guitar Chord Example</h1>
      <div ref={containerRef}></div>
    </div>
  );
}
