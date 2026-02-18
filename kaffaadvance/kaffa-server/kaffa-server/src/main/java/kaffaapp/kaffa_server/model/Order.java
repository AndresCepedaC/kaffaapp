package kaffaapp.kaffa_server.model;

import java.time.LocalDateTime;
import java.util.List;

public class Order {

    private Integer id;
    private LocalDateTime createdAt;
    private List<ItemCart> items;
    private Double total;
    private String notes;

    private Double tipOrDiscountPercent;
    private boolean tip;

    public Order() {
    }

    public Order(Integer id, LocalDateTime createdAt,
                 List<ItemCart> items, Double total, String notes) {
        this.id = id;
        this.createdAt = createdAt;
        this.items = items;
        this.total = total;
        this.notes = notes;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<ItemCart> getItems() { return items; }
    public void setItems(List<ItemCart> items) { this.items = items; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Double getTipOrDiscountPercent() { return tipOrDiscountPercent; }
    public void setTipOrDiscountPercent(Double tipOrDiscountPercent) {
        this.tipOrDiscountPercent = tipOrDiscountPercent;
    }

    public boolean isTip() { return tip; }
    public void setTip(boolean tip) { this.tip = tip; }

    public String buildDescription() {
        StringBuilder sb = new StringBuilder();
        sb.append("Pedido ").append(id).append(" - ").append(createdAt).append("\n");
        if (items != null) {
            for (ItemCart item : items) {
                sb.append(item.getQuantity())
                        .append(" x ")
                        .append(item.getProduct().getName())
                        .append("  ($").append(item.getProduct().getPrice()).append(")\n");
            }
        }
        sb.append("Total: $").append(total);
        if (tipOrDiscountPercent != null && tipOrDiscountPercent != 0) {
            sb.append("\n");
            if (tip) {
                sb.append("Incluye propina de ").append(tipOrDiscountPercent).append("%");
            } else {
                sb.append("Incluye descuento de ").append(tipOrDiscountPercent).append("%");
            }
        }
        if (notes != null && !notes.isBlank()) {
            sb.append("\nNotas: ").append(notes);
        }
        return sb.toString();
    }
}
