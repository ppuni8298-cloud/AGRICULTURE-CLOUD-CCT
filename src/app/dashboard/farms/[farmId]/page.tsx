'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { farmService } from '@/lib/services/farmService';
import {
  SOIL_TYPES,
  IRRIGATION_TYPES,
  WATER_SOURCES,
  FARM_OWNERSHIP,
  CROP_GROWTH_STAGES,
  CROP_STATUSES,
  ACTIVITY_TYPES,
  EXPENSE_CATEGORIES,
  fieldFormSchema,
  cropFormSchema,
  activityFormSchema,
  expenseFormSchema,
} from '@/lib/validations/farm';
import { INDIAN_STATES } from '@/i18n/languages';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Farm, Field, Crop, FarmingActivity, FarmingExpense } from '@/lib/supabase/types';
import {
  MapPin,
  Layers,
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
  ArrowRight,
  TrendingUp,
  FileText,
  Filter,
  Check,
  Tag,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export default function FarmDetailPage() {
  const params = useParams();
  const router = useRouter();
  const farmId = params?.farmId as string;
  const { user } = useAuth();
  const { t } = useLanguage();

  const [farm, setFarm] = useState<Farm | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [activities, setActivities] = useState<FarmingActivity[]>([]);
  const [expenses, setExpenses] = useState<FarmingExpense[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'fields' | 'crops' | 'activities' | 'expenses' | 'performance'>('fields');

  // Modals
  const [isEditFarmModalOpen, setIsEditFarmModalOpen] = useState(false);
  const [isDeleteFarmModalOpen, setIsDeleteFarmModalOpen] = useState(false);
  const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);
  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState(false);
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  // Sub-item Deletion Modals
  const [deletingField, setDeletingField] = useState<Field | null>(null);
  const [deletingCrop, setDeletingCrop] = useState<Crop | null>(null);

  // Form States - Edit Farm
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editState, setEditState] = useState('Karnataka');
  const [editDistrict, setEditDistrict] = useState('Kolar');
  const [editTaluk, setEditTaluk] = useState('');
  const [editVillage, setEditVillage] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editAreaUnit, setEditAreaUnit] = useState<'acres' | 'hectares'>('acres');
  const [editSoilType, setEditSoilType] = useState<string>(SOIL_TYPES[0]);
  const [editIrrigationType, setEditIrrigationType] = useState<string>(IRRIGATION_TYPES[0]);
  const [editOwnership, setEditOwnership] = useState<'owned' | 'leased' | 'shared'>('owned');
  const [editNotes, setEditNotes] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  // Form States - Add Field
  const [fieldName, setFieldName] = useState('');
  const [fieldSize, setFieldSize] = useState('');
  const [fieldAreaUnit, setFieldAreaUnit] = useState<'acres' | 'hectares'>('acres');
  const [fieldSoilType, setFieldSoilType] = useState<string>(SOIL_TYPES[0]);
  const [fieldSoilPh, setFieldSoilPh] = useState('');
  const [fieldIrrigation, setFieldIrrigation] = useState<string>(IRRIGATION_TYPES[0]);
  const [fieldWaterSource, setFieldWaterSource] = useState<string>(WATER_SOURCES[0]);
  const [fieldDesc, setFieldDesc] = useState('');
  const [fieldNotes, setFieldNotes] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  // Form States - Add Crop
  const [cropFieldId, setCropFieldId] = useState('');
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

  // Form States - Add Activity
  const [actFieldId, setActFieldId] = useState('');
  const [actCropId, setActCropId] = useState('');
  const [actType, setActType] = useState<string>(ACTIVITY_TYPES[0]);
  const [actDate, setActDate] = useState(new Date().toISOString().split('T')[0]);
  const [actDesc, setActDesc] = useState('');
  const [actOperator, setActOperator] = useState('');
  const [actCost, setActCost] = useState('0');
  const [actNotes, setActNotes] = useState('');
  const [actError, setActError] = useState<string | null>(null);

  // Form States - Add Expense
  const [expFieldId, setExpFieldId] = useState('');
  const [expCropId, setExpCropId] = useState('');
  const [expCategory, setExpCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expDesc, setExpDesc] = useState('');
  const [expPayMethod, setExpPayMethod] = useState('Cash');
  const [expError, setExpError] = useState<string | null>(null);

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load all farm details
  const loadFarmData = useCallback(async () => {
    if (!farmId) return;
    setLoading(true);
    try {
      const [currentFarm, farmFields, farmCrops, farmActivities, farmExpenses] = await Promise.all([
        farmService.getFarmById(farmId, user?.id),
        farmService.getFields(farmId, user?.id),
        farmService.getCrops(undefined, farmId, user?.id),
        farmService.getActivities(farmId, undefined, user?.id),
        farmService.getExpenses(farmId, undefined, user?.id),
      ]);

      if (currentFarm) {
        setFarm(currentFarm);
        // Pre-fill edit modal states
        setEditName(currentFarm.name);
        setEditDesc(currentFarm.description || '');
        setEditState(currentFarm.state);
        setEditDistrict(currentFarm.district);
        setEditTaluk(currentFarm.taluk || '');
        setEditVillage(currentFarm.village || '');
        setEditPincode(currentFarm.pincode || '');
        setEditAddress(currentFarm.address || '');
        setEditArea(String(currentFarm.area));
        setEditAreaUnit(currentFarm.area_unit);
        setEditSoilType(currentFarm.soil_type);
        setEditIrrigationType(currentFarm.irrigation_type);
        setEditOwnership(currentFarm.ownership);
        setEditNotes(currentFarm.notes || '');
      }
      setFields(farmFields);
      setCrops(farmCrops);
      setActivities(farmActivities);
      setExpenses(farmExpenses);

      // Default select first field for modals
      if (farmFields.length > 0) {
        setCropFieldId(farmFields[0].id);
        setActFieldId(farmFields[0].id);
        setExpFieldId(farmFields[0].id);
      }
    } catch (err) {
      console.error('Failed to load farm details:', err);
    } finally {
      setLoading(false);
    }
  }, [farmId, user?.id]);

  useEffect(() => {
    loadFarmData();
  }, [loadFarmData]);

  // Derived Performance Metrics
  const performanceStats = useMemo(() => {
    const totalExpenses = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    const farmAreaAcres = farm?.area_unit === 'hectares' ? farm.area * 2.47105 : farm?.area || 1;
    const costPerAcre = farmAreaAcres > 0 ? totalExpenses / farmAreaAcres : 0;
    const activeCropsCount = crops.filter((c) => c.status === 'active').length;
    const harvestedCropsCount = crops.filter((c) => c.status === 'harvested').length;

    // Expenses breakdown by category
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
    });

    const sortedCategories = Object.entries(categoryTotals)
      .map(([cat, amount]) => ({
        category: cat,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalExpenses,
      costPerAcre: Math.round(costPerAcre),
      activeCropsCount,
      harvestedCropsCount,
      sortedCategories,
    };
  }, [expenses, crops, farm]);

  // Handlers
  const handleUpdateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setIsSubmitting(true);

    try {
      const updated = await farmService.updateFarm(
        farmId,
        {
          name: editName.trim(),
          description: editDesc.trim() || null,
          state: editState,
          district: editDistrict.trim(),
          taluk: editTaluk.trim() || null,
          village: editVillage.trim() || null,
          pincode: editPincode.trim() || null,
          address: editAddress.trim() || null,
          area: parseFloat(editArea),
          area_unit: editAreaUnit,
          soil_type: editSoilType,
          irrigation_type: editIrrigationType,
          ownership: editOwnership,
          notes: editNotes.trim() || null,
        },
        user?.id
      );

      if (updated) {
        setFarm(updated);
        setIsEditFarmModalOpen(false);
        setActionSuccess('Farm details updated successfully.');
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Failed to update farm details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFarm = async () => {
    setIsSubmitting(true);
    try {
      await farmService.deleteFarm(farmId, user?.id);
      router.push('/dashboard/farms');
    } catch (err) {
      console.error('Failed to delete farm:', err);
      setIsSubmitting(false);
    }
  };

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    setIsSubmitting(true);

    try {
      const parsedPh = fieldSoilPh.trim() ? parseFloat(fieldSoilPh) : null;
      const parsedSize = parseFloat(fieldSize);

      const validation = fieldFormSchema.safeParse({
        farm_id: farmId,
        name: fieldName.trim(),
        size: parsedSize,
        area_unit: fieldAreaUnit,
        soil_type: fieldSoilType,
        soil_ph: parsedPh,
        irrigation_method: fieldIrrigation,
        water_source: fieldWaterSource,
        description: fieldDesc.trim() || null,
        notes: fieldNotes.trim() || null,
      });

      if (!validation.success) {
        setFieldError(validation.error.errors[0]?.message || 'Invalid field data');
        setIsSubmitting(false);
        return;
      }

      await farmService.createField(
        {
          farm_id: farmId,
          name: fieldName.trim(),
          size: parsedSize,
          area_unit: fieldAreaUnit,
          soil_type: fieldSoilType,
          soil_ph: parsedPh,
          irrigation_method: fieldIrrigation,
          water_source: fieldWaterSource,
          description: fieldDesc.trim() || null,
          notes: fieldNotes.trim() || null,
        },
        user?.id || 'demo-farmer-001'
      );

      // Reset
      setFieldName('');
      setFieldSize('');
      setFieldSoilPh('');
      setFieldDesc('');
      setFieldNotes('');
      setIsAddFieldModalOpen(false);
      setActionSuccess('Field added successfully.');
      setTimeout(() => setActionSuccess(null), 4000);
      await loadFarmData();
    } catch (err: unknown) {
      setFieldError(err instanceof Error ? err.message : 'Failed to add field');
    } finally {
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
        field_id: cropFieldId,
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
        setCropError(validation.error.errors[0]?.message || 'Invalid crop details');
        setIsSubmitting(false);
        return;
      }

      await farmService.createCrop(
        {
          farm_id: farmId,
          field_id: cropFieldId,
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
      setActionSuccess('Crop added to field successfully.');
      setTimeout(() => setActionSuccess(null), 4000);
      await loadFarmData();
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
        field_id: actFieldId,
        crop_id: actCropId || null,
        activity_type: actType as (typeof ACTIVITY_TYPES)[number],
        date: actDate,
        description: actDesc.trim(),
        operator_name: actOperator.trim() || null,
        cost: parsedCost,
        notes: actNotes.trim() || null,
      });

      if (!validation.success) {
        setActError(validation.error.errors[0]?.message || 'Invalid activity record');
        setIsSubmitting(false);
        return;
      }

      await farmService.createActivity(
        {
          farm_id: farmId,
          field_id: actFieldId,
          crop_id: actCropId || null,
          activity_type: actType as (typeof ACTIVITY_TYPES)[number],
          date: actDate,
          description: actDesc.trim(),
          operator_name: actOperator.trim() || null,
          cost: parsedCost,
          notes: actNotes.trim() || null,
        },
        user?.id || 'demo-farmer-001'
      );

      setActDesc('');
      setActOperator('');
      setActCost('0');
      setActNotes('');
      setIsAddActivityModalOpen(false);
      setActionSuccess('Farming activity recorded.');
      setTimeout(() => setActionSuccess(null), 4000);
      await loadFarmData();
    } catch (err: unknown) {
      setActError(err instanceof Error ? err.message : 'Failed to record activity');
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
        field_id: expFieldId || null,
        crop_id: expCropId || null,
        category: expCategory as (typeof EXPENSE_CATEGORIES)[number],
        amount: parsedAmt,
        date: expDate,
        description: expDesc.trim(),
        payment_method: expPayMethod,
        receipt_url: null,
      });

      if (!validation.success) {
        setExpError(validation.error.errors[0]?.message || 'Invalid expense record');
        setIsSubmitting(false);
        return;
      }

      await farmService.createExpense(
        {
          farm_id: farmId,
          field_id: expFieldId || null,
          crop_id: expCropId || null,
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
      setActionSuccess('Expense recorded successfully.');
      setTimeout(() => setActionSuccess(null), 4000);
      await loadFarmData();
    } catch (err: unknown) {
      setExpError(err instanceof Error ? err.message : 'Failed to record expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFieldConfirm = async () => {
    if (!deletingField) return;
    setIsSubmitting(true);
    try {
      await farmService.deleteField(deletingField.id, user?.id);
      setDeletingField(null);
      setActionSuccess('Field and associated records removed.');
      setTimeout(() => setActionSuccess(null), 4000);
      await loadFarmData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCropConfirm = async () => {
    if (!deletingCrop) return;
    setIsSubmitting(true);
    try {
      await farmService.deleteCrop(deletingCrop.id, user?.id);
      setDeletingCrop(null);
      setActionSuccess('Crop record deleted.');
      setTimeout(() => setActionSuccess(null), 4000);
      await loadFarmData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
          Loading farm profile and field records...
        </p>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="p-8 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-xl space-y-4">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Farm Not Found</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            The requested farm holding may have been deleted or does not exist under your account.
          </p>
          <div className="pt-4">
            <Link href="/dashboard/farms">
              <Button variant="primary">Return to Farm Directory</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Success notification banner */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-between animate-fadeIn shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/dashboard/farms"
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Farms</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditFarmModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Farm</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteFarmModalOpen(true)}
            className="flex items-center gap-1.5 text-rose-600 border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Farm</span>
          </Button>
        </div>
      </div>

      {/* Farm Header Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-[#063826] text-white p-6 sm:p-8 shadow-xl overflow-hidden border border-emerald-700/50">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-700/60 border border-emerald-500/40 text-emerald-200">
                {farm.ownership} Holding
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-emerald-100">
                <MapPin className="w-3.5 h-3.5 text-lime-400" />
                {farm.district}, {farm.state}
              </span>
              {farm.pincode && (
                <span className="text-xs text-emerald-300 font-mono">PIN: {farm.pincode}</span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{farm.name}</h1>

            {farm.description && (
              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
                {farm.description}
              </p>
            )}

            <div className="flex flex-wrap gap-y-2 gap-x-6 text-xs text-emerald-200 pt-2 border-t border-emerald-700/40">
              {farm.taluk && (
                <span>
                  Taluk: <strong>{farm.taluk}</strong>
                </span>
              )}
              {farm.village && (
                <span>
                  Village: <strong>{farm.village}</strong>
                </span>
              )}
              {farm.address && (
                <span>
                  Address: <strong>{farm.address}</strong>
                </span>
              )}
              <span>
                Soil: <strong>{farm.soil_type}</strong>
              </span>
              <span>
                Irrigation: <strong>{farm.irrigation_type}</strong>
              </span>
            </div>
          </div>

          {/* Quick Stat Pill Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 min-w-[260px]">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-medium">
                <Building className="w-3.5 h-3.5" />
                <span>Total Area</span>
              </div>
              <div className="mt-1 text-xl font-black text-white">
                {farm.area}{' '}
                <span className="text-xs font-medium text-emerald-300">{farm.area_unit}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-medium">
                <Layers className="w-3.5 h-3.5" />
                <span>Fields</span>
              </div>
              <div className="mt-1 text-xl font-black text-white">{fields.length}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-medium">
                <Wheat className="w-3.5 h-3.5" />
                <span>Active Crops</span>
              </div>
              <div className="mt-1 text-xl font-black text-lime-300">
                {performanceStats.activeCropsCount}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-medium">
                <IndianRupee className="w-3.5 h-3.5" />
                <span>Expenses</span>
              </div>
              <div className="mt-1 text-xl font-black text-white">
                ₹{performanceStats.totalExpenses.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-emerald-800/40">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-1" aria-label="Tabs">
          {[
            { id: 'fields', label: `Fields (${fields.length})`, icon: Layers },
            { id: 'crops', label: `Crops (${crops.length})`, icon: Wheat },
            { id: 'activities', label: `Activities (${activities.length})`, icon: Activity },
            { id: 'expenses', label: `Expenses (${expenses.length})`, icon: IndianRupee },
            { id: 'performance', label: 'Farm Performance & Twin', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* =========================================================================
          TAB 1: FIELDS LIST & MANAGEMENT
         ========================================================================= */}
      {activeTab === 'fields' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>Field Partitions in this Farm</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold">
                  {fields.length} Registered
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Each field represents a distinct agronomic plot with its own soil profile, irrigation system, and crop lifecycle.
              </p>
            </div>

            <Button
              variant="primary"
              onClick={() => setIsAddFieldModalOpen(true)}
              className="flex items-center gap-2 self-start sm:self-auto shadow-md shadow-emerald-700/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Field</span>
            </Button>
          </div>

          {fields.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#062419] border border-dashed border-emerald-200 dark:border-emerald-800/60 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 flex items-center justify-center mx-auto text-emerald-600">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                No Fields Added to this Farm Yet
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Organize this {farm.area} {farm.area_unit} holding into distinct fields or blocks to start tracking individual crop growth stages and treatments.
              </p>
              <Button
                variant="primary"
                onClick={() => setIsAddFieldModalOpen(true)}
                className="inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Field Block 1</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fields.map((field) => {
                const fieldCrops = crops.filter((c) => c.field_id === field.id);
                const activeCrop = fieldCrops.find((c) => c.status === 'active');

                return (
                  <div
                    key={field.id}
                    className="p-6 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-md hover:shadow-lg transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                            {field.size} {field.area_unit}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                            {field.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setDeletingField(field)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Field"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {field.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {field.description}
                        </p>
                      )}

                      {/* Agronomic Specs */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-gray-100 dark:border-emerald-800/30">
                        <div className="p-2 rounded-xl bg-gray-50 dark:bg-emerald-950/30">
                          <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Soil Type</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200 truncate block">
                            {field.soil_type}
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-gray-50 dark:bg-emerald-950/30">
                          <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Soil pH</span>
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            {field.soil_ph !== null && field.soil_ph !== undefined
                              ? `${field.soil_ph} (Farmer-tested)`
                              : 'Not recorded'}
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-gray-50 dark:bg-emerald-950/30">
                          <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Irrigation</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200 truncate block">
                            {field.irrigation_method}
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-gray-50 dark:bg-emerald-950/30">
                          <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Water Source</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200 truncate block">
                            {field.water_source || 'Unspecified'}
                          </span>
                        </div>
                      </div>

                      {/* Current Active Crop Badge */}
                      <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wheat className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <div>
                            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium block">
                              Active Crop
                            </span>
                            <span className="text-xs font-bold text-gray-900 dark:text-white">
                              {activeCrop ? activeCrop.name : 'Fallow (No active crop)'}
                            </span>
                          </div>
                        </div>

                        {activeCrop && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-lime-500/20 text-lime-800 dark:text-lime-300 border border-lime-500/40">
                            {activeCrop.growth_stage}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-emerald-800/30 flex items-center justify-between gap-2">
                      <Link
                        href={`/dashboard/farms/${farmId}/fields/${field.id}`}
                        className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 inline-flex items-center gap-1 group/btn"
                      >
                        <span>View Field Information</span>
                        <ArrowRight className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform" />
                      </Link>

                      <button
                        onClick={() => {
                          setCropFieldId(field.id);
                          setIsAddCropModalOpen(true);
                        }}
                        className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                      >
                        + Plant Crop
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: CROPS LIFECYCLE & STAGE PROGRESSION
         ========================================================================= */}
      {activeTab === 'crops' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>Crops Cultivated on this Farm</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-lime-100 dark:bg-lime-900/60 text-lime-900 dark:text-lime-300 font-semibold">
                  {crops.length} Records
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Track sowing milestones, phenological growth stages, and expected harvesting dates across all fields.
              </p>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                if (fields.length === 0) {
                  setIsAddFieldModalOpen(true);
                } else {
                  setIsAddCropModalOpen(true);
                }
              }}
              className="flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Plant New Crop</span>
            </Button>
          </div>

          {crops.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#062419] border border-dashed border-emerald-200 dark:border-emerald-800/60 space-y-4">
              <Wheat className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Crops Logged Yet</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Record your current sowing cycle to track phenological growth stages from germination to harvest.
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  if (fields.length === 0) {
                    setIsAddFieldModalOpen(true);
                  } else {
                    setIsAddCropModalOpen(true);
                  }
                }}
              >
                + Plant First Crop
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {crops.map((crop) => {
                const assignedField = fields.find((f) => f.id === crop.field_id);
                const stageIndex = CROP_GROWTH_STAGES.indexOf(crop.growth_stage as (typeof CROP_GROWTH_STAGES)[number]);
                const progressPercentage = Math.round(((stageIndex + 1) / CROP_GROWTH_STAGES.length) * 100);

                return (
                  <div
                    key={crop.id}
                    className="p-6 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm hover:shadow-md transition-all space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                              crop.status === 'active'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : crop.status === 'harvested'
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            }`}
                          >
                            {crop.status}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Planted in: <strong>{assignedField?.name || 'Assigned Field'}</strong>
                          </span>
                        </div>

                        <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">
                          {crop.name}{' '}
                          {crop.variety && (
                            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                              ({crop.variety})
                            </span>
                          )}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => setDeletingCrop(crop)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete Crop Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Visual Growth Stage Progress Stepper */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-lime-500" />
                          Growth Stage: <span className="font-extrabold text-sm">{crop.growth_stage}</span>
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {progressPercentage}% Complete
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-emerald-950 overflow-hidden border border-gray-200 dark:border-emerald-800/40">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-500 transition-all duration-500"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>

                      {/* Stepper Labels */}
                      <div className="grid grid-cols-7 text-[10px] sm:text-xs text-center text-gray-500 dark:text-gray-400 pt-1 font-medium">
                        {CROP_GROWTH_STAGES.map((stg, idx) => {
                          const isDone = idx <= stageIndex;
                          const isCurrent = idx === stageIndex;
                          return (
                            <span
                              key={stg}
                              className={`truncate px-0.5 ${
                                isCurrent
                                  ? 'font-bold text-emerald-700 dark:text-emerald-400'
                                  : isDone
                                  ? 'text-gray-700 dark:text-gray-300'
                                  : 'opacity-40'
                              }`}
                            >
                              {stg}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dates & Yield metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-gray-100 dark:border-emerald-800/30">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Sowing Date</span>
                        <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          {crop.sowing_date}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Expected Harvest</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {crop.expected_harvest_date || 'Not specified'}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Recorded Yield</span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {crop.yield_quantity !== null && crop.yield_quantity !== undefined
                            ? `${crop.yield_quantity} ${crop.yield_unit}`
                            : 'Pending harvest'}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Field Area</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {assignedField?.size} {assignedField?.area_unit}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: FARMING ACTIVITIES LOG
         ========================================================================= */}
      {activeTab === 'activities' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>Field Operations & Activity Log</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold">
                  {activities.length} Recorded
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Audit trail of agronomic operations: irrigation, weeding, fertilizing, spray schedules, and soil tests.
              </p>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                if (fields.length === 0) {
                  setIsAddFieldModalOpen(true);
                } else {
                  setIsAddActivityModalOpen(true);
                }
              }}
              className="flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Record Activity</span>
            </Button>
          </div>

          {activities.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#062419] border border-dashed border-emerald-200 dark:border-emerald-800/60 space-y-4">
              <Activity className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Activities Recorded</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Maintain a log of irrigation cycles, fertilizer doses, pesticide sprays, and labor records for compliance and yield optimization.
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  if (fields.length === 0) {
                    setIsAddFieldModalOpen(true);
                  } else {
                    setIsAddActivityModalOpen(true);
                  }
                }}
              >
                + Record First Operation
              </Button>
            </div>
          ) : (
            <div className="rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-b border-emerald-100 dark:border-emerald-800/50">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Date</th>
                      <th className="py-3.5 px-4 font-bold">Activity Type</th>
                      <th className="py-3.5 px-4 font-bold">Field Block</th>
                      <th className="py-3.5 px-4 font-bold">Description</th>
                      <th className="py-3.5 px-4 font-bold">Operator / Labor</th>
                      <th className="py-3.5 px-4 font-bold text-right">Cost</th>
                      <th className="py-3.5 px-4 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-emerald-800/30">
                    {activities.map((act) => {
                      const f = fields.find((item) => item.id === act.field_id);
                      return (
                        <tr key={act.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                            {act.date}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              {act.activity_type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {f?.name || 'All Fields'}
                          </td>
                          <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400 max-w-xs">
                            {act.description}
                          </td>
                          <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {act.operator_name || 'Self'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                            {(act.cost || 0) > 0 ? `₹${(act.cost || 0).toLocaleString('en-IN')}` : '₹0'}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={async () => {
                                await farmService.deleteActivity(act.id, user?.id);
                                loadFarmData();
                              }}
                              className="text-gray-400 hover:text-rose-600 p-1 rounded-lg"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: FARMING EXPENSES
         ========================================================================= */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>Farming Expenses & Ledger</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold">
                  Total: ₹{performanceStats.totalExpenses.toLocaleString('en-IN')}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Itemized input expenditure: Seeds, Fertilizers, Pesticides, Machinery, Irrigation, and Labor.
              </p>
            </div>

            <Button
              variant="primary"
              onClick={() => setIsAddExpenseModalOpen(true)}
              className="flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </Button>
          </div>

          {/* Quick Category Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {performanceStats.sortedCategories.slice(0, 4).map((cat) => (
              <div
                key={cat.category}
                className="p-4 rounded-2xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm"
              >
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{cat.category}</div>
                <div className="text-lg font-black text-gray-900 dark:text-white mt-1">
                  ₹{cat.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                  {cat.percentage.toFixed(1)}% of total spend
                </div>
              </div>
            ))}
          </div>

          {expenses.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#062419] border border-dashed border-emerald-200 dark:border-emerald-800/60 space-y-4">
              <IndianRupee className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Expenses Recorded</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Track all input costs to accurately compute your cost per acre and net profit margins at harvest.
              </p>
              <Button variant="primary" onClick={() => setIsAddExpenseModalOpen(true)}>
                + Add First Expense
              </Button>
            </div>
          ) : (
            <div className="rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-b border-emerald-100 dark:border-emerald-800/50">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Date</th>
                      <th className="py-3.5 px-4 font-bold">Category</th>
                      <th className="py-3.5 px-4 font-bold">Description</th>
                      <th className="py-3.5 px-4 font-bold">Payment Method</th>
                      <th className="py-3.5 px-4 font-bold text-right">Amount (₹)</th>
                      <th className="py-3.5 px-4 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-emerald-800/30">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          {exp.date}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400 max-w-sm">
                          {exp.description}
                        </td>
                        <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {exp.payment_method}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-800 dark:text-emerald-300 whitespace-nowrap">
                          ₹{exp.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={async () => {
                              await farmService.deleteExpense(exp.id, user?.id);
                              loadFarmData();
                            }}
                            className="text-gray-400 hover:text-rose-600 p-1 rounded-lg"
                            title="Delete expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 5: PERFORMANCE & ANALYTICS
         ========================================================================= */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Holding Economics & Agronomic Profile</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/50 space-y-1">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  Total Expenditure per Acre
                </span>
                <div className="text-2xl font-black text-gray-900 dark:text-white">
                  ₹{performanceStats.costPerAcre.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-gray-500 dark:text-gray-400"> / acre</span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-400">
                  Derived from {expenses.length} actual expense receipts logged against {farm.area} {farm.area_unit}.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/50 space-y-1">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  Holding Soil Taxonomy
                </span>
                <div className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {farm.soil_type}
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-400">
                  Irrigation System: <strong>{farm.irrigation_type}</strong>
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/50 space-y-1">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  Crop Utilization Ratio
                </span>
                <div className="text-2xl font-black text-lime-700 dark:text-lime-400">
                  {fields.length > 0
                    ? `${Math.round((performanceStats.activeCropsCount / fields.length) * 100)}%`
                    : '0%'}
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-400">
                  {performanceStats.activeCropsCount} active crops planted across {fields.length} partitioned fields.
                </p>
              </div>
            </div>

            {/* Expenses breakdown chart bars */}
            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-emerald-800/30">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Input Expenditure Breakdown by Category
              </h3>
              {performanceStats.sortedCategories.length === 0 ? (
                <p className="text-xs text-gray-500">No expense records available to render breakdown.</p>
              ) : (
                <div className="space-y-2.5">
                  {performanceStats.sortedCategories.map((c) => (
                    <div key={c.category} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-gray-700 dark:text-gray-300">{c.category}</span>
                        <span className="text-emerald-700 dark:text-emerald-400">
                          ₹{c.amount.toLocaleString('en-IN')} ({c.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-emerald-950 overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                          style={{ width: `${c.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Farm notes */}
            {farm.notes && (
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-emerald-950/30 border border-gray-100 dark:border-emerald-800/30 space-y-1">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  Farm Documentation & Borewell Notes
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400">{farm.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: EDIT FARM
         ========================================================================= */}
      <Modal
        isOpen={isEditFarmModalOpen}
        onClose={() => setIsEditFarmModalOpen(false)}
        title="Edit Farm Profile"
        size="lg"
      >
        <form onSubmit={handleUpdateFarm} className="space-y-4">
          {editError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {editError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Farm Name *
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Ownership *
              </label>
              <select
                value={editOwnership}
                onChange={(e) => setEditOwnership(e.target.value as 'owned' | 'leased' | 'shared')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {FARM_OWNERSHIP.map((own) => (
                  <option key={own} value={own}>
                    {own.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Total Area *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={editArea}
                onChange={(e) => setEditArea(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Area Unit
              </label>
              <select
                value={editAreaUnit}
                onChange={(e) => setEditAreaUnit(e.target.value as 'acres' | 'hectares')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                PIN Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={editPincode}
                onChange={(e) => setEditPincode(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Soil Type
              </label>
              <select
                value={editSoilType}
                onChange={(e) => setEditSoilType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {SOIL_TYPES.map((soil) => (
                  <option key={soil} value={soil}>
                    {soil}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Irrigation System
              </label>
              <select
                value={editIrrigationType}
                onChange={(e) => setEditIrrigationType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {IRRIGATION_TYPES.map((irr) => (
                  <option key={irr} value={irr}>
                    {irr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-emerald-800/40">
            <Button variant="outline" type="button" onClick={() => setIsEditFarmModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL 2: ADD FIELD (All 10 required fields)
         ========================================================================= */}
      <Modal
        isOpen={isAddFieldModalOpen}
        onClose={() => setIsAddFieldModalOpen(false)}
        title="Partition New Field Plot"
        size="lg"
      >
        <form onSubmit={handleAddField} className="space-y-4">
          {fieldError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {fieldError}
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
                placeholder="e.g. Block A (North Terrace)"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Parent Farm
              </label>
              <input
                type="text"
                disabled
                value={farm.name}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-emerald-900 bg-gray-100 dark:bg-emerald-950/40 text-gray-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Field Size *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="e.g. 2.5"
                value={fieldSize}
                onChange={(e) => setFieldSize(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Area Unit
              </label>
              <select
                value={fieldAreaUnit}
                onChange={(e) => setFieldAreaUnit(e.target.value as 'acres' | 'hectares')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
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
                placeholder="e.g. 6.8"
                value={fieldSoilPh}
                onChange={(e) => setFieldSoilPh(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                Farmer soil test reading; no sensors simulated.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Soil Type *
              </label>
              <select
                value={fieldSoilType}
                onChange={(e) => setFieldSoilType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {SOIL_TYPES.map((soil) => (
                  <option key={soil} value={soil}>
                    {soil}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Irrigation Method *
              </label>
              <select
                value={fieldIrrigation}
                onChange={(e) => setFieldIrrigation(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {IRRIGATION_TYPES.map((irr) => (
                  <option key={irr} value={irr}>
                    {irr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Water Source
              </label>
              <select
                value={fieldWaterSource}
                onChange={(e) => setFieldWaterSource(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {WATER_SOURCES.map((ws) => (
                  <option key={ws} value={ws}>
                    {ws}
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
              placeholder="e.g. Raised beds with 30-micron silver/black mulch film for tomato cultivation."
              value={fieldDesc}
              onChange={(e) => setFieldDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-emerald-800/40">
            <Button variant="outline" type="button" onClick={() => setIsAddFieldModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Field'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL 3: ADD CROP
         ========================================================================= */}
      <Modal
        isOpen={isAddCropModalOpen}
        onClose={() => setIsAddCropModalOpen(false)}
        title="Plant New Crop Cycle"
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
                Target Field Block *
              </label>
              <select
                required
                value={cropFieldId}
                onChange={(e) => setCropFieldId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.size} {f.area_unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Crop Status *
              </label>
              <select
                value={cropStatus}
                onChange={(e) => setCropStatus(e.target.value as 'active' | 'harvested' | 'failed')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {CROP_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Crop Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tomato, Cotton, Maize, Chilli"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Crop Variety / Hybrid
              </label>
              <input
                type="text"
                placeholder="e.g. Syngenta Sahu, G4 Chilli, Bt-Cotton"
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
                Expected Harvest Date
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
                Current Growth Stage *
              </label>
              <select
                value={cropStage}
                onChange={(e) => setCropStage(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {CROP_GROWTH_STAGES.map((stg) => (
                  <option key={stg} value={stg}>
                    {stg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Yield (Quintals / Tons)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 15.5"
                value={cropYield}
                onChange={(e) => setCropYield(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Yield Unit
              </label>
              <input
                type="text"
                value={cropYieldUnit}
                onChange={(e) => setCropYieldUnit(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Agronomic Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Direct seeded after 2 weeks solarization."
              value={cropNotes}
              onChange={(e) => setCropNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
            />
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

      {/* =========================================================================
          MODAL 4: RECORD ACTIVITY
         ========================================================================= */}
      <Modal
        isOpen={isAddActivityModalOpen}
        onClose={() => setIsAddActivityModalOpen(false)}
        title="Record Farm Operation"
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
                Field Block *
              </label>
              <select
                required
                value={actFieldId}
                onChange={(e) => setActFieldId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Activity Type *
              </label>
              <select
                value={actType}
                onChange={(e) => setActType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {ACTIVITY_TYPES.map((act) => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Execution Date *
              </label>
              <input
                type="date"
                required
                value={actDate}
                onChange={(e) => setActDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Labor / Operator Name
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh + 2 Workers"
                value={actOperator}
                onChange={(e) => setActOperator(e.target.value)}
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
              placeholder="e.g. Foliar spray of micronutrients and humic acid."
              value={actDesc}
              onChange={(e) => setActDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Direct Cost (₹)
            </label>
            <input
              type="number"
              step="1"
              value={actCost}
              onChange={(e) => setActCost(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-emerald-800/40">
            <Button variant="outline" type="button" onClick={() => setIsAddActivityModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Recording...' : 'Record Activity'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL 5: RECORD EXPENSE
         ========================================================================= */}
      <Modal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        title="Record Farming Expense"
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
                placeholder="e.g. 4500"
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Payment Method
              </label>
              <select
                value={expPayMethod}
                onChange={(e) => setExpPayMethod(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / GooglePay / PhonePe</option>
                <option value="Card">Bank Debit/Credit Card</option>
                <option value="NetBanking">Net Banking</option>
                <option value="KCC">Kisan Credit Card (KCC)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Description / Vendor *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 50kg Urea & 50kg DAP from IFFCO dealer"
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
              {isSubmitting ? 'Recording...' : 'Save Expense'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL 6: DELETE FARM CONFIRMATION (Cascading Warning)
         ========================================================================= */}
      <Modal
        isOpen={isDeleteFarmModalOpen}
        onClose={() => setIsDeleteFarmModalOpen(false)}
        title="Confirm Farm Deletion"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold block">Permanent Cascading Deletion Notice</span>
              <p>
                Deleting <strong>{farm.name}</strong> will also permanently delete all{' '}
                <strong>{fields.length} associated fields</strong>,{' '}
                <strong>{crops.length} crop records</strong>,{' '}
                <strong>{activities.length} operations</strong>, and{' '}
                <strong>{expenses.length} financial receipts</strong>.
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300">
            Are you sure you wish to delete this agricultural holding? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-emerald-800/40">
            <Button variant="outline" onClick={() => setIsDeleteFarmModalOpen(false)}>
              Keep Farm
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteFarm}
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isSubmitting ? 'Deleting...' : 'Yes, Delete Farm & All Data'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Field Deletion Modal */}
      <Modal
        isOpen={!!deletingField}
        onClose={() => setDeletingField(null)}
        title="Delete Field Block"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Delete <strong>{deletingField?.name}</strong>? Any crops, activities, and expenses mapped specifically to this field will also be removed.
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-emerald-800/40">
            <Button variant="outline" onClick={() => setDeletingField(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteFieldConfirm}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Crop Deletion Modal */}
      <Modal
        isOpen={!!deletingCrop}
        onClose={() => setDeletingCrop(null)}
        title="Delete Crop Cycle Record"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Are you sure you want to remove <strong>{deletingCrop?.name}</strong> from field records?
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-emerald-800/40">
            <Button variant="outline" onClick={() => setDeletingCrop(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteCropConfirm}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

