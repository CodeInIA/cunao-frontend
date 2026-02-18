import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../../config';
import { 
  Users, Search, Mail, ShoppingBag, ChevronLeft, ChevronRight,
  Eye, Filter, TrendingUp, UserCheck, Package, Euro, Calendar, BarChart3,
  UserPlus, Repeat, Target, Award, Globe, Activity, CreditCard
} from 'lucide-react';

axios.defaults.withCredentials = true;

type PaymentMethodInfo = { provider: string; cardBrand?: string };

function PaymentMethodIcon({ method, size = 'md' }: { method?: PaymentMethodInfo; size?: 'sm' | 'md' }) {
  const imgClass = size === 'sm' ? 'w-10 h-10' : 'w-14 h-14';
  const iconClass = size === 'sm' ? 'w-9 h-9' : 'w-12 h-12';

  if (!method) return <span className="text-sm text-slate-400">No disponible</span>;

  const cfg: Record<string, { label: string; img?: string; whiteBg?: boolean }> = {
    card:       { label: 'Tarjeta' },
    visa:       { label: 'Visa',        img: '/payment-methods/visa.svg' },
    mastercard: { label: 'Mastercard',  img: '/payment-methods/mastercard.svg' },
    google_pay: { label: 'Google Pay',  img: '/payment-methods/google-pay.svg' },
    apple_pay:  { label: 'Apple Pay',   img: '/payment-methods/apple-pay.svg' },
    link:       { label: 'Stripe Link', img: '/payment-methods/link.svg', whiteBg: true },
    paypal:     { label: 'PayPal',      img: '/payment-methods/paypal.svg' },
    klarna:     { label: 'Klarna',      img: '/payment-methods/klarna.svg' },
    amazon_pay: { label: 'Amazon Pay',  img: '/payment-methods/amazon-pay.svg' },
  };

  const providerEntry = cfg[method.provider];
  const brandEntry = method.cardBrand ? cfg[method.cardBrand] : undefined;
  const tooltip = [providerEntry?.label ?? method.provider, brandEntry?.label].filter(Boolean).join(' · ');

  if (!providerEntry) return <span className="text-sm text-slate-300 font-medium">{method.provider}</span>;

  const renderImg = (entry: { label: string; img?: string; whiteBg?: boolean }) =>
    entry.img
      ? entry.whiteBg
        ? <span className="inline-flex items-center justify-center bg-white rounded-md px-2 py-0.5"><img src={entry.img} alt={entry.label} className={`${imgClass} object-contain`} /></span>
        : <img src={entry.img} alt={entry.label} className={`${imgClass} object-contain`} />
      : <CreditCard className={`${iconClass} text-slate-200`} />;

  return (
    <span className="inline-flex items-center gap-1" title={tooltip}>
      {renderImg(providerEntry)}
      {brandEntry && renderImg(brandEntry)}
    </span>
  );
}

// Alias kept for call sites
function PaymentMethodBadge({ method, size }: { method?: PaymentMethodInfo; size?: 'sm' | 'md' }) {
  return <PaymentMethodIcon method={method} size={size} />;
}

function formatPhone(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  // Spanish numbers: +34 + 9 digits
  if (phone.startsWith('+34') && digits.length === 11) {
    const n = digits.slice(2); // 9 digits
    return `+34 ${n.slice(0, 3)} ${n.slice(3, 5)} ${n.slice(5, 7)} ${n.slice(7, 9)}`;
  }
  // Generic: country code heuristic (2 digits) + group remaining in pairs
  if (phone.startsWith('+') && digits.length >= 10) {
    const cc = digits.slice(0, 2);
    const rest = digits.slice(2);
    const groups = rest.match(/.{1,2}/g)?.join(' ') ?? rest;
    return `+${cc} ${groups}`;
  }
  return phone;
}

interface Client {
  _id: string; name: string; email: string; phone?: string;
  address: { line1: string; line2?: string; city: string; state?: string; postal_code: string; country: string };
  orderIds: string[]; emailMarketing: boolean; newsletterId?: any;
  createdAt: string; updatedAt: string;
}

