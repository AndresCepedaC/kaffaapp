import React from "react";

export default function CartPanel({
  cart,
  isTip,
  tipOrDiscountPercent,
  notes,
  onChangeIsTip,
  onChangePercent,
  onChangeNotes,
  onEditQuantity,
  onRemoveItem,
  onClearCart,
  onSendOrder
}) {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const percent = Number(tipOrDiscountPercent) || 0;

  const total = isTip
    ? subtotal * (1 + percent / 100)
    : subtotal * (1 - percent / 100);

  const adjustment = isTip
    ? subtotal * percent / 100
    : -subtotal * percent / 100;

  return (
    <div style={{ flex: 1 }}>
      <h2>Carrito</h2>

      <div
        style={{
          minHeight: 200,
          border: "1px solid #ccc",
          marginBottom: 8,
          padding: 4,
          overflowY: "auto"
        }}
      >
        {cart.length === 0 && <p>Sin items.</p>}
        {cart.map((item, idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
            <span>
              {item.quantity} x {item.product.name} (${item.product.price})
            </span>
            <span>
              ${item.product.price * item.quantity}{" "}
              <button onClick={() => onEditQuantity(idx)}>Editar</button>{" "}
              <button onClick={() => onRemoveItem(idx)}>X</button>
            </span>
          </div>
        ))}
      </div>

      <button onClick={onClearCart} disabled={cart.length === 0}>
        Vaciar carrito
      </button>

      <h3 style={{ marginTop: 12 }}>Propina / Descuento</h3>
      <label>
        <input
          type="radio"
          checked={isTip}
          onChange={() => onChangeIsTip(true)}
        />
        Propina
      </label>
      <label style={{ marginLeft: 8 }}>
        <input
          type="radio"
          checked={!isTip}
          onChange={() => onChangeIsTip(false)}
        />
        Descuento
      </label>

      <div style={{ marginTop: 8 }}>
        <input
          type="number"
          min="0"
          max="100"
          value={tipOrDiscountPercent}
          onChange={e => onChangePercent(e.target.value)}
          style={{ width: 80 }}
        />{" "}
        %
      </div>

      <div style={{ marginTop: 8 }}>
        <div>Subtotal: ${subtotal.toFixed(1)}</div>
        <div>
          {isTip ? "Propina" : "Descuento"} ({percent}%): {adjustment.toFixed(1)}
        </div>
        <div>
          <b>Total: ${total.toFixed(1)}</b>
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <textarea
          placeholder="Notas / Mesa"
          value={notes}
          onChange={e => onChangeNotes(e.target.value)}
          rows={3}
          style={{ width: "100%" }}
        />
      </div>

      <button
        style={{ marginTop: 8 }}
        onClick={onSendOrder}
        disabled={cart.length === 0}
      >
        Hacer pedido
      </button>
    </div>
  );
}
