import { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { PolicyForm } from '../../components/forms/PolicyForm';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { demoStore } from '../../mocks/demo-store';
import { getCategoryLabel, formatShortDate } from '../../lib/utils';
import type { Policy } from '../../types';
import type { PolicyFormData } from '../../lib/validation';

export function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>(() =>
    demoStore.getPolicies()
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [deletingPolicyId, setDeletingPolicyId] = useState<string | null>(null);

  const handleSavePolicy = (data: PolicyFormData) => {
    if (editingPolicy) {
      // Update
      const updated: Policy = {
        ...editingPolicy,
        name: data.name,
        category: data.category,
        rule_text: data.rule_text,
        severity: data.severity,
        rule_config: {
          max_payment_days: data.max_payment_days,
          min_cancellation_notice_days: data.min_cancellation_notice_days,
          liability_cap_percent: data.liability_cap_percent,
          preferred_jurisdiction: data.preferred_jurisdiction,
        },
        is_enabled: data.is_enabled,
        updated_at: new Date().toISOString(),
      };
      demoStore.savePolicy(updated);
    } else {
      // Create new
      const newPolicy: Policy = {
        id: `pol_custom_${Date.now()}`,
        owner_id: 'usr_demo_8829',
        name: data.name,
        category: data.category,
        rule_text: data.rule_text,
        severity: data.severity,
        rule_config: {
          max_payment_days: data.max_payment_days,
          min_cancellation_notice_days: data.min_cancellation_notice_days,
          liability_cap_percent: data.liability_cap_percent,
          preferred_jurisdiction: data.preferred_jurisdiction,
        },
        is_enabled: data.is_enabled,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      demoStore.savePolicy(newPolicy);
    }

    setPolicies(demoStore.getPolicies());
    setIsFormOpen(false);
    setEditingPolicy(null);
  };

  const handleToggleEnabled = (policy: Policy) => {
    const updated = { ...policy, is_enabled: !policy.is_enabled };
    demoStore.savePolicy(updated);
    setPolicies(demoStore.getPolicies());
  };

  const handleDelete = () => {
    if (deletingPolicyId) {
      demoStore.deletePolicy(deletingPolicyId);
      setPolicies(demoStore.getPolicies());
      setDeletingPolicyId(null);
    }
  };

  // Preset Template Quick Inserter
  const applyPresetTemplate = (template: Partial<Policy>) => {
    const newPolicy: Policy = {
      id: `pol_preset_${Date.now()}`,
      owner_id: 'usr_demo_8829',
      name: template.name || 'New Policy',
      category: template.category || 'payment',
      rule_text: template.rule_text || '',
      severity: template.severity || 'high',
      rule_config: template.rule_config || {},
      is_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    demoStore.savePolicy(newPolicy);
    setPolicies(demoStore.getPolicies());
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Policies"
        description="Configure your custom business and contracting standards to automatically detect unfavorable terms."
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setEditingPolicy(null);
              setIsFormOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create New Policy
          </Button>
        }
      />

      {/* Preset Suggestions Bar */}
      <div className="rounded-lg border border-slate-200 bg-white p-3.5 text-xs">
        <h3 className="font-medium text-slate-800 mb-1.5">
          Standard Policy Presets
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              applyPresetTemplate({
                name: 'Cap Liability at Contract Fees',
                category: 'liability',
                rule_text:
                  'Ensure total freelancer liability is capped at no more than 100% of the total fees collected under the agreement.',
                severity: 'high',
                rule_config: { liability_cap_percent: 100 },
              })
            }
            className="text-xs"
          >
            + 100% Fee liability cap
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              applyPresetTemplate({
                name: 'Net-30 Maximum Payment Terms',
                category: 'payment',
                rule_text:
                  'Flag any clause stating invoices are due more than 30 days after issuance, or conditional upon third-party customer approval.',
                severity: 'high',
                rule_config: { max_payment_days: 30 },
              })
            }
            className="text-xs"
          >
            + Net-30 Payment window
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              applyPresetTemplate({
                name: 'No Automatic Multi-Year Extensions',
                category: 'renewal',
                rule_text:
                  'Flag automatic rollover provisions that do not require explicit written confirmation from the contractor.',
                severity: 'medium',
                rule_config: { min_cancellation_notice_days: 60 },
              })
            }
            className="text-xs"
          >
            + Auto-renewal safeguard
          </Button>
        </div>
      </div>

      {/* Policy Form Modal / Inline Box */}
      {isFormOpen && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              {editingPolicy ? 'Edit Business Policy' : 'Create New Business Policy'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Define the conditions that should trigger an alert during contract review.
            </p>
          </div>
          <PolicyForm
            initialData={editingPolicy}
            onSubmit={handleSavePolicy}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingPolicy(null);
            }}
          />
        </div>
      )}

      {/* Policy List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {policies.map(policy => (
          <div
            key={policy.id}
            className={`rounded-lg border p-4 transition-colors text-xs ${
              policy.is_enabled
                ? 'border-slate-200 bg-white hover:border-slate-300'
                : 'border-slate-200 bg-slate-50/70 opacity-75'
            }`}
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <RiskBadge severity={policy.severity} size="sm" />
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600 font-medium">
                      {getCategoryLabel(policy.category)}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 mt-1.5">
                    {policy.name}
                  </h4>
                </div>

                {/* Enable Toggle Button */}
                <button
                  type="button"
                  onClick={() => handleToggleEnabled(policy)}
                  className={`p-0.5 rounded transition-colors cursor-pointer ${
                    policy.is_enabled
                      ? 'text-slate-700 hover:text-slate-900'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title={policy.is_enabled ? 'Disable policy' : 'Enable policy'}
                  aria-label={policy.is_enabled ? 'Disable policy' : 'Enable policy'}
                >
                  {policy.is_enabled ? (
                    <ToggleRight className="w-6 h-6 text-slate-800" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Natural language rule description */}
              <p className="text-slate-600 leading-relaxed">
                {policy.rule_text}
              </p>

              {/* Structured values */}
              {policy.rule_config && Object.keys(policy.rule_config).length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                  {policy.rule_config.max_payment_days && (
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                      Limit: Net-{policy.rule_config.max_payment_days}
                    </span>
                  )}
                  {policy.rule_config.min_cancellation_notice_days && (
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                      Notice: {policy.rule_config.min_cancellation_notice_days}d
                    </span>
                  )}
                  {policy.rule_config.liability_cap_percent && (
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                      Cap: {policy.rule_config.liability_cap_percent}%
                    </span>
                  )}
                  {policy.rule_config.preferred_jurisdiction && (
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-xs">
                      Venue: {policy.rule_config.preferred_jurisdiction}
                    </span>
                  )}
                </div>
              )}

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
                <span>Updated {formatShortDate(policy.updated_at)}</span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPolicy(policy);
                      setIsFormOpen(true);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                    title="Edit policy"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingPolicyId(policy.id)}
                    className="p-1 text-slate-400 hover:text-red-700 rounded transition-colors"
                    title="Delete policy"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>


      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingPolicyId}
        title="Delete Policy?"
        description="Are you sure you want to remove this policy? Future contract scans will no longer evaluate clauses against this rule."
        confirmLabel="Delete Policy"
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setDeletingPolicyId(null)}
      />
    </div>
  );
}
