import { lazy, Suspense, type ComponentProps } from "react";

/* Heavy canvas / WebGL originals are code-split: they load only on the page that uses them,
   and unmount (cleaning up their own rAF loops / GL contexts) when you navigate away. */
const Murmuration = lazy(() => import("./original/murmuration-wordmark"));
const Footer = lazy(() => import("./original/halftone-wordmark-footer"));
const RadarBg = lazy(() => import("./original/Radar"));
const SideRaysBg = lazy(() => import("./original/SideRays"));

export function LazyMurmuration(p: ComponentProps<typeof Murmuration>) {
  return <Suspense fallback={<div style={{ height: p.height ?? "100svh" }} />}><Murmuration {...p} /></Suspense>;
}
export function LazyFooter(p: ComponentProps<typeof Footer>) {
  return <Suspense fallback={<div style={{ height: p.height ?? "560px" }} aria-hidden="true" />}><Footer {...p} /></Suspense>;
}
export function LazyRadar(p: ComponentProps<typeof RadarBg>) {
  return <Suspense fallback={null}><RadarBg {...p} /></Suspense>;
}
export function LazySideRays(p: ComponentProps<typeof SideRaysBg>) {
  return <Suspense fallback={null}><SideRaysBg {...p} /></Suspense>;
}
