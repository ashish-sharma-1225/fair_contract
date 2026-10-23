import type {
  Analysis,
  Contract,
  ContractExtraction,
  Finding,
  Policy,
  RegulatoryRule,
  RegulatorySource,
  UserProfile,
} from '../types';

export const mockUserProfile: UserProfile = {
  id: 'usr_demo_8829',
  name: 'Alex Morgan',
  email: 'alex.morgan@studiocraft.dev',
  organization: 'StudioCraft Solutions LLC',
  role: 'Freelance Principal & Tech Consultant',
  retention_days: 90,
};

export const mockRegulatorySources: RegulatorySource[] = [
  {
    id: 'src_uk_latepay',
    title: 'Late Payment of Commercial Debts (Interest) Act 1998',
    jurisdiction: 'United Kingdom (England & Wales)',
    publisher: 'UK Department for Business and Trade',
    official_url: 'https://www.legislation.gov.uk/ukpga/1998/20/contents',
    effective_date: '1998-11-01',
    last_verified_at: '2026-01-15',
  },
  {
    id: 'src_eu_uctd',
    title: 'Directive 93/13/EEC on Unfair Terms in Consumer and Commercial Contracts',
    jurisdiction: 'European Union',
    publisher: 'Official Journal of the European Communities',
    official_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A31993L0013',
    effective_date: '1993-04-05',
    last_verified_at: '2026-02-10',
  },
  {
    id: 'src_us_ucc_2302',
    title: 'Uniform Commercial Code (UCC) § 2-302: Unconscionable Contract or Clause',
    jurisdiction: 'United States (Model Act)',
    publisher: 'Uniform Law Commission / American Law Institute',
    official_url: 'https://www.law.cornell.edu/ucc/2/2-302',
    effective_date: '2003-01-01',
    last_verified_at: '2026-01-20',
  },
];

export const mockRegulatoryRules: RegulatoryRule[] = [
  {
    id: 'reg_uk_30day_payment',
    source_id: 'src_uk_latepay',
    source: mockRegulatorySources[0],
    rule_code: 'REG-UK-LPCD-30D',
    category: 'payment',
    rule_text:
      'Payment terms between commercial entities must not exceed 60 days unless expressly agreed and not grossly unfair; default statutory entitlement requires payment within 30 days of invoice receipt.',
    applicability_notes:
      'Statutory baseline for B2B supplier transactions in UK jurisdiction.',
    binding_type: 'binding_law',
    version: '2024.1',
    status: 'active',
    is_selected: true,
  },
  {
    id: 'reg_eu_autorenewal_notice',
    source_id: 'src_eu_uctd',
    source: mockRegulatorySources[1],
    rule_code: 'REG-EU-UCTD-AR60',
    category: 'renewal',
    rule_text:
      'Clauses providing for automatic contract extension where the customer is not given adequate advance notification or reasonable termination window are deemed potentially unfair and unenforceable.',
    applicability_notes:
      'Applies to recurring service agreements and rolling retainer commitments.',
    binding_type: 'binding_law',
    version: '2023.2',
    status: 'active',
    is_selected: true,
  },
  {
    id: 'reg_us_ucc_unconscionable_indemnity',
    source_id: 'src_us_ucc_2302',
    source: mockRegulatorySources[2],
    rule_code: 'REG-US-UCC-INDEMNITY',
    category: 'liability',
    rule_text:
      'Unilateral indemnity clauses requiring a vendor or freelancer to indemnify the enterprise for the enterprise’s own negligence or unlimited third-party damages are subject to unconscionability challenge.',
    applicability_notes:
      'Persuasive standard across state commercial law governing contractor risk allocation.',
    binding_type: 'official_guidance',
    version: '2022.4',
    status: 'active',
    is_selected: false,
  },
];

