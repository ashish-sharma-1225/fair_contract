import type {
  Analysis,
  Contract,
  Finding,
  Policy,
  RegulatoryRule,
  ReviewStatus,
} from '../types';

import {
  mockAnalyses,
  mockContracts,
  mockPolicies,
  mockRegulatoryRules,
} from './demo-data';

const STORAGE_KEYS = {
  CONTRACTS: 'clauselens_contracts',
  POLICIES: 'clauselens_policies',
  RULES: 'clauselens_rules',
  ANALYSES: 'clauselens_analyses',
};

function loadStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Handle quota or private browsing silently
  }
}

export const demoStore = {
  getContracts(): Contract[] {
    return loadStorage<Contract[]>(STORAGE_KEYS.CONTRACTS, mockContracts);
  },

  getContract(id: string): Contract | undefined {
    return this.getContracts().find(c => c.id === id);
  },

  saveContract(contract: Contract): void {
    const contracts = this.getContracts();
    const existingIndex = contracts.findIndex(c => c.id === contract.id);
    if (existingIndex >= 0) {
      contracts[existingIndex] = contract;
    } else {
      contracts.unshift(contract);
    }
    saveStorage(STORAGE_KEYS.CONTRACTS, contracts);
  },

  deleteContract(id: string): boolean {
    const contracts = this.getContracts();
    const filtered = contracts.filter(c => c.id !== id);
    saveStorage(STORAGE_KEYS.CONTRACTS, filtered);
    return true;
  },

  getPolicies(): Policy[] {
    return loadStorage<Policy[]>(STORAGE_KEYS.POLICIES, mockPolicies);
  },

  getPolicy(id: string): Policy | undefined {
    return this.getPolicies().find(p => p.id === id);
  },

  savePolicy(policy: Policy): void {
    const policies = this.getPolicies();
    const existingIndex = policies.findIndex(p => p.id === policy.id);
    if (existingIndex >= 0) {
      policies[existingIndex] = policy;
    } else {
      policies.unshift(policy);
    }
    saveStorage(STORAGE_KEYS.POLICIES, policies);
  },

  deletePolicy(id: string): boolean {
    const policies = this.getPolicies();
    const filtered = policies.filter(p => p.id !== id);
    saveStorage(STORAGE_KEYS.POLICIES, filtered);
    return true;
  },

  getRegulatoryRules(): RegulatoryRule[] {
    return loadStorage<RegulatoryRule[]>(STORAGE_KEYS.RULES, mockRegulatoryRules);
  },

  toggleRegulatoryRule(id: string): void {
    const rules = this.getRegulatoryRules();
    const rule = rules.find(r => r.id === id);
    if (rule) {
      rule.is_selected = !rule.is_selected;
      saveStorage(STORAGE_KEYS.RULES, rules);
    }
  },

  getAnalyses(): Analysis[] {
    return loadStorage<Analysis[]>(STORAGE_KEYS.ANALYSES, mockAnalyses);
  },

  getAnalysis(id: string): Analysis | undefined {
    return this.getAnalyses().find(a => a.id === id);
  },

  saveAnalysis(analysis: Analysis): void {
    const analyses = this.getAnalyses();
    const existingIndex = analyses.findIndex(a => a.id === analysis.id);
    if (existingIndex >= 0) {
      analyses[existingIndex] = analysis;
    } else {
      analyses.unshift(analysis);
    }
    saveStorage(STORAGE_KEYS.ANALYSES, analyses);
  },

  updateFindingReview(
    analysisId: string,
    findingId: string,
    reviewStatus: ReviewStatus
  ): Finding | null {
    const analyses = this.getAnalyses();
    const analysis = analyses.find(a => a.id === analysisId);
    if (!analysis || !analysis.findings) return null;

    const finding = analysis.findings.find(f => f.id === findingId);
    if (!finding) return null;

    finding.review_status = reviewStatus;
    saveStorage(STORAGE_KEYS.ANALYSES, analyses);
    return finding;
  },

  createSimulatedAnalysis(
    contract: Contract,
    selectedPolicyIds: string[],
    selectedRuleIds: string[]
  ): Analysis {
    const allPolicies = this.getPolicies();
    const allRules = this.getRegulatoryRules();

    const selectedPolicies = allPolicies.filter(p =>
      selectedPolicyIds.includes(p.id)
    );
    const selectedRules = allRules.filter(r => selectedRuleIds.includes(r.id));

    const analysisId = `anl_sim_${Date.now()}`;

    // Generate findings matching the policies and rules selected
    const generatedFindings: Finding[] = [];

    if (selectedPolicies.some(p => p.category === 'payment')) {
      generatedFindings.push({
        id: `fnd_${Date.now()}_1`,
        analysis_id: analysisId,
        policy_id: 'pol_net_30',
        regulatory_rule_id: 'reg_uk_30day_payment',
        trigger_type: 'policy',
        trigger_name: 'Maximum Net-30 Payment Window',
        category: 'payment',
        severity: 'high',
        source_quote:
          'Payment shall be issued within seventy-five (75) days following receipt of statement.',
        page_number: 2,
        section_reference: 'Section 4.1 (Payment Terms)',
        reason:
          'The 75-day payment clause exceeds your configured Net-30 policy limit.',
        remediation_advice:
          'Amend payment schedule to Net-30 with interest charged on overdue balances.',
        evidence_verified: true,
        review_status: 'needs_review',
        created_at: new Date().toISOString(),
      });
    }

    if (selectedPolicies.some(p => p.category === 'renewal') || selectedRules.some(r => r.category === 'renewal')) {
      generatedFindings.push({
        id: `fnd_${Date.now()}_2`,
        analysis_id: analysisId,
        policy_id: 'pol_auto_renewal_60d',
        regulatory_rule_id: 'reg_eu_autorenewal_notice',
        trigger_type: 'policy',
        trigger_name: '60-Day Notice for Automatic Renewal',
        category: 'renewal',
        severity: 'high',
        source_quote:
          'Agreement renews automatically for successive one-year terms unless terminated 90 days before expiration.',
        page_number: 3,
        section_reference: 'Section 6.2 (Renewal and Notice)',
        reason:
          'Requires 90 days advance notice to prevent binding one-year rollover.',
        remediation_advice:
          'Reduce notice period to 30 days and add requirement for Client reminder notice.',
        evidence_verified: true,
        review_status: 'needs_review',
        created_at: new Date().toISOString(),
      });
    }

    if (selectedPolicies.some(p => p.category === 'liability')) {
      generatedFindings.push({
        id: `fnd_${Date.now()}_3`,
        analysis_id: analysisId,
        policy_id: 'pol_liability_cap',
        regulatory_rule_id: null,
        trigger_type: 'policy',
        trigger_name: 'Liability Cap at 100% of Fees Paid',
        category: 'liability',
        severity: 'high',
        source_quote:
          'Contractor shall hold Client harmless from all third-party claims without limitation.',
        page_number: 4,
        section_reference: 'Section 8.3 (Indemnification)',
        reason:
          'Unilateral uncapped indemnity violates your configured liability protection policy.',
        remediation_advice:
          'Cap contractor indemnity liability to total fees paid under this agreement.',
        evidence_verified: true,
        review_status: 'needs_review',
        created_at: new Date().toISOString(),
      });
    }

    // Always include a low/medium finding for realism
    generatedFindings.push({
      id: `fnd_${Date.now()}_4`,
      analysis_id: analysisId,
      policy_id: null,
      regulatory_rule_id: null,
      trigger_type: 'ai_heuristic',
      trigger_name: 'Broad Work Product Definition',
      category: 'other',
      severity: 'low',
      source_quote:
        'All developments, ideas, and code created during the engagement shall belong exclusively to Client.',
      page_number: 5,
      section_reference: 'Section 9.1 (Intellectual Property)',
      reason:
        'Clause does not explicitly carve out contractor background IP and open-source tooling.',
      remediation_advice:
        'Add a standard background IP reservation clause.',
      evidence_verified: true,
      review_status: 'needs_review',
      created_at: new Date().toISOString(),
    });

    const highCount = generatedFindings.filter(f => f.severity === 'high').length;
    const medCount = generatedFindings.filter(f => f.severity === 'medium').length;
    const lowCount = generatedFindings.filter(f => f.severity === 'low').length;

    let overallRisk: 'high' | 'medium' | 'low' | 'clean' = 'clean';
    if (highCount > 0) overallRisk = 'high';
    else if (medCount > 0) overallRisk = 'medium';
    else if (lowCount > 0) overallRisk = 'low';

    const newAnalysis: Analysis = {
      id: analysisId,
      contract_id: contract.id,
      contract_name: contract.filename_original,
      owner_id: contract.owner_id,
      status: 'completed',
      model_provider: 'Google Cloud (Gemini API)',
      model_name: 'Gemini 2.5 Flash (FastAPI Orchestrated)',
      policy_snapshot: selectedPolicies,
      regulatory_rules_snapshot: selectedRules,
      summary: `Automated simulation complete. Flagged ${generatedFindings.length} terms based on ${selectedPolicies.length} business policies and ${selectedRules.length} regulatory guidelines.`,
      overall_risk_level: overallRisk,
      findings_count: {
        high: highCount,
        medium: medCount,
        low: lowCount,
        total: generatedFindings.length,
      },
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      findings: generatedFindings,
    };

    this.saveAnalysis(newAnalysis);

    // Update contract status
    contract.status = 'analyzed';
    contract.latest_analysis_id = analysisId;
    contract.risk_summary = newAnalysis.findings_count;
    this.saveContract(contract);

    return newAnalysis;
  },

  reset(): void {
    saveStorage(STORAGE_KEYS.CONTRACTS, mockContracts);
    saveStorage(STORAGE_KEYS.POLICIES, mockPolicies);
    saveStorage(STORAGE_KEYS.RULES, mockRegulatoryRules);
    saveStorage(STORAGE_KEYS.ANALYSES, mockAnalyses);
  },
};
