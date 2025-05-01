import React from "react";
import "@fontsource/poppins";
import "daisyui/dist/full.css";

export default function App() {
  return (
    <>
      <h1 className="text-3xl font-bold underline hover:text-sky-400">
        Hello worlds!
      </h1>
      <button className="btn">Button</button>
      <button className="btn btn-neutral">Neutral</button>
      <button className="btn btn-primary">Primary</button>
      <button className="btn btn-secondary">Secondary</button>
      <button className="btn btn-accent">Accent</button>
      <button className="btn btn-ghost">Ghost</button>
      <button className="btn btn-link">Link</button>
    </>
  );
}
