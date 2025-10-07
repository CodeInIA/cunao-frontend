import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { config } from '../../config';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Edit2, Trash2, Percent, Calendar, Tag as TagIcon, Mail, Search } from 'lucide-react';

axios.defaults.withCredentials = true;

interface DiscountCode {
  _id: string;
  code: string;
  discountPercentage: number;
  expiryDate?: string;
  isActive: boolean;
  appliesTo: 'subtotal' | 'shipping';
  maxUses?: number | null;
  usedCount: number;
  scheduledActivation?: string;
  scheduledEmailSend?: boolean;
  wasScheduled?: boolean;
  emailsSent?: boolean;
  emailsSentTo?: string[];
  usedBy?: Array<{
    email: string;
    name?: string;
    usedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  isValid: boolean;
}

function getCookie(name: string) {
  const v = `; ${document.cookie}`;
  const parts = v.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(';').shift();
}

export default function DiscountManager() {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [sendEmail, setSendEmail] = useState(false);
  const [emailRecipientType, setEmailRecipientType] = useState<'all' | 'custom'>('all');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [subscribers, setSubscribers] = useState<Array<{email: string; hasPromotions: boolean; createdAt: string}>>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState<{ id: string; code: string } | null>(null);
  const [showEmailsSentModal, setShowEmailsSentModal] = useState<string | null>(null);
  const [showUsedByModal, setShowUsedByModal] = useState<string | null>(null);
  const [subscriberSearchTerm, setSubscriberSearchTerm] = useState('');
  const [discountSearchTerm, setDiscountSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'most-used' | 'least-used'>('recent');
  const [filterByStatus, setFilterByStatus] = useState<'all' | 'scheduled' | 'active' | 'inactive' | 'auto-activated' | 'sent' | 'not-sent'>('all');
  const [isScheduled, setIsScheduled] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: 10,
    expiryDate: '',
    isActive: true,
    appliesTo: 'subtotal' as 'subtotal' | 'shipping',
    maxUses: '' as string | number,
    scheduledActivation: '',
    scheduledEmailSend: false
  });

  // Validaciones en tiempo real (solo si hay contenido)
  const isCodeValid = !formData.code.trim() || (
    formData.code.trim().length >= 3 && 
    formData.code.trim().length <= 20 && 
    /^[A-ZÁÉÍÓÚÑ0-9_-]+$/i.test(formData.code.trim())
  );
  
  const isPercentageValid = formData.discountPercentage >= 1 && 
                           formData.discountPercentage <= 100 && 
                           Number.isInteger(formData.discountPercentage);
  
  // El formulario es válido solo si hay código Y es válido
  const isFormValid = formData.code.trim().length >= 3 && isCodeValid && isPercentageValid;

  useEffect(() => {
    fetchDiscountCodes();
  }, []);

  async function fetchDiscountCodes() {
    setLoading(true);
    try {
      const res = await axios.get(`${config.API_URL}/admin/discount-codes`);
      setDiscountCodes(res.data.discountCodes || []);
    } catch (e) {
      console.error(e);
      toast.error('Error cargando cupones');
    } finally {
      setLoading(false);
    }
  }

  async function fetchSubscribers() {
    setLoadingSubscribers(true);
    try {
      const res = await axios.get(`${config.API_URL}/admin/newsletter-subscribers`);
      setSubscribers(res.data.subscribers || []);
    } catch (e) {
      console.error(e);
      toast.error('Error cargando suscriptores');
    } finally {
      setLoadingSubscribers(false);
    }
  }

