import { create } from "zustand";
export type SortBy = "P" | "q" | "n";
type ControlsState = { watchlist:string[]; topN:number; sortBy:SortBy; setWatchlist:(csv:string)=>void; setTopN:(n:number)=>void; setSortBy:(s:SortBy)=>void; };
export const useControls = create<ControlsState>((set)=>({
  watchlist:[], topN:20, sortBy:"P",
  setWatchlist:(csv)=>set(()=>({watchlist:csv.split(",").map(s=>s.trim().toUpperCase()).filter(Boolean)})),
  setTopN:(n)=>set(()=>({topN:Math.max(1,Math.min(100,Math.floor(n)))})),
  setSortBy:(s)=>set(()=>({sortBy:s}))
}));
