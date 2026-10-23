export type RiskSeverity = 'high' | 'medium' | 'low';
export type ClauseCategory = 'payment' | 'renewal' | 'liability' | 'jurisdiction' | 'other';
export type ReviewStatus = 'needs_review' | 'reviewed' | 'dismissed';
export type ContractStatus = 'uploaded' | 'extracted' | 'analyzing' | 'analyzed' | 'failed';
export type BindingType = 'binding_law' | 'official_guidance' | 'standard';

export interface RiskSummary {
  high: number;
  medium: number;
  low: number;
  total: number;
}

export interface Contract {
  id: string;
  owner_id: string;
  filename_original: string;
  storage_key: string;
  sha256: string;
  mime_type: string;
  size_bytes: number;
  page_count: number;
  status: ContractStatus;
  uploaded_at: string;
  deleted_at?: string | null;
  latest_analysis_id?: string;
  risk_summary?: RiskSummary;
}

export interface PolicyRuleConfig {
  max_payment_days?: number;
  min_cancellation_notice_days?: number;
  liability_cap_percent?: number;
  preferred_jurisdiction?: string;
  [key: string]: unknown;
}

export interface Policy {
  id: string;
  owner_id: string;
  name: string;
  category: ClauseCategory;
  rule_text: string;
  rule_config?: PolicyRuleConfig;
  severity: RiskSeverity;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegulatorySource {
  id: string;
  title: string;
  jurisdiction: string;
  publisher: string;
  official_url: string;
  effective_date: string;
  last_verified_at: string;
}

export interface RegulatoryRule {
  id: string;
  source_id: string;
  source?: RegulatorySource;
  rule_code: string;
  category: ClauseCategory;
  rule_text: string;
  applicability_notes: string;
  binding_type: BindingType;
  version: string;
  status: 'active' | 'deprecated' | 'under_review';
  is_selected?: boolean;
}

export interface Finding {
  id: string;
  analysis_id: string;
  policy_id?: string | null;
  regulatory_rule_id?: string | null;
  trigger_type: 'policy' | 'regulatory_rule' | 'ai_heuristic';
  trigger_name: string;
  category: ClauseCategory;
  severity: RiskSeverity;
  source_quote: string;
  page_number: number;
  section_reference?: string;
  reason: string;
  remediation_advice: string;
  evidence_verified: boolean;
  review_status: ReviewStatus;
  created_at: string;
}

export interface Analysis {
  id: string;
  contract_id: string;
  contract_name: string;
  owner_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  model_provider: string;
  model_name: string;
  policy_snapshot?: Policy[];
  regulatory_rules_snapshot?: RegulatoryRule[];
  summary: string;
  overall_risk_level: 'high' | 'medium' | 'low' | 'clean';
  findings_count: RiskSummary;
  created_at: string;
  completed_at?: string;
  error_code?: string | null;
  findings?: Finding[];
}

export interface ContractExtractionPage {
  page_number: number;
  text: string;
  clauses_count: number;
}

export interface ContractExtraction {
  contract_id: string;
  page_count: number;
  pages: ContractExtractionPage[];
  extracted_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: string;
  retention_days: number;
}