export const mockPolicies: Policy[] = [
  {
    id: 'pol_net_30',
    owner_id: 'usr_demo_8829',
    name: 'Maximum Net-30 Payment Window',
    category: 'payment',
    rule_text:
      'Flag any clause that requires payment terms exceeding 30 calendar days from invoice submission, or conditions payment upon third-party customer approval ("pay-when-paid").',
    rule_config: { max_payment_days: 30 },
    severity: 'high',
    is_enabled: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-02-01T14:30:00Z',
  },
  {
    id: 'pol_auto_renewal_60d',
    owner_id: 'usr_demo_8829',
    name: '60-Day Notice for Automatic Renewal',
    category: 'renewal',
    rule_text:
      'Flag any automatic renewal clause that binds the vendor for an additional term unless cancellation notice is required more than 60 days in advance, or contains no reminder notice requirement.',
    rule_config: { min_cancellation_notice_days: 60 },
    severity: 'high',
    is_enabled: true,
    created_at: '2026-01-12T11:20:00Z',
    updated_at: '2026-01-12T11:20:00Z',
  },
  {
    id: 'pol_liability_cap',
    owner_id: 'usr_demo_8829',
    name: 'Liability Cap at 100% of Fees Paid',
    category: 'liability',
    rule_text:
      'Flag contracts with unlimited contractor liability or liability caps that exceed 100% of total fees paid to the contractor under the applicable Statement of Work.',
    rule_config: { liability_cap_percent: 100 },
    severity: 'high',
    is_enabled: true,
    created_at: '2026-01-15T09:15:00Z',
    updated_at: '2026-01-20T16:00:00Z',
  },
  {
    id: 'pol_local_jurisdiction',
    owner_id: 'usr_demo_8829',
    name: 'Preferred Domestic Jurisdiction',
    category: 'jurisdiction',
    rule_text:
      'Flag governing law or dispute resolution clauses specifying offshore, foreign, or distant arbitral venues that impose disproportionate legal expense on a small vendor.',
    rule_config: { preferred_jurisdiction: 'New York, USA or London, UK' },
    severity: 'medium',
    is_enabled: true,
    created_at: '2026-01-18T13:45:00Z',
    updated_at: '2026-01-18T13:45:00Z',
  },
];

export const mockContracts: Contract[] = [
  {
    id: 'ctr_saas_msa_001',
    owner_id: 'usr_demo_8829',
    filename_original: 'Apex_Enterprises_Master_Services_Agreement_2026.pdf',
    storage_key: 'uploads/2026/02/ctr_saas_msa_001.pdf',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    mime_type: 'application/pdf',
    size_bytes: 1428500, // 1.4 MB
    page_count: 6,
    status: 'analyzed',
    uploaded_at: '2026-02-14T09:30:00Z',
    deleted_at: null,
    latest_analysis_id: 'anl_apex_001',
    risk_summary: {
      high: 3,
      medium: 1,
      low: 1,
      total: 5,
    },
  },
  {
    id: 'ctr_freelance_retainer_002',
    owner_id: 'usr_demo_8829',
    filename_original: 'NorthStar_Digital_Consulting_Retainer.pdf',
    storage_key: 'uploads/2026/02/ctr_freelance_retainer_002.pdf',
    sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    mime_type: 'application/pdf',
    size_bytes: 784200, // 784 KB
    page_count: 3,
    status: 'analyzed',
    uploaded_at: '2026-02-18T14:15:00Z',
    deleted_at: null,
    latest_analysis_id: 'anl_northstar_002',
    risk_summary: {
      high: 1,
      medium: 2,
      low: 0,
      total: 3,
    },
  },
  {
    id: 'ctr_cloud_vendor_003',
    owner_id: 'usr_demo_8829',
    filename_original: 'SkyScale_Infrastructure_Vendor_Agreement.pdf',
    storage_key: 'uploads/2026/02/ctr_cloud_vendor_003.pdf',
    sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    mime_type: 'application/pdf',
    size_bytes: 2150400, // 2.1 MB
    page_count: 8,
    status: 'extracted',
    uploaded_at: '2026-02-21T11:00:00Z',
    deleted_at: null,
  },
];

