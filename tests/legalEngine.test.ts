import { describe, it, expect } from 'vitest';
import { classifyLegalIntent } from '../src/app/legal/classification/intentClassifier';
import { validateLegalDraft } from '../src/app/legal/validation/legalValidator';
import {
  lookupStatute,
  resolveLegacyProvision,
  VERIFIED_REGISTRY,
} from '../src/app/legal/registry/statutoryRegistry';
import { executeLegalPipeline } from '../src/app/legal/pipeline/legalGenerationPipeline';

describe('Vakeel Saab Legal Engine & Procedural Compliance', () => {
  // ──────────────────────────────────────────────────────────
  // Test A: Initial theft reporting -> Police complaint (not FIR or bail)
  // ──────────────────────────────────────────────────────────
  it('Test A: generates a police complaint, not an FIR or bail petition, when reporting theft without prior police approach', async () => {
    const classification = classifyLegalIntent({
      incidentDescription: 'Someone broke into my shop last night and stole cash of Rs. 50,000 and two laptops.',
      desiredOutcome: 'report_offence',
      hasApproachedPolice: false,
    });

    expect(classification.recommendedType).toBe('police-complaint');
    expect(classification.recommendedType).not.toBe('bail-petition');
    expect(classification.officialDocumentTitle).toContain('Complaint to the Station House Officer');
    expect(classification.recipientDescription).toContain('Station House Officer');

    // Pipeline generation check
    const pipelineResult = await executeLegalPipeline({
      situation: {
        incidentDescription: 'Someone broke into my shop last night and stole cash of Rs. 50,000.',
        hasApproachedPolice: false,
      },
    });

    expect(pipelineResult.documentType).toBe('police-complaint');
    expect(pipelineResult.rawText).not.toContain('IN THE COURT OF');
    expect(pipelineResult.rawText).toContain('STATION HOUSE OFFICER');
    expect(pipelineResult.rawText).toContain('Section 173');
  });

  // ──────────────────────────────────────────────────────────
  // Test B: Police refused to act -> Escalation check without skipping statutory route
  // ──────────────────────────────────────────────────────────
  it('Test B: checks appropriate escalation route to Superintendent of Police when police station refuses to act', () => {
    const classification = classifyLegalIntent({
      incidentDescription: 'I submitted a complaint of cheating for Rs. 5 Lakhs to the local police station last week, but the SHO refused to register an FIR and told me it is a civil matter.',
      hasApproachedPolice: true,
      policeActionTaken: 'refused',
      hasApproachedSP: false,
    });

    expect(classification.recommendedType).toBe('sp-representation');
    expect(classification.officialDocumentTitle).toContain('Section 173(4)');
    expect(classification.recipientDescription).toContain('Superintendent of Police');
    expect(classification.escalationPath[1]).toContain('Representation to Superintendent of Police');
  });

  // ──────────────────────────────────────────────────────────
  // Test C: S. 175(3) BNSS requested without prior SP approach -> Missing prerequisite flagged
  // ──────────────────────────────────────────────────────────
  it('Test C: flags missing mandatory prerequisite (prior SP approach under S. 173(4)) when user requests Section 175(3) application', () => {
    const classification = classifyLegalIntent({
      incidentDescription: 'I want to file a Section 175(3) application before the Magistrate to direct the police to register an FIR.',
      desiredOutcome: 'magistrate_investigation',
      hasApproachedPolice: true,
      hasApproachedSP: false, // User skipped SP!
      hasSupportingAffidavit: false,
    });

    expect(classification.recommendedType).toBe('bnss-175-3-application');
    expect(classification.hasMissingMandatoryPrerequisite).toBe(true);

    const spPrereq = classification.statutoryPrerequisites.find((p) => p.id === 'prior_sp_representation');
    expect(spPrereq).toBeDefined();
    expect(spPrereq?.isSatisfied).toBe(false);

    // Validation layer check
    const sampleDraftWithoutSP = `IN THE COURT OF LD. JUDICIAL MAGISTRATE
APPLICATION UNDER SECTION 175(3) BNSS
1. Complainant states that theft occurred.
PRAYER: Direct police to register FIR.`;

    const validation = validateLegalDraft({
      docType: 'bnss-175-3-application',
      content: sampleDraftWithoutSP,
      classification,
    });

    expect(validation.isValid).toBe(false);
    expect(validation.criticalErrors.some((e) => e.code === 'ERR_BNSS_175_3_MISSING_SP_AVERMENT')).toBe(true);
    expect(validation.criticalErrors.some((e) => e.code === 'ERR_BNSS_175_3_MISSING_AFFIDAVIT')).toBe(true);
  });

  // ──────────────────────────────────────────────────────────
  // Test D: Regular bail request with existing FIR -> Bail application (not police complaint)
  // ──────────────────────────────────────────────────────────
  it('Test D: generates a bail application, not a police complaint, when user requests regular bail with an existing FIR', () => {
    const classification = classifyLegalIntent({
      incidentDescription: 'My brother was arrested yesterday in FIR No. 204/2025 under Section 303(2) BNS. He is in judicial custody and we need urgent bail.',
      desiredOutcome: 'seek_bail',
      existingFirNo: '204/2025',
      isApplicantArrestedOrInCustody: true,
    });

    expect(classification.recommendedType).toBe('bail-petition');
    expect(classification.recommendedType).not.toBe('police-complaint');
    expect(classification.officialDocumentTitle).toContain('Regular Bail');
    expect(classification.recipientDescription).toContain('In the Court of');
    expect(classification.applicableProvisions.some((p) => p.section === '480' || p.section === '483')).toBe(true);
  });

  // ──────────────────────────────────────────────────────────
  // Test E: Anticipatory bail before arrest -> S. 482 BNSS (distinguished from regular bail)
  // ──────────────────────────────────────────────────────────
  it('Test E: distinguishes anticipatory bail under S. 482 BNSS from regular bail when applicant is not arrested', () => {
    const classification = classifyLegalIntent({
      incidentDescription: 'A commercial rival has threatened to lodge a false FIR of fraud against me at Hauz Khas PS. Police visited my office. I have not been arrested.',
      desiredOutcome: 'seek_anticipatory_bail',
      isApplicantArrestedOrInCustody: false,
    });

    expect(classification.recommendedType).toBe('anticipatory-bail');
    expect(classification.officialDocumentTitle).toContain('Section 482');
    expect(classification.applicableProvisions.some((p) => p.section === '482')).toBe(true);

    // If applicant states they are already arrested, validation layer catches conflict
    const invalidAnticipatoryDraft = `IN THE COURT OF SESSIONS JUDGE
APPLICATION UNDER SECTION 482 BNSS
1. Applicant was arrested yesterday and is in custody.
PRAYER: Grant anticipatory bail.`;

    const validation = validateLegalDraft({
      docType: 'anticipatory-bail',
      content: invalidAnticipatoryDraft,
    });

    expect(validation.criticalErrors.some((e) => e.code === 'ERR_ANTICIPATORY_BAIL_ALREADY_ARRESTED')).toBe(true);
  });

  // ──────────────────────────────────────────────────────────
  // Test F: Outdated IPC or CrPC section -> Checks transition/savings rules & suggests BNS/BNSS
  // ──────────────────────────────────────────────────────────
  it('Test F: checks transition and savings rules when outdated IPC or CrPC sections are supplied', () => {
    // 1. Theft: IPC 379 -> BNS 303(2)
    const ipcRes = resolveLegacyProvision('IPC', '379', '2025-05-10');
    expect(ipcRes.current?.act).toBe('BNS');
    expect(ipcRes.current?.section).toBe('303(2)');

    // 2. Pre-July 2024 transitional savings check (Article 20(1) & S. 531 BNSS)
    const oldIncidentRes = resolveLegacyProvision('IPC', '379', '2023-11-20');
    expect(oldIncidentRes.transitionNote).toContain('prior to 1 July 2024');
    expect(oldIncidentRes.transitionNote).toContain('Article 20(1)');

    // 3. CrPC 156(3) -> BNSS 175(3)
    const crpcRes = resolveLegacyProvision('CrPC', '156(3)');
    expect(crpcRes.current?.act).toBe('BNSS');
    expect(crpcRes.current?.section).toBe('175(3)');

    // 4. Cheating: IPC 420 -> BNS 318(4)
    const cheatRes = resolveLegacyProvision('IPC', '420');
    expect(cheatRes.current?.section).toBe('318(4)');
  });

  // ──────────────────────────────────────────────────────────
  // Test G: Nonexistent section or fake citation -> Flagged by validation layer
  // ──────────────────────────────────────────────────────────
  it('Test G: validation layer flags nonexistent statutory sections as unverified', () => {
    const bogusDraft = `TO THE STATION HOUSE OFFICER,
POLICE STATION CENTRAL
COMPLAINT UNDER SECTION 999 OF BHARATIYA NYAYA SANHITA, 2023 AND SECTION 888 OF BNSS.
Complainant alleges fraud.`;

    const validation = validateLegalDraft({
      docType: 'police-complaint',
      content: bogusDraft,
    });

    expect(validation.unverifiedStatutes.length).toBeGreaterThan(0);
    expect(validation.unverifiedStatutes.some((s) => s.includes('999'))).toBe(true);
    expect(validation.warnings.some((w) => w.code === 'WARN_UNVERIFIED_BNS_SECTION')).toBe(true);
  });

  // ──────────────────────────────────────────────────────────
  // Test H: Blank incident date or party name -> Uses explicit placeholders without hallucination
  // ──────────────────────────────────────────────────────────
  it('Test H: uses explicit uppercase placeholders without fabricating missing names or dates', async () => {
    const pipelineResult = await executeLegalPipeline({
      situation: {
        incidentDescription: 'My phone was snatched on the street.',
        // Leaving incidentDate, party names, and police station blank
      },
    });

    expect(pipelineResult.rawText).toContain('[NAME OF COMPLAINANT]');
    expect(pipelineResult.rawText).toContain('[NAME OF POLICE STATION]');
    expect(pipelineResult.validation.placeholdersDetected.length).toBeGreaterThan(0);
    // Ensure no random fake police officer or random court name was invented
    expect(pipelineResult.rawText).not.toContain('Inspector Vikram Chauhan');
  });

  // ──────────────────────────────────────────────────────────
  // Test I: Facts not constituting cognizable offence -> Does not promise FIR and flags for review
  // ──────────────────────────────────────────────────────────
  it('Test I: flags non-cognizable offence facts for legal review and warns that police cannot register FIR without Magistrate order', () => {
    const classification = classifyLegalIntent({
      incidentDescription: 'My neighbor used abusive language during an argument over parking. No physical violence occurred.',
      desiredOutcome: 'report_offence',
    });

    expect(classification.cognizabilityAssessment.isCognizable).toBe(false);
    expect(classification.cognizabilityAssessment.requiresMagistrateOrder).toBe(true);
    expect(classification.warnings.some((w) => w.includes('non-cognizable'))).toBe(true);
  });
});
