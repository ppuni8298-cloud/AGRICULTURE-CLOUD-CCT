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
  fieldFormSchema,
} from '@/lib/validations/farm';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Farm, Field, Crop } from '@/lib/supabase/types';
import {
  Layers,
  MapPin,
  Plus,
  ArrowLeft,
  ArrowRight,
  Edit2,
  Trash2,
  Wheat,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Droplets,
  Search,
} from 'lucide-react';

export default function FarmFieldsPage() {
  const params = useParams();
  const router = useRouter();
  const farmId = params?.farmId as string;
  const { user } = useAuth();

  const [farm, setFarm] = useState<Farm | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [deletingField, setDeletingField] = useState<Field | null>(null);

  // Form State
  const [fieldName, setFieldName] = useState('');
  const [fieldSize, setFieldSize] = useState('');
  const [fieldAreaUnit, setFieldAreaUnit] = useState<'acres' | 'hectares'>('acres');
  const [fieldSoilType, setFieldSoilType] = useState<string>(SOIL_TYPES[0]);
  const [fieldSoilPh, setFieldSoilPh] = useState('');
  const [fieldIrrigation, setFieldIrrigation] = useState<string>(IRRIGATION_TYPES[0]);
  const [fieldWaterSource, setFieldWaterSource] = useState<string>(WATER_SOURCES[0]);
  const [fieldDesc, setFieldDesc] = useState('');
  const [fieldNotes, setFieldNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!farmId) return;
    setLoading(true);
    try {
      const [currentFarm, farmFields, allCrops] = await Promise.all([
        farmService.getFarmById(farmId, user?.id),
        farmService.getFields(farmId, user?.id),
        farmService.getCrops(undefined, farmId, user?.id),
      ]);
      setFarm(currentFarm);
      setFields(farmFields);
      setCrops(allCrops);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [farmId, user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Edit Field Modal
  const openEditModal = (field: Field) => {
    setEditingField(field);
    setFieldName(field.name);
    setFieldSize(String(field.size));
    setFieldAreaUnit(field.area_unit);
    setFieldSoilType(field.soil_type);
    setFieldSoilPh(field.soil_ph !== null && field.soil_ph !== undefined ? String(field.soil_ph) : '');
    setFieldIrrigation(field.irrigation_method);
    setFieldWaterSource(field.water_source || WATER_SOURCES[0]);
    setFieldDesc(field.description || '');
    setFieldNotes(field.notes || '');
    setFormError(null);
  };

  const resetForm = () => {
    setFieldName('');
    setFieldSize('');
    setFieldAreaUnit('acres');
    setFieldSoilType(SOIL_TYPES[0]);
    setFieldSoilPh('');
    setFieldIrrigation(IRRIGATION_TYPES[0]);
    setFieldWaterSource(WATER_SOURCES[0]);
    setFieldDesc('');
    setFieldNotes('');
    setFormError(null);
    setEditingField(null);
  };

  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
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
        setFormError(validation.error.errors[0]?.message || 'Please check form fields');
        setIsSubmitting(false);
        return;
      }

      if (editingField) {
        await farmService.updateField(
          editingField.id,
          {
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
          user?.id
        );
        setSuccessMsg('Field updated successfully.');
      } else {
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
        setSuccessMsg('New field partition created successfully.');
      }

      setIsAddModalOpen(false);
      resetForm();
      setTimeout(() => setSuccessMsg(null), 4000);
      await loadData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save field');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteField = async () => {
    if (!deletingField) return;
    setIsSubmitting(true);
    try {
      await farmService.deleteField(deletingField.id, user?.id);
      setDeletingField(null);
      setSuccessMsg('Field block deleted.');
      setTimeout(() => setSuccessMsg(null), 4000);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFields = fields.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.soil_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.irrigation_method.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
          Loading field partitions...
        </p>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">Parent farm could not be found.</p>
        <Link href="/dashboard/farms" className="mt-4 inline-block text-emerald-600 font-bold">
          Return to All Farms
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Toast message */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-xs text-emerald-700 underline">
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
            <span className="text-gray-500 dark:text-gray-400">Fields</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            Field Partitions & Agronomic Plots
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Managing {fields.length} individual plots inside <strong>{farm.name}</strong> ({farm.area} {farm.area_unit}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/dashboard/farms/${farm.id}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span>Farm Overview</span>
            </Button>
          </Link>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 shadow-md shadow-emerald-700/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Field</span>
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search fields by name, soil type, or irrigation method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-emerald-800/60 bg-gray-50 dark:bg-emerald-950/40 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Field Cards Grid */}
      {filteredFields.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#062419] border border-dashed border-emerald-200 dark:border-emerald-800/60 space-y-4">
          <Layers className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {searchQuery ? 'No matching fields found' : 'No Fields Registered Yet'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {searchQuery
              ? 'Try adjusting your search terms.'
              : `Create the first field plot for ${farm.name} to track soil profiles, irrigation lines, and crop cycles.`}
          </p>
          {!searchQuery && (
            <Button
              variant="primary"
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
            >
              + Partition Field Block 1
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFields.map((field) => {
            const fieldCrops = crops.filter((c) => c.field_id === field.id);
            const activeCrop = fieldCrops.find((c) => c.status === 'active');

            return (
              <div
                key={field.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        {field.size} {field.area_unit}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                        {field.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(field)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        title="Edit Field"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingField(field)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
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

                  {/* Agronomic Profile Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-gray-100 dark:border-emerald-800/30">
                    <div className="p-2 rounded-xl bg-gray-50 dark:bg-emerald-950/30">
                      <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Soil Type</span>
                      <span className="font-semibold text-gray-900 dark:text-white truncate block">
                        {field.soil_type}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-gray-50 dark:bg-emerald-950/30">
                      <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Soil pH</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {field.soil_ph !== null && field.soil_ph !== undefined
                          ? `${field.soil_ph} (Tested)`
                          : 'Not recorded'}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-gray-50 dark:bg-emerald-950/30">
                      <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Irrigation</span>
                      <span className="font-semibold text-gray-900 dark:text-white truncate block">
                        {field.irrigation_method}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-gray-50 dark:bg-emerald-950/30">
                      <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Water Source</span>
                      <span className="font-semibold text-gray-900 dark:text-white truncate block">
                        {field.water_source || 'Default'}
                      </span>
                    </div>
                  </div>

                  {/* Active Crop Pill */}
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wheat className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium block">
                          Current Crop
                        </span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {activeCrop ? activeCrop.name : 'No active crop'}
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

                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-emerald-800/30 flex items-center justify-between">
                  <Link
                    href={`/dashboard/farms/${farmId}/fields/${field.id}`}
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 inline-flex items-center gap-1 group/btn"
                  >
                    <span>Field Details & History</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform" />
                  </Link>

                  <span className="text-[11px] text-gray-500">
                    {fieldCrops.length} {fieldCrops.length === 1 ? 'Crop cycle' : 'Crop cycles'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT FIELD (All 10 required fields)
         ========================================================================= */}
      <Modal
        isOpen={isAddModalOpen || !!editingField}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingField(null);
        }}
        title={editingField ? `Edit Field: ${editingField.name}` : 'Add Field to Farm'}
        size="lg"
      >
        <form onSubmit={handleSaveField} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {formError}
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
                placeholder="e.g. North Terrace Block A"
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
                placeholder="e.g. 3.5"
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
                placeholder="e.g. 6.5"
                value={fieldSoilPh}
                onChange={(e) => setFieldSoilPh(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                Optional soil test result (no sensor simulated)
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
              placeholder="e.g. Dedicated to vegetable beds with mulch and drip lines."
              value={fieldDesc}
              onChange={(e) => setFieldDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Additional Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Next soil test scheduled for pre-Kharif season."
              value={fieldNotes}
              onChange={(e) => setFieldNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-emerald-800/40">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingField(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingField ? 'Save Changes' : 'Create Field'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Field Modal */}
      <Modal
        isOpen={!!deletingField}
        onClose={() => setDeletingField(null)}
        title="Delete Field Partition"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Are you sure you want to delete <strong>{deletingField?.name}</strong>? Any crop records or activities tied to this field will also be removed.
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-emerald-800/40">
            <Button variant="outline" onClick={() => setDeletingField(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteField}
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

