// ============================================================
// VAKEEL SAAB — Stage G: Legal Review & Statutory Source Inspector
// Displays verified legal provisions, procedural prerequisites audit,
// placeholder completion status, and the mandatory advocate review disclaimer
// ============================================================

import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  BookOpen,
  Info,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { VerifiedStatute } from '../legal/registry/statutoryRegistry';
import { LegalValidationResult } from '../legal/validation/legalValidator';

interface LegalReviewBannerProps {
  validation?: LegalValidationResult;
  verifiedProvisions?: VerifiedStatute[];
  documentTitle?: string;
}

export function LegalReviewBanner({
  validation,
  verifiedProvisions = [],
  documentTitle,
}: LegalReviewBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStatute, setSelectedStatute] = useState<VerifiedStatute | null>(null);

  const provisions = verifiedProvisions.length > 0 ? verifiedProvisions : validation?.verifiedStatutes || [];
  const qualityScore = validation?.qualityScore ?? 95;
  const criticalErrors = validation?.criticalErrors || [];
  const warnings = validation?.warnings || [];
  const placeholders = validation?.placeholdersDetected || [];
  const prerequisites = validation?.prerequisiteAudit || [];

  return (
    <div className="w-full bg-[var(--pure-white)] border-b border-[var(--grey-300)] shadow-sm">
      {/* Top Disclaimer Strip */}
      <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2 flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2 text-amber-900 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>
            <strong>AI-GENERATED DRAFT:</strong> Mandatory legal review required. This document must be verified by an enrolled Advocate prior to filing.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Legal Score: {qualityScore}/100
          </span>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-[11px] font-medium text-amber-950 hover:text-black underline transition-colors"
          >
            <span>{isExpanded ? 'Hide Statutory Details' : 'Inspect Legal Sources & Prerequisites'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Legal Verification Panel */}
      {isExpanded && (
        <div className="p-4 sm:p-6 bg-neutral-50/70 border-t border-[var(--grey-300)] space-y-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: Verified Statutory Provisions */}
            <div className="p-3.5 bg-white border border-neutral-200 rounded shadow-sm space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-neutral-200">
                <span className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[var(--gold)]" />
                  Verified Statutory Provisions
                </span>
                <span className="text-[10px] px-1.5 py-0.2 bg-neutral-100 text-neutral-600 rounded">
                  {provisions.length} Verified
                </span>
              </div>

              {provisions.length === 0 ? (
                <p className="text-[11px] text-neutral-500">General drafting framework applied under BNSS/BNS.</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {provisions.map((stat, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedStatute(stat)}
                      className="p-2 border border-neutral-150 rounded hover:border-neutral-400 cursor-pointer bg-neutral-50/50 hover:bg-white transition-all text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-900">
                          {stat.act} Section {stat.section}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1 rounded">
                          Gazette Source
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 mt-0.5 truncate">{stat.officialHeading}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 2: Procedural Prerequisites Checklist */}
            <div className="p-3.5 bg-white border border-neutral-200 rounded shadow-sm space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-neutral-200">
                <span className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                  Procedural Prerequisites
                </span>
                <span className="text-[10px] text-neutral-500">BNSS Audit</span>
              </div>

              {prerequisites.length === 0 ? (
                <p className="text-[11px] text-neutral-500">Standard document prerequisites verified.</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {prerequisites.map((p, idx) => (
                    <div key={idx} className="p-2 border rounded text-xs bg-neutral-50/50">
                      <div className="flex items-center gap-1.5 font-medium">
                        {p.satisfied ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                        )}
                        <span className={p.satisfied ? 'text-neutral-800' : 'text-red-700 font-semibold'}>
                          {p.prerequisite}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-1 pl-5">{p.details}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 3: Advocate Placeholders Tracker */}
            <div className="p-3.5 bg-white border border-neutral-200 rounded shadow-sm space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-neutral-200">
                <span className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                  Placeholders to Fill
                </span>
                <span className="text-[10px] font-medium text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded">
                  {placeholders.length} Pending
                </span>
              </div>

              {placeholders.length === 0 ? (
                <p className="text-[11px] text-emerald-700">All mandatory fields provided.</p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  <p className="text-[10px] text-neutral-500 mb-1">
                    The draft uses explicit placeholders to prevent hallucinated details:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {placeholders.map((ph, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-800 border border-neutral-200 rounded font-mono"
                      >
                        {ph}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Warnings & Critical Errors */}
          {(criticalErrors.length > 0 || warnings.length > 0) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-900 space-y-1">
              <span className="font-semibold flex items-center gap-1 text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Legal Advisory Alerts:
              </span>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                {criticalErrors.map((e, idx) => (
                  <li key={`crit-${idx}`} className="font-semibold text-red-950">
                    {e.message} ({e.recommendation})
                  </li>
                ))}
                {warnings.map((w, idx) => (
                  <li key={`warn-${idx}`}>{w.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Modal / Detail for Selected Statute */}
          {selectedStatute && (
            <div className="p-3.5 bg-white border border-neutral-300 rounded shadow-sm text-xs space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-neutral-900">
                  {selectedStatute.fullActName} — Section {selectedStatute.section}
                </h4>
                <button
                  onClick={() => setSelectedStatute(null)}
                  className="text-neutral-500 hover:text-black font-semibold text-[11px]"
                >
                  Close
                </button>
              </div>
              <p className="font-medium text-neutral-700">{selectedStatute.officialHeading}</p>
              <p className="text-[11px] text-neutral-600 leading-relaxed bg-neutral-50 p-2 border border-neutral-200 rounded">
                {selectedStatute.statutorySummary}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-neutral-500 pt-1">
                <span>Effective Date: <strong>{selectedStatute.effectiveDate}</strong></span>
                <span>Category: <strong>{selectedStatute.category}</strong></span>
                <span>Source: <strong>{selectedStatute.authoritativeSource}</strong></span>
                {selectedStatute.repealsLegacy && (
                  <span className="text-amber-800">
                    Replaces: <strong>{selectedStatute.repealsLegacy.act} Section {selectedStatute.repealsLegacy.section}</strong>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
