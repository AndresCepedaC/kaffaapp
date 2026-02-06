package kaffaapp.kaffa_server.model;

public class Product {

    private Integer id;          // ahora Integer, permite null cuando se crea
    private String name;
    private String description;
    private double price;
    private Category category;   // relación con Category
    private boolean active;      // para desactivar sin borrar

    public Product() {
    }

    public Product(Integer id, String name, String description,
                   double price, Category category, boolean active) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.active = active;
    }

    // Getters y setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    @Override
    public String toString() {
        return name + " - $" + price;
    }
}
