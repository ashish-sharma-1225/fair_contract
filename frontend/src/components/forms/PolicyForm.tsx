import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/Button';

import { Input } from '../ui/Input';
import { policyFormSchema, type PolicyFormData } from '../../lib/validation';
import type { Policy } from '../../types';

export interface PolicyFormProps {
  initialData?: Policy | null;
  onSubmit: (data: PolicyFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PolicyForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: PolicyFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PolicyFormData>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      category: initialData?.category || 'payment',
      rule_text: initialData?.rule_text || '',
      severity: initialData?.severity || 'high',
      max_payment_days: initialData?.rule_config?.max_payment_days || 30,
      min_cancellation_notice_days:
        initialData?.rule_config?.min_cancellation_notice_days || 60,
      liability_cap_percent:
        initialData?.rule_config?.liability_cap_percent || 100,
      preferred_jurisdiction:
        initialData?.rule_config?.preferred_jurisdiction || '',
      is_enabled: initialData?.is_enabled ?? true,
    },
  });

  const selectedCategory = watch('category');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Policy Name */}
      <Input
        label="Policy Title"
        placeholder="e.g., Maximum Net-30 Payment Window"
        {...register('name')}
        error={errors.name?.message}
      />

      {/* Category & Severity Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Category
          </label>
          <select
            {...register('category')}
            className="block w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="payment">Payment Terms</option>
            <option value="renewal">Automatic Renewal</option>
            <option value="liability">Liability & Indemnity</option>
            <option value="jurisdiction">Governing Law & Jurisdiction</option>
            <option value="other">General / Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Risk Severity When Violated
          </label>
          <select
            {...register('severity')}
            className="block w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="high">High Risk (Blocker)</option>
            <option value="medium">Medium Warning (Requires Review)</option>
            <option value="low">Low Notice (Informational)</option>
          </select>
        </div>
      </div>

      {/* Natural Language Rule Text */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Rule Description (Plain Language Instructions)
        </label>
        <textarea
          rows={3}
          placeholder="Explain what clause terms the AI reviewer should flag and why..."
          {...register('rule_text')}
          className="block w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.rule_text && (
          <p className="mt-1 text-xs text-red-600 font-medium">
            {errors.rule_text.message}
          </p>
        )}
      </div>

      {/* Structured Parameters based on category */}
      <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-3">
        <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
          Structured Parameters (Optional deterministic checks)
        </h4>

        {selectedCategory === 'payment' && (
          <Input
            label="Maximum Allowed Payment Window (Days)"
            type="number"
            placeholder="30"
            {...register('max_payment_days', { valueAsNumber: true })}
            error={errors.max_payment_days?.message}
            helperText="Clauses specifying payment terms longer than this threshold will be flagged."
          />
        )}

        {selectedCategory === 'renewal' && (
          <Input
            label="Minimum Non-Renewal Notice Required (Days)"
            type="number"
            placeholder="60"
            {...register('min_cancellation_notice_days', { valueAsNumber: true })}
            error={errors.min_cancellation_notice_days?.message}
            helperText="Contracts requiring notice periods longer than this or with no reminder will be flagged."
          />
        )}

        {selectedCategory === 'liability' && (
          <Input
            label="Contractor Maximum Liability Cap (% of contract fees)"
            type="number"
            placeholder="100"
            {...register('liability_cap_percent', { valueAsNumber: true })}
            error={errors.liability_cap_percent?.message}
            helperText="Unlimited liability or caps exceeding this percentage will be flagged."
          />
        )}


        {selectedCategory === 'jurisdiction' && (
          <Input
            label="Preferred Domestic Jurisdiction / Venue"
            placeholder="e.g., New York, USA or London, UK"
            {...register('preferred_jurisdiction')}
            error={errors.preferred_jurisdiction?.message}
            helperText="Agreements mandating foreign or distant arbitral courts will be flagged."
          />
        )}

        {selectedCategory === 'other' && (
          <p className="text-xs text-slate-500">
            For general terms, the rule description above is evaluated contextually by Gemini.
          </p>
        )}
      </div>

      {/* Enable Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_enabled"
          {...register('is_enabled')}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="is_enabled" className="text-xs font-medium text-slate-700">
          Enable this policy immediately for upcoming contract analyses
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
          {initialData ? 'Update Policy' : 'Create Policy'}
        </Button>
      </div>
    </form>
  );
}
