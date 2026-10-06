import Link from "next/link";
import { DatabaseUnavailableNotice } from "@/components/features/database-unavailable-notice";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { SignExplorer } from "@/components/dashboard/sign-explorer";
import { TransitionExplorer } from "@/components/dashboard/transition-explorer";
import { MotifExplorer } from "@/components/dashboard/motif-explorer";
import { DuplicateExplorer } from "@/components/dashboard/duplicate-explorer";
import { OutlierExplorer } from "@/components/dashboard/outlier-explorer";
import { SitesExplorer } from "@/components/dashboard/sites-explorer";
import {
  runDatasetAnalysis,
  getSignExplorationDetails,
  getTransitionEvidenceInscriptions,
} from "@/lib/db/analysis-repository";
import { getMultiSiteReport } from "@/lib/db/multisite-repository";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    tab?: string;
    sign?: string;
    pair?: string;
    motifLen?: string;
  }>;
};

export default async function ResearchDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeTab = params.tab || "overview";
  const currentSignCode = params.sign || "P324";
  const currentPairCode = params.pair || "P122-P385";
  const currentMotifLen = params.motifLen || "3";

  let report;
  try {
    report = await runDatasetAnalysis();
  } catch (err) {
    console.error("Failed to load dataset analysis report:", err);
    return (
      <div className="page-shell py-14 sm:py-20">
        <DatabaseUnavailableNotice />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="page-shell py-14 sm:py-20">
        <DatabaseUnavailableNotice />
      </div>
    );
  }

  // Load specific drill-down details based on active tab
  let selectedSignDetails = null;
  if (activeTab === "signs") {
    try {
      selectedSignDetails = await getSignExplorationDetails(report.dataset.id, currentSignCode);
    } catch (err) {
      console.error("Failed to load sign exploration details:", err);
    }
  }

  let selectedPair = null;
  let transitionInscriptions: any[] = [];
  if (activeTab === "transitions") {
    const [s1, s2] = currentPairCode.split("-");
    selectedPair = report.adjacentPairs.pairs.find(
      (p) => p.sign1Code === s1 && p.sign2Code === s2
    ) || {
      sign1Code: s1 || "P122",
      sign1Label: s1 || "P122",
      sign2Code: s2 || "P385",
      sign2Label: s2 || "P385",
      frequency: 0,
      rank: 0,
    };

    try {
      if (s1 && s2) {
        transitionInscriptions = await getTransitionEvidenceInscriptions(
          report.dataset.id,
          s1,
          s2
        );
      }
    } catch (err) {
      console.error("Failed to load transition evidence inscriptions:", err);
    }
  }

  let multiSiteReport = null;
  if (activeTab === "sites") {
    try {
      multiSiteReport = await getMultiSiteReport(report.dataset.id);
    } catch (err) {
      console.error("Failed to load multi-site report:", err);
    }
  }

  const tabs = [
    { id: "overview", label: "📊 Overview & Charts" },
    { id: "sites", label: "🏛️ Corpus & Sites" },
    { id: "signs", label: "🔍 Sign Explorer" },
    { id: "transitions", label: "⇄ Transition Explorer" },
    { id: "motifs", label: "🧩 Motif Explorer" },
    { id: "duplicates", label: "⧉ Duplicate Explorer" },
    { id: "outliers", label: "⚡ Structural Outliers" },
  ];

  return (
    <div className="page-shell py-14 sm:py-20">
      {/* Top Breadcrumb & Dataset Identifier */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/research" className="text-sm font-semibold text-clay hover:text-ink">
          ← Research &amp; methodology
        </Link>
        <div className="flex items-center gap-2 text-xs text-ink/60">
          <span>Frozen Dataset:</span>
          <Link
            href={`/research/datasets/${report.dataset.id}`}
            className="font-mono font-semibold text-clay hover:text-ink hover:underline"
          >
            {report.dataset.stableId}
          </Link>
          <span className="rounded border border-ink/15 bg-sandstone/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink/75">
            {report.dataset.state}
          </span>
        </div>
      </div>

      {/* Main Title Banner */}
      <div className="mt-6">
        <p className="eyebrow">Phase 2 · Reproducible Research Infrastructure</p>
        <h1 className="mt-3 display-title">
          Computational Research Dashboard
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-ink/75">
          Interactive exploration and evidence traceability layer. Discover formal sign distributions, directional transitions, and recurring motifs, and immediately trace each observation back to the underlying inscribed seals.
        </p>
      </div>

      {/* Research Safeguards Notice */}
      <div className="mt-8 border-l-2 border-clay bg-sandstone/25 p-5 text-sm leading-6 text-ink/80">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-clay text-xs font-bold text-paper">
            !
          </span>
          <div>
            <p className="font-semibold text-ink">
              Core Methodological Principle: DATA → COMPUTATION → EVIDENCE → INTERPRETATION
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink/70">
              <strong>Computational observations ≠ historical or linguistic interpretation.</strong> All metrics and distributions describe formal catalogue glyph codes and transcribed positions. They do not constitute translation, decipherment, language identification, phonetic values, or grammatical assignments.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink/10 pt-2.5 text-xs text-ink/65">
              <span><strong>Dataset:</strong> {report.dataset.name} ({report.dataset.stableId})</span>
              <span><strong>Scope:</strong> {report.coverage.totalInscriptions} Mohenjo-daro inscriptions · {report.coverage.totalOccurrences.toLocaleString()} tokens · {report.coverage.distinctSigns} signs</span>
              <Link href="/analyze" className="font-semibold text-clay hover:underline">
                View formal numerical analysis (M1–M11) →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Dashboard Tab Navigation */}
      <nav aria-label="Dashboard views" className="mt-10 border-b border-ink/15">
        <div className="flex flex-wrap items-center gap-2 pb-px font-display text-sm font-semibold">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/research/dashboard?tab=${tab.id}${
                  tab.id === "signs" && currentSignCode ? `&sign=${currentSignCode}` : ""
                }${
                  tab.id === "transitions" && currentPairCode ? `&pair=${currentPairCode}` : ""
                }${
                  tab.id === "motifs" && currentMotifLen ? `&motifLen=${currentMotifLen}` : ""
                }`}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-3 transition ${
                  isActive
                    ? "border-clay bg-sandstone/20 font-bold text-ink"
                    : "border-transparent text-ink/60 hover:border-ink/30 hover:text-ink"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Tab Content Display */}
      <div className="mt-8">
        {activeTab === "overview" && <DashboardOverview report={report} />}

        {activeTab === "sites" && multiSiteReport && (
          <SitesExplorer report={multiSiteReport} />
        )}

        {activeTab === "signs" && (
          <SignExplorer
            allSigns={report.signFrequencies.identified}
            selectedSign={selectedSignDetails}
            currentSignCode={currentSignCode}
          />
        )}

        {activeTab === "transitions" && (
          <TransitionExplorer
            allPairs={report.adjacentPairs.pairs}
            selectedPair={selectedPair}
            currentPairCode={currentPairCode}
            inscriptions={transitionInscriptions}
          />
        )}

        {activeTab === "motifs" && (
          <MotifExplorer motifs={report.motifs} currentLen={currentMotifLen} />
        )}

        {activeTab === "duplicates" && (
          <DuplicateExplorer similarity={report.similarity} />
        )}

        {activeTab === "outliers" && (
          <OutlierExplorer outliers={report.outliers.outliers} />
        )}
      </div>
    </div>
  );
}
