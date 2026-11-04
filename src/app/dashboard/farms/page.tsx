'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { farmService } from '@/lib/services/farmService';
import {
  SOIL_TYPES,
  IRRIGATION_TYPES,
  FARM_OWNERSHIP,
  farmFormSchema,
  FarmFormData,
} from '@/lib/validations/farm';
import { INDIAN_STATES } from '@/i18n/languages';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Farm, Field, Crop } from '@/lib/supabase/types';
import {
  MapPin,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Layers,
  Wheat,
  IndianRupee,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Droplets,
  Building,
  Image as ImageIcon,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function FarmManagementPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [stats, setStats] = useState({
    totalFarms: 0,
    totalCultivatedArea: 0,
    totalFields: 0,
    activeCrops: 0,
    totalExpenses: 0,
  });
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('All');
  const [ownershipFilter, setOwnershipFilter] = useState('All');
  const [soilFilter, setSoilFilter] = useState('All');

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [deletingFarm, setDeletingFarm] = useState<Farm | null>(null);
  const [addFieldFarm, setAddFieldFarm] = useState<Farm | null>(null);

  // Farm Form State
  const [farmName, setFarmName] = useState('');
  const [farmDesc, setFarmDesc] = useState('');
  const [state, setState] = useState('Karnataka');
  const [district, setDistrict] = useState('Kolar');
  const [taluk, setTaluk] = useState('');
  const [village, setVillage] = useState('');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState<'acres' | 'hectares'>('acres');
  const [soilType, setSoilType] = useState<string>(SOIL_TYPES[0]);
  const [irrigationType, setIrrigationType] = useState<string>(IRRIGATION_TYPES[0]);
  const [ownership, setOwnership] = useState<'owned' | 'leased' | 'shared'>('owned');
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Field Add Modal State
  const [quickFieldName, setQuickFieldName] = useState('');
  const [quickFieldSize, setQuickFieldSize] = useState('');
  const [quickFieldSoil, setQuickFieldSoil] = useState<string>(SOIL_TYPES[0]);
  const [quickFieldIrrigation, setQuickFieldIrrigation] = useState<string>(IRRIGATION_TYPES[0]);

  // Load all farm data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allFarms, allFields, allCrops, kpis] = await Promise.all([
        farmService.getFarms(user?.id),
        farmService.getFields(undefined, user?.id),
        farmService.getCrops(undefined, undefined, user?.id),
        farmService.getDashboardStats(user?.id),
      ]);
      setFarms(allFarms);
      setFields(allFields);
      setCrops(allCrops);
      setStats(kpis);
    } catch (err) {
      console.error('Error loading farms data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered farms list
  const filteredFarms = useMemo(() => {
    return farms.filter((f) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        f.name.toLowerCase().includes(q) ||
        f.district.toLowerCase().includes(q) ||
        f.state.toLowerCase().includes(q) ||
        (f.village && f.village.toLowerCase().includes(q)) ||
        (f.taluk && f.taluk.toLowerCase().includes(q));

      const matchState = stateFilter === 'All' || f.state === stateFilter;
      const matchOwnership = ownershipFilter === 'All' || f.ownership === ownershipFilter;
      const matchSoil = soilFilter === 'All' || f.soil_type === soilFilter;

      return matchSearch && matchState && matchOwnership && matchSoil;
    });
  }, [farms, searchQuery, stateFilter, ownershipFilter, soilFilter]);

  // Open modal for new farm
  const handleOpenCreateModal = () => {
    setEditingFarm(null);
    setFarmName('');
    setFarmDesc('');
    setState(user ? 'Karnataka' : 'Karnataka');
    setDistrict('Kolar');
    setTaluk('');
    setVillage('');
    setPincode('');
    setAddress('');
    setArea('');
    setAreaUnit('acres');
    setSoilType(SOIL_TYPES[0]);
    setIrrigationType(IRRIGATION_TYPES[0]);
    setOwnership('owned');
    setImageUrl('');
    setNotes('');
    setFormError(null);
    setIsRegisterModalOpen(true);
  };

  // Open modal for editing farm
  const handleOpenEditModal = (farm: Farm) => {
    setEditingFarm(farm);
    setFarmName(farm.name);
    setFarmDesc(farm.description || '');
    setState(farm.state);
    setDistrict(farm.district);
    setTaluk(farm.taluk || '');
    setVillage(farm.village || '');
    setPincode(farm.pincode || '');
    setAddress(farm.address || '');
    setArea(farm.area.toString());
    setAreaUnit(farm.area_unit);
    setSoilType(farm.soil_type);
    setIrrigationType(farm.irrigation_type);
    setOwnership(farm.ownership);
    setImageUrl(farm.image_url || '');
    setNotes(farm.notes || '');
    setFormError(null);
    setIsRegisterModalOpen(true);
  };

  // Handle farm registration / update form submission
  const handleSaveFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const parsedData: FarmFormData = farmFormSchema.parse({
        name: farmName,
        description: farmDesc || null,
        state,
        district,
        taluk: taluk || null,
        village: village || null,
        pincode: pincode || null,
        address: address || null,
        area: parseFloat(area),
        area_unit: areaUnit,
        soil_type: soilType,
        irrigation_type: irrigationType,
        ownership,
        image_url: imageUrl || null,
        notes: notes || null,
      });

      if (editingFarm) {
        await farmService.updateFarm(editingFarm.id, parsedData, user?.id);
      } else {
        await farmService.createFarm(parsedData, user?.id || 'demo-farmer-001');
      }

      setIsRegisterModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Validation failed. Please verify the entered farm details.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle farm deletion
  const handleConfirmDelete = async () => {
    if (!deletingFarm) return;
    setIsSubmitting(true);
    try {
      await farmService.deleteFarm(deletingFarm.id, user?.id);
      setDeletingFarm(null);
      await loadData();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Quick Add Field
  const handleQuickAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFieldFarm || !quickFieldName || !quickFieldSize) return;

    try {
      await farmService.createField(
        {
          farm_id: addFieldFarm.id,
          name: quickFieldName,
          size: parseFloat(quickFieldSize) || 1.0,
          area_unit: addFieldFarm.area_unit,
          soil_type: quickFieldSoil,
          soil_ph: 6.8,
          irrigation_method: quickFieldIrrigation,
          water_source: 'Borewell / Tube Well',
          description: `Field under ${addFieldFarm.name}`,
          notes: null,
        },
        user?.id || 'demo-farmer-001'
      );
      setAddFieldFarm(null);
      setQuickFieldName('');
      setQuickFieldSize('');
      await loadData();
    } catch (err) {
      console.error('Quick add field error:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Page Title & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-100 dark:border-emerald-800/60">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight">
              Farm Management System
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80 mt-1">
            Register, monitor, and manage your agricultural holdings, acreage geometry, and soil classifications.
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          className="shadow-md"
        >
          Register New Farm
        </Button>
      </div>

      {/* 5 KPI Stat Cards Calculated from Actual Database Records */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Registered Farms */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-500 dark:text-emerald-400 uppercase tracking-wider">
              Registered Farms
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100">
              {stats.totalFarms}
            </p>
          </div>
        </div>

        {/* Total Cultivated Area */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-500 dark:text-emerald-400 uppercase tracking-wider">
              Cultivated Area
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100">
              {stats.totalCultivatedArea} <span className="text-xs font-semibold text-stone-500 dark:text-emerald-400">Acres</span>
            </p>
          </div>
        </div>

        {/* Total Fields */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-500 dark:text-emerald-400 uppercase tracking-wider">
              Total Fields
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100">
              {stats.totalFields}
            </p>
          </div>
        </div>

        {/* Active Crops */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <Wheat className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-500 dark:text-emerald-400 uppercase tracking-wider">
              Active Crops
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100">
              {stats.activeCrops}
            </p>
          </div>
        </div>

        {/* Total Farming Expenses */}
        <div className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-lime-100 dark:bg-lime-950/60 text-lime-700 dark:text-lime-400 flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-500 dark:text-emerald-400 uppercase tracking-wider">
              Total Expenses
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100">
              ₹{stats.totalExpenses.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by farm name, village, taluk, or district..."
              className="w-full text-xs sm:text-sm bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 pl-10 pr-4 py-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full text-xs sm:text-sm font-medium bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All States (Pan-India)</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={ownershipFilter}
              onChange={(e) => setOwnershipFilter(e.target.value)}
              className="w-full text-xs sm:text-sm font-medium bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Ownership</option>
              <option value="owned">Owned</option>
              <option value="leased">Leased</option>
              <option value="shared">Shared</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={soilFilter}
              onChange={(e) => setSoilFilter(e.target.value)}
              className="w-full text-xs sm:text-sm font-medium bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Soil Types</option>
              {SOIL_TYPES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Farms Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-sm font-medium text-stone-500 dark:text-emerald-300">
          Loading farm holdings...
        </div>
      ) : filteredFarms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarms.map((farm) => {
            // Compute farm-specific stats
            const farmFields = fields.filter((f) => f.farm_id === farm.id);
            const farmCrops = crops.filter((c) => c.farm_id === farm.id && c.status === 'active');

            return (
              <div
                key={farm.id}
                className="rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Farm Card Header Image / Placeholder */}
                  <div className="relative h-44 w-full bg-emerald-950/20 overflow-hidden">
                    {farm.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={farm.image_url}
                        alt={farm.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-emerald-300/40">
                        <Building className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />

                    {/* Ownership badge */}
                    <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 dark:bg-[#0A2920]/90 text-emerald-900 dark:text-emerald-200 backdrop-blur-md shadow">
                      {farm.ownership}
                    </span>

                    {/* Area Badge */}
                    <span className="absolute bottom-3 right-3 text-xs font-black px-3 py-1 rounded-xl bg-emerald-600 text-white shadow-md">
                      {farm.area} {farm.area_unit}
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="p-5">
                    <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-100 leading-snug">
                      {farm.name}
                    </h2>

                    <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-emerald-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">
                        {[farm.village, farm.taluk, farm.district, farm.state]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>

                    {farm.description && (
                      <p className="mt-2 text-xs text-stone-600 dark:text-emerald-200/80 line-clamp-2 leading-relaxed">
                        {farm.description}
                      </p>
                    )}

                    {/* Key Attributes Grid */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-100/70 dark:border-emerald-800/60">
                        <span className="text-[10px] font-bold text-stone-500 dark:text-emerald-400 uppercase block">
                          Fields
                        </span>
                        <span className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100">
                          {farmFields.length} {farmFields.length === 1 ? 'Field' : 'Fields'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-100/70 dark:border-emerald-800/60">
                        <span className="text-[10px] font-bold text-stone-500 dark:text-emerald-400 uppercase block">
                          Active Crops
                        </span>
                        <span className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100 truncate block">
                          {farmCrops.length > 0
                            ? farmCrops.map((c) => c.name).join(', ')
                            : 'None'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1 text-[11px] text-stone-600 dark:text-emerald-300/80">
                      <p>
                        <strong>Soil Type:</strong> {farm.soil_type}
                      </p>
                      <p>
                        <strong>Irrigation:</strong> {farm.irrigation_type}
                      </p>
                      <p className="text-stone-400 dark:text-emerald-500">
                        Registered: {new Date(farm.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-emerald-50/40 dark:bg-[#071F18] border-t border-emerald-100 dark:border-emerald-800/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/dashboard/farms/${farm.id}`}
                      className="p-2 rounded-xl text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                      title="View Farm Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(farm)}
                      className="p-2 rounded-xl text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                      title="Edit Farm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingFarm(farm)}
                      className="p-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                      title="Delete Farm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAddFieldFarm(farm)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/70 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-200 transition-colors"
                    >
                      + Field
                    </button>

                    <Link
                      href={`/dashboard/farms/${farm.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#0A2920] border-2 border-dashed border-emerald-200 dark:border-emerald-800 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
            <Building className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-emerald-950 dark:text-emerald-100">
            No farms match your search
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80 leading-relaxed">
            Try adjusting your search query, or register a new farm holding to start logging plots and crops.
          </p>
          <div className="pt-2">
            <Button onClick={handleOpenCreateModal} variant="primary" icon={<Plus className="w-4 h-4" />}>
              Register New Farm
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. FARM REGISTRATION & EDIT MODAL (All 15 Fields)                         */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title={editingFarm ? 'Edit Farm Holding' : 'Register Agricultural Farm'}
        subtitle="Record your agricultural holding, cadastral survey, area, and soil classification"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 flex items-center gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveFarm} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Farm Name & Ownership */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                Farm Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                placeholder="e.g. Kolar Green Valley Farm"
                className="w-full text-xs sm:text-sm bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                Ownership <span className="text-red-500">*</span>
              </label>
              <select
                value={ownership}
                onChange={(e) => setOwnership(e.target.value as 'owned' | 'leased' | 'shared')}
                className="w-full text-xs sm:text-sm bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {FARM_OWNERSHIP.map((o) => (
                  <option key={o} value={o}>
                    {o.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Farm Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
              Farm Description
            </label>
            <textarea
              rows={2}
              value={farmDesc}
              onChange={(e) => setFarmDesc(e.target.value)}
              placeholder="Brief description of farm elevation, crop patterns, or boundaries..."
              className="w-full text-xs sm:text-sm bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Area & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                Farm Area <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. 5.5"
                className="w-full text-xs sm:text-sm bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                Area Unit <span className="text-red-500">*</span>
              </label>
              <select
                value={areaUnit}
                onChange={(e) => setAreaUnit(e.target.value as 'acres' | 'hectares')}
                className="w-full text-xs sm:text-sm bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="acres">Acres (ac)</option>
                <option value="hectares">Hectares (ha)</option>
              </select>
            </div>
          </div>

          {/* Soil Type & Irrigation Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                Dominant Soil Type <span className="text-red-500">*</span>
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full text-xs sm:text-sm bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {SOIL_TYPES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                Primary Irrigation System <span className="text-red-500">*</span>
              </label>
              <select
                value={irrigationType}
                onChange={(e) => setIrrigationType(e.target.value)}
                className="w-full text-xs sm:text-sm bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {IRRIGATION_TYPES.map((it) => (
                  <option key={it} value={it}>
                    {it}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location Fields: State, District, Taluk, Village, Pincode */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-[#082218] border border-emerald-100 dark:border-emerald-800 space-y-3">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
              Location & Cadastral Details
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-emerald-300 mb-1">
                  State *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-emerald-300 mb-1">
                  District *
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Kolar"
                  className="w-full text-xs bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-emerald-300 mb-1">
                  Taluk / Block
                </label>
                <input
                  type="text"
                  value={taluk}
                  onChange={(e) => setTaluk(e.target.value)}
                  placeholder="Bangarapet"
                  className="w-full text-xs bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-emerald-300 mb-1">
                  Village
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Desihalli"
                  className="w-full text-xs bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-emerald-300 mb-1">
                  PIN Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="563114"
                  className="w-full text-xs bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-emerald-300 mb-1">
                Cadastral Survey / Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Survey No. 142/2B, Near Bethamangala Lake Road"
                className="w-full text-xs bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Image URL & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                Optional Farm Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-xs sm:text-sm bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                Additional Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Borewell yield, solar fencing, etc."
                className="w-full text-xs sm:text-sm bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-emerald-100 dark:border-emerald-800/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 dark:text-emerald-300 hover:bg-stone-100 dark:hover:bg-emerald-900/40"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              {editingFarm ? 'Save Changes' : 'Register Farm'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. DELETE CONFIRMATION DIALOG WITH CASCADING WARNING                      */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(deletingFarm)}
        onClose={() => setDeletingFarm(null)}
        title="Confirm Farm Deletion"
        subtitle={`Permanently remove "${deletingFarm?.name}"`}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-2 leading-relaxed">
              <p className="font-bold">Important Notice on Cascading Deletions:</p>
              <p>
                Deleting this farm will also permanently erase all of its child records:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>All mapped fields and cadastral boundary records in this farm.</li>
                <li>All active and historical crop cycles associated with these fields.</li>
                <li>All recorded farm activities (irrigation, fertilization, spraying logs).</li>
                <li>All financial expense records logged under this holding.</li>
              </ul>
              <p className="font-bold">This operation cannot be undone.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-100 dark:border-emerald-800/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeletingFarm(null)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 dark:text-emerald-300 hover:bg-stone-100 dark:hover:bg-emerald-900/40"
            >
              Keep Farm
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Deleting...' : 'Yes, Delete Everything'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 3. QUICK ADD FIELD MODAL SHORTCUT                                         */}
      {/* ========================================================================= */}
      {addFieldFarm && (
        <Modal
          isOpen={Boolean(addFieldFarm)}
          onClose={() => setAddFieldFarm(null)}
          title={`Add Field to ${addFieldFarm.name}`}
          subtitle={`Parent holding: ${addFieldFarm.name} (${addFieldFarm.area} ${addFieldFarm.area_unit})`}
        >
          <form onSubmit={handleQuickAddField} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                Field Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={quickFieldName}
                onChange={(e) => setQuickFieldName(e.target.value)}
                placeholder="e.g. North Plot A"
                className="w-full text-xs sm:text-sm bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                  Field Size ({addFieldFarm.area_unit}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={quickFieldSize}
                  onChange={(e) => setQuickFieldSize(e.target.value)}
                  placeholder="2.5"
                  className="w-full text-xs sm:text-sm bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                  Soil Type
                </label>
                <select
                  value={quickFieldSoil}
                  onChange={(e) => setQuickFieldSoil(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {SOIL_TYPES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
                Irrigation Method
              </label>
              <select
                value={quickFieldIrrigation}
                onChange={(e) => setQuickFieldIrrigation(e.target.value)}
                className="w-full text-xs sm:text-sm bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {IRRIGATION_TYPES.map((it) => (
                  <option key={it} value={it}>
                    {it}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t border-emerald-100 dark:border-emerald-800/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAddFieldFarm(null)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 dark:text-emerald-300 hover:bg-stone-100 dark:hover:bg-emerald-900/40"
              >
                Cancel
              </button>
              <Button type="submit" variant="primary" size="sm">
                Add Field
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

