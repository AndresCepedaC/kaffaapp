// Dynamically use the current hostname so it works from any device on the network
const API_URL = `http://${window.location.hostname}:8080/api`;

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

export async function createOrder(order) {
    const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
    });
    if (!res.ok) throw new Error("Failed to create order");
    return res.json();
}
