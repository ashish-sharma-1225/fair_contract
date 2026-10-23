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
        label="Policy Name"
        placeholder="e.g. Net-30 Maximum Payment Window"
        {...register('name')}
        error={errors.name?.message}
      />

      {/* Category & Severity Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Category
          </label>
          <select
            {...register('category')}
            className="block w-full rounded border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
          >
            <option value="payment">Payment Terms</option>
            <option value="renewal">Automatic Renewal</option>
            <option value="liability">Liability & Indemnity</option>
            <option value="jurisdiction">Governing Law & Jurisdiction</option>
            <option value="other">General / Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Severity
          </label>
          <select
            {...register('severity')}
            className="block w-full rounded border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
          >
            <option value="high">High Risk</option>
            <option value="medium">Medium Warning</option>
            <option value="low">Low Notice</option>
          </select>
        </div>
      </div>

      {/* Rules */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Rules
        </label>
        <textarea
          rows={3}
          placeholder="Specify conditions to flag during review..."
          {...register('rule_text')}
          className="block w-full rounded border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
        />
        {errors.rule_text && (
          <p className="mt-1 text-xs text-red-600 font-medium">
            {errors.rule_text.message}
          </p>
        )}
      </div>

      {/* Structured Parameters based on category */}
      <div className="rounded border border-slate-200 bg-slate-50/60 p-3.5 space-y-3">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
          Parameters
        </span>

        {selectedCategory === 'payment' && (
          <Input
            label="Maximum Payment Days"
            type="number"
            placeholder="30"
            {...register('max_payment_days', { valueAsNumber: true })}
            error={errors.max_payment_days?.message}
          />
        )}

        {selectedCategory === 'renewal' && (
          <Input
            label="Minimum Cancellation Notice (Days)"
            type="number"
            placeholder="60"
            {...register('min_cancellation_notice_days', { valueAsNumber: true })}
            error={errors.min_cancellation_notice_days?.message}
          />
        )}

        {selectedCategory === 'liability' && (
          <Input
            label="Liability Cap (%)"
            type="number"
            placeholder="100"
            {...register('liability_cap_percent', { valueAsNumber: true })}
            error={errors.liability_cap_percent?.message}
          />
        )}

        {selectedCategory === 'jurisdiction' && (
          <Input
            label="Preferred Jurisdiction"
            placeholder="e.g. New York or London"
            {...register('preferred_jurisdiction')}
            error={errors.preferred_jurisdiction?.message}
          />
        )}
      </div>

      {/* Enable Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_enabled"
          {...register('is_enabled')}
          className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-slate-400"
        />
        <label htmlFor="is_enabled" className="text-xs text-slate-700">
          Enable policy for contract analyses
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isLoading}
          className="text-xs"
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" isLoading={isLoading} className="text-xs">
          Save
        </Button>
      </div>
    </form>
  );
}
