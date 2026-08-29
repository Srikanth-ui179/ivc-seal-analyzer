import { AnalyzeWorkspace } from "@/components/features/analyze-workspace";

export default function AnalyzePage() { return <div className="page-shell py-14 sm:py-20"><p className="eyebrow">Analysis workspace</p><h1 className="mt-3 display-title">Inspect sign patterns with clear limits.</h1><p className="mt-5 max-w-2xl leading-7 text-ink/70">This prototype demonstrates the review flow for visual recognition and sequence statistics. Outputs are fixed mock data and do not translate or decipher inscriptions.</p><div className="mt-10"><AnalyzeWorkspace /></div></div>; }