export const mockFindingsApex: Finding[] = [
  {
    id: 'fnd_apex_01',
    analysis_id: 'anl_apex_001',
    policy_id: 'pol_net_30',
    regulatory_rule_id: 'reg_uk_30day_payment',
    trigger_type: 'policy',
    trigger_name: 'Maximum Net-30 Payment Window',
    category: 'payment',
    severity: 'high',
    source_quote:
      'Client shall remit payment for undisputed invoices within ninety (90) calendar days from receipt of Client’s internal executive steering committee approval.',
    page_number: 2,
    section_reference: 'Section 4.2 (Payment & Invoicing Terms)',
    reason:
      'Contract specifies Net-90 payment terms coupled with an internal discretionary approval prerequisite ("pay-after-internal-approval"). This directly breaches your Net-30 policy and poses severe cash flow risk for small vendors.',
    remediation_advice:
      'Counter-propose standard Net-30 terms calculated from invoice delivery date, with statutory late payment interest of 2% per month on delayed sums.',
    evidence_verified: true,
    review_status: 'needs_review',
    created_at: '2026-02-14T09:32:00Z',
  },
  {
    id: 'fnd_apex_02',
    analysis_id: 'anl_apex_001',
    policy_id: 'pol_auto_renewal_60d',
    regulatory_rule_id: 'reg_eu_autorenewal_notice',
    trigger_type: 'policy',
    trigger_name: '60-Day Notice for Automatic Renewal',
    category: 'renewal',
    severity: 'high',
    source_quote:
      'This Agreement shall automatically renew for successive twelve (12) month terms unless Contractor provides written notice of non-renewal no fewer than ninety (90) days prior to expiration of the Initial Term.',
    page_number: 3,
    section_reference: 'Section 6.1 (Term and Renewal)',
    reason:
      'The renewal clause imposes an unusually restrictive 90-day non-renewal notification window and automatically locks the contractor into a full 12-month subsequent term without mandatory reminder notices.',
    remediation_advice:
      'Propose an opt-in renewal mechanism, or shorten the cancellation notice window to 30 days prior to term expiration with written advance reminder from Client.',
    evidence_verified: true,
    review_status: 'needs_review',
    created_at: '2026-02-14T09:32:00Z',
  },
  {
    id: 'fnd_apex_03',
    analysis_id: 'anl_apex_001',
    policy_id: 'pol_liability_cap',
    regulatory_rule_id: 'reg_us_ucc_unconscionable_indemnity',
    trigger_type: 'policy',
    trigger_name: 'Liability Cap at 100% of Fees Paid',
    category: 'liability',
    severity: 'high',
    source_quote:
      'Contractor agrees to indemnify, defend, and hold harmless Client from any and all claims, liabilities, or losses whatsoever, and Contractor’s aggregate liability shall be uncapped with respect to indemnification and confidentiality.',
    page_number: 4,
    section_reference: 'Section 9.4 (Indemnification and Limitation of Liability)',
    reason:
      'Carves out indemnification from liability caps, exposing the freelancer to unlimited financial liability even where damages exceed the total value of fees paid under the contract.',
    remediation_advice:
      'Insert an explicit mutual liability cap equal to 100% of aggregate fees paid by Client to Contractor under the specific Statement of Work in the preceding 12 months.',
    evidence_verified: true,
    review_status: 'needs_review',
    created_at: '2026-02-14T09:32:00Z',
  },
  {
    id: 'fnd_apex_04',
    analysis_id: 'anl_apex_001',
    policy_id: 'pol_local_jurisdiction',
    regulatory_rule_id: null,
    trigger_type: 'policy',
    trigger_name: 'Preferred Domestic Jurisdiction',
    category: 'jurisdiction',
    severity: 'medium',
    source_quote:
      'This Agreement shall be governed by the laws of the Canton of Zurich, Switzerland, and the parties submit to the exclusive jurisdiction of the Courts of Zurich for any dispute arising hereunder.',
    page_number: 5,
    section_reference: 'Section 12.8 (Governing Law and Dispute Resolution)',
    reason:
      'The contract designates an offshore foreign venue (Zurich, Switzerland) that would make dispute resolution prohibitively costly and complex for a domestic sole proprietor.',
    remediation_advice:
      'Request governing law and jurisdiction to be changed to your principal place of business, or propose neutral virtual expedited commercial mediation/arbitration.',
    evidence_verified: true,
    review_status: 'reviewed',
    created_at: '2026-02-14T09:32:00Z',
  },
  {
    id: 'fnd_apex_05',
    analysis_id: 'anl_apex_001',
    policy_id: null,
    regulatory_rule_id: null,
    trigger_type: 'ai_heuristic',
    trigger_name: 'Broad Non-Solicitation & Restrictive Covenant',
    category: 'other',
    severity: 'low',
    source_quote:
      'For twenty-four (24) months following termination, Contractor shall not solicit or perform services for any client or prospective client of Client contacted during the term.',
    page_number: 5,
    section_reference: 'Section 11.2 (Non-Solicitation and Restrictive Covenants)',
    reason:
      'The 24-month duration and coverage of "prospective clients" is broad and could unduly restrict freelancer business development opportunities.',
    remediation_advice:
      'Reduce duration to 6-12 months and restrict applicability strictly to active clients with whom Contractor directly worked on confidential deliverables.',
    evidence_verified: true,
    review_status: 'dismissed',
    created_at: '2026-02-14T09:32:00Z',
  },
];

export const mockAnalyses: Analysis[] = [
  {
    id: 'anl_apex_001',
    contract_id: 'ctr_saas_msa_001',
    contract_name: 'Apex_Enterprises_Master_Services_Agreement_2026.pdf',
    owner_id: 'usr_demo_8829',
    status: 'completed',
    model_provider: 'Google Cloud (Gemini API)',
    model_name: 'Gemini 2.5 Flash (FastAPI Orchestrated)',
    policy_snapshot: mockPolicies,
    regulatory_rules_snapshot: mockRegulatoryRules,
    summary:
      'High-risk contract terms detected across payment duration, automatic renewal commitments, and un-capped vendor indemnity. Standard commercial revisions strongly advised prior to signing.',
    overall_risk_level: 'high',
    findings_count: {
      high: 3,
      medium: 1,
      low: 1,
      total: 5,
    },
    created_at: '2026-02-14T09:30:45Z',
    completed_at: '2026-02-14T09:32:00Z',
    findings: mockFindingsApex,
  },
  {
    id: 'anl_northstar_002',
    contract_id: 'ctr_freelance_retainer_002',
    contract_name: 'NorthStar_Digital_Consulting_Retainer.pdf',
    owner_id: 'usr_demo_8829',
    status: 'completed',
    model_provider: 'Google Cloud (Gemini API)',
    model_name: 'Gemini 2.5 Flash (FastAPI Orchestrated)',
    policy_snapshot: mockPolicies.slice(0, 2),
    regulatory_rules_snapshot: [mockRegulatoryRules[0]],
    summary:
      'Moderate risk profile. Payment window (Net-45) slightly exceeds preferred Net-30 benchmark, with reasonable mutual termination provisions.',
    overall_risk_level: 'medium',
    findings_count: {
      high: 1,
      medium: 2,
      low: 0,
      total: 3,
    },
    created_at: '2026-02-18T14:15:30Z',
    completed_at: '2026-02-18T14:16:45Z',
    findings: [
      {
        id: 'fnd_ns_01',
        analysis_id: 'anl_northstar_002',
        policy_id: 'pol_net_30',
        regulatory_rule_id: 'reg_uk_30day_payment',
        trigger_type: 'policy',
        trigger_name: 'Maximum Net-30 Payment Window',
        category: 'payment',
        severity: 'high',
        source_quote:
          'Payment shall be issued Net forty-five (45) days following receipt and acceptance of monthly timesheets.',
        page_number: 1,
        section_reference: 'Section 3.1 (Compensation and Disbursement)',
        reason:
          'Net-45 exceeds your configured Net-30 maximum threshold by 15 days.',
        remediation_advice:
          'Request Net-30 payment or request a 5% discount incentive for payment settled within 10 days.',
        evidence_verified: true,
        review_status: 'reviewed',
        created_at: '2026-02-18T14:16:45Z',
      },
      {
        id: 'fnd_ns_02',
        analysis_id: 'anl_northstar_002',
        policy_id: null,
        regulatory_rule_id: null,
        trigger_type: 'ai_heuristic',
        trigger_name: 'Asymmetric Intellectual Property Assignment',
        category: 'other',
        severity: 'medium',
        source_quote:
          'Contractor assigns all right, title, and interest in Work Product, including pre-existing proprietary tools and developer frameworks.',
        page_number: 2,
        section_reference: 'Section 7.3 (Intellectual Property Rights)',
        reason:
          'Includes pre-existing background code and reusable developer toolkits in the general IP assignment to Client.',
        remediation_advice:
          'Clarify that pre-existing materials remain Contractor property, subject only to a non-exclusive license to Client for using the deliverables.',
        evidence_verified: true,
        review_status: 'needs_review',
        created_at: '2026-02-18T14:16:45Z',
      },
      {
        id: 'fnd_ns_03',
        analysis_id: 'anl_northstar_002',
        policy_id: 'pol_local_jurisdiction',
        regulatory_rule_id: null,
        trigger_type: 'policy',
        trigger_name: 'Preferred Domestic Jurisdiction',
        category: 'jurisdiction',
        severity: 'medium',
        source_quote:
          'This Retainer shall be interpreted under the laws of the State of Delaware with mandatory arbitration in Wilmington.',
        page_number: 3,
        section_reference: 'Section 10.1 (Governing Law)',
        reason:
          'Delaware arbitration required; may involve travel and arbitral filing costs.',
        remediation_advice:
          'Agree on remote AAA arbitration or use Contractor’s domestic state court.',
        evidence_verified: true,
        review_status: 'needs_review',
        created_at: '2026-02-18T14:16:45Z',
      },
    ],
  },
];

export const mockSampleContractText: ContractExtraction = {
  contract_id: 'ctr_saas_msa_001',
  page_count: 6,
  extracted_at: '2026-02-14T09:31:12Z',
  pages: [
    {
      page_number: 1,
      clauses_count: 4,
      text: `MASTER SERVICES AGREEMENT
This Master Services Agreement ("Agreement") is entered into as of January 15, 2026 ("Effective Date"), by and between Apex Enterprises Inc., a Delaware corporation having its principal office at 500 Silicon Way, San Francisco, CA ("Client"), and StudioCraft Solutions LLC ("Contractor" or "Vendor").

RECITALS
WHEREAS, Client desires to retain Contractor to perform certain consulting and software development services described in Statements of Work; and
WHEREAS, Contractor possesses the requisite expertise and agrees to perform such services in accordance with the terms and conditions set forth herein.

NOW, THEREFORE, the parties agree as follows:
1. SERVICES AND STATEMENTS OF WORK
1.1 Statements of Work. Contractor shall provide the consulting, engineering, and design services specified in one or more Statements of Work ("SOW") executed by both parties.
1.2 Performance Standards. Contractor shall perform all Services with reasonable skill and diligence consistent with industry best practices.`,
    },
    {
      page_number: 2,
      clauses_count: 5,
      text: `4. FEES, INVOICING, AND PAYMENT TERMS
4.1 Invoicing Schedule. Contractor shall submit itemized invoices at the end of each calendar month for Services performed during such month.
4.2 Payment Terms. Client shall remit payment for undisputed invoices within ninety (90) calendar days from receipt of Client’s internal executive steering committee approval. If Client in good faith disputes any invoice portion, Client shall notify Contractor within thirty (30) days and pay the undisputed portion.
4.3 Taxes. Fees stated herein are exclusive of applicable federal, state, or local sales and use taxes.
4.4 Late Fees Waived. The parties agree that no interest, late charges, or penalties shall accrue on any delayed payments regardless of the duration of delay.`,
    },
    {
      page_number: 3,
      clauses_count: 4,
      text: `6. TERM AND TERMINATION
6.1 Term and Renewal. This Agreement shall commence on the Effective Date and continue for a period of one (1) year. This Agreement shall automatically renew for successive twelve (12) month terms unless Contractor provides written notice of non-renewal no fewer than ninety (90) days prior to expiration of the Initial Term.
6.2 Termination for Convenience by Client. Client may terminate this Agreement or any Statement of Work at any time, for any reason or no reason, upon five (5) business days prior written notice to Contractor.
6.3 Termination by Contractor. Contractor may terminate only in the event of an uncured material breach by Client following sixty (60) days written notice.`,
    },
    {
      page_number: 4,
      clauses_count: 3,
      text: `9. INDEMNIFICATION AND LIABILITY ALLOCATION
9.1 Client Indemnification. None.
9.2 Contractor Indemnification. Contractor agrees to indemnify, defend, and hold harmless Client, its affiliates, directors, officers, and employees from any and all claims, liabilities, losses, damages, costs, or expenses (including reasonable attorney fees) whatsoever arising out of or resulting from Contractor's performance, alleged IP infringement, or breach of this Agreement.
9.3 Limitation of Liability. IN NO EVENT SHALL CLIENT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES. CLIENT'S TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED $500.
9.4 Contractor Liability. Contractor’s aggregate liability shall be uncapped with respect to indemnification and confidentiality.`,
    },
    {
      page_number: 5,
      clauses_count: 4,
      text: `11. RESTRICTIVE COVENANTS
11.1 Confidentiality. Contractor shall maintain Client Proprietary Information in strict confidence for a period of five (5) years.
11.2 Non-Solicitation and Restrictive Covenants. For twenty-four (24) months following termination, Contractor shall not solicit or perform services for any client or prospective client of Client contacted during the term.

12. GENERAL PROVISIONS
12.8 Governing Law and Dispute Resolution. This Agreement shall be governed by the laws of the Canton of Zurich, Switzerland, and the parties submit to the exclusive jurisdiction of the Courts of Zurich for any dispute arising hereunder.`,
    },
    {
      page_number: 6,
      clauses_count: 2,
      text: `IN WITNESS WHEREOF, the parties hereto have caused this Master Services Agreement to be executed by their duly authorized representatives as of the Effective Date.

APEX ENTERPRISES INC.
By: _______________________________
Name: Marcus Vance
Title: VP of Procurement & Global Operations

STUDIOCRAFT SOLUTIONS LLC
By: _______________________________
Name: Alex Morgan
Title: Principal Consultant & Founder`,
    },
  ],
};
