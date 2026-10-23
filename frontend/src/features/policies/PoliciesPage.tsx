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
import { getCategoryLabel } from '../../lib/utils';
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

  return (
    <div className="space-y-5">
      <PageHeader
        title="Contract Policies"
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
            Create Policy
          </Button>
        }
      />

      {/* Policy Form Modal / Inline Box */}
      {isFormOpen && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-semibold text-slate-900">
              {editingPolicy ? 'Edit Policy' : 'Create Policy'}
            </h2>
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

      {/* Compact Policy Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-medium">
              <tr>
                <th className="py-2.5 px-4">Policy Name</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Severity</th>
                <th className="py-2.5 px-4">Rules</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {policies.map(policy => (
                <tr key={policy.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                    {policy.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    {getCategoryLabel(policy.category)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <RiskBadge severity={policy.severity} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-sm truncate" title={policy.rule_text}>
                    {policy.rule_text}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleToggleEnabled(policy)}
                      className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700"
                      title={policy.is_enabled ? 'Disable' : 'Enable'}
                    >
                      {policy.is_enabled ? (
                        <ToggleRight className="w-5 h-5 text-slate-800" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-slate-400" />
                      )}
                      <span className="text-[11px] text-slate-500">
                        {policy.is_enabled ? 'Active' : 'Disabled'}
                      </span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingPolicy(policy);
                          setIsFormOpen(true);
                        }}
                        leftIcon={<Edit2 className="w-3 h-3" />}
                        className="text-xs"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingPolicyId(policy.id)}
                        leftIcon={<Trash2 className="w-3 h-3 text-red-600" />}
                        className="text-xs text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingPolicyId}
        title="Delete Policy?"
        description="Are you sure you want to delete this policy?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setDeletingPolicyId(null)}
      />
    </div>
  );
}