  function resetForm() {
    setFormData({
      code: '',
      discountPercentage: 10,
      expiryDate: '',
      isActive: true,
      appliesTo: 'subtotal',
      maxUses: '',
      scheduledActivation: '',
      scheduledEmailSend: false
    });
    setEditingCode(null);
    setShowCreate(false);
    setSendEmail(false);
    setIsScheduled(false);
    setEmailRecipientType('all');
    setSelectedEmails([]);
    
    // Scroll al top de la página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleEdit(code: DiscountCode) {
    // Bloquear edición si se enviaron emails
    if (code.emailsSent) {
      toast.error('No se puede editar un cupón que ya fue enviado por email a los suscriptores', {
        duration: 4000,
        icon: '🔒'
      });
      return;
    }

    setEditingCode(code);
    const hasScheduledActivation = code.scheduledActivation && !code.wasScheduled;
    setIsScheduled(!!hasScheduledActivation);
    
    setFormData({
      code: code.code,
      discountPercentage: code.discountPercentage,
      expiryDate: code.expiryDate ? new Date(code.expiryDate).toISOString().split('T')[0] : '',
      isActive: code.isActive,
      appliesTo: code.appliesTo,
      maxUses: code.maxUses ?? '',
      scheduledActivation: code.scheduledActivation ? new Date(code.scheduledActivation).toISOString().slice(0, 16) : '',
      scheduledEmailSend: code.scheduledEmailSend || false
    });
    setShowCreate(true);
    
    // Scroll al top de la página para mostrar el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validación del código
    if (!formData.code.trim()) {
      toast.error('El código es requerido');
      return;
    }

    // Validar formato del código (3-20 caracteres, letras, números, guiones y guiones bajos)
    const codeRegex = /^[A-ZÁÉÍÓÚÑ0-9_-]{3,20}$/i;
    if (!codeRegex.test(formData.code.trim())) {
      toast.error('El código debe tener entre 3 y 20 caracteres y solo puede contener letras (incluida Ñ), números, guiones y guiones bajos');
      return;
    }

    // Validación del porcentaje
    if (!formData.discountPercentage || isNaN(formData.discountPercentage)) {
      toast.error('El porcentaje de descuento es requerido');
      return;
    }

    if (formData.discountPercentage < 1 || formData.discountPercentage > 100) {
      toast.error('El porcentaje debe estar entre 1 y 100');
      return;
    }

    // Validar que sea un número entero
    if (!Number.isInteger(formData.discountPercentage)) {
      toast.error('El porcentaje de descuento debe ser un número entero');
      return;
    }

    // Validación de fecha de expiración
    if (formData.expiryDate) {
      const expiryDateObj = new Date(formData.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      if (isNaN(expiryDateObj.getTime())) {
        toast.error('La fecha de expiración no es válida');
        return;
      }

      if (expiryDateObj <= today) {
        toast.error('La fecha de expiración debe ser futura');
        return;
      }
    }

    // Validación de appliesTo
    if (!formData.appliesTo || !['subtotal', 'shipping'].includes(formData.appliesTo)) {
      toast.error('Debe seleccionar si el descuento aplica al subtotal o al envío');
      return;
    }

    // Validación de maxUses
    if (formData.maxUses !== '' && formData.maxUses !== null) {
      const maxUsesNum = Number(formData.maxUses);
      if (isNaN(maxUsesNum) || !Number.isInteger(maxUsesNum) || maxUsesNum < 1) {
        toast.error('El número máximo de usos debe ser un entero positivo o dejarse vacío para usos ilimitados');
        return;
      }
      
      // Si estamos editando, verificar que maxUses no sea menor que usedCount
      if (editingCode && editingCode.usedCount > 0) {
        if (maxUsesNum < editingCode.usedCount) {
          toast.error(`El número máximo de usos no puede ser menor que los usos actuales (${editingCode.usedCount})`);
          return;
        }
      }
    }

    const csrfToken = getCookie('csrfToken');
    if (!csrfToken) {
      toast.error('Token CSRF no encontrado');
      return;
    }

    // Validación de programación
    if (isScheduled) {
      if (!formData.scheduledActivation) {
        toast.error('La fecha de activación programada es requerida');
        return;
      }
      
      const schedDate = new Date(formData.scheduledActivation);
      const now = new Date();
      
      if (isNaN(schedDate.getTime())) {
        toast.error('La fecha de activación programada no es válida');
        return;
      }
      
      if (schedDate <= now) {
        toast.error('La fecha de activación programada debe ser futura');
        return;
      }
      
      // Validar que la fecha de expiración sea posterior a la de activación
      if (formData.expiryDate) {
        const expiryDateObj = new Date(formData.expiryDate);
        if (expiryDateObj <= schedDate) {
          toast.error('La fecha de expiración debe ser posterior a la fecha de activación');
          return;
        }
      }
    }

    // Validación de emails personalizados si se seleccionó esa opción
    if ((sendEmail || formData.scheduledEmailSend) && emailRecipientType === 'custom') {
      if (selectedEmails.length === 0) {
        toast.error('Debes seleccionar al menos un email');
        return;
      }
    }

    const payload: any = {
      code: formData.code.trim().toUpperCase(),
      discountPercentage: formData.discountPercentage,
      appliesTo: formData.appliesTo
    };

    // Si está programado, configurar los campos de programación
    if (isScheduled) {
      payload.scheduledActivation = formData.scheduledActivation;
      payload.scheduledEmailSend = formData.scheduledEmailSend;
      
      if (formData.scheduledEmailSend && emailRecipientType === 'custom') {
        payload.customEmails = selectedEmails;
      }
      // No enviar isActive si está programado (se fuerza a false en el backend)
    } else {
      // Cupón inmediato
      payload.isActive = formData.isActive;
      payload.sendEmail = sendEmail;
      
      if (sendEmail && emailRecipientType === 'custom') {
        payload.customEmails = selectedEmails;
      }
    }

    if (formData.expiryDate) {
      payload.expiryDate = formData.expiryDate;
    }

    // Añadir maxUses (enviar null si está vacío para usos ilimitados)
    if (formData.maxUses !== '' && formData.maxUses !== null) {
      payload.maxUses = Number(formData.maxUses);
    } else if (editingCode) {
      // Si estamos editando y maxUses está vacío, enviar null explícitamente
      payload.maxUses = null;
    }

    try {
      if (editingCode) {
        await axios.put(
          `${config.API_URL}/admin/discount-codes/${editingCode._id}`,
          payload,
          { headers: { 'X-CSRF-Token': csrfToken } }
        );
        toast.success('Cupón actualizado correctamente');
      } else {
        const response = await axios.post(
          `${config.API_URL}/admin/discount-codes`,
          payload,
          { headers: { 'X-CSRF-Token': csrfToken } }
        );
        
        // Mostrar mensaje según si está programado o no
        if (isScheduled) {
          const schedDate = new Date(formData.scheduledActivation);
          toast.success(
            `🕐 Cupón programado para activarse el ${schedDate.toLocaleString('es-ES')}${formData.scheduledEmailSend ? ' y enviar emails automáticamente' : ''}`,
            { duration: 6000 }
          );
        } else if (sendEmail && response.data?.discountCode?.emailStats) {
          // Mostrar estadísticas de email si se enviaron
          const stats = response.data.discountCode.emailStats;
          toast.success(
            `Cupón creado. Emails: ${stats.sent} enviados, ${stats.failed} fallidos`,
            { duration: 6000 }
          );
        } else {
          toast.success('Cupón creado correctamente');
        }
      }
      
      resetForm();
      fetchDiscountCodes();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error al guardar el cupón');
    }
  }

  async function handleDelete(id: string) {
    const csrfToken = getCookie('csrfToken');
    if (!csrfToken) {
      toast.error('Token CSRF no encontrado');
      return;
    }

    try {
      await axios.delete(
        `${config.API_URL}/admin/discount-codes/${id}`,
        { headers: { 'X-CSRF-Token': csrfToken } }
      );
      toast.success('Cupón eliminado correctamente');
      fetchDiscountCodes();
      setShowDeleteModal(false);
      setCodeToDelete(null);
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar el cupón');
    }
  }

  function confirmDelete(id: string, code: string) {
    setCodeToDelete({ id, code });
    setShowDeleteModal(true);
  }

  function cancelDelete() {
    setShowDeleteModal(false);
    setCodeToDelete(null);
  }

  function formatDate(dateString?: string) {
    if (!dateString) return 'Sin expiración';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // Filter subscribers by search term
  const filteredSubscribers = subscribers.filter(sub => 
    sub.email.toLowerCase().includes(subscriberSearchTerm.toLowerCase())
  );

  // Filter and sort discount codes
  const filteredAndSortedCodes = discountCodes
    .filter(code => {
      // Filtro por búsqueda de texto
      const matchesSearch = code.code.toLowerCase().includes(discountSearchTerm.toLowerCase());
      
      // Filtro por estado
      let matchesStatus = true;
      if (filterByStatus === 'scheduled') {
        matchesStatus = !!(code.scheduledActivation && !code.wasScheduled);
      } else if (filterByStatus === 'active') {
        matchesStatus = code.isActive && code.isValid && !code.scheduledActivation;
      } else if (filterByStatus === 'inactive') {
        matchesStatus = !code.isActive || !code.isValid;
      } else if (filterByStatus === 'auto-activated') {
        matchesStatus = !!code.wasScheduled;
      } else if (filterByStatus === 'sent') {
        matchesStatus = !!code.emailsSent;
      } else if (filterByStatus === 'not-sent') {
        matchesStatus = !code.emailsSent;
      }
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'most-used':
          return b.usedCount - a.usedCount;
        case 'least-used':
          return a.usedCount - b.usedCount;
        default:
          return 0;
      }
    });

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
          <Link 
            to="/admin/dashboard" 
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 flex-shrink-0" 
            title="Volver al dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </Link>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">Gestión de Cupones</h2>
            <p className="text-sm md:text-base text-slate-400 mt-1">Crear, editar y eliminar códigos de descuento</p>
          </div>
        </div>
        
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-yellow-400 text-slate-900 px-4 py-2 rounded-md font-semibold shadow hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 w-full sm:w-auto justify-center flex-shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span className="whitespace-nowrap">Nuevo Cupón</span>
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {showCreate && (
        <div className="mb-6 md:mb-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-4 md:p-6 shadow-lg">
          <h3 className="text-lg md:text-xl font-semibold text-white mb-4">
            {editingCode ? 'Editar Cupón' : 'Crear Nuevo Cupón'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Código *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    // Solo permitir caracteres válidos
                    const sanitized = value.replace(/[^A-ZÁÉÍÓÚÑ0-9_-]/gi, '');
                    setFormData({ ...formData, code: sanitized });
                  }}
                  placeholder="VERANO2024"
                  className={`w-full px-4 py-2 bg-slate-700 text-white rounded-lg border focus:outline-none focus:ring-2 ${
                    formData.code && !isCodeValid 
                      ? 'border-red-500 focus:ring-red-400' 
                      : 'border-slate-600 focus:ring-yellow-400'
                  }`}
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[A-ZÁÉÍÓÚÑ0-9_-]{3,20}"
                  title="El código debe tener entre 3 y 20 caracteres y solo puede contener letras, números, guiones y guiones bajos"
                />
                <p className={`text-xs mt-1 ${
                  formData.code && !isCodeValid ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {formData.code && !isCodeValid 
                    ? '⚠️ Código inválido: debe tener 3-20 caracteres válidos' 
                    : '3-20 caracteres (letras, números, guiones y guiones bajos)'
                  }
                </p>
              </div>

              {/* Discount Percentage */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Descuento (%) *
                </label>
                <input
                  type="number"
                  value={formData.discountPercentage === 0 ? '' : formData.discountPercentage}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Si está vacío, poner 0 internamente pero mostrar vacío
                    if (value === '') {
                      setFormData({ ...formData, discountPercentage: 0 });
                      return;
                    }
                    
                    const numValue = parseInt(value);
                    // Validar que sea un número y esté en el rango
                    if (!isNaN(numValue)) {
                      // Permitir cualquier número para escribir, pero limitar en el rango
                      if (numValue >= 1 && numValue <= 100) {
                        setFormData({ ...formData, discountPercentage: numValue });
                      } else if (numValue > 100) {
                        setFormData({ ...formData, discountPercentage: 100 });
                      } else if (numValue < 1) {
                        setFormData({ ...formData, discountPercentage: numValue });
                      }
                    }
                  }}
                  onKeyPress={(e) => {
                    // Solo permitir números (0-9)
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    // Prevenir pegar texto que no sea numérico
                    const paste = e.clipboardData.getData('text');
                    if (!/^\d+$/.test(paste)) {
                      e.preventDefault();
                    }
                  }}
                  min="1"
                  max="100"
                  step="1"
                  placeholder="10"
                  className={`w-full px-4 py-2 bg-slate-700 text-white rounded-lg border focus:outline-none focus:ring-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    formData.discountPercentage > 0 && !isPercentageValid
                      ? 'border-red-500 focus:ring-red-400'
                      : 'border-slate-600 focus:ring-yellow-400'
                  }`}
                  required
                  title="El porcentaje debe ser un número entero entre 1 y 100"
                />
                <p className={`text-xs mt-1 ${
                  formData.discountPercentage > 0 && !isPercentageValid ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {formData.discountPercentage > 0 && !isPercentageValid
                    ? '⚠️ Debe ser un número entero entre 1 y 100'
                    : 'Número entero entre 1 y 100'
                  }
                </p>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Fecha de expiración
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    if (selectedDate) {
                      const dateObj = new Date(selectedDate);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      
                      if (dateObj <= today) {
                        toast.error('La fecha debe ser futura', { duration: 3000 });
                        return;
                      }
                    }
                    setFormData({ ...formData, expiryDate: selectedDate });
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  title="La fecha de expiración debe ser futura (opcional)"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Dejar vacío para cupón permanente (sin fecha de expiración)
                </p>
              </div>

              {/* Applies To */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Aplicar a *
                </label>
                <select
                  value={formData.appliesTo}
                  onChange={(e) => setFormData({ ...formData, appliesTo: e.target.value as 'subtotal' | 'shipping' })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="subtotal">Subtotal</option>
                  <option value="shipping">Envío</option>
                </select>
              </div>

              {/* Max Uses */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Número máximo de usos
                  {editingCode && editingCode.usedCount > 0 && (
                    <span className="text-xs text-yellow-400 ml-2">
                      (mínimo: {editingCode.usedCount})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min={editingCode ? editingCode.usedCount : 1}
                  step="1"
                  value={formData.maxUses}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Permitir vacío para borrar
                    if (value === '') {
                      setFormData({ ...formData, maxUses: '' });
                      return;
                    }
                    
                    // Solo permitir números (validación básica mientras escribe)
                    const numValue = parseInt(value);
                    if (!isNaN(numValue)) {
                      setFormData({ ...formData, maxUses: numValue });
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value === '') return; // Permitir vacío
                    
                    const numValue = parseInt(value);
                    const minValue = editingCode ? editingCode.usedCount : 1;
                    
                    // Validar al perder el foco
                    if (!isNaN(numValue) && numValue < minValue) {
                      toast.error(`El número mínimo de usos es ${minValue}`, { duration: 3000 });
                      setFormData({ ...formData, maxUses: minValue });
                    }
                  }}
                  onKeyPress={(e) => {
                    // Solo permitir números
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Ilimitado"
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <p className="text-xs text-slate-400 mt-1">
                  {editingCode && editingCode.usedCount > 0 
                    ? `Ya se han usado ${editingCode.usedCount} veces. Deja vacío para usos ilimitados.`
                    : 'Dejar vacío para usos ilimitados'
                  }
                </p>
              </div>
            </div>

            {/* Programación de Activación */}
            {!editingCode?.wasScheduled && (
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30 rounded-lg p-4 space-y-4">
                <label htmlFor="isScheduled" className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      id="isScheduled"
                      checked={isScheduled}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsScheduled(checked);
                        if (checked) {
                          // Si se activa la programación, desactivar el cupón y el envío inmediato
                          setFormData({ ...formData, isActive: false, scheduledEmailSend: false });
                          setSendEmail(false);
                        } else {
                          // Si se desactiva, limpiar campos de programación
                          setFormData({ ...formData, scheduledActivation: '', scheduledEmailSend: false });
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 rounded-full peer-checked:bg-blue-400 transition-colors duration-300"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                        Programar activación automática
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      El cupón se activará automáticamente en la fecha y hora especificada
                    </p>
                  </div>
                </label>

                {isScheduled && (
                  <div className="space-y-4 pl-0">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-slate-300">
                        Fecha y hora de activación *
                      </label>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Selector de Fecha */}
                        <div className="space-y-1.5">
                          <label htmlFor="scheduledDate" className="block text-xs font-medium text-slate-400">
                            📅 Fecha
                          </label>
                          <input
                            type="date"
                            id="scheduledDate"
                            value={formData.scheduledActivation ? formData.scheduledActivation.slice(0, 10) : ''}
                            onChange={(e) => {
                              const date = e.target.value;
                              const time = formData.scheduledActivation ? formData.scheduledActivation.slice(11, 16) : '00:00';
                              setFormData({ ...formData, scheduledActivation: `${date}T${time}` });
                            }}
                            min={new Date().toISOString().slice(0, 10)}
                            required={isScheduled}
                            className="w-full px-4 py-3 bg-gradient-to-br from-slate-700 to-slate-700/80 text-white rounded-xl border-2 border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all [color-scheme:dark] cursor-pointer hover:border-blue-500/50 shadow-lg"
                          />
                        </div>

                        {/* Selector de Hora */}
                        <div className="space-y-1.5">
                          <label htmlFor="scheduledTime" className="block text-xs font-medium text-slate-400">
                            🕐 Hora (24h)
                          </label>
                          <input
                            type="time"
                            id="scheduledTime"
                            value={formData.scheduledActivation ? formData.scheduledActivation.slice(11, 16) : '00:00'}
                            onChange={(e) => {
                              const time = e.target.value;
                              const date = formData.scheduledActivation ? formData.scheduledActivation.slice(0, 10) : new Date().toISOString().slice(0, 10);
                              setFormData({ ...formData, scheduledActivation: `${date}T${time}` });
                            }}
                            step="900"
                            required={isScheduled}
                            className="w-full px-4 py-3 bg-gradient-to-br from-slate-700 to-slate-700/80 text-white rounded-xl border-2 border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all [color-scheme:dark] cursor-pointer hover:border-blue-500/50 shadow-lg text-lg font-semibold text-center"
                          />
                        </div>
                      </div>

                      {/* Preview de fecha y hora seleccionada */}
                      {formData.scheduledActivation && (
                        <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-2 border-blue-500/30 rounded-xl p-3.5 shadow-inner">
                          <div className="flex items-start gap-2.5">
                            <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                              <p className="text-xs text-blue-300/80 font-medium mb-0.5">
                                Activación programada
                              </p>
                              <p className="text-sm text-blue-200 font-semibold">
                                {new Date(formData.scheduledActivation).toLocaleString('es-ES', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        El cupón estará inactivo hasta esta fecha
                      </p>
                    </div>

                    <div>
                      <label htmlFor="scheduledEmailSend" className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative mt-0.5">
                          <input
                            type="checkbox"
                            id="scheduledEmailSend"
                            checked={formData.scheduledEmailSend}
                            onChange={(e) => {
                              setFormData({ ...formData, scheduledEmailSend: e.target.checked });
                              if (!e.target.checked) {
                                setSelectedEmails([]);
                              }
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-600 rounded-full peer-checked:bg-blue-400 transition-colors duration-300"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                              Enviar emails automáticamente al activar
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            Los emails se enviarán cuando el cupón se active automáticamente
                          </p>
                        </div>
                      </label>

                      {formData.scheduledEmailSend && (
                        <div className="mt-4 space-y-3">
                          <div className="space-y-3">
                            {/* Opción: Todos los suscriptores */}
                            <label className="flex items-start sm:items-center gap-2 sm:gap-3 cursor-pointer group p-2 sm:p-3 rounded-lg border-2 transition-all hover:bg-slate-600/20 border-slate-600 hover:border-blue-400/50 has-[:checked]:border-blue-400 has-[:checked]:bg-blue-400/10">
                              <div className="relative flex-shrink-0">
                                <input
                                  type="radio"
                                  name="emailRecipientType"
                                  value="all"
                                  checked={emailRecipientType === 'all'}
                                  onChange={() => {
                                    setEmailRecipientType('all');
                                    setSelectedEmails([]);
                                  }}
                                  className="sr-only peer"
                                />
                                <div className="w-5 h-5 bg-slate-700 border-2 border-slate-600 rounded-full peer-checked:bg-blue-500 peer-checked:border-blue-500 peer-focus:ring-2 peer-focus:ring-blue-400 peer-focus:ring-offset-2 peer-focus:ring-offset-slate-800 transition-all duration-200 flex items-center justify-center cursor-pointer group-hover:border-blue-500/50">
                                  <div className={`w-2.5 h-2.5 bg-white rounded-full transform transition-all duration-200 ${emailRecipientType === 'all' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}></div>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-white transition-colors block">
                                  Todos los suscriptores
                                </span>
                                <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                                  Envío masivo a todos los usuarios que aceptaron promociones
                                </p>
                              </div>
                            </label>

                            {/* Opción: Lista personalizada */}
                            <label className="flex items-start sm:items-center gap-2 sm:gap-3 cursor-pointer group p-2 sm:p-3 rounded-lg border-2 transition-all hover:bg-slate-600/20 border-slate-600 hover:border-blue-400/50 has-[:checked]:border-blue-400 has-[:checked]:bg-blue-400/10">
                              <div className="relative flex-shrink-0">
                                <input
                                  type="radio"
                                  name="emailRecipientType"
                                  value="custom"
                                  checked={emailRecipientType === 'custom'}
                                  onChange={() => {
                                    setEmailRecipientType('custom');
                                    if (subscribers.length === 0) {
                                      fetchSubscribers();
                                    }
                                  }}
                                  className="sr-only peer"
                                />
                                <div className="w-5 h-5 bg-slate-700 border-2 border-slate-600 rounded-full peer-checked:bg-blue-500 peer-checked:border-blue-500 peer-focus:ring-2 peer-focus:ring-blue-400 peer-focus:ring-offset-2 peer-focus:ring-offset-slate-800 transition-all duration-200 flex items-center justify-center cursor-pointer group-hover:border-blue-500/50">
                                  <div className={`w-2.5 h-2.5 bg-white rounded-full transform transition-all duration-200 ${emailRecipientType === 'custom' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}></div>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-white transition-colors block">
                                  Lista personalizada de emails
                                </span>
                                <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                                  Selecciona manualmente los destinatarios
                                </p>
                              </div>
                            </label>
                          </div>

                          {emailRecipientType === 'custom' && (
                            <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-4 border border-slate-600/50 shadow-lg">
                              {loadingSubscribers ? (
                                <div className="flex items-center justify-center py-8">
                                  <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm text-slate-400">Cargando suscriptores...</p>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {/* Buscador */}
                                  <div className="mb-4">
                                    <div className="relative group">
                                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                      <input
                                        type="text"
                                        placeholder="Buscar por email..."
                                        value={subscriberSearchTerm}
                                        onChange={(e) => setSubscriberSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 text-white rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm placeholder-slate-500 transition-all"
                                      />
                                    </div>
                                  </div>

                                  {/* Lista de suscriptores */}
                                  <div className="max-h-56 overflow-y-auto space-y-1 mb-3 pr-1 custom-scrollbar">
                                    {subscribers
                                      .filter(sub => 
                                        sub.email.toLowerCase().includes(subscriberSearchTerm.toLowerCase()) &&
                                        sub.hasPromotions
                                      )
                                      .length === 0 ? (
                                        <div className="text-center py-8">
                                          <Mail className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                          <p className="text-sm text-slate-500">
                                            {subscriberSearchTerm 
                                              ? 'No se encontraron suscriptores' 
                                              : 'No hay suscriptores disponibles'}
                                          </p>
                                        </div>
                                      ) : (
                                        subscribers
                                          .filter(sub => 
                                            sub.email.toLowerCase().includes(subscriberSearchTerm.toLowerCase()) &&
                                            sub.hasPromotions
                                          )
                                          .map(sub => (
                                            <label 
                                              key={sub.email} 
                                              className="flex items-center gap-3 p-2.5 hover:bg-blue-500/10 rounded-lg cursor-pointer transition-all group border border-transparent hover:border-blue-500/20"
                                            >
                                              <div className="relative flex-shrink-0">
                                                <input
                                                  type="checkbox"
                                                  checked={selectedEmails.includes(sub.email)}
                                                  onChange={(e) => {
                                                    if (e.target.checked) {
                                                      setSelectedEmails([...selectedEmails, sub.email]);
                                                    } else {
                                                      setSelectedEmails(selectedEmails.filter(email => email !== sub.email));
                                                    }
                                                  }}
                                                  className="sr-only peer"
                                                />
                                                <div className="w-5 h-5 bg-slate-700 border-2 border-slate-600 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 peer-focus:ring-2 peer-focus:ring-blue-400 peer-focus:ring-offset-2 peer-focus:ring-offset-slate-800 transition-all duration-200 flex items-center justify-center cursor-pointer group-hover:border-blue-500/50">
                                                  <svg 
                                                    className={`w-3 h-3 text-white transform transition-all duration-200 ${
                                                      selectedEmails.includes(sub.email) 
                                                        ? 'scale-100 opacity-100' 
                                                        : 'scale-0 opacity-0'
                                                    }`}
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                  >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                  </svg>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <Mail className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                                                <span className="text-sm text-slate-300 group-hover:text-white transition-colors truncate">
                                                  {sub.email}
                                                </span>
                                              </div>
                                              {selectedEmails.includes(sub.email) && (
                                                <div className="flex-shrink-0 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                                              )}
                                            </label>
                                          ))
                                      )}
                                  </div>

                                  {/* Contador y acciones */}
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-slate-600/50">
                                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                      <div className={`w-2 h-2 rounded-full ${selectedEmails.length > 0 ? 'bg-blue-400' : 'bg-slate-600'} transition-colors`}></div>
                                      <span className={selectedEmails.length > 0 ? 'text-blue-400 font-medium' : ''}>
                                        {selectedEmails.length} email{selectedEmails.length !== 1 ? 's' : ''} seleccionado{selectedEmails.length !== 1 ? 's' : ''}
                                      </span>
                                    </p>
                                    {selectedEmails.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => setSelectedEmails([])}
                                        className="text-xs text-slate-400 hover:text-red-400 transition-colors underline text-left sm:text-right"
                                      >
                                        Limpiar selección
                                      </button>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Active Status - Solo mostrar si NO está programado */}
            {!isScheduled && (
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
              <label htmlFor="isActive" className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => {
                      const isActive = e.target.checked;
                      setFormData({ ...formData, isActive });
                      // Si se desactiva el cupón, también desactivar el envío de email
                      if (!isActive && sendEmail) {
                        setSendEmail(false);
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 rounded-full peer-checked:bg-yellow-400 transition-colors duration-300"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                    Cupón activo
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formData.isActive ? 'Los clientes pueden usar este cupón' : 'El cupón no estará disponible para uso'}
                  </p>
                </div>
              </label>
            </div>
            )}

            {/* Send Email to Subscribers - Solo al crear y si el cupón está activo y NO programado */}
            {!editingCode && formData.isActive && !isScheduled && (
              <div className="bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 border border-yellow-400/30 rounded-lg p-4 space-y-4">
                <label htmlFor="sendEmail" className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      id="sendEmail"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 rounded-full peer-checked:bg-yellow-400 transition-colors duration-300"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                        Enviar cupón por email
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Envía el cupón de descuento a usuarios específicos por correo electrónico.
                    </p>
                  </div>
                </label>

                {/* Email Recipients Selector */}
                {sendEmail && (
                  <div className="space-y-3 pl-0 sm:pl-14">
                    <div className="space-y-3">
                      {/* Opción: Todos los suscriptores */}
                      <label className="flex items-start sm:items-center gap-2 sm:gap-3 cursor-pointer group p-2 sm:p-3 rounded-lg border-2 transition-all hover:bg-slate-600/20 border-slate-600 hover:border-yellow-400/50 has-[:checked]:border-yellow-400 has-[:checked]:bg-yellow-400/10">
                        <div className="relative flex-shrink-0">
                          <input
                            type="radio"
                            name="emailRecipientType"
                            value="all"
                            checked={emailRecipientType === 'all'}
                            onChange={(e) => setEmailRecipientType('all')}
                            className="sr-only peer"
                          />
                          <div className="w-5 h-5 bg-slate-700 border-2 border-slate-600 rounded-full peer-checked:bg-yellow-500 peer-checked:border-yellow-500 peer-focus:ring-2 peer-focus:ring-yellow-400 peer-focus:ring-offset-2 peer-focus:ring-offset-slate-800 transition-all duration-200 flex items-center justify-center cursor-pointer group-hover:border-yellow-500/50">
                            <div className={`w-2.5 h-2.5 bg-slate-900 rounded-full transform transition-all duration-200 ${emailRecipientType === 'all' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}></div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-white transition-colors block">
                            Todos los suscriptores con promociones activadas
                          </span>
                          <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                            Envío masivo a todos los usuarios que aceptaron promociones
                          </p>
                        </div>
                      </label>

                      {/* Opción: Lista personalizada */}
                      <label className="flex items-start sm:items-center gap-2 sm:gap-3 cursor-pointer group p-2 sm:p-3 rounded-lg border-2 transition-all hover:bg-slate-600/20 border-slate-600 hover:border-yellow-400/50 has-[:checked]:border-yellow-400 has-[:checked]:bg-yellow-400/10">
                        <div className="relative flex-shrink-0">
                          <input
                            type="radio"
                            name="emailRecipientType"
                            value="custom"
                            checked={emailRecipientType === 'custom'}
                            onChange={(e) => setEmailRecipientType('custom')}
                            className="sr-only peer"
                          />
                          <div className="w-5 h-5 bg-slate-700 border-2 border-slate-600 rounded-full peer-checked:bg-yellow-500 peer-checked:border-yellow-500 peer-focus:ring-2 peer-focus:ring-yellow-400 peer-focus:ring-offset-2 peer-focus:ring-offset-slate-800 transition-all duration-200 flex items-center justify-center cursor-pointer group-hover:border-yellow-500/50">
                            <div className={`w-2.5 h-2.5 bg-slate-900 rounded-full transform transition-all duration-200 ${emailRecipientType === 'custom' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}></div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-white transition-colors block">
                            Lista personalizada de emails
                          </span>
                          <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                            Selecciona manualmente los destinatarios
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Custom Email List Selector */}
                    {emailRecipientType === 'custom' && (
                      <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-4 border border-slate-600/50 shadow-lg">
                        {loadingSubscribers ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                              <p className="text-sm text-slate-400">Cargando suscriptores...</p>
                            </div>
                          </div>
                        ) : subscribers.length > 0 ? (
                          <>
                            {/* Buscador */}
                            <div className="mb-4">
                              <div className="relative group">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-yellow-400 transition-colors" />
                                <input
                                  type="text"
                                  placeholder="Buscar por email..."
                                  value={subscriberSearchTerm}
                                  onChange={(e) => setSubscriberSearchTerm(e.target.value)}
                                  className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 text-white rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm placeholder-slate-500 transition-all"
                                />
                              </div>
                            </div>

                            {/* Lista de suscriptores */}
                            <div className="max-h-56 overflow-y-auto space-y-1 mb-3 pr-1 custom-scrollbar">
                              {filteredSubscribers.length === 0 ? (
                                <div className="text-center py-8">
                                  <Mail className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                  <p className="text-sm text-slate-500">
                                    {subscriberSearchTerm 
                                      ? 'No se encontraron suscriptores' 
                                      : 'No hay suscriptores disponibles'}
                                  </p>
                                </div>
                              ) : (
                                filteredSubscribers.map(sub => (
                                  <label 
                                    key={sub.email} 
                                    className="flex items-center gap-3 p-2.5 hover:bg-yellow-500/10 rounded-lg cursor-pointer transition-all group border border-transparent hover:border-yellow-500/20"
                                  >
                                    <div className="relative flex-shrink-0">
                                      <input
                                        type="checkbox"
                                        checked={selectedEmails.includes(sub.email)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedEmails([...selectedEmails, sub.email]);
                                          } else {
                                            setSelectedEmails(selectedEmails.filter(email => email !== sub.email));
                                          }
                                        }}
                                        className="sr-only peer"
                                      />
                                      <div className="w-5 h-5 bg-slate-700 border-2 border-slate-600 rounded peer-checked:bg-yellow-500 peer-checked:border-yellow-500 peer-focus:ring-2 peer-focus:ring-yellow-400 peer-focus:ring-offset-2 peer-focus:ring-offset-slate-800 transition-all duration-200 flex items-center justify-center cursor-pointer group-hover:border-yellow-500/50">
                                        <svg 
                                          className={`w-3 h-3 text-slate-900 transform transition-all duration-200 ${
                                            selectedEmails.includes(sub.email) 
                                              ? 'scale-100 opacity-100' 
                                              : 'scale-0 opacity-0'
                                          }`}
                                          fill="none" 
                                          stroke="currentColor" 
                                          viewBox="0 0 24 24"
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <Mail className="w-3.5 h-3.5 text-slate-500 group-hover:text-yellow-400 transition-colors flex-shrink-0" />
                                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors truncate">
                                        {sub.email}
                                      </span>
                                    </div>
                                    {selectedEmails.includes(sub.email) && (
                                      <div className="flex-shrink-0 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
                                    )}
                                  </label>
                                ))
                              )}
                            </div>

                            {/* Contador y acciones */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-slate-600/50">
                              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${selectedEmails.length > 0 ? 'bg-yellow-400' : 'bg-slate-600'} transition-colors`}></div>
                                <span className={selectedEmails.length > 0 ? 'text-yellow-400 font-medium' : ''}>
                                  {selectedEmails.length} email{selectedEmails.length !== 1 ? 's' : ''} seleccionado{selectedEmails.length !== 1 ? 's' : ''}
                                </span>
                              </p>
                              {selectedEmails.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedEmails([])}
                                  className="text-xs text-slate-400 hover:text-red-400 transition-colors underline text-left sm:text-right"
                                >
                                  Limpiar selección
                                </button>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <Mail className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-slate-500 mb-3">No hay suscriptores cargados</p>
                            <button
                              type="button"
                              onClick={() => fetchSubscribers()}
                              className="text-sm text-yellow-400 hover:text-yellow-300 underline"
                            >
                              Cargar suscriptores
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {emailRecipientType === 'all' 
                        ? '📧 Se enviará a todos los usuarios suscritos a la newsletter con promociones activadas.'
                        : selectedEmails.length > 0
                          ? `📧 Se enviará a ${selectedEmails.length} destinatario${selectedEmails.length !== 1 ? 's' : ''} seleccionado${selectedEmails.length !== 1 ? 's' : ''}.`
                          : '📧 Selecciona los destinatarios de la lista.'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={!isFormValid}
                className={`flex-1 px-6 py-2 rounded-md font-semibold shadow focus:outline-none focus:ring-2 transition-all ${
                  isFormValid
                    ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-300 focus:ring-yellow-300 cursor-pointer'
                    : 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-60'
                }`}
                title={!isFormValid ? 'Completa todos los campos requeridos correctamente' : ''}
              >
                {editingCode ? 'Actualizar' : 'Crear'} Cupón
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-slate-700 text-slate-300 px-6 py-2 rounded-md font-semibold shadow hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Cancelar
              </button>
            </div>
            
            {/* Validation Summary - Solo muestra si hay contenido inválido */}
            {!isFormValid && formData.code.trim().length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-sm text-red-400 font-medium">⚠️ Completa los campos requeridos:</p>
                <ul className="text-xs text-red-300 mt-2 ml-4 list-disc space-y-1">
                  {formData.code.trim().length > 0 && !isCodeValid && <li>Código válido (3-20 caracteres, letras, números, guiones)</li>}
                  {!isPercentageValid && <li>Porcentaje válido (número entero entre 1-100)</li>}
                </ul>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Discount Codes List */}
      <div className="space-y-4">
        {!showCreate && discountCodes.length > 0 && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-4 space-y-3">
            <h3 className="text-lg font-semibold text-white">Buscar y Filtrar</h3>
            
            {/* Search Bar and Filters - Row on desktop, column on mobile */}
            <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={discountSearchTerm}
                  onChange={(e) => setDiscountSearchTerm(e.target.value)}
                  placeholder="Buscar cupón por código..."
                  className="w-full pl-12 pr-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {/* Sort Filters */}
              <div className="flex flex-col sm:flex-row gap-3 lg:flex-row lg:items-end">
                {/* Filtro por estado */}
                <label className="flex-1 sm:flex-1 lg:w-auto lg:min-w-[220px]">
                  <span className="text-xs text-slate-400 block mb-1">Filtrar por estado:</span>
                  <select
                    value={filterByStatus}
                    onChange={(e) => setFilterByStatus(e.target.value as typeof filterByStatus)}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                  >
                    <option value="all">📋 Todos</option>
                    <option value="scheduled">📅 Programados</option>
                    <option value="active">✅ Activos</option>
                    <option value="inactive">❌ Inactivos</option>
                    <option value="auto-activated">🤖 Auto-activados</option>
                    <option value="sent">📧 Enviados</option>
                    <option value="not-sent">📭 No enviados</option>
                  </select>
                </label>

                {/* Ordenar por */}
                <label className="flex-1 sm:flex-1 lg:w-auto lg:min-w-[200px]">
                  <span className="text-xs text-slate-400 block mb-1">Ordenar por:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'recent' | 'oldest' | 'most-used' | 'least-used')}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                  >
                    <option value="recent">Más reciente primero</option>
                    <option value="oldest">Más antiguo primero</option>
                    <option value="most-used">Más usado primero</option>
                    <option value="least-used">Menos usado primero</option>
                  </select>
                </label>

                <div className="flex items-center sm:items-end lg:pb-2 gap-3">
                  {filterByStatus !== 'all' && (
                    <button
                      onClick={() => setFilterByStatus('all')}
                      className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs hover:bg-yellow-500/30 transition-colors flex items-center gap-1"
                      title="Limpiar filtro"
                    >
                      <span>×</span>
                      {filterByStatus === 'scheduled' && '📅 Programados'}
                      {filterByStatus === 'active' && '✅ Activos'}
                      {filterByStatus === 'inactive' && '❌ Inactivos'}
                      {filterByStatus === 'auto-activated' && '🤖 Auto-activados'}
                      {filterByStatus === 'sent' && '📧 Enviados'}
                      {filterByStatus === 'not-sent' && '📭 No enviados'}
                    </button>
                  )}
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {filteredAndSortedCodes.length} de {discountCodes.length} cupones
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
            <p className="text-slate-400 mt-4">Cargando cupones...</p>
          </div>
        ) : discountCodes.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700">
            <Percent className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No hay cupones creados aún</p>
            <p className="text-slate-500 text-sm mt-2">Crea tu primer cupón de descuento</p>
          </div>
        ) : filteredAndSortedCodes.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700">
            <p className="text-slate-400 text-lg">No se encontraron cupones con ese criterio</p>
            <button
              onClick={() => {
                setDiscountSearchTerm('');
                setFilterByStatus('all');
              }}
              className="mt-4 text-yellow-400 hover:text-yellow-300 underline text-sm"
            >
              Limpiar búsqueda y filtros
            </button>
          </div>
        ) : (
          filteredAndSortedCodes.map((code) => (
            <div
              key={code._id}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1 min-w-0 w-full">
                  {/* Code and Status */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h3 className="text-xl md:text-2xl font-bold text-yellow-400 font-mono break-all">
                      {code.code}
                    </h3>
                    
                    {/* Estado de programación */}
                    {code.scheduledActivation && !code.wasScheduled ? (
                      <span className="px-2 md:px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 whitespace-nowrap flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Programado
                      </span>
                    ) : code.wasScheduled ? (
                      <span className="px-2 md:px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 whitespace-nowrap">
                        Auto-activado
                      </span>
                    ) : (
                      <span
                        className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          code.isValid
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {code.isValid ? 'Activo' : 'Inactivo/Expirado'}
                      </span>
                    )}
                    
                    {!code.isActive && !code.scheduledActivation && (
                      <span className="px-2 md:px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400 whitespace-nowrap">
                        Desactivado
                      </span>
                    )}

                    {/* Indicador de emails enviados */}
                    {code.emailsSent && (
                      <span className="px-2 md:px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400 whitespace-nowrap flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Enviado
                      </span>
                    )}
                  </div>

                  {/* Información de programación */}
                  {code.scheduledActivation && !code.wasScheduled && (
                    <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>Activación programada</span>
                      </div>
                      <p className="text-sm text-slate-300">
                        Se activará el <span className="font-semibold">{new Date(code.scheduledActivation).toLocaleString('es-ES')}</span>
                      </p>
                      {code.scheduledEmailSend && (
                        <div className="flex items-center gap-2 text-blue-400 text-xs mt-2">
                          <Mail className="w-3 h-3" />
                          <span>Enviará emails automáticamente</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-4">
                    <div className="flex items-center gap-2 text-slate-300 min-w-0">
                      <Percent className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      <span className="text-sm truncate">
                        <span className="font-semibold">{code.discountPercentage}%</span> de descuento
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300 min-w-0">
                      <TagIcon className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      <span className="text-sm truncate">
                        Aplica a: <span className="font-semibold">
                          {code.appliesTo === 'subtotal' ? 'Subtotal' : 'Envío'}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300 min-w-0">
                      <Calendar className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      <span className="text-sm truncate">
                        {formatDate(code.expiryDate)}
                      </span>
                    </div>

                    {/* Usage Stats */}
                    <div className="flex items-center gap-2 text-slate-300 min-w-0">
                      <svg className="w-4 h-4 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="text-sm truncate">
                        Usos: <span className="font-semibold">
                          {code.maxUses !== null && code.maxUses !== undefined 
                            ? `${code.usedCount}/${code.maxUses}` 
                            : `${code.usedCount} (ilimitado)`}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="mt-4 text-xs text-slate-500 break-words">
                    Creado: {new Date(code.createdAt).toLocaleDateString('es-ES')}
                    {code.updatedAt !== code.createdAt && (
                      <> • Actualizado: {new Date(code.updatedAt).toLocaleDateString('es-ES')}</>
                    )}
                  </div>

                  {/* Botones para ver listas */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {code.emailsSentTo && code.emailsSentTo.length > 0 && (
                      <button
                        onClick={() => setShowEmailsSentModal(code._id)}
                        className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Ver emails enviados ({code.emailsSentTo.length})
                      </button>
                    )}
                    {code.usedBy && code.usedBy.length > 0 && (
                      <button
                        onClick={() => setShowUsedByModal(code._id)}
                        className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Ver clientes ({code.usedBy.length})
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleEdit(code)}
                    disabled={code.emailsSent}
                    className={`flex-1 sm:flex-none p-2 rounded-lg transition ${
                      code.emailsSent
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    }`}
                    title={code.emailsSent ? 'No se puede editar: cupón enviado por email' : 'Editar cupón'}
                  >
                    <Edit2 className="w-5 h-5 mx-auto" />
                  </button>
                  <button
                    onClick={() => confirmDelete(code._id, code.code)}
                    className="flex-1 sm:flex-none p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition"
                    title="Eliminar cupón"
                  >
                    <Trash2 className="w-5 h-5 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && codeToDelete && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-200"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <div 
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full mx-auto"
            style={{ animation: 'scaleIn 0.3s ease-out' }}
          >
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-white">Eliminar Cupón</h3>
                  <p className="text-xs md:text-sm text-slate-400 mt-0.5">Esta acción no se puede deshacer</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 md:p-6">
              <p className="text-sm md:text-base text-slate-300 mb-4">
                ¿Estás seguro de que deseas eliminar el cupón de descuento?
              </p>
              <div className="bg-slate-700/50 rounded-lg p-3 md:p-4 border border-slate-600">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="text-xs md:text-sm text-slate-400">Código:</span>
                  <span className="text-base md:text-lg font-bold text-yellow-400 font-mono break-all">{codeToDelete.code}</span>
                </div>
              </div>
              <p className="text-xs text-red-400 mt-4 flex items-start gap-2">
                <span className="text-base md:text-lg flex-shrink-0">⚠️</span>
                <span>Los clientes ya no podrán usar este cupón de descuento.</span>
              </p>
            </div>

            {/* Footer */}
            <div className="p-4 md:p-6 border-t border-slate-700 flex flex-col sm:flex-row gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(codeToDelete.id)}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Emails Enviados */}
      {showEmailsSentModal && (() => {
        const code = discountCodes.find(c => c._id === showEmailsSentModal);
        if (!code) return null;
        
        return (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowEmailsSentModal(null)}
          >
            <div 
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{ animation: 'scaleIn 0.2s ease-out' }}
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                      <Mail className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Emails Enviados</h3>
                      <p className="text-sm text-slate-400 mt-1">Cupón: <span className="text-yellow-400 font-mono">{code.code}</span></p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEmailsSentModal(null)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)] custom-scrollbar">
                <p className="text-sm text-slate-400 mb-4">
                  Total de emails enviados: <span className="text-indigo-400 font-semibold">{code.emailsSentTo?.length || 0}</span>
                </p>
                <div className="space-y-2">
                  {code.emailsSentTo?.map((email, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-indigo-500/30 transition-colors">
                      <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-indigo-400" />
                      </div>
                      <span className="text-sm text-slate-300 flex-1 break-all">{email}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-700">
                <button
                  onClick={() => setShowEmailsSentModal(null)}
                  className="w-full px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-semibold transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal: Clientes que usaron el cupón */}
      {showUsedByModal && (() => {
        const code = discountCodes.find(c => c._id === showUsedByModal);
        if (!code) return null;
        
        return (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowUsedByModal(null)}
          >
            <div 
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{ animation: 'scaleIn 0.2s ease-out' }}
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Clientes que usaron el cupón</h3>
                      <p className="text-sm text-slate-400 mt-1">Cupón: <span className="text-yellow-400 font-mono">{code.code}</span></p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUsedByModal(null)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)] custom-scrollbar">
                <p className="text-sm text-slate-400 mb-4">
                  Total de usos: <span className="text-green-400 font-semibold">{code.usedBy?.length || 0}</span>
                </p>
                <div className="space-y-2">
                  {code.usedBy?.map((usage, index) => (
                    <div key={index} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-green-500/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-400 font-semibold text-sm">{usage.name ? usage.name.charAt(0).toUpperCase() : '?'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          {usage.name && (
                            <p className="text-sm font-semibold text-slate-200 mb-1">{usage.name}</p>
                          )}
                          <p className="text-sm text-slate-400 break-all">{usage.email}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Usado el {new Date(usage.usedAt).toLocaleString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-700">
                <button
                  onClick={() => setShowUsedByModal(null)}
                  className="w-full px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-semibold transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}
