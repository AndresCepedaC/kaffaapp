const API_URL = '/api';

export async function getCategories() {
    const res = await fetch(`${API_URL}/categorias`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
}

export async function getProducts() {
    const res = await fetch(`${API_URL}/productos`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
}

/**
 * Creates an order. Returns { order } with status PENDING.
 */
export async function createOrder(order) {
    const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
    });
    if (!res.ok) throw new Error("Failed to create order");
    return res.json();
}

export async function getRecommendations(cartProductIds) {
    try {
        const res = await fetch(`${API_URL}/productos/recommendations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cartProductIds)
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

// ─── Order Management Dashboard ──────────────────────────────

export async function getOrders() {
    const res = await fetch(`${API_URL}/orders`);
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
}

export async function updateOrder(id, updatedData) {
    const res = await fetch(`${API_URL}/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
    });
    if (!res.ok) throw new Error("Failed to update order");
    return res.json();
}

export async function deleteOrder(id) {
    const res = await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error("Failed to delete order");
}

// ─── Payment ─────────────────────────────────────────────────

/**
 * Process payment for an order.
 * @param {number} id - Order ID
 * @param {{ paymentMethod: string, amountCash?: number, amountBank?: number }} paymentData
 */
export async function payOrder(id, paymentData) {
    const res = await fetch(`${API_URL}/orders/${id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
    });
    if (!res.ok) throw new Error("Failed to process payment");
    return res.json();
}

// ─── On-Demand Printing ──────────────────────────────────────

export async function printInternal(id) {
    const res = await fetch(`${API_URL}/orders/${id}/print-internal`, { method: 'POST' });
    if (!res.ok) throw new Error("Failed to print internal ticket");
    return res.json();
}

export async function printCustomer(id) {
    const res = await fetch(`${API_URL}/orders/${id}/print-customer`, { method: 'POST' });
    if (!res.ok) throw new Error("Failed to print customer ticket");
    return res.json();
}

// ─── Cash Register ───────────────────────────────────────────

export async function getDailyClosing(date) {
    const url = date ? `${API_URL}/cash/closing?date=${date}` : `${API_URL}/cash/today`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch daily closing");
    return res.json();
}
