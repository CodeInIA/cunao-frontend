import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { config } from '../../config';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Edit2, Trash2, Percent, Calendar, Tag as TagIcon, Mail } from 'lucide-react';

axios.defaults.withCredentials = true;

interface DiscountCode {
  _id: string;
  code: string;
  discountPercentage: number;
  expiryDate?: string;
  isActive: boolean;
  appliesTo: 'subtotal' | 'shipping';
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
  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: 10,
    expiryDate: '',
    isActive: true,
    appliesTo: 'subtotal' as 'subtotal' | 'shipping'
  });

  // Validaciones en tiempo real
  const isCodeValid = formData.code.trim().length >= 3 && 
                      formData.code.trim().length <= 20 && 
                      /^[A-ZÁÉÍÓÚÑ0-9_-]+$/i.test(formData.code.trim());
  
  const isPercentageValid = formData.discountPercentage >= 1 && 
                           formData.discountPercentage <= 100 && 
                           Number.isInteger(formData.discountPercentage);
  
  const isFormValid = isCodeValid && isPercentageValid;

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

  function resetForm() {
    setFormData({
      code: '',
      discountPercentage: 10,
      expiryDate: '',
      isActive: true,
      appliesTo: 'subtotal'
    });
    setEditingCode(null);
    setShowCreate(false);
    setSendEmail(false);
  }

  function handleEdit(code: DiscountCode) {
    setEditingCode(code);
    setFormData({
      code: code.code,
      discountPercentage: code.discountPercentage,
      expiryDate: code.expiryDate ? new Date(code.expiryDate).toISOString().split('T')[0] : '',
      isActive: code.isActive,
      appliesTo: code.appliesTo
    });
    setShowCreate(true);
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

    const csrfToken = getCookie('csrfToken');
    if (!csrfToken) {
      toast.error('Token CSRF no encontrado');
      return;
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
    if (!confirm('¿Estás seguro de eliminar este cupón?')) return;

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
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar el cupón');
    }
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link 
            to="/admin/dashboard" 
            className="p-2 rounded bg-slate-800 hover:bg-slate-700" 
            title="Volver al dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </Link>
          <div>
            <h2 className="text-3xl font-serif font-bold text-white">Gestión de Cupones</h2>
            <p className="text-slate-400 mt-1">Crear, editar y eliminar códigos de descuento</p>
          </div>
        </div>
        
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-yellow-400 text-slate-900 px-4 py-2 rounded-md font-semibold shadow hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          >
            <Plus className="w-5 h-5" />
            Nuevo Cupón
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {showCreate && (
        <div className="mb-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-4">
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
                  value={formData.discountPercentage}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    // Validar rango inmediatamente
                    if (!isNaN(value) && value >= 1 && value <= 100) {
                      setFormData({ ...formData, discountPercentage: value });
                    } else if (e.target.value === '') {
                      setFormData({ ...formData, discountPercentage: 0 });
                    }
                  }}
                  min="1"
                  max="100"
                  step="1"
                  className={`w-full px-4 py-2 bg-slate-700 text-white rounded-lg border focus:outline-none focus:ring-2 ${
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
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 text-yellow-400 bg-slate-700 border-slate-600 rounded focus:ring-yellow-400"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-300">
                Cupón activo
              </label>
            </div>

            {/* Send Email to Subscribers - Solo al crear */}
            {!editingCode && (
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="w-5 h-5 text-yellow-400 bg-slate-700 border-slate-600 rounded focus:ring-yellow-400 mt-0.5"
                  />
                  <div>
                    <label htmlFor="sendEmail" className="text-sm font-medium text-slate-300 cursor-pointer">
                      📧 Enviar cupón por email a suscriptores
                    </label>
                    <p className="text-xs text-slate-400 mt-1">
                      Se enviará el cupón a todos los usuarios suscritos a la newsletter con promociones activadas
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!isFormValid}
                className={`px-6 py-2 rounded-md font-semibold shadow focus:outline-none focus:ring-2 transition-all ${
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
                className="bg-slate-700 text-slate-300 px-6 py-2 rounded-md font-semibold shadow hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Cancelar
              </button>
            </div>
            
            {/* Validation Summary */}
            {!isFormValid && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-sm text-red-400 font-medium">⚠️ Completa los campos requeridos:</p>
                <ul className="text-xs text-red-300 mt-2 ml-4 list-disc space-y-1">
                  {!isCodeValid && <li>Código válido (3-20 caracteres, letras, números, guiones)</li>}
                  {!isPercentageValid && <li>Porcentaje válido (número entero entre 1-100)</li>}
                </ul>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Discount Codes List */}
      <div className="space-y-4">
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
        ) : (
          discountCodes.map((code) => (
            <div
              key={code._id}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Code and Status */}
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold text-yellow-400 font-mono">
                      {code.code}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        code.isValid
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {code.isValid ? 'Activo' : 'Inactivo/Expirado'}
                    </span>
                    {!code.isActive && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400">
                        Desactivado
                      </span>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Percent className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm">
                        <span className="font-semibold">{code.discountPercentage}%</span> de descuento
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <TagIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm">
                        Aplica a: <span className="font-semibold">
                          {code.appliesTo === 'subtotal' ? 'Subtotal' : 'Envío'}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm">
                        {formatDate(code.expiryDate)}
                      </span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="mt-4 text-xs text-slate-500">
                    Creado: {new Date(code.createdAt).toLocaleDateString('es-ES')}
                    {code.updatedAt !== code.createdAt && (
                      <> • Actualizado: {new Date(code.updatedAt).toLocaleDateString('es-ES')}</>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(code)}
                    className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
                    title="Editar cupón"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(code._id)}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition"
                    title="Eliminar cupón"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
