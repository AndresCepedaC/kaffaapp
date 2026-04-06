import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Trash2, Edit3, Package, X, Plus, Minus, Save, AlertTriangle, Loader2, Receipt, DollarSign } from 'lucide-react';
import { getOrders, updateOrder, deleteOrder } from '../services/api';
import DailyCash from './DailyCash';
import './OrderDashboard.css';

export default function OrderDashboard({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');

  // Edit modal state
  const [editingOrder, setEditingOrder] = useState(null);
  const [editItems, setEditItems] = useState([]);
  const [editNotes, setEditNotes] = useState('');
  const [editTip, setEditTip] = useState(false);
  const [editPercent, setEditPercent] = useState(0);
  const [saving, setSaving] = useState(false);

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Notification
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      setError('No se pudieron cargar los pedidos. Intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ─── Delete flow
  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await deleteOrder(deletingId);
      setOrders(prev => prev.filter(o => o.id !== deletingId));
      setNotification({ type: 'success', message: `Pedido #${deletingId} eliminado correctamente.` });
    } catch {
      setNotification({ type: 'error', message: 'Error al eliminar el pedido.' });
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  };

  // ─── Edit flow
  const openEdit = (order) => {
    setEditingOrder(order);
    setEditItems(order.items.map(item => ({ product: { ...item.product }, quantity: item.quantity })));
    setEditNotes(order.notes || '');
    setEditTip(order.tip || false);
    setEditPercent(order.tipOrDiscountPercent || 0);
  };

  const closeEdit = () => {
    setEditingOrder(null);
    setEditItems([]);
    setEditNotes('');
    setEditTip(false);
    setEditPercent(0);
  };

  const updateItemQty = (productId, delta) => {
    setEditItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + delta }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const editSubtotal = editItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const editTipAmount = editTip ? editSubtotal * (editPercent / 100) : 0;
  const editDiscount = !editTip ? editSubtotal * (editPercent / 100) : 0;
  const editTotal = editTip ? editSubtotal + editTipAmount : editSubtotal - editDiscount;

  const handleSaveEdit = async () => {
    if (editItems.length === 0) {
      setNotification({ type: 'error', message: 'El pedido debe tener al menos un producto.' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        items: editItems.map(item => ({ product: item.product, quantity: item.quantity })),
        notes: editNotes,
        tip: editTip,
        tipOrDiscountPercent: editPercent,
      };
      const updated = await updateOrder(editingOrder.id, payload);
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      setNotification({ type: 'success', message: `Pedido #${updated.id} actualizado. Nuevo total: $${updated.total.toLocaleString()}` });
      closeEdit();
    } catch {
      setNotification({ type: 'error', message: 'Error al actualizar el pedido.' });
    } finally {
      setSaving(false);
    }
  };

  // ─── Format helpers
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatMoney = (amount) => {
    if (amount == null) return '$0';
    return '$' + Math.round(amount).toLocaleString('es-CO');
  };

  const getStatusBadge = (status) => {
    if (status === 'PAID') return <span className="status-badge status-paid">✓ Pagado</span>;
    return <span className="status-badge status-pending">◷ Pendiente</span>;
  };

  const getPaymentBadge = (method) => {
    if (!method) return <span className="text-[#5a5040]">—</span>;
    const map = { CASH: '💵 Efectivo', BANK: '🏦 Banco', SPLIT: '➗ Dividido' };
    return <span className="payment-badge">{map[method] || method}</span>;
  };

  return (
    <div className="order-dashboard">
      {/* Header Bar */}
      <div className="dash-header">
        <button onClick={onBack} className="dash-back-btn" aria-label="Volver al menú">
          <ArrowLeft className="w-5 h-5" />
          <span>Menú</span>
        </button>

        {/* Tabs */}
        <div className="dash-tabs">
          <button
            onClick={() => setActiveTab('orders')}
            className={`dash-tab ${activeTab === 'orders' ? 'dash-tab-active' : ''}`}
          >
            <Receipt className="w-4 h-4" />
            <span>Pedidos</span>
          </button>
          <button
            onClick={() => setActiveTab('cash')}
            className={`dash-tab ${activeTab === 'cash' ? 'dash-tab-active' : ''}`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Caja Diaria</span>
          </button>
        </div>

        <div className="dash-order-count">
          {!loading && activeTab === 'orders' && <span className="dash-badge">{orders.length} pedidos</span>}
        </div>
      </div>

      {/* ─── Caja Diaria Tab ──────────────────────────────── */}
      {activeTab === 'cash' && (
        <div style={{ paddingTop: '1rem' }}>
          <DailyCash />
        </div>
      )}

      {/* ─── Orders Tab ────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <>
          {loading && (
            <div className="dash-loading">
              <div className="dash-spinner"><Loader2 className="w-8 h-8 animate-spin text-[#c9a96e]" /></div>
              <p className="text-[#7a6e5d] mt-4">Cargando pedidos...</p>
            </div>
          )}

          {error && !loading && (
            <div className="dash-error">
              <AlertTriangle className="w-10 h-10 text-[#c94a4a] mb-3" />
              <p className="text-[#c94a4a] font-medium">{error}</p>
              <button onClick={fetchOrders} className="dash-retry-btn">Reintentar</button>
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="dash-empty">
              <Package className="w-16 h-16 text-[#3a3024] mb-4" />
              <p className="text-[#7a6e5d] text-lg font-medium">No hay pedidos registrados</p>
              <p className="text-[#5a5040] text-sm mt-2">Los pedidos aparecerán aquí cuando se realicen desde el menú.</p>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="dash-table-wrapper">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fecha</th>
                    <th>Productos</th>
                    <th className="hide-mobile">Estado</th>
                    <th className="hide-mobile">Pago</th>
                    <th>Propina / Desc.</th>
                    <th>Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => (
                    <tr key={order.id} className="dash-row" style={{ animationDelay: `${idx * 0.04}s` }}>
                      <td className="dash-cell-id">{order.id}</td>
                      <td className="dash-cell-date">{formatDate(order.createdAt)}</td>
                      <td className="dash-cell-items">
                        <div className="item-chips">
                          {order.items && order.items.slice(0, 3).map((item, i) => (
                            <span key={i} className="item-chip">
                              {item.quantity}× {item.product?.name || 'Producto'}
                            </span>
                          ))}
                          {order.items && order.items.length > 3 && (
                            <span className="item-chip item-chip-more">+{order.items.length - 3} más</span>
                          )}
                        </div>
                      </td>
                      <td className="dash-cell-status hide-mobile">{getStatusBadge(order.status)}</td>
                      <td className="dash-cell-payment hide-mobile">{getPaymentBadge(order.paymentMethod)}</td>
                      <td className="dash-cell-tip">
                        {order.tipOrDiscountPercent > 0 ? (
                          <span className={`tip-badge ${order.tip ? 'tip-badge-tip' : 'tip-badge-disc'}`}>
                            {order.tip ? '☕ Propina' : '🏷️ Desc.'} {order.tipOrDiscountPercent}%
                          </span>
                        ) : (
                          <span className="text-[#5a5040]">—</span>
                        )}
                      </td>
                      <td className="dash-cell-total">{formatMoney(order.total)}</td>
                      <td className="dash-cell-actions">
                        <button onClick={() => openEdit(order)} className="action-btn action-edit" title="Editar pedido">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeletingId(order.id)} className="action-btn action-delete" title="Eliminar pedido">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ─── Delete Confirmation Modal ─────────────────────── */}
      {deletingId && (
        <div className="modal-overlay" onClick={() => !deleting && setDeletingId(null)}>
          <div className="modal-box modal-delete bounce-in" onClick={e => e.stopPropagation()}>
            <div className="modal-delete-icon">
              <AlertTriangle className="w-10 h-10 text-[#c94a4a]" />
            </div>
            <h3 className="modal-delete-title">¿Eliminar Pedido #{deletingId}?</h3>
            <p className="modal-delete-desc">
              Esta acción eliminará el pedido y todos sus productos de forma permanente.
            </p>
            <div className="modal-delete-actions">
              <button onClick={() => setDeletingId(null)} className="modal-btn-cancel" disabled={deleting}>
                Cancelar
              </button>
              <button onClick={handleDeleteConfirm} className="modal-btn-delete" disabled={deleting}>
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Modal ────────────────────────────────────── */}
      {editingOrder && (
        <div className="modal-overlay" onClick={() => !saving && closeEdit()}>
          <div className="modal-box modal-edit bounce-in" onClick={e => e.stopPropagation()}>
            <div className="modal-edit-header">
              <div>
                <h3 className="modal-edit-title">Editar Pedido #{editingOrder.id}</h3>
                <p className="modal-edit-date">{formatDate(editingOrder.createdAt)}</p>
              </div>
              <button onClick={closeEdit} className="modal-close-btn" disabled={saving}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="modal-edit-items">
              <h4 className="modal-section-label">Productos</h4>
              {editItems.length === 0 ? (
                <p className="text-[#7a6e5d] text-sm italic py-4 text-center">
                  Todos los productos fueron eliminados. Agrega al menos uno.
                </p>
              ) : (
                <div className="modal-items-list">
                  {editItems.map(item => (
                    <div key={item.product.id} className="modal-item-row">
                      <div className="modal-item-info">
                        <span className="modal-item-name">{item.product.name}</span>
                        <span className="modal-item-price">{formatMoney(item.product.price)} c/u</span>
                      </div>
                      <div className="modal-item-controls">
                        <button onClick={() => updateItemQty(item.product.id, -1)} className="qty-btn qty-minus" aria-label="Disminuir cantidad">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button onClick={() => updateItemQty(item.product.id, 1)} className="qty-btn qty-plus" aria-label="Aumentar cantidad">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <span className="modal-item-subtotal">{formatMoney(item.product.price * item.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-edit-notes">
              <h4 className="modal-section-label">Notas</h4>
              <textarea
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                placeholder="Notas del pedido..."
                className="modal-textarea"
                rows={2}
              />
            </div>

            <div className="modal-edit-tip">
              <div className="tip-toggle-row">
                <label className="tip-toggle-label">
                  <input
                    type="checkbox"
                    checked={editPercent > 0}
                    onChange={e => { if (!e.target.checked) setEditPercent(0); else setEditPercent(10); }}
                    className="tip-checkbox"
                  />
                  <span>{editTip ? 'Propina' : 'Descuento'}</span>
                </label>
                {editPercent > 0 && (
                  <button onClick={() => setEditTip(!editTip)} className="tip-type-toggle">
                    Cambiar a {editTip ? 'Descuento' : 'Propina'}
                  </button>
                )}
              </div>
              {editPercent > 0 && (
                <div className="tip-percent-row">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editPercent}
                    onChange={e => setEditPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="tip-percent-input"
                  />
                  <span className="tip-percent-symbol">%</span>
                </div>
              )}
            </div>

            <div className="modal-edit-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>{formatMoney(editSubtotal)}</span>
              </div>
              {editPercent > 0 && (
                <div className="total-row total-row-highlight">
                  <span>{editTip ? '☕ Propina' : '🏷️ Descuento'} ({editPercent}%)</span>
                  <span className={editTip ? 'text-[#4ade80]' : 'text-[#c94a4a]'}>
                    {editTip ? '+' : '-'}{formatMoney(editTip ? editTipAmount : editDiscount)}
                  </span>
                </div>
              )}
              <div className="total-row total-row-final">
                <span>Total</span>
                <span>{formatMoney(editTotal)}</span>
              </div>
            </div>

            <button onClick={handleSaveEdit} className="modal-save-btn" disabled={saving || editItems.length === 0}>
              {saving ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</>
              ) : (
                <><Save className="w-5 h-5" /> Guardar Cambios</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="dash-toast bounce-in" role="alert">
          <div className={`dash-toast-inner ${notification.type === 'success' ? 'toast-success' : 'toast-error'}`}>
            <p className="dash-toast-msg">{notification.type === 'success' ? '✅' : '❌'} {notification.message}</p>
            <button onClick={() => setNotification(null)} className="dash-toast-close">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
