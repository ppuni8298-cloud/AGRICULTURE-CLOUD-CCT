'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { farmService } from '@/lib/services/farmService';
import {
  SOIL_TYPES,
  IRRIGATION_TYPES,
  WATER_SOURCES,
  CROP_GROWTH_STAGES,
  CROP_STATUSES,
  ACTIVITY_TYPES,
  EXPENSE_CATEGORIES,
  fieldFormSchema,
  cropFormSchema,
  activityFormSchema,
  expenseFormSchema,
} from '@/lib/validations/farm';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Farm, Field, Crop, FarmingActivity, FarmingExpense } from '@/lib/supabase/types';
import {
  Layers,
  MapPin,
  Wheat,
  Activity,
  IndianRupee,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Droplets,
  Building,
  Clock,
  History,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export default function FieldDetailPage() {
  const params = useParams();
  const router = useRouter();
  const farmId = params?.farmId as string;
  const fieldId = params?.fieldId as string;
  const { user } = useAuth();

  const [farm, setFarm] = useState<Farm | null>(null);
  const [field, setField] = useState<Field | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [activities, setActivities] = useState<FarmingActivity[]>([]);
  const [expenses, setExpenses] = useState<FarmingExpense[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState(false);
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  // Form state - Edit Field
  const [editName, setEditName] = useState('');
  const [editSize, setEditSize] = useState('');
  const [editAreaUnit, setEditAreaUnit] = useState<'acres' | 'hectares'>('acres');
  const [editSoilType, setEditSoilType] = useState<string>(SOIL_TYPES[0]);
  const [editSoilPh, setEditSoilPh] = useState('');
  const [editIrrigation, setEditIrrigation] = useState<string>(IRRIGATION_TYPES[0]);
  const [editWaterSource, setEditWaterSource] = useState<string>(WATER_SOURCES[0]);
  const [editDesc, setEditDesc] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  // Form state - Add Crop
  const [cropName, setCropName] = useState('');
  const [cropVariety, setCropVariety] = useState('');
  const [cropSowingDate, setCropSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [cropHarvestDate, setCropHarvestDate] = useState('');
  const [cropStage, setCropStage] = useState<string>(CROP_GROWTH_STAGES[0]);
  const [cropStatus, setCropStatus] = useState<'active' | 'harvested' | 'failed'>('active');
  const [cropYield, setCropYield] = useState('');
  const [cropYieldUnit, setCropYieldUnit] = useState('quintals');
  const [cropNotes, setCropNotes] = useState('');
  const [cropError, setCropError] = useState<string | null>(null);

  // Form state - Add Activity
  const [actType, setActType] = useState<string>(ACTIVITY_TYPES[0]);
  const [actDate, setActDate] = useState(new Date().toISOString().split('T')[0]);
  const [actDesc, setActDesc] = useState('');
  const [actOperator, setActOperator] = useState('');
  const [actCost, setActCost] = useState('0');
  const [actError, setActError] = useState<string | null>(null);

  // Form state - Add Expense
  const [expCategory, setExpCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expDesc, setExpDesc] = useState('');
  const [expPayMethod, setExpPayMethod] = useState('Cash');
  const [expError, setExpError] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadFieldData = useCallback(async () => {
    if (!farmId || !fieldId) return;
    setLoading(true);
    try {
      const [currentFarm, currentField, allCrops, allActivities, allExpenses] = await Promise.all([
        farmService.getFarmById(farmId, user?.id),
        farmService.getFieldById(fieldId, user?.id),
        farmService.getCrops(fieldId, farmId, user?.id),
        farmService.getActivities(farmId, fieldId, user?.id),
        farmService.getExpenses(farmId, fieldId, user?.id),
      ]);

      setFarm(currentFarm);
      if (currentField) {
        setField(currentField);
        setEditName(currentField.name);
        setEditSize(String(currentField.size));
        setEditAreaUnit(currentField.area_unit);
        setEditSoilType(currentField.soil_type);
        setEditSoilPh(
          currentField.soil_ph !== null && currentField.soil_ph !== undefined
            ? String(currentField.soil_ph)
            : ''
        );
        setEditIrrigation(currentField.irrigation_method);
        setEditWaterSource(currentField.water_source || WATER_SOURCES[0]);
        setEditDesc(currentField.description || '');
        setEditNotes(currentField.notes || '');
      }
      setCrops(allCrops);
      setActivities(allActivities);
      setExpenses(allExpenses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [farmId, fieldId, user?.id]);

  useEffect(() => {
    loadFieldData();
  }, [loadFieldData]);

  // Derived
  const activeCrop = crops.find((c) => c.status === 'active');
  const cropHistory = crops.filter((c) => c.status !== 'active');
  const totalFieldSpend = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Handlers
  const handleUpdateField = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setIsSubmitting(true);

    try {
      const parsedPh = editSoilPh.trim() ? parseFloat(editSoilPh) : null;
      const parsedSize = parseFloat(editSize);

      const validation = fieldFormSchema.safeParse({
        farm_id: farmId,
        name: editName.trim(),
        size: parsedSize,
        area_unit: editAreaUnit,
        soil_type: editSoilType,
        soil_ph: parsedPh,
        irrigation_method: editIrrigation,
        water_source: editWaterSource,
        description: editDesc.trim() || null,
        notes: editNotes.trim() || null,
      });

      if (!validation.success) {
        setEditError(validation.error.errors[0]?.message || 'Please check field details');
        setIsSubmitting(false);
        return;
      }

      await farmService.updateField(
        fieldId,
        {
          name: editName.trim(),
          size: parsedSize,
          area_unit: editAreaUnit,
          soil_type: editSoilType,
          soil_ph: parsedPh,
          irrigation_method: editIrrigation,
          water_source: editWaterSource,
          description: editDesc.trim() || null,
          notes: editNotes.trim() || null,
        },
        user?.id
      );

      setIsEditModalOpen(false);
      setToastMessage('Field details updated.');
      setTimeout(() => setToastMessage(null), 4000);
      await loadFieldData();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Failed to update field');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteField = async () => {
    setIsSubmitting(true);
    try {
      await farmService.deleteField(fieldId, user?.id);
      router.push(`/dashboard/farms/${farmId}`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setCropError(null);
    setIsSubmitting(true);

    try {
      const parsedYield = cropYield.trim() ? parseFloat(cropYield) : null;

      const validation = cropFormSchema.safeParse({
        farm_id: farmId,
        field_id: fieldId,
        name: cropName.trim(),
        variety: cropVariety.trim() || null,
        sowing_date: cropSowingDate,
        expected_harvest_date: cropHarvestDate || null,
        actual_harvest_date: null,
        growth_stage: cropStage as (typeof CROP_GROWTH_STAGES)[number],
        status: cropStatus,
        yield_quantity: parsedYield,
        yield_unit: cropYieldUnit,
        notes: cropNotes.trim() || null,
      });

      if (!validation.success) {
        setCropError(validation.error.errors[0]?.message || 'Please verify crop details');
        setIsSubmitting(false);
        return;
      }

      await farmService.createCrop(
        {
          farm_id: farmId,
          field_id: fieldId,
          name: cropName.trim(),
          variety: cropVariety.trim() || null,
          sowing_date: cropSowingDate,
          expected_harvest_date: cropHarvestDate || null,
          actual_harvest_date: null,
          growth_stage: cropStage as (typeof CROP_GROWTH_STAGES)[number],
          status: cropStatus,
          yield_quantity: parsedYield,
          yield_unit: cropYieldUnit,
          notes: cropNotes.trim() || null,
        },
        user?.id || 'demo-farmer-001'
      );

      setCropName('');
      setCropVariety('');
      setCropHarvestDate('');
      setCropYield('');
      setCropNotes('');
      setIsAddCropModalOpen(false);
      setToastMessage('New crop cycle planted in this field.');
      setTimeout(() => setToastMessage(null), 4000);
      await loadFieldData();
    } catch (err: unknown) {
      setCropError(err instanceof Error ? err.message : 'Failed to create crop');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setActError(null);
    setIsSubmitting(true);

    try {
      const parsedCost = actCost.trim() ? parseFloat(actCost) : 0;
      const validation = activityFormSchema.safeParse({
        farm_id: farmId,
        field_id: fieldId,
        crop_id: activeCrop?.id || null,
        activity_type: actType as (typeof ACTIVITY_TYPES)[number],
        date: actDate,
        description: actDesc.trim(),
        operator_name: actOperator.trim() || null,
        cost: parsedCost,
        notes: null,
      });

      if (!validation.success) {
        setActError(validation.error.errors[0]?.message || 'Invalid activity parameters');
        setIsSubmitting(false);
        return;
      }

      await farmService.createActivity(
        {
          farm_id: farmId,
          field_id: fieldId,
          crop_id: activeCrop?.id || null,
          activity_type: actType as (typeof ACTIVITY_TYPES)[number],
          date: actDate,
          description: actDesc.trim(),
          operator_name: actOperator.trim() || null,
          cost: parsedCost,
          notes: null,
        },
        user?.id || 'demo-farmer-001'
      );

      setActDesc('');
      setActOperator('');
      setActCost('0');
      setIsAddActivityModalOpen(false);
      setToastMessage('Field activity logged.');
      setTimeout(() => setToastMessage(null), 4000);
      await loadFieldData();
    } catch (err: unknown) {
      setActError(err instanceof Error ? err.message : 'Failed to record operation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpError(null);
    setIsSubmitting(true);

    try {
      const parsedAmt = parseFloat(expAmount);
      const validation = expenseFormSchema.safeParse({
        farm_id: farmId,
        field_id: fieldId,
        crop_id: activeCrop?.id || null,
        category: expCategory as (typeof EXPENSE_CATEGORIES)[number],
        amount: parsedAmt,
        date: expDate,
        description: expDesc.trim(),
        payment_method: expPayMethod,
        receipt_url: null,
      });

      if (!validation.success) {
        setExpError(validation.error.errors[0]?.message || 'Invalid expense format');
        setIsSubmitting(false);
        return;
      }

      await farmService.createExpense(
        {
          farm_id: farmId,
          field_id: fieldId,
          crop_id: activeCrop?.id || null,
          category: expCategory as (typeof EXPENSE_CATEGORIES)[number],
          amount: parsedAmt,
          date: expDate,
          description: expDesc.trim(),
          payment_method: expPayMethod,
          receipt_url: null,
        },
        user?.id || 'demo-farmer-001'
      );

      setExpAmount('');
      setExpDesc('');
      setIsAddExpenseModalOpen(false);
      setToastMessage('Expense logged against this field.');
      setTimeout(() => setToastMessage(null), 4000);
      await loadFieldData();
    } catch (err: unknown) {
      setExpError(err instanceof Error ? err.message : 'Failed to record expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
          Loading field telemetry & crop records...
        </p>
      </div>
    );
  }

  if (!field || !farm) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="p-8 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-xl space-y-4">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Field Not Found</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            The requested field plot does not exist or has been removed.
          </p>
          <div className="pt-2">
            <Link href={`/dashboard/farms/${farmId}`}>
              <Button variant="primary">Return to Farm</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Toast message */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs text-emerald-700 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Breadcrumb Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <Link href="/dashboard/farms" className="hover:underline">
              Farms
            </Link>
            <span>/</span>
            <Link href={`/dashboard/farms/${farm.id}`} className="hover:underline">
              {farm.name}
            </Link>
            <span>/</span>
            <Link href={`/dashboard/farms/${farm.id}/fields`} className="hover:underline">
              Fields
            </Link>
            <span>/</span>
            <span className="text-gray-500 dark:text-gray-400">{field.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <span>{field.name}</span>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold">
              {field.size} {field.area_unit}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Field</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-1.5 text-rose-600 border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Field</span>
          </Button>
        </div>
      </div>

      {/* Field Overview & Agronomic Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-emerald-800/30">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Agronomic Plot Information
            </span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Parent Holding: {farm.name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {farm.village ? `${farm.village}, ` : ''}{farm.district}, {farm.state}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddCropModalOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Wheat className="w-3.5 h-3.5" />
              <span>Plant Crop</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddActivityModalOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Log Activity</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddExpenseModalOpen(true)}
              className="flex items-center gap-1.5"
            >
              <IndianRupee className="w-3.5 h-3.5" />
              <span>Record Expense</span>
            </Button>
          </div>
        </div>

        {/* Agronomic Specifications */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 space-y-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Field Area</span>
            <div className="text-lg font-black text-gray-900 dark:text-white">
              {field.size} <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{field.area_unit}</span>
            </div>
            <span className="text-[11px] text-gray-500">Partitioned plot</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 space-y-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Soil Classification</span>
            <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {field.soil_type}
            </div>
            <span className="text-[11px] text-gray-500">Parent bed</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 space-y-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Soil pH Reaction</span>
            <div className="text-lg font-black text-emerald-700 dark:text-emerald-400">
              {field.soil_ph !== null && field.soil_ph !== undefined ? field.soil_ph : 'Not entered'}
            </div>
            <span className="text-[10px] text-gray-500 block leading-tight">
              {field.soil_ph !== null && field.soil_ph !== undefined
                ? 'Farmer soil test entry'
                : 'Optional user-entered'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 space-y-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Irrigation System</span>
            <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {field.irrigation_method}
            </div>
            <span className="text-[11px] text-gray-500 truncate block">
              Source: {field.water_source || 'Default'}
            </span>
          </div>
        </div>

        {field.description && (
          <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-emerald-950/20 p-3.5 rounded-2xl border border-gray-100 dark:border-emerald-800/20">
            <strong>Description:</strong> {field.description}
          </div>
        )}
      </div>

      {/* Current Active Crop Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Wheat className="w-5 h-5 text-emerald-600" />
          <span>Current Active Crop in this Field</span>
        </h2>

        {!activeCrop ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#062419] border border-dashed border-emerald-200 dark:border-emerald-800/60 space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This field currently has no active crop planted (fallow or between cycles).
            </p>
            <Button variant="primary" size="sm" onClick={() => setIsAddCropModalOpen(true)}>
              + Plant Crop in this Field
            </Button>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Active Lifecycle
                </span>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                  {activeCrop.name}{' '}
                  {activeCrop.variety && (
                    <span className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
                      ({activeCrop.variety})
                    </span>
                  )}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-lime-100 dark:bg-lime-950 text-lime-800 dark:text-lime-300 border border-lime-300 dark:border-lime-800">
                  Stage: {activeCrop.growth_stage}
                </span>
              </div>
            </div>

            {/* Growth Stage Stepper */}
            {(() => {
              const stageIdx = CROP_GROWTH_STAGES.indexOf(
                activeCrop.growth_stage as (typeof CROP_GROWTH_STAGES)[number]
              );
              const progressPct = Math.round(((stageIdx + 1) / CROP_GROWTH_STAGES.length) * 100);

              return (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-lime-500" />
                      Phenological Stage: {activeCrop.growth_stage}
                    </span>
                    <span className="text-gray-500">{progressPct}% Complete</span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-emerald-950 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-7 text-[10px] sm:text-xs text-center text-gray-500 pt-1">
                    {CROP_GROWTH_STAGES.map((stg, i) => (
                      <span
                        key={stg}
                        className={`truncate ${
                          i === stageIdx
                            ? 'font-bold text-emerald-700 dark:text-emerald-400'
                            : i <= stageIdx
                            ? 'text-gray-800 dark:text-gray-200'
                            : 'opacity-40'
                        }`}
                      >
                        {stg}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-gray-100 dark:border-emerald-800/30">
              <div>
                <span className="text-gray-500 block text-[11px]">Sowing Date</span>
                <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  {activeCrop.sowing_date}
                </span>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px]">Expected Harvest</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {activeCrop.expected_harvest_date || 'Pending estimation'}
                </span>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px]">Expected Yield</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {activeCrop.yield_quantity !== null && activeCrop.yield_quantity !== undefined
                    ? `${activeCrop.yield_quantity} ${activeCrop.yield_unit}`
                    : 'To be determined'}
                </span>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px]">Field Expenses</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ₹{totalFieldSpend.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Crop History for this Field */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-600" />
          <span>Crop Rotation & Historical Cycles</span>
        </h2>

        {cropHistory.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-gray-50 dark:bg-emerald-950/20 text-xs text-gray-500">
            No previous crop rotation cycles recorded for this field.
          </div>
        ) : (
          <div className="rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-b border-emerald-100 dark:border-emerald-800/50">
                  <tr>
                    <th className="py-3 px-4 font-bold">Crop & Variety</th>
                    <th className="py-3 px-4 font-bold">Sowing Date</th>
                    <th className="py-3 px-4 font-bold">Harvest Date</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Harvested Yield</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-emerald-800/30">
                  {cropHistory.map((c) => (
                    <tr key={c.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20">
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                        {c.name} {c.variety ? `(${c.variety})` : ''}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{c.sowing_date}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {c.actual_harvest_date || c.expected_harvest_date || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold uppercase bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                        {c.yield_quantity ? `${c.yield_quantity} ${c.yield_unit}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Field Operations & Activities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <span>Field Activity Log</span>
          </h2>
          <Button variant="outline" size="sm" onClick={() => setIsAddActivityModalOpen(true)}>
            + Log Operation
          </Button>
        </div>

        {activities.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-gray-50 dark:bg-emerald-950/20 text-xs text-gray-500">
            No farming operations recorded for this field yet.
          </div>
        ) : (
          <div className="rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-b border-emerald-100 dark:border-emerald-800/50">
                  <tr>
                    <th className="py-3 px-4 font-bold">Date</th>
                    <th className="py-3 px-4 font-bold">Activity</th>
                    <th className="py-3 px-4 font-bold">Description</th>
                    <th className="py-3 px-4 font-bold">Operator</th>
                    <th className="py-3 px-4 font-bold text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-emerald-800/30">
                  {activities.map((a) => (
                    <tr key={a.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {a.date}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {a.activity_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{a.description}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{a.operator_name || 'Self'}</td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">
                        {(a.cost || 0) > 0 ? `₹${(a.cost || 0).toLocaleString('en-IN')}` : '₹0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODALS
         ========================================================================= */}
      {/* Edit Field Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Field Profile"
        size="lg"
      >
        <form onSubmit={handleUpdateField} className="space-y-4">
          {editError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {editError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Field Name *
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Field Size *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={editSize}
                onChange={(e) => setEditSize(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Soil Type
              </label>
              <select
                value={editSoilType}
                onChange={(e) => setEditSoilType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {SOIL_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Soil pH (Optional user-entered)
              </label>
              <input
                type="number"
                step="0.1"
                min="3.0"
                max="10.0"
                value={editSoilPh}
                onChange={(e) => setEditSoilPh(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Irrigation Method
              </label>
              <select
                value={editIrrigation}
                onChange={(e) => setEditIrrigation(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {IRRIGATION_TYPES.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Field Description
            </label>
            <textarea
              rows={2}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-emerald-800/40">
            <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Field Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Field Plot"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold block">Permanent Field Deletion</span>
              <p>
                Deleting <strong>{field.name}</strong> will also permanently remove its active crop
                {activeCrop ? ` (${activeCrop.name})` : ''}, historical records, and mapped operations.
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300">
            Confirm permanent deletion of this field partition?
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-emerald-800/40">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteField}
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Field'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Crop Modal */}
      <Modal
        isOpen={isAddCropModalOpen}
        onClose={() => setIsAddCropModalOpen(false)}
        title={`Plant Crop in ${field.name}`}
        size="lg"
      >
        <form onSubmit={handleAddCrop} className="space-y-4">
          {cropError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {cropError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Crop Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tomato, Cotton, Chilli"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Variety / Hybrid
              </label>
              <input
                type="text"
                placeholder="e.g. Syngenta Sahu"
                value={cropVariety}
                onChange={(e) => setCropVariety(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Sowing Date *
              </label>
              <input
                type="date"
                required
                value={cropSowingDate}
                onChange={(e) => setCropSowingDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Expected Harvest
              </label>
              <input
                type="date"
                value={cropHarvestDate}
                onChange={(e) => setCropHarvestDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Growth Stage *
              </label>
              <select
                value={cropStage}
                onChange={(e) => setCropStage(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {CROP_GROWTH_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-emerald-800/40">
            <Button variant="outline" type="button" onClick={() => setIsAddCropModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Plant Crop'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Activity Modal */}
      <Modal
        isOpen={isAddActivityModalOpen}
        onClose={() => setIsAddActivityModalOpen(false)}
        title="Record Field Activity"
        size="md"
      >
        <form onSubmit={handleAddActivity} className="space-y-4">
          {actError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {actError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Activity Type *
              </label>
              <select
                value={actType}
                onChange={(e) => setActType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {ACTIVITY_TYPES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={actDate}
                onChange={(e) => setActDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Operation Details *
            </label>
            <textarea
              required
              rows={2}
              value={actDesc}
              onChange={(e) => setActDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Labor / Operator
              </label>
              <input
                type="text"
                value={actOperator}
                onChange={(e) => setActOperator(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Cost (₹)
              </label>
              <input
                type="number"
                step="1"
                value={actCost}
                onChange={(e) => setActCost(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-emerald-800/40">
            <Button variant="outline" type="button" onClick={() => setIsAddActivityModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Record Activity'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        title="Record Field Expense"
        size="md"
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          {expError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {expError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                step="1"
                required
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Description *
            </label>
            <input
              type="text"
              required
              value={expDesc}
              onChange={(e) => setExpDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-emerald-800/40">
            <Button variant="outline" type="button" onClick={() => setIsAddExpenseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Record Expense'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

