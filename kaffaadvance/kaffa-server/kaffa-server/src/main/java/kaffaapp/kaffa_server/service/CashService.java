package kaffaapp.kaffa_server.service;

import kaffaapp.kaffa_server.dao.OrderDAO;
import kaffaapp.kaffa_server.exception.ResourceNotFoundException;
import kaffaapp.kaffa_server.model.DailyClosing;
import kaffaapp.kaffa_server.model.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class CashService {

    private static final Logger logger = LoggerFactory.getLogger(CashService.class);

    private final OrderDAO orderDAO;

    public CashService(OrderDAO orderDAO) {
        this.orderDAO = orderDAO;
    }

    /**
     * Processes payment for an order.
     */
    public Order processPayment(int orderId, String method, Double amountCash, Double amountBank) {
        Order order = orderDAO.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Pedido con ID " + orderId + " no encontrado"));

        if ("PAID".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalArgumentException("El pedido #" + orderId + " ya fue pagado");
        }

        double total = order.getTotal();

        switch (method.toUpperCase()) {
            case "CASH":
                order.setAmountCash(total);
                order.setAmountBank(0.0);
                break;
            case "BANK":
                order.setAmountCash(0.0);
                order.setAmountBank(total);
                break;
            case "SPLIT":
                if (amountCash == null || amountBank == null) {
                    throw new IllegalArgumentException(
                            "Para pago dividido, se requieren ambos montos (efectivo y banco)");
                }
                double splitTotal = amountCash + amountBank;
                if (Math.abs(splitTotal - total) > 1.0) {
                    throw new IllegalArgumentException(
                            String.format("Los montos divididos ($%,.0f + $%,.0f = $%,.0f) no coinciden con el total ($%,.0f)",
                                    amountCash, amountBank, splitTotal, total));
                }
                order.setAmountCash(amountCash);
                order.setAmountBank(amountBank);
                break;
            default:
                throw new IllegalArgumentException("Método de pago no válido: " + method
                        + ". Use CASH, BANK o SPLIT");
        }

        order.setPaymentMethod(method.toUpperCase());
        order.setStatus("PAID");

        orderDAO.updatePayment(order);
        logger.info("Order #{} marked PAID via {} (Cash: ${}, Bank: ${})",
                orderId, method, order.getAmountCash(), order.getAmountBank());

        return order;
    }

    /**
     * Gets the daily cash register summary for a given date.
     */
    public DailyClosing getDailyClosing(String date) {
        if (date == null || date.isBlank()) {
            date = LocalDate.now().toString();
        }
        return orderDAO.getDailySummary(date);
    }

    /**
     * Gets daily closings for each day in a given month.
     * @param yearMonth e.g. "2026-04"
     */
    public List<DailyClosing> getMonthlyClosings(String yearMonth) {
        if (yearMonth == null || yearMonth.isBlank()) {
            yearMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        }
        return orderDAO.getMonthlySummary(yearMonth);
    }

    /**
     * Generates a UTF-8 CSV (with BOM for Excel) containing the monthly financial report.
     */
    public String generateMonthlyCsv(String yearMonth) {
        if (yearMonth == null || yearMonth.isBlank()) {
            yearMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        }

        List<DailyClosing> closings = orderDAO.getMonthlySummary(yearMonth);

        StringBuilder csv = new StringBuilder();
        // UTF-8 BOM for Excel compatibility
        csv.append('\uFEFF');

        // Header
        csv.append("Fecha,Total Efectivo,Total Banco,Cantidad Pedidos,Total General\n");

        double sumCash = 0, sumBank = 0, sumTotal = 0;
        int sumOrders = 0;

        for (DailyClosing dc : closings) {
            csv.append(dc.getDate()).append(',');
            csv.append(String.format("%.0f", dc.getTotalCash())).append(',');
            csv.append(String.format("%.0f", dc.getTotalBank())).append(',');
            csv.append(dc.getOrderCount()).append(',');
            csv.append(String.format("%.0f", dc.getGrandTotal())).append('\n');

            sumCash += dc.getTotalCash();
            sumBank += dc.getTotalBank();
            sumTotal += dc.getGrandTotal();
            sumOrders += dc.getOrderCount();
        }

        // Totals row
        csv.append("TOTAL MES,");
        csv.append(String.format("%.0f", sumCash)).append(',');
        csv.append(String.format("%.0f", sumBank)).append(',');
        csv.append(sumOrders).append(',');
        csv.append(String.format("%.0f", sumTotal)).append('\n');

        logger.info("Generated monthly CSV for {} ({} days, {} orders)",
                yearMonth, closings.size(), sumOrders);

        return csv.toString();
    }
}

