'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { farmService } from '@/lib/services/farmService';
import {
  CROP_GROWTH_STAGES,
  CROP_STATUSES,
  cropFormSchema,
} from '@/lib/validations/farm';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Farm, Field, Crop } from '@/lib/supabase/types';
import {
  Wheat,
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  Layers,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Edit2,
  Trash2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function CropsManagementPage() {
  const { user } = useAuth();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [farmFilter, setFarmFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [deletingCrop, setDeletingCrop] = useState<Crop | null>(null);

  // Form State
  const [formFarmId, setFormFarmId] = useState('');
  const [formFieldId, setFormFieldId] = useState('');
  const [cropName, setCropName] = useState('');
  const [cropVariety, setCropVariety] = useState('');
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [actualHarvestDate, setActualHarvestDate] = useState('');
  const [growthStage, setGrowthStage] = useState<string>(CROP_GROWTH_STAGES[0]);
  const [status, setStatus] = useState<'active' | 'harvested' | 'failed'>('active');
  const [yieldQuantity, setYieldQuantity] = useState('');
  const [yieldUnit, setYieldUnit] = useState('quintals');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allCrops, allFarms, allFields] = await Promise.all([
        farmService.getCrops(undefined, undefined, user?.id),
        farmService.getFarms(user?.id),
        farmService.getFields(undefined, user?.id),
      ]);
      setCrops(allCrops);
      setFarms(allFarms);
      setFields(allFields);

      if (allFarms.length > 0 && !formFarmId) {
        setFormFarmId(allFarms[0].id);
        const related = allFields.filter((f) => f.farm_id === allFarms[0].id);
        if (related.length > 0) {
          setFormFieldId(related[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, formFarmId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // When formFarmId changes, update field dropdown options
  const availableFieldsForSelectedFarm = useMemo(() => {
    return fields.filter((f) => f.farm_id === formFarmId);
  }, [fields, formFarmId]);

  // KPI Calculations
  const stats = useMemo(() => {
    const active = crops.filter((c) => c.status === 'active').length;
    const harvested = crops.filter((c) => c.status === 'harvested').length;
    const floweringOrRipening = crops.filter(
      (c) => c.status === 'active' && ['Flowering', 'Yield Formation', 'Ripening'].includes(c.growth_stage)
    ).length;

    // Total area cultivated by active crops
    const activeCropFieldIds = new Set(crops.filter((c) => c.status === 'active').map((c) => c.field_id));
    const totalArea = fields
      .filter((f) => activeCropFieldIds.has(f.id))
      .reduce((sum, f) => {
        const acres = f.area_unit === 'hectares' ? f.size * 2.47105 : f.size;
        return sum + acres;
      }, 0);

    return {
      active,
      harvested,
      floweringOrRipening,
      totalArea: Number(totalArea.toFixed(1)),
    };
  }, [crops, fields]);

  // Open Edit Modal
  const openEditModal = (crop: Crop) => {
    setEditingCrop(crop);
    setFormFarmId(crop.farm_id);
    setFormFieldId(crop.field_id);
    setCropName(crop.name);
    setCropVariety(crop.variety || '');
    setSowingDate(crop.sowing_date);
    setExpectedHarvestDate(crop.expected_harvest_date || '');
    setActualHarvestDate(crop.actual_harvest_date || '');
    setGrowthStage(crop.growth_stage);
    setStatus(crop.status);
    setYieldQuantity(crop.yield_quantity !== null && crop.yield_quantity !== undefined ? String(crop.yield_quantity) : '');
    setYieldUnit(crop.yield_unit || 'quintals');
    setNotes(crop.notes || '');
    setFormError(null);
  };

  const resetForm = () => {
    if (farms.length > 0) {
      setFormFarmId(farms[0].id);
      const related = fields.filter((f) => f.farm_id === farms[0].id);
      if (related.length > 0) setFormFieldId(related[0].id);
    }
    setCropName('');
    setCropVariety('');
    setSowingDate(new Date().toISOString().split('T')[0]);
    setExpectedHarvestDate('');
    setActualHarvestDate('');
    setGrowthStage(CROP_GROWTH_STAGES[0]);
    setStatus('active');
    setYieldQuantity('');
    setYieldUnit('quintals');
    setNotes('');
    setFormError(null);
    setEditingCrop(null);
  };

  const handleSaveCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const parsedYield = yieldQuantity.trim() ? parseFloat(yieldQuantity) : null;

      const validation = cropFormSchema.safeParse({
        farm_id: formFarmId,
        field_id: formFieldId,
        name: cropName.trim(),
        variety: cropVariety.trim() || null,
        sowing_date: sowingDate,
        expected_harvest_date: expectedHarvestDate || null,
        actual_harvest_date: actualHarvestDate || null,
        growth_stage: growthStage as (typeof CROP_GROWTH_STAGES)[number],
        status: status,
        yield_quantity: parsedYield,
        yield_unit: yieldUnit,
        notes: notes.trim() || null,
      });

      if (!validation.success) {
        setFormError(validation.error.errors[0]?.message || 'Please check crop parameters');
        setIsSubmitting(false);
        return;
      }

      if (editingCrop) {
        await farmService.updateCrop(
          editingCrop.id,
          {
            farm_id: formFarmId,
            field_id: formFieldId,
            name: cropName.trim(),
            variety: cropVariety.trim() || null,
            sowing_date: sowingDate,
            expected_harvest_date: expectedHarvestDate || null,
            actual_harvest_date: actualHarvestDate || null,
            growth_stage: growthStage as (typeof CROP_GROWTH_STAGES)[number],
            status: status,
            yield_quantity: parsedYield,
            yield_unit: yieldUnit,
            notes: notes.trim() || null,
          },
          user?.id
        );
        setToastMessage('Crop details and growth stage updated.');
      } else {
        await farmService.createCrop(
          {
            farm_id: formFarmId,
            field_id: formFieldId,
            name: cropName.trim(),
            variety: cropVariety.trim() || null,
            sowing_date: sowingDate,
            expected_harvest_date: expectedHarvestDate || null,
            actual_harvest_date: actualHarvestDate || null,
            growth_stage: growthStage as (typeof CROP_GROWTH_STAGES)[number],
            status: status,
            yield_quantity: parsedYield,
            yield_unit: yieldUnit,
            notes: notes.trim() || null,
          },
          user?.id || 'demo-farmer-001'
        );
        setToastMessage('New crop cycle registered.');
      }

      setIsAddModalOpen(false);
      resetForm();
      setTimeout(() => setToastMessage(null), 4000);
      await loadData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save crop');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCrop = async () => {
    if (!deletingCrop) return;
    setIsSubmitting(true);
    try {
      await farmService.deleteCrop(deletingCrop.id, user?.id);
      setDeletingCrop(null);
      setToastMessage('Crop record deleted.');
      setTimeout(() => setToastMessage(null), 4000);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter crops
  const filteredCrops = crops.filter((crop) => {
    const matchesSearch =
      crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (crop.variety && crop.variety.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFarm = farmFilter === 'All' || crop.farm_id === farmFilter;
    const matchesStage = stageFilter === 'All' || crop.growth_stage === stageFilter;
    const matchesStatus = statusFilter === 'All' || crop.status === statusFilter;

    return matchesSearch && matchesFarm && matchesStage && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
          Loading crop lifecycles and growth stages...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            Crop Lifecycle & Stage Tracking
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Phenological growth tracking across 7 distinct agronomic stages from sowing to harvest.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 self-start sm:self-auto shadow-md shadow-emerald-700/20"
        >
          <Plus className="w-4 h-4" />
          <span>Plant New Crop</span>
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <Wheat className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Active Crop Cycles</div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
              {stats.active}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-lime-100 dark:bg-lime-950 text-lime-700 dark:text-lime-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Flowering / Ripening</div>
            <div className="text-2xl font-black text-lime-700 dark:text-lime-400 mt-0.5">
              {stats.floweringOrRipening}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Harvest Completed</div>
            <div className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
              {stats.harvested}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Cultivated Area</div>
            <div className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
              {stats.totalArea} <span className="text-xs font-semibold text-gray-500">Acres</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search crops by name (e.g. Tomato, Cotton, Chilli)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-emerald-800/60 bg-gray-50 dark:bg-emerald-950/40 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Farm filter */}
            <select
              value={farmFilter}
              onChange={(e) => setFarmFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-gray-200 dark:border-emerald-800/60 bg-gray-50 dark:bg-emerald-950/40 text-gray-900 dark:text-white"
            >
              <option value="All">All Farms</option>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>

            {/* Growth stage filter */}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-gray-200 dark:border-emerald-800/60 bg-gray-50 dark:bg-emerald-950/40 text-gray-900 dark:text-white"
            >
              <option value="All">All Stages</option>
              {CROP_GROWTH_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-gray-200 dark:border-emerald-800/60 bg-gray-50 dark:bg-emerald-950/40 text-gray-900 dark:text-white"
            >
              <option value="All">All Statuses</option>
              {CROP_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Crop Cards List */}
      {filteredCrops.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#062419] border border-dashed border-emerald-200 dark:border-emerald-800/60 space-y-4">
          <Wheat className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {searchQuery || farmFilter !== 'All' || stageFilter !== 'All'
              ? 'No crops match your filters'
              : 'No Crop Cycles Recorded'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {searchQuery || farmFilter !== 'All' || stageFilter !== 'All'
              ? 'Try resetting your filter parameters or search term.'
              : 'Plant your first crop cycle in any of your registered fields to track growth stages and projected harvest.'}
          </p>
          {!searchQuery && farmFilter === 'All' && (
            <Button
              variant="primary"
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
            >
              + Plant First Crop
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCrops.map((crop) => {
            const parentFarm = farms.find((f) => f.id === crop.farm_id);
            const parentField = fields.find((f) => f.id === crop.field_id);
            const stageIndex = CROP_GROWTH_STAGES.indexOf(
              crop.growth_stage as (typeof CROP_GROWTH_STAGES)[number]
            );
            const progressPercentage = Math.round(((stageIndex + 1) / CROP_GROWTH_STAGES.length) * 100);

            return (
              <div
                key={crop.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm hover:shadow-md transition-all space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
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

                      {parentFarm && (
                        <Link
                          href={`/dashboard/farms/${parentFarm.id}`}
                          className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <MapPin className="w-3 h-3" />
                          {parentFarm.name}
                        </Link>
                      )}

                      {parentField && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          &bull; Field: <strong>{parentField.name}</strong> ({parentField.size} {parentField.area_unit})
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                      {crop.name}{' '}
                      {crop.variety && (
                        <span className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
                          ({crop.variety})
                        </span>
                      )}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(crop)}
                      className="flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Update Stage</span>
                    </Button>
                    <button
                      onClick={() => setDeletingCrop(crop)}
                      className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Crop Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 7-Stage Visual Stepper */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-lime-500" />
                      Growth Stage: <span className="font-extrabold text-sm">{crop.growth_stage}</span>
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {progressPercentage}% Lifecycle Complete
                    </span>
                  </div>

                  {/* Progress track */}
                  <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-emerald-950 overflow-hidden border border-gray-200 dark:border-emerald-800/40">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-500 transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>

                  {/* 7 Stages Labels */}
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
                              ? 'text-gray-800 dark:text-gray-200'
                              : 'opacity-40'
                          }`}
                        >
                          {stg}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Sowing & Harvest Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-3 border-t border-gray-100 dark:border-emerald-800/30">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Sowing Date</span>
                    <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      {crop.sowing_date}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Expected Harvest</span>
                    <span className="font-semibold text-gray-900 dark:text-white block mt-0.5">
                      {crop.expected_harvest_date || 'Pending estimation'}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Harvested Yield</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 block mt-0.5">
                      {crop.yield_quantity !== null && crop.yield_quantity !== undefined
                        ? `${crop.yield_quantity} ${crop.yield_unit}`
                        : 'Awaiting harvest'}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Field Navigation</span>
                    {parentField ? (
                      <Link
                        href={`/dashboard/farms/${crop.farm_id}/fields/${crop.field_id}`}
                        className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span>View Field Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="text-gray-400 mt-0.5 block">-</span>
                    )}
                  </div>
                </div>

                {crop.notes && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-emerald-950/20 p-3 rounded-2xl border border-gray-100 dark:border-emerald-800/20">
                    <strong>Agronomic Notes:</strong> {crop.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT CROP CYCLE
         ========================================================================= */}
      <Modal
        isOpen={isAddModalOpen || !!editingCrop}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCrop(null);
        }}
        title={editingCrop ? `Update Crop: ${editingCrop.name}` : 'Register New Crop Cycle'}
        size="lg"
      >
        <form onSubmit={handleSaveCrop} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Parent Farm *
              </label>
              <select
                required
                value={formFarmId}
                onChange={(e) => {
                  setFormFarmId(e.target.value);
                  const matching = fields.filter((f) => f.farm_id === e.target.value);
                  if (matching.length > 0) setFormFieldId(matching[0].id);
                }}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.district})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Target Field Partition *
              </label>
              <select
                required
                value={formFieldId}
                onChange={(e) => setFormFieldId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {availableFieldsForSelectedFarm.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.size} {f.area_unit})
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
                placeholder="e.g. Tomato, Cotton, Chilli, Maize"
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
                placeholder="e.g. Syngenta Sahu, G4 Teja"
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
                value={sowingDate}
                onChange={(e) => setSowingDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Expected Harvest
              </label>
              <input
                type="date"
                value={expectedHarvestDate}
                onChange={(e) => setExpectedHarvestDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Actual Harvest Date
              </label>
              <input
                type="date"
                value={actualHarvestDate}
                onChange={(e) => setActualHarvestDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Current Growth Stage *
              </label>
              <select
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {CROP_GROWTH_STAGES.map((stg) => (
                  <option key={stg} value={stg}>
                    {stg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'harvested' | 'failed')}
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
                Yield Quantity
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 18.5"
                value={yieldQuantity}
                onChange={(e) => setYieldQuantity(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Yield Unit
              </label>
              <input
                type="text"
                value={yieldUnit}
                onChange={(e) => setYieldUnit(e.target.value)}
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
              placeholder="e.g. 120-day crop cycle; integrated pest management protocol applied."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-emerald-800/40">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingCrop(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingCrop ? 'Save Changes' : 'Plant Crop'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Crop Modal */}
      <Modal
        isOpen={!!deletingCrop}
        onClose={() => setDeletingCrop(null)}
        title="Delete Crop Cycle"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Are you sure you want to delete the record for <strong>{deletingCrop?.name}</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-emerald-800/40">
            <Button variant="outline" onClick={() => setDeletingCrop(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteCrop}
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
