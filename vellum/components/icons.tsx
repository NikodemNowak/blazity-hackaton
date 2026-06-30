// Minimal stroke icons (16px grid). No fills, no glow — keeps the UI calm.
import type { SVGProps } from "react";

function Base(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

export const Icon = {
  Dashboard: (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </Base>
  ),
  Generate: (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </Base>
  ),
  Analyze: (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 16v-4M12 16V8M16 16v-6" />
    </Base>
  ),
  Review: (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
      <path d="M9 11l3 3 5-6" />
      <path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
    </Base>
  ),
  Docs: (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
      <path d="M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
      <path d="M14 2v4h4" />
      <path d="M8 13h8M8 17h6" />
    </Base>
  ),
  Arrow: (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Base>
  ),
  Copy: (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </Base>
  ),
  Check: (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
      <path d="M5 12l5 5 9-11" />
    </Base>
  ),
  Doc: (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
      <path d="M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
      <path d="M14 2v4h4" />
    </Base>
  ),
  // Docs-vs-code drift: a git-diff fork — two branches that disagree.
  Drift: (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
      <circle cx="6" cy="5" r="2" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="12" r="2" />
      <path d="M6 7v10" />
      <path d="M6 9a6 6 0 0 0 6 6h4" />
    </Base>
  ),
  Chat: (p: SVGProps<SVGSVGElement>) => (
    <Base {...p}>
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 9 9 0 0 1-4-1L3 20l1-3.5a8.38 8.38 0 0 1-1-4A8.5 8.5 0 0 1 11.5 4a8.38 8.38 0 0 1 8.5 7.5z" />
    </Base>
  ),
};
