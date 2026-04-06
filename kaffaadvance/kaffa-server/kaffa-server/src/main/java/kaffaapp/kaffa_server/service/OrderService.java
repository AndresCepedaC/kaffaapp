package kaffaapp.kaffa_server.service;

import kaffaapp.kaffa_server.dao.OrderDAO;
import kaffaapp.kaffa_server.exception.ResourceNotFoundException;
import kaffaapp.kaffa_server.model.ItemCart;
import kaffaapp.kaffa_server.model.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    private final OrderDAO orderDAO;
    private final PrinterService printerService;
    private final WhatsAppService whatsappService;

    public OrderService(OrderDAO orderDAO, PrinterService printerService, WhatsAppService whatsappService) {
        this.orderDAO = orderDAO;
        this.printerService = printerService;
        this.whatsappService = whatsappService;
    }

    /**
     * Creates an order in the DB and sends WhatsApp notification.
     * Printing is NO LONGER automatic — it's on-demand via separate endpoints.
     */
    public Order createOrder(Order order) {
        validateOrder(order);

        // Default status to PENDING
        order.setStatus("PENDING");

        Order created = orderDAO.insert(order);
        logger.info("Order #{} created successfully. Total: ${} Status: PENDING",
                created.getId(), created.getTotal());

        // Send WhatsApp notification (async, fire-and-forget)
        whatsappService.sendOrderNotification(created);

        return created;
    }

    // ─── On-Demand Printing ──────────────────────────────────────

    /**
     * Print only the Internal Pre-Factura for an order.
     */
    public boolean printInternal(int id) {
        Order order = orderDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Pedido con ID " + id + " no encontrado"));
        return printerService.printSingleTicket(order, "INTERNAL");
    }

    /**
     * Print only the Customer Factura for an order.
     */
    public boolean printCustomer(int id) {
        Order order = orderDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Pedido con ID " + id + " no encontrado"));
        return printerService.printSingleTicket(order, "CUSTOMER");
    }

    // ─── Dashboard operations ────────────────────────────────────

    public List<Order> getAllOrders() {
        return orderDAO.findAll();
    }

    public Order updateOrder(int id, Order updatedOrder) {
        Order existing = orderDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Pedido con ID " + id + " no encontrado"));

        validateOrder(updatedOrder);

        double subtotal = 0;
        for (ItemCart item : updatedOrder.getItems()) {
            subtotal += item.getProduct().getPrice() * item.getQuantity();
        }

        double percent = updatedOrder.getTipOrDiscountPercent() != null
                ? updatedOrder.getTipOrDiscountPercent()
                : 0.0;
        double total;
        if (updatedOrder.isTip()) {
            total = subtotal * (1 + percent / 100.0);
        } else {
            total = subtotal * (1 - percent / 100.0);
        }

        updatedOrder.setId(id);
        updatedOrder.setTotal(total);
        updatedOrder.setCreatedAt(existing.getCreatedAt());
        // Preserve payment state
        updatedOrder.setPaymentMethod(existing.getPaymentMethod());
        updatedOrder.setAmountCash(existing.getAmountCash());
        updatedOrder.setAmountBank(existing.getAmountBank());
        updatedOrder.setStatus(existing.getStatus());

        Order saved = orderDAO.update(updatedOrder);
        logger.info("Order #{} updated. New total: ${}", id, total);

        return saved;
    }

    public void deleteOrder(int id) {
        orderDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Pedido con ID " + id + " no encontrado"));
        orderDAO.deleteById(id);
        logger.info("Order #{} deleted successfully", id);
    }

    // ─── Validation ──────────────────────────────────────────────

    private void validateOrder(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new IllegalArgumentException("El pedido debe contener al menos un item");
        }
        for (ItemCart item : order.getItems()) {
            if (item.getProduct() == null) {
                throw new IllegalArgumentException("Cada item debe tener un producto asociado");
            }
            if (item.getQuantity() <= 0) {
                throw new IllegalArgumentException("La cantidad debe ser mayor a cero");
            }
        }
        if (order.getTipOrDiscountPercent() != null
                && (order.getTipOrDiscountPercent() < 0 || order.getTipOrDiscountPercent() > 100)) {
            throw new IllegalArgumentException("El porcentaje de propina/descuento debe estar entre 0 y 100");
        }
    }
}
