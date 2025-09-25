import React, { useState } from "react";
import { useControls, SortBy } from "../../store/controlsStore";
import "./controls.css";

export default function ControlsPanel(){
  const { watchlist, topN, sortBy, setWatchlist, setTopN, setSortBy } = useControls();
  const [input, setInput] = useState(watchlist.join(", "));
  const onCommitWatchlist = () => setWatchlist(input);
  const sortButtons: { key: SortBy; label: string }[] = [
    { key: "P", label: "Sort by Price change (%)" },
    { key: "q", label: "Sort by Quote volume (24h)" },
    { key: "n", label: "Sort by Total trades (24h)" },
  ];
  return (<div className="controls">
    <div className="ctrl-row">
      <label>Watchlist / Multi-sélection (separated by commas; also accepts sub-strings, e.g., BNB)</label>
      <div className="watchlist">
        <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&onCommitWatchlist()} placeholder="BNB, BTCUSDT, SOL" />
        <button onClick={onCommitWatchlist}>Apply</button>
        {watchlist.length>0 && <span className="hint">Active: {watchlist.join(", ")}</span>}
      </div>
    </div>
    <div className="ctrl-row">
      <label>Top N</label>
      <input type="range" min={1} max={100} value={topN} onChange={(e)=>setTopN(Number(e.target.value))} />
      <span className="badge">{topN}</span>
    </div>
    <div className="ctrl-row">
      <label>Sorting</label>
      <div className="sort-group">
        {sortButtons.map(b=>(<button key={b.key} className={sortBy===b.key?"active":""} onClick={()=>setSortBy(b.key)}>{b.label}</button>))}
      </div>
    </div>
  </div>);
}
