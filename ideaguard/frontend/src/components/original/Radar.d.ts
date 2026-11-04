/* Type declaration for the unmodified original Radar.jsx.
   The original destructures its props in JS, so TypeScript would otherwise infer every optional
   prop as required. All props are optional at runtime (they have defaults in the original). */
import type { ComponentType } from "react";
declare const Radar: ComponentType<Record<string, any>>;
export default Radar;
