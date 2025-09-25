
## 1) Objectif
- Suivre en **temps réel** l’état du marché Futures (tick ~1s).
- Focaliser via **Watchlist**, **Top N** et **tri** (P, q, n).
- Afficher des **KPIs instantanés** utiles à la décision (breadth, activité, intensité).


## 2) Source de données
- **Binance Futures WS** : `wss://fstream.binance.com/ws/!ticker@arr`
- Envoie **uniquement** les symboles **modifiés** depuis le précédent tick (≈1s).
- Champs clefs (renommés dans l’UI) : `Event type`, `Event time`, `Symbol`, `Last price (c)`, `Price change (Δ p)`, `Price change (%) (P)`, `Open/High/Low (24h)`, `Weighted avg (24h)`, `Total traded base/quote volume (24h) (v/q)`, `Total number of trades (24h) (n)`.
- Les métriques 24h sont **roulantes** (24h glissantes), pas la journée UTC.


## 3) Stack & raisons
- **React + TypeScript** : standard, typage strict, composants réutilisables.
- **Vite** : serveur dev rapide (HMR) — **commande `npm run dev`**.
- **Zustand** : store global léger pour l’état temps réel.
- **Lightweight Charts** (prévu) : rendu performant pour séries financières si nécessaire.


## 4) Fonctionnalités
- **Watchlist / multi-sélection** : accepte **sous-chaînes** (ex. `BNB` → `BNBUSDT`, `BNBTRY`, …) et symboles complets.
- **Top N + tri** par :
  - `P` = **Price change (%)**
  - `q` = **Total traded quote volume (24h)**
  - `n` = **Total number of trades (24h)**
- **Vues** :
  - **KPI Cards** : Max/Min Last, Breadth marché (↑), Σ Trades (24h), Taux de trades (/s).
  - **Top movers** : barres horizontales (gagnants & perdants par %).
  - **Ticker table** : temps réel, **noms de colonnes complets**.

## 5) KPIs (définition synthétique)
- **Max/Min Last price** : extrêmes de prix à l’instant t (sur l’univers filtré).
- **Breadth marché (↑)** : `% de symboles avec P > 0` → mesure la **participation** à la hausse (mouvement large vs étroit).
- **Σ Trades (24h)** : `Σ n` → **activité cumulée** 24h sur le panier suivi.
- **Taux de trades (/s)** : `Δ Σn / Δt` (entre 2 ticks) → **intensité immédiate** du flux d’exécutions.

> Remarque : ces KPIs sont **instantanés** (pas d’historique/agrégation côté app).

## 6) Structure du projet
front-streaming/
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
└─ src/
   ├─ main.tsx                      # Point d'entrée (monte Dashboard)
   ├─ css/
   │  └─ styles.css                 # Styles globaux (dark UI)
   ├─ pages/
   │  └─ Dashboard.tsx              # Page principale
   ├─ hooks/
   │  └─ useBinanceAllTickers.ts    # Connexion WS + état instantané + dérivés KPIs
   ├─ components/
   │  ├─ controls/
   │  │  ├─ ControlsPanel.tsx       # Watchlist (sous-chaîne), Top N, tri P|q|n
   │  │  └─ controls.css
   │  └─ widgets/
   │     ├─ KpiCards.tsx
   │     ├─ TopMovers.tsx
   │     ├─ MarketTable.tsx
   │     └─ widgets.css
   ├─ store/
   │  └─ controlsStore.ts           # Zustand (watchlist, topN, sortBy)
   └─ lib/
      ├─ binanceTypes.ts            # Types bruts Binance + version normalisée
      └─ format.ts                  # Formatage (nombres, % , time)


## 7) Installation & exécution

Prérequis : **Node.js LTS** (inclut npm).  
```bash
npm install
npm run dev
# Ouvrir http://localhost:5173

Build & preview (test prod local)

npm run build
npm run preview
# Ouvrir http://localhost:4173