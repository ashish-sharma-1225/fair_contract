import type { Finding } from '../types';

export interface CounterOffer {
  originalText: string;
  proposedText: string;
  politeEmailSnippet: string;
  justification: string;
}

/**
 * Generates an actionable fair redline and polite pushback for any finding.
 */
export function generateCounterOffer(finding: Finding): CounterOffer {
  const category = finding.category;
  const quote = finding.source_quote.trim();
  const trigger = finding.trigger_name.toLowerCase();

  // 1. Payment Delay / Late Payment
  if (category === 'payment' || trigger.includes('pay') || trigger.includes('invoice')) {
    return {
      originalText: quote || 'Payment shall be made within sixty (60) days of receipt of invoice.',
      proposedText:
        'Undisputed invoices shall be payable within thirty (30) calendar days of receipt. Any undisputed balance remaining unpaid after thirty (30) days shall accrue interest at the rate of 1.5% per month or the maximum rate permitted by law.',
      justification:
        'Standard small-vendor cash flow policies require Net 30 payment terms to cover operational payroll.',
      politeEmailSnippet:
        'Regarding the payment terms in Section ' +
        (finding.section_reference || 'Payment') +
        ': as a boutique vendor, our cash flow guidelines require Net 30 payment schedules. Would you be open to adjusting this to 30 days?',
    };
  }

  // 2. Liability / Indemnification
  if (category === 'liability' || trigger.includes('liab') || trigger.includes('indemn')) {
    return {
      originalText: quote || 'Contractor assumes unlimited liability and indemnifies Client against all claims.',
      proposedText:
        "Except for gross negligence or willful misconduct, Contractor's aggregate liability under this Agreement shall be capped at the total amount of fees actually received by Contractor hereunder in the twelve (12) months preceding the claim.",
      justification:
        'Uncapped liability exposes small service providers to disproportionate financial risk exceeding project value.',
      politeEmailSnippet:
        'Regarding Section ' +
        (finding.section_reference || 'Liability') +
        ': to align with standard professional liability coverage, we propose capping aggregate liability at the total fees paid under this agreement. We have added standard mutual language for this.',
    };
  }

  // 3. Renewal / Termination / Kill Fee
  if (category === 'renewal' || trigger.includes('terminat') || trigger.includes('renew') || trigger.includes('kill')) {
    return {
      originalText: quote || 'Client may terminate this Agreement at any time with immediate effect without compensation.',
      proposedText:
        'Either party may terminate this Agreement upon thirty (30) days prior written notice. In the event of early termination by Client without cause, Contractor shall be compensated for all services performed and milestones completed up to the termination date, plus an early cancellation fee equal to 15% of the remaining contract balance.',
      justification:
        'Guarantees compensation for committed resources and unbilled work-in-progress if a project is canceled abruptly.',
      politeEmailSnippet:
        'Regarding Section ' +
        (finding.section_reference || 'Termination') +
        ': we propose a 30-day written notice period and compensation for work completed up to the cancellation date so our team can schedule project transitions smoothly.',
    };
  }

  // 4. IP / Intellectual Property / Deliverables
  if (category === 'other' && (trigger.includes('ip') || trigger.includes('intellectual') || trigger.includes('ownership'))) {
    return {
      originalText: quote || 'All intellectual property rights transfer to Client immediately upon creation.',
      proposedText:
        'Upon receipt of full and final payment of all undisputed fees due under this Agreement, Contractor assigns to Client all right, title, and interest in and to the final custom deliverables.',
      justification:
        'Ensures intellectual property ownership only transfers once deliverables are paid for in full.',
      politeEmailSnippet:
        'Regarding Section ' +
        (finding.section_reference || 'Intellectual Property') +
        ': we standardly assign complete copyright and ownership upon receipt of final invoice payment. We have included this standard wording in our redline.',
    };
  }

  // 5. Scope / Revisions (Scope Creep)
  if (trigger.includes('scope') || trigger.includes('revis') || quote.toLowerCase().includes('revis')) {
    return {
      originalText: quote || 'Contractor will perform revisions as requested until Client satisfaction.',
      proposedText:
        'The agreed fee includes up to two (2) rounds of reasonable revisions within agreed project specifications. Additional revisions, scope additions, or change requests shall be billed at the standard hourly rate upon mutual written agreement.',
      justification:
        'Prevents open-ended scope creep and guarantees fair compensation for extra client requests.',
      politeEmailSnippet:
        'Regarding Section ' +
        (finding.section_reference || 'Revisions') +
        ': to keep our schedule on track, we include 2 rounds of consolidated revisions, with additional requests handled via change orders. Does that work for your team?',
    };
  }

  // Default fallback
  return {
    originalText: quote || 'Current contract provision as written.',
    proposedText: finding.remediation_advice || 'Mutually agreed reasonable terms conforming to industry standards.',
    justification: 'Balances contractual risk fairly between both parties.',
    politeEmailSnippet:
      'Regarding Section ' +
      (finding.section_reference || 'Clause') +
      ': we noticed the current phrasing could be interpreted ambiguity. We suggested a clarifying adjustment to keep expectations clear for both parties.',
  };
}

/**
 * Builds a complete, professional, copy-paste ready negotiation email combining all flagged clauses.
 */
export function generateConsolidatedNegotiationEmail(
  contractName: string,
  findings: Finding[]
): string {
  const riskyFindings = findings.filter(f => f.severity === 'high' || f.severity === 'medium');
  const bulletPoints = (riskyFindings.length > 0 ? riskyFindings : findings).slice(0, 4).map(f => {
    const offer = generateCounterOffer(f);
    const sectionName = f.section_reference || f.trigger_name;
    return `• ${sectionName}: ${offer.politeEmailSnippet}`;
  });

  return `Subject: Re: ${contractName} — Proposed Revisions & Next Steps

Hi [Client Name],

Thank you for sharing the agreement for ${contractName}! We are genuinely excited about the opportunity to partner with your team and get started on this project.

We reviewed the draft against our standard vendor policies. Overall, the agreement looks great—we just noticed a few standard commercial points that we typically align on to match our insurance and operational guidelines:

${bulletPoints.join('\n\n')}

We've prepared clean redline adjustments reflecting these standard terms. Could you please take a look and let us know if these work for your legal/procurement team?

We're flexible and happy to jump on a quick 5-minute call if easier. Looking forward to kicking this project off!

Best regards,
[Your Name / Business Name]`;
}