interface ClientStats {
  totalClients: number; totalWithMarketing: number; totalOrders: number; newsletterSubscribers: number;
  totalRevenue: number; periodRevenue: number; periodOrders: number; averageOrderValue: number;
  newClientsInPeriod: number; conversionRate: number; recurringClients: number; 
  avgOrdersPerClient: number; clientsWithOrders: number; avgCustomerLifetimeValue: number;
  topClientByOrders: { name: string; email: string; orderCount: number } | null;
  clientsByCountry: Array<{ country: string; count: number }>;
  ordersByStatus: { [key: string]: number };
  monthlyRevenue: Array<{ month: string; revenue: number; orders: number }>;
  topClients: Array<{ id: string; name: string; email: string; totalSpent: number; orderCount: number }>;
}

export default function ClientsManager() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientDetails, setClientDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmailMarketing, setFilterEmailMarketing] = useState<'all' | 'true' | 'false'>('all');

  useEffect(() => { fetchClients(); fetchStats(); }, [currentPage, searchTerm, filterEmailMarketing, period]);

  // Limpiar el overflow del body al desmontar el componente
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  async function fetchStats() {
    try {
      const res = await axios.get(`${config.API_URL}/admin/clients/stats`, { params: { period } });
      if (res.data.success) setStats(res.data.stats);
    } catch (error) { console.error('Error fetching stats:', error); }
  }

  async function fetchClients() {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit };
      if (searchTerm) params.search = searchTerm;
      if (filterEmailMarketing !== 'all') params.emailMarketing = filterEmailMarketing;
      const res = await axios.get(`${config.API_URL}/admin/clients`, { params });
      if (res.data.success) {
        setClients(res.data.clients);
        setTotalPages(res.data.pagination.totalPages);
        setTotal(res.data.pagination.total);
      }
    } catch (error) { console.error('Error fetching clients:', error);
    } finally { setLoading(false); }
  }

  async function fetchClientDetails(clientId: string) {
    try {
      setLoadingDetails(true);
      const res = await axios.get(`${config.API_URL}/admin/clients/${clientId}`);
      if (res.data.success) setClientDetails(res.data);
    } catch (error) { console.error('Error fetching client details:', error);
    } finally { setLoadingDetails(false); }
  }

  function handleViewClient(client: Client) {
    setSelectedClient(client);
    setClientDetails(null);
    fetchClientDetails(client._id);
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';
  }

  function handleCloseModal() { 
    setSelectedClient(null); 
    setClientDetails(null);
    // Restaurar scroll del body
    document.body.style.overflow = 'unset';
  }

  function handleSearch(e: React.FormEvent) { e.preventDefault(); setCurrentPage(1); fetchClients(); }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/dashboard')} className="p-2 rounded bg-slate-800 hover:bg-slate-700 transition" title="Volver al dashboard">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white flex items-center gap-2">
              <Users className="w-7 h-7 text-yellow-400" />
              Gestión de Clientes
            </h2>
            <p className="text-sm text-slate-400 mt-1">{total} clientes registrados</p>
          </div>
        </div>
      </div>

      {stats && (
        <>
          <div className="mb-4 flex items-center gap-2 justify-end">
            <Calendar className="w-5 h-5 text-slate-400" />
            <select value={period} onChange={(e) => setPeriod(e.target.value as any)} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400">
              <option value="week">Última semana</option>
              <option value="month">Este mes</option>
              <option value="year">Este año</option>
              <option value="all">Todo el tiempo</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div><p className="text-blue-100 text-sm font-medium">Total Clientes</p><p className="text-3xl font-bold text-white mt-1">{stats.totalClients}</p></div>
                <Users className="w-10 h-10 text-blue-200 opacity-80" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div><p className="text-green-100 text-sm font-medium">Con Marketing</p><p className="text-3xl font-bold text-white mt-1">{stats.totalWithMarketing}</p></div>
                <UserCheck className="w-10 h-10 text-green-200 opacity-80" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div><p className="text-purple-100 text-sm font-medium">Total Pedidos</p><p className="text-3xl font-bold text-white mt-1">{stats.totalOrders}</p></div>
                <Package className="w-10 h-10 text-purple-200 opacity-80" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div><p className="text-yellow-100 text-sm font-medium">Newsletter</p><p className="text-3xl font-bold text-white mt-1">{stats.newsletterSubscribers}</p></div>
                <Mail className="w-10 h-10 text-yellow-200 opacity-80" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div><p className="text-emerald-100 text-sm font-medium">Ingresos Totales</p><p className="text-2xl font-bold text-white mt-1">{stats.totalRevenue.toFixed(2)}€</p></div>
                <Euro className="w-10 h-10 text-emerald-200 opacity-80" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div><p className="text-cyan-100 text-sm font-medium">Ingresos {period === 'week' ? 'Semana' : period === 'month' ? 'Mes' : period === 'year' ? 'Año' : 'Total'}</p><p className="text-2xl font-bold text-white mt-1">{stats.periodRevenue.toFixed(2)}€</p></div>
                <TrendingUp className="w-10 h-10 text-cyan-200 opacity-80" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div><p className="text-orange-100 text-sm font-medium">Pedidos Periodo</p><p className="text-3xl font-bold text-white mt-1">{stats.periodOrders}</p></div>
                <ShoppingBag className="w-10 h-10 text-orange-200 opacity-80" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-pink-600 to-pink-700 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div><p className="text-pink-100 text-sm font-medium">Ticket Medio</p><p className="text-2xl font-bold text-white mt-1">{stats.averageOrderValue.toFixed(2)}€</p></div>
                <BarChart3 className="w-10 h-10 text-pink-200 opacity-80" />
              </div>
            </div>
          </div>

          {/* Nuevas estadísticas adicionales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div><p className="text-indigo-100 text-sm font-medium">Clientes Nuevos</p><p className="text-3xl font-bold text-white mt-1">{stats.newClientsInPeriod}</p><p className="text-xs text-indigo-200 mt-1">en periodo</p></div>
                <UserPlus className="w-10 h-10 text-indigo-200 opacity-80" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div><p className="text-teal-100 text-sm font-medium">Tasa Conversión</p><p className="text-3xl font-bold text-white mt-1">{stats.conversionRate.toFixed(1)}%</p><p className="text-xs text-teal-200 mt-1">{stats.clientsWithOrders} compraron</p></div>
                <Target className="w-10 h-10 text-teal-200 opacity-80" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-violet-600 to-violet-700 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div><p className="text-violet-100 text-sm font-medium">Clientes Recurrentes</p><p className="text-3xl font-bold text-white mt-1">{stats.recurringClients}</p><p className="text-xs text-violet-200 mt-1">+2 pedidos</p></div>
                <Repeat className="w-10 h-10 text-violet-200 opacity-80" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-rose-600 to-rose-700 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div><p className="text-rose-100 text-sm font-medium">LTV Promedio</p><p className="text-2xl font-bold text-white mt-1">{stats.avgCustomerLifetimeValue.toFixed(2)}€</p><p className="text-xs text-rose-200 mt-1">por cliente</p></div>
                <Activity className="w-10 h-10 text-rose-200 opacity-80" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-yellow-400" />Ingresos Mensuales (Últimos 12 meses)</h3>
              <div className="space-y-2">
                {stats.monthlyRevenue.map((item, idx) => {
                  const maxRevenue = Math.max(...stats.monthlyRevenue.map(m => m.revenue));
                  const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="text-xs text-slate-400 w-20">{item.month}</div>
                      <div className="flex-1 bg-slate-700 rounded-full h-6 overflow-hidden">
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-full flex items-center justify-end px-2" style={{ width: `${Math.max(5, percentage)}%` }}>
                          {item.revenue > 0 && <span className="text-xs font-semibold text-white">{item.revenue.toFixed(0)}€</span>}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 w-16 text-right">{item.orders} ped.</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-yellow-400" />Top 5 Clientes por Gasto</h3>
              <div className="space-y-3">
                {stats.topClients.length > 0 ? stats.topClients.map((client, idx) => (
                  <div key={client.id} className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center text-white font-bold">{idx + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{client.name}</p>
                      <p className="text-xs text-slate-400 truncate">{client.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{client.totalSpent.toFixed(2)}€</p>
                      <p className="text-xs text-slate-400">{client.orderCount} pedidos</p>
                    </div>
                  </div>
                )) : <p className="text-slate-400 text-center py-4">No hay datos disponibles</p>}
              </div>
            </div>
          </div>

          {/* Nuevas visualizaciones adicionales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Cliente más activo */}
            {stats.topClientByOrders && (
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-yellow-400" />Cliente Más Activo</h3>
                <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg p-4">
                  <p className="text-amber-100 text-sm font-medium">Más pedidos realizados</p>
                  <p className="text-white font-bold text-xl mt-2 truncate">{stats.topClientByOrders.name}</p>
                  <p className="text-xs text-amber-200 truncate mt-1">{stats.topClientByOrders.email}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-white font-bold text-2xl">{stats.topClientByOrders.orderCount}</span>
                    <span className="text-amber-100 text-sm">pedidos</span>
                  </div>
                </div>
              </div>
            )}

            {/* Distribución por país */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-yellow-400" />Top Países</h3>
              <div className="space-y-2">
                {stats.clientsByCountry && stats.clientsByCountry.length > 0 ? stats.clientsByCountry.map((item, idx) => {
                  const maxCount = Math.max(...stats.clientsByCountry.map(c => c.count));
                  const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="text-xs text-slate-400 w-12">{item.country}</div>
                      <div className="flex-1 bg-slate-700 rounded-full h-5 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-full flex items-center justify-end px-2" style={{ width: `${Math.max(10, percentage)}%` }}>
                          <span className="text-xs font-semibold text-white">{item.count}</span>
                        </div>
                      </div>
                    </div>
                  );
                }) : <p className="text-slate-400 text-center py-4">No hay datos</p>}
              </div>
            </div>

            {/* Estado de pedidos */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-yellow-400" />Estado de Pedidos</h3>
              <div className="space-y-2">
                {stats.ordersByStatus && Object.keys(stats.ordersByStatus).length > 0 ? Object.entries(stats.ordersByStatus).map(([status, count]) => {
                  const statusColors: { [key: string]: string } = {
                    'pending': 'from-yellow-500 to-yellow-600',
                    'processing': 'from-blue-500 to-blue-600',
                    'shipped': 'from-purple-500 to-purple-600',
                    'delivered': 'from-green-500 to-green-600',
                    'cancelled': 'from-red-500 to-red-600',
                    'completed': 'from-emerald-500 to-emerald-600'
                  };
                  const statusLabels: { [key: string]: string } = {
                    'pending': 'Pendiente',
                    'processing': 'Procesando',
                    'shipped': 'Enviado',
                    'delivered': 'Entregado',
                    'cancelled': 'Cancelado',
                    'completed': 'Completado'
                  };
                  const maxCount = Math.max(...Object.values(stats.ordersByStatus));
                  const percentage = maxCount > 0 ? ((count as number) / maxCount) * 100 : 0;
                  return (
                    <div key={status} className="flex items-center gap-2">
                      <div className="text-xs text-slate-400 w-20">{statusLabels[status] || status}</div>
                      <div className="flex-1 bg-slate-700 rounded-full h-5 overflow-hidden">
                        <div className={`bg-gradient-to-r ${statusColors[status] || 'from-slate-500 to-slate-600'} h-full flex items-center justify-end px-2`} style={{ width: `${Math.max(10, percentage)}%` }}>
                          <span className="text-xs font-semibold text-white">{count}</span>
                        </div>
                      </div>
                    </div>
                  );
                }) : <p className="text-slate-400 text-center py-4">No hay datos</p>}
              </div>
            </div>
          </div>

          {/* Métricas adicionales en pequeñas cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-800 rounded-lg p-4 border-l-4 border-cyan-500">
              <p className="text-slate-400 text-sm">Promedio Pedidos/Cliente</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.avgOrdersPerClient.toFixed(2)}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border-l-4 border-green-500">
              <p className="text-slate-400 text-sm">Clientes con Pedidos</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.clientsWithOrders} <span className="text-sm text-slate-400">/ {stats.totalClients}</span></p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border-l-4 border-purple-500">
              <p className="text-slate-400 text-sm">Tasa Recurrencia</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.totalClients > 0 ? ((stats.recurringClients / stats.totalClients) * 100).toFixed(1) : 0}%</p>
            </div>
          </div>
        </>
      )}

      <div className="bg-slate-800 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por nombre o email..." className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
          </form>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select value={filterEmailMarketing} onChange={(e) => { setFilterEmailMarketing(e.target.value as 'all' | 'true' | 'false'); setCurrentPage(1); }} className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400">
              <option value="all">Todos</option>
              <option value="true">Con marketing</option>
              <option value="false">Sin marketing</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Cargando clientes...</div>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No se encontraron clientes</div>
        ) : (
          <>
            {/* Desktop: keep table for wider screens */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Pedidos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Marketing</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Registro</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {clients.map((client) => (
                    <tr key={client._id} className="hover:bg-slate-700/50 transition">
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-white">{client.name}</div>
                        <div className="text-xs text-slate-400">{formatPhone(client.phone) || 'Sin teléfono'}</div>
                      </td>
                      <td className="px-4 py-4"><div className="text-sm text-slate-300">{client.email}</div></td>
                      <td className="px-4 py-4"><div className="flex items-center gap-1 text-sm text-slate-300"><ShoppingBag className="w-4 h-4" />{client.orderIds.length}</div></td>
                      <td className="px-4 py-4">
                        {client.emailMarketing ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-900/50 text-green-300 border border-green-700"><Mail className="w-3 h-3" />Sí</span>
                        ) : <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-400">No</span>}
                      </td>
                      <td className="px-4 py-4"><div className="text-sm text-slate-400">{new Date(client.createdAt).toLocaleDateString('es-ES')}</div></td>
                      <td className="px-4 py-4 text-right">
                        <button onClick={() => handleViewClient(client)} className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-400 text-slate-900 rounded-md text-sm font-semibold hover:bg-yellow-300 transition"><Eye className="w-4 h-4" />Ver</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: compact cards that fit the screen width */}
            <div className="block md:hidden">
              <ul className="divide-y divide-slate-700">
                {clients.map((client) => (
                  <li key={client._id} className="p-4 hover:bg-slate-700/50 transition flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white truncate">{client.name}</div>
                          <div className="text-xs text-slate-400 truncate">{client.email}</div>
                        </div>
                        <div className="text-xs text-slate-400 text-right">{new Date(client.createdAt).toLocaleDateString('es-ES')}</div>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex items-center gap-1 text-sm text-slate-300"><ShoppingBag className="w-4 h-4" /> <span className="text-sm">{client.orderIds.length}</span></div>
                        <div className="text-xs text-slate-400">{formatPhone(client.phone) || 'Sin teléfono'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-3">
                      <div className="shrink-0">
                        {client.emailMarketing ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-900/50 text-green-300 border border-green-700"><Mail className="w-3 h-3" />Sí</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-400">No</span>
                        )}
                      </div>
                      <button onClick={() => handleViewClient(client)} className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-400 text-slate-900 rounded-md text-sm font-semibold hover:bg-yellow-300 transition"><Eye className="w-4 h-4" /></button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-slate-400">Página {currentPage} de {totalPages}</div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition flex items-center gap-1"><ChevronLeft className="w-4 h-4" />Anterior</button>
            <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition flex items-center gap-1">Siguiente<ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {selectedClient && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center md:p-4 z-50 overflow-y-auto">
          <div className="bg-slate-800 md:rounded-xl max-w-5xl w-full h-full md:h-auto md:max-h-[90vh] md:my-8 flex flex-col">
            <div className="bg-slate-900 p-4 md:p-6 border-b border-slate-700 flex items-center justify-between md:rounded-t-xl shrink-0">
              <h3 className="text-xl md:text-2xl font-bold text-white">Detalles del Cliente</h3>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-800 rounded-lg transition">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {loadingDetails ? <div className="p-8 text-center text-slate-400 flex-1 flex items-center justify-center">Cargando detalles...</div> : clientDetails ? (
              <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto flex-1 scrollbar-spanish">
                <div className="bg-slate-900 rounded-lg p-4 md:p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Información Personal</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="text-sm text-slate-400">Nombre</label><p className="text-base text-white font-medium break-words">{selectedClient.name}</p></div>
                    <div><label className="text-sm text-slate-400">Email</label><p className="text-base text-white font-medium break-all">{selectedClient.email}</p></div>
                    <div><label className="text-sm text-slate-400">Teléfono</label><p className="text-base text-white font-medium">{formatPhone(selectedClient.phone) || 'No disponible'}</p></div>
                    <div><label className="text-sm text-slate-400">Marketing</label><p className="text-base text-white font-medium">{selectedClient.emailMarketing ? <span className="text-green-400">✓ Activo</span> : <span className="text-slate-400">✗ Inactivo</span>}</p></div>
                    <div><label className="text-sm text-slate-400">Último método de pago</label><p className="text-base text-white font-medium mt-1"><PaymentMethodBadge method={clientDetails.client?.paymentInfo?.lastPaymentMethod} /></p></div>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-lg p-4 md:p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Dirección</h4>
                  <div className="text-base text-slate-300 space-y-1">
                    <p>{selectedClient.address.line1}</p>
                    {selectedClient.address.line2 && <p>{selectedClient.address.line2}</p>}
                    <p>{selectedClient.address.postal_code} {selectedClient.address.city}{selectedClient.address.state && `, ${selectedClient.address.state}`}</p>
                    <p>{selectedClient.address.country}</p>
                  </div>
                </div>

                {selectedClient.newsletterId && (
                  <div className="bg-slate-900 rounded-lg p-4 md:p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Estado Newsletter</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><label className="text-sm text-slate-400">Newsletter</label><p className="text-base text-white font-medium">{clientDetails.client.newsletterId?.preferences?.newsletter ? <span className="text-green-400">✓ Activo</span> : <span className="text-slate-400">✗ Inactivo</span>}</p></div>
                      <div><label className="text-sm text-slate-400">Promociones</label><p className="text-base text-white font-medium">{clientDetails.client.newsletterId?.preferences?.promotions ? <span className="text-green-400">✓ Activo</span> : <span className="text-slate-400">✗ Inactivo</span>}</p></div>
                      <div><label className="text-sm text-slate-400">Nuevos Productos</label><p className="text-base text-white font-medium">{clientDetails.client.newsletterId?.preferences?.newProducts ? <span className="text-green-400">✓ Activo</span> : <span className="text-slate-400">✗ Inactivo</span>}</p></div>
                    </div>
                  </div>
                )}

                <div className="bg-slate-900 rounded-lg p-4 md:p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><ShoppingBag className="w-5 h-5" />Pedidos ({clientDetails.orders?.length || 0})</h4>
                  {clientDetails.orders && clientDetails.orders.length > 0 ? (
                    <div className="space-y-4">
                      {clientDetails.orders.map((order: any, idx: number) => (
                        <div key={idx} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-slate-700">
                            <div>
                              <p className="text-base text-white font-semibold">Pedido #{order.orderId}</p>
                              <p className="text-sm text-slate-400">{new Date(order.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                              {order.paymentMethod && <div className="mt-1"><PaymentMethodBadge method={order.paymentMethod} size="sm" /></div>}
                            </div>
                            <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                              <p className="text-xl text-white font-bold">{order.total?.toFixed(2)}€</p>
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                order.status === 'completed' || order.status === 'delivered' ? 'bg-green-900/50 text-green-300 border border-green-700' :
                                order.status === 'pending' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700' :
                                order.status === 'shipped' ? 'bg-purple-900/50 text-purple-300 border border-purple-700' :
                                order.status === 'processing' ? 'bg-blue-900/50 text-blue-300 border border-blue-700' :
                                order.status === 'cancelled' ? 'bg-red-900/50 text-red-300 border border-red-700' :
                                'bg-slate-700 text-slate-300'
                              }`}>{
                                order.status === 'pending' ? 'Pendiente' :
                                order.status === 'processing' ? 'Procesando' :
                                order.status === 'shipped' ? 'Enviado' :
                                order.status === 'delivered' ? 'Entregado' :
                                order.status === 'cancelled' ? 'Cancelado' :
                                order.status === 'completed' ? 'Completado' :
                                order.status
                              }</span>
                            </div>
                          </div>
                          {order.items && order.items.length > 0 && (
                            <div className="space-y-3">
                              {order.items.map((item: any, itemIdx: number) => (
                                <div key={itemIdx} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-700/50 p-3 rounded-lg">
                                  {item.productImage ? (
                                    <img src={item.productImage} alt={item.productTitle} className="w-20 h-20 object-cover rounded-lg border-2 border-slate-600 shrink-0 mx-auto sm:mx-0" />
                                  ) : (
                                    <div className="w-20 h-20 bg-slate-600 rounded-lg flex items-center justify-center shrink-0 mx-auto sm:mx-0"><Package className="w-8 h-8 text-slate-400" /></div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-base text-white font-medium truncate">{item.productTitle}</p>
                                    <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-slate-400">
                                      <span>Cant: {item.quantity}</span>
                                      <span className="hidden sm:inline">•</span>
                                      <span>Precio: {item.price.toFixed(2)}€</span>
                                      {item.size && item.size !== 'N/A' && (
                                        <>
                                          <span className="hidden sm:inline">•</span>
                                          <span>Talla: {item.size}</span>
                                        </>
                                      )}
                                      {item.color && item.color !== 'N/A' && (
                                        <>
                                          <span className="hidden sm:inline">•</span>
                                          <span>Color: {item.color}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-center sm:text-right shrink-0"><p className="text-lg text-white font-bold">{(item.price * item.quantity).toFixed(2)}€</p></div>
                                </div>
                              ))}
                            </div>
                          )}
                          {(order.trackingNumber || order.trackingUrl) && (
                            <div className="mt-3 p-3 bg-purple-900/20 border border-purple-700/50 rounded-lg">
                              <p className="text-xs font-semibold text-purple-300 mb-2 uppercase tracking-wide">Información de seguimiento</p>
                              {order.trackingNumber && (
                                <div className="flex items-center gap-2 text-sm mb-1">
                                  <span className="text-slate-400">Nº seguimiento:</span>
                                  <span className="text-white font-mono font-medium">{order.trackingNumber}</span>
                                </div>
                              )}
                              {order.trackingUrl && (
                                <a
                                  href={order.trackingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-purple-300 hover:text-purple-200 underline"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                  Ver seguimiento del envío
                                </a>
                              )}
                            </div>
                          )}
                          {order.shippingCost !== undefined && (
                            <div className="mt-4 pt-3 border-t border-slate-700">
                              <div className="flex justify-between text-sm text-slate-400 mb-1"><span>Subtotal:</span><span>{(order.total - order.shippingCost).toFixed(2)}€</span></div>
                              <div className="flex justify-between text-sm text-slate-400 mb-2"><span>Envío:</span><span>{order.shippingCost.toFixed(2)}€</span></div>
                              {order.discountCode && order.discountPercentage && (
                                <div className="mb-2 p-2 bg-green-900/20 border border-green-700/50 rounded-lg">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-sm font-semibold text-green-400">
                                        Descuento: {order.discountCode}
                                      </span>
                                      <span className="text-xs text-green-300">
                                        ({order.discountPercentage}%)
                                      </span>
                                      {order.discountAppliesTo && (
                                        <span className="px-2 py-0.5 bg-green-900/50 border border-green-700 rounded text-xs text-green-300">
                                          {order.discountAppliesTo === 'shipping' ? 'Envío' : 'Subtotal'}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-sm font-bold text-green-400">
                                      -{order.discountAmount?.toFixed(2) || '0.00'}€
                                    </span>
                                  </div>
                                </div>
                              )}
                              <div className="flex justify-between text-lg font-bold text-white"><span>Total:</span><span>{order.total.toFixed(2)}€</span></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-slate-400 text-center py-8 text-base">No hay pedidos registrados</p>}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
