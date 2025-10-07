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
  const [subscriberSearchTerm, setSubscriberSearchTerm] = useState('');
  const [discountSearchTerm, setDiscountSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'most-used' | 'least-used'>('recent');
  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: 10,
    expiryDate: '',
    isActive: true,
    appliesTo: 'subtotal' as 'subtotal' | 'shipping',
    maxUses: '' as string | number
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
      maxUses: ''
    });
    setEditingCode(null);
    setShowCreate(false);
    setSendEmail(false);
    setEmailRecipientType('all');
    setSelectedEmails([]);
    
    // Scroll al top de la página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleEdit(code: DiscountCode) {
    setEditingCode(code);
    setFormData({
      code: code.code,
      discountPercentage: code.discountPercentage,
      expiryDate: code.expiryDate ? new Date(code.expiryDate).toISOString().split('T')[0] : '',
      isActive: code.isActive,
      appliesTo: code.appliesTo,
      maxUses: code.maxUses ?? ''
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

    // Validar emails personalizados si se seleccionó esa opción
    if (sendEmail && emailRecipientType === 'custom') {
      if (selectedEmails.length === 0) {
        toast.error('Debes seleccionar al menos un email');
        return;
      }
    }

    const payload: any = {
      code: formData.code.trim().toUpperCase(),
      discountPercentage: formData.discountPercentage,
      isActive: formData.isActive,
      appliesTo: formData.appliesTo,
      sendEmail: sendEmail
    };

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

    // Añadir información de emails personalizados si aplica
    if (sendEmail && emailRecipientType === 'custom') {
      payload.customEmails = selectedEmails;
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
        
        // Mostrar estadísticas de email si se enviaron
        if (sendEmail && response.data?.discountCode?.emailStats) {
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
    .filter(code => 
      code.code.toLowerCase().includes(discountSearchTerm.toLowerCase())
    )
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

            {/* Active Status */}
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
              <label htmlFor="isActive" className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
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

            {/* Send Email to Subscribers - Solo al crear */}
            {!editingCode && (
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
                          <div className="w-5 h-5 bg-slate-600 border-2 border-slate-500 rounded-full peer-checked:border-yellow-400 transition-all duration-200 flex items-center justify-center">
                            {emailRecipientType === 'all' && (
                              <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
                            )}
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
                          <div className="w-5 h-5 bg-slate-600 border-2 border-slate-500 rounded-full peer-checked:border-yellow-400 transition-all duration-200 flex items-center justify-center">
                            {emailRecipientType === 'custom' && (
                              <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
                            )}
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
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <label className="block text-xs font-medium text-slate-300">
                            Selecciona los destinatarios
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              if (!subscribers.length) fetchSubscribers();
                            }}
                            className="text-xs text-yellow-400 hover:text-yellow-300 underline whitespace-nowrap"
                          >
                            {subscribers.length > 0 ? 'Actualizar lista' : 'Cargar suscriptores'}
                          </button>
                        </div>

                        {loadingSubscribers ? (
                          <div className="text-center py-4">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-yellow-400"></div>
                            <p className="text-xs text-slate-400 mt-2">Cargando suscriptores...</p>
                          </div>
                        ) : subscribers.length > 0 ? (
                          <>
                            {/* Search Bar for Subscribers */}
                            <div className="mb-3 relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <input
                                type="text"
                                value={subscriberSearchTerm}
                                onChange={(e) => setSubscriberSearchTerm(e.target.value)}
                                placeholder="Buscar por email..."
                                className="w-full pl-10 pr-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                              />
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                              <span className="text-xs text-slate-400">
                                {selectedEmails.length} de {subscribers.length} seleccionados
                                {subscriberSearchTerm && ` • ${filteredSubscribers.length} coincidencias`}
                              </span>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedEmails(filteredSubscribers.map(s => s.email))}
                                  className="text-xs text-yellow-400 hover:text-yellow-300 whitespace-nowrap"
                                >
                                  {subscriberSearchTerm ? 'Seleccionar coincidencias' : 'Seleccionar todos'}
                                </button>
                                <span className="text-slate-600">|</span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedEmails([])}
                                  className="text-xs text-yellow-400 hover:text-yellow-300 whitespace-nowrap"
                                >
                                  Deseleccionar todos
                                </button>
                              </div>
                            </div>
                            <div className="max-h-64 overflow-y-auto bg-slate-700/50 rounded-lg border border-slate-600 p-2 sm:p-3 space-y-1.5 sm:space-y-2">
                              {filteredSubscribers.length > 0 ? (
                                filteredSubscribers.map((subscriber) => (
                                <label
                                  key={subscriber.email}
                                  className="flex items-center gap-2 sm:gap-3 cursor-pointer group hover:bg-slate-600/40 p-2 sm:p-3 rounded-lg transition-all border border-transparent hover:border-yellow-400/30"
                                >
                                  {/* Custom Checkbox */}
                                  <div className="relative flex-shrink-0">
                                    <input
                                      type="checkbox"
                                      checked={selectedEmails.includes(subscriber.email)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedEmails([...selectedEmails, subscriber.email]);
                                        } else {
                                          setSelectedEmails(selectedEmails.filter(email => email !== subscriber.email));
                                        }
                                      }}
                                      className="sr-only peer"
                                    />
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-slate-600 border-2 border-slate-500 rounded peer-checked:bg-yellow-400 peer-checked:border-yellow-400 transition-all duration-200 flex items-center justify-center">
                                      {selectedEmails.includes(subscriber.email) && (
                                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <span className="text-xs sm:text-sm text-slate-300 group-hover:text-white transition-colors flex-1 truncate font-medium min-w-0">
                                    {subscriber.email}
                                  </span>
                                  
                                  {subscriber.hasPromotions && (
                                    <span className="text-xs bg-green-500/20 text-green-400 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-semibold flex items-center gap-1 flex-shrink-0">
                                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full hidden sm:inline-block"></span>
                                      <span className="hidden sm:inline">Promociones</span>
                                      <span className="sm:hidden">✓</span>
                                    </span>
                                  )}
                                </label>
                              ))
                              ) : (
                                <div className="text-center py-4 text-slate-400 text-xs">
                                  No se encontraron coincidencias
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-4 text-slate-400 text-xs">
                            Haz clic en "Cargar suscriptores" para ver la lista
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
                <label className="flex-1 sm:flex-1 lg:w-auto lg:min-w-[250px]">
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

                <div className="flex items-center sm:items-end lg:pb-2">
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
              onClick={() => setDiscountSearchTerm('')}
              className="mt-4 text-yellow-400 hover:text-yellow-300 underline text-sm"
            >
              Limpiar búsqueda
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
                    <span
                      className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        code.isValid
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {code.isValid ? 'Activo' : 'Inactivo/Expirado'}
                    </span>
                    {!code.isActive && (
                      <span className="px-2 md:px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400 whitespace-nowrap">
                        Desactivado
                      </span>
                    )}
                  </div>

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
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleEdit(code)}
                    className="flex-1 sm:flex-none p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
                    title="Editar cupón"
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
