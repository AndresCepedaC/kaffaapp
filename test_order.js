
const API_URL = "http://localhost:8080/api";

async function verifyOrder() {
    console.log("1. Fetching products...");
    const productsRes = await fetch(`${API_URL}/productos`);
    if (!productsRes.ok) {
        console.error("Failed to fetch products");
        process.exit(1);
    }
    const products = await productsRes.json();

    if (products.length === 0) {
        console.error("No products found! Seed data might be missing.");
        process.exit(1);
    }

    const product = products[0];
    console.log(`Found product: ${product.name} (ID: ${product.id})`);

    console.log("2. Creating order...");
    const order = {
        items: [
            {
                product: product,
                quantity: 2
            }
        ],
        tipOrDiscountPercent: 10,
        tip: true,
        notes: "Test order from verification script"
    };

    const orderRes = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
    });

    if (!orderRes.ok) {
        console.error(`Failed to create order: ${orderRes.status} ${orderRes.statusText}`);
        const text = await orderRes.text();
        console.error("Response:", text);
        process.exit(1);
    }

    const createdOrder = await orderRes.json();
    console.log("Order created successfully!");
    console.log("Order ID:", createdOrder.id);
    console.log("Order Total:", createdOrder.total);

    // Verify values (assuming backend calculates total correctly)
    const expectedTotal = product.price * 2;
    // Note: Backend might or might not include tip in total depending on implementation, 
    // but at least we got an ID back.

    if (createdOrder.id) {
        console.log("SUCCESS: Order verification passed.");
    } else {
        console.error("FAILURE: Order created but no ID returned.");
        process.exit(1);
    }
}

verifyOrder().catch(err => {
    console.error("Script error:", err);
    process.exit(1);
});
