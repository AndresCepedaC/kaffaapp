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
 * Creates an order. Returns { order, printed } where:
 * - order: the created Order object with ID, total, etc.
 * - printed: boolean indicating if the thermal printer succeeded
 */
export async function createOrder(order) {
    const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
    });
    if (!res.ok) throw new Error("Failed to create order");
    return res.json(); // { order: {...}, printed: true/false }
}

export async function getRecommendations(cartProductIds) {
    try {
        const res = await fetch(`${API_URL}/productos/recommendations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cartProductIds)
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}
