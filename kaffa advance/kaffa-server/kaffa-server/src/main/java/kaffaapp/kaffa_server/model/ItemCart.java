package kaffaapp.kaffa_server.model;

public class ItemCart {

    private Product product;
    private int quantity;   // este puede seguir siendo int porque siempre hay cantidad


    public ItemCart(Product product, int quantity) {
        this.product = product;
        this.quantity = quantity;
    }

    public ItemCart() {
    }

    // Getters y setters
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public double getSubtotal() {
        return product.getPrice() * quantity;
    }

    @Override
    public String toString() {
        return quantity + " x " + product.getName() + " = $" + getSubtotal();
    }
}
