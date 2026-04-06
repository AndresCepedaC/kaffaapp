package kaffaapp.kaffa_server.service;

import kaffaapp.kaffa_server.dao.OrderDAO;
import kaffaapp.kaffa_server.model.ItemCart;
import kaffaapp.kaffa_server.model.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.sql.SQLException;

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
     * Creates an order in the DB and attempts to print the receipt.
     * Returns an OrderResult containing the order and printer status.
     * Printer failure NEVER prevents order creation.
     */
    public OrderResult createOrder(Order order) {
        validateOrder(order);
        try {
            Order created = orderDAO.insert(order);
            logger.info("Order #{} created successfully. Total: ${}", created.getId(), created.getTotal());

            // Send WhatsApp notification
            whatsappService.sendOrderNotification(created);

            // Print receipt - synchronous but non-blocking on failure
            boolean printed = false;
            try {
                printed = printerService.printOrder(created);
            } catch (Exception e) {
                logger.warn("Printer failed for Order #{}: {}", created.getId(), e.getMessage());
            }

            return new OrderResult(created, printed);
        } catch (SQLException e) {
            logger.error("Error creating order: {}", e.getMessage(), e);
            throw new RuntimeException("No se pudo crear el pedido", e);
        }
    }

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

    /**
     * Encapsulates the result of order creation including printer status.
     */
    public static class OrderResult {
        private final Order order;
        private final boolean printed;

        public OrderResult(Order order, boolean printed) {
            this.order = order;
            this.printed = printed;
        }

        public Order getOrder() { return order; }
        public boolean isPrinted() { return printed; }
    }
}
