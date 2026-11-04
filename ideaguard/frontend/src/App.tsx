import { Routes, type RouteDef } from "@/lib/router";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import NewAnalysis from "@/pages/NewAnalysis";
import Analyzing from "@/pages/Analyzing";
import Results from "@/pages/Results";
import Comparable from "@/pages/Comparable";
import Innovation from "@/pages/Innovation";
import History from "@/pages/History";
import Projects from "@/pages/Projects";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

const routes: RouteDef[] = [
  { pattern: "/", render: () => <Home /> },
  { pattern: "/dashboard", render: () => <Dashboard /> },
  { pattern: "/new", render: () => <NewAnalysis /> },
  { pattern: "/analyzing", render: () => <Analyzing /> },
  { pattern: "/results/:rid", render: p => <Results key={p.rid} rid={p.rid} /> },
  { pattern: "/projects", render: () => <Projects /> },
  { pattern: "/history", render: () => <History /> },
  { pattern: "/comparable/:rid?", render: p => <Comparable rid={p.rid} /> },
  { pattern: "/innovation/:rid?", render: p => <Innovation rid={p.rid} /> },
  { pattern: "/settings", render: () => <Settings /> },
];
export default function App() { return <Routes routes={routes} fallback={<NotFound />} />; }
