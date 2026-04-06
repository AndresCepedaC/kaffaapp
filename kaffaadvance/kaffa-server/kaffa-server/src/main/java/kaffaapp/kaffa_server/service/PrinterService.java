package kaffaapp.kaffa_server.service;

import kaffaapp.kaffa_server.model.ItemCart;
import kaffaapp.kaffa_server.model.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.print.*;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;

/**
 * Service responsible for printing order receipts (comandas) using the OS Spooler (CUPS/Windows).
 * It sends raw ESC/POS commands to the dedicated printer.
 *
 * Refined formatting:
 * - Notes only on INTERNAL ticket.
 * - Breakdown of Subtotal and Tip (10%).
 */
@Service
public class PrinterService {

    private static final Logger logger = LoggerFactory.getLogger(PrinterService.class);

    // ─── ESC/POS Command Constants ─────────────────────────────
    private static final byte[] ESC_INIT       = {0x1B, 0x40};                  // Initialize printer
    private static final byte[] ESC_ALIGN_CENTER = {0x1B, 0x61, 0x01};          // Center alignment
    private static final byte[] ESC_ALIGN_LEFT   = {0x1B, 0x61, 0x00};          // Left alignment
    private static final byte[] ESC_ALIGN_RIGHT  = {0x1B, 0x61, 0x02};          // Right alignment
    private static final byte[] ESC_BOLD_ON    = {0x1B, 0x45, 0x01};            // Bold ON
    private static final byte[] ESC_BOLD_OFF   = {0x1B, 0x45, 0x00};            // Bold OFF
    private static final byte[] ESC_DOUBLE_HEIGHT = {0x1B, 0x21, 0x10};         // Double height
    private static final byte[] ESC_DOUBLE_BOTH   = {0x1B, 0x21, 0x30};         // Double height+width
    private static final byte[] ESC_NORMAL     = {0x1B, 0x21, 0x00};            // Normal text
    private static final byte[] ESC_FEED_LINES = {0x1B, 0x64, 0x04};            // Feed 4 lines
    private static final byte[] GS_CUT_PARTIAL = {0x1D, 0x56, 0x01};            // Partial paper cut
    private static final byte[] ESC_BEEP       = {0x1B, 0x42, 0x03, 0x02};      // Beep 3 times
    private static final byte[] LF             = {0x0A};                         // Line feed

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    @Value("${kaffa.printer.enabled:true}")
    private boolean printerEnabled;

    @Value("${kaffa.printer.name:digitalpos}")
    private String printerName;

    @Value("${kaffa.printer.paper-width:32}")
    private int paperWidth;

    /**
     * Prints both Internal and Customer receipts asynchronously.
     */
    @Async
    public void printOrderAsync(Order order) {
        if (!printerEnabled) {
            logger.info("Printer disabled. Skipping print for Order #{}", order.getId());
            return;
        }
        try {
            byte[] combinedTicket = buildCombinedReceipts(order);
            sendToSpooler(combinedTicket);
            logger.info("✅ Double ticket sent to spooler for Order #{}", order.getId());
        } catch (Exception e) {
            logger.warn("⚠️ Could not print ticket for Order #{}: {}", order.getId(), e.getMessage());
        }
    }

    /**
     * Synchronous print attempt for both receipts.
     */
    public boolean printOrder(Order order) {
        if (!printerEnabled) {
            logger.info("Printer disabled. Skipping print for Order #{}", order.getId());
            return false;
        }
        try {
            byte[] combinedTicket = buildCombinedReceipts(order);
            sendToSpooler(combinedTicket);
            logger.info("✅ Double ticket sent to spooler for Order #{}", order.getId());
            return true;
        } catch (Exception e) {
            logger.warn("⚠️ Could not print ticket for Order #{}: {}", order.getId(), e.getMessage());
            return false;
        }
    }

    /**
     * Builds both receipts into a single byte array with a cut in between.
     */
    private byte[] buildCombinedReceipts(Order order) throws Exception {
        ByteArrayOutputStream combined = new ByteArrayOutputStream();
        
        // 1. Internal Receipt
        combined.write(buildTicket(order, "INTERNAL"));
        
        // 2. Customer Receipt
        combined.write(buildTicket(order, "CUSTOMER"));
        
        return combined.toByteArray();
    }

    /**
     * Ticket Builder for specific types.
     */
    private byte[] buildTicket(Order order, String ticketType) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        // Initialize
        out.write(ESC_INIT);

        // ─── Header ───
        out.write(ESC_ALIGN_CENTER);
        
        if ("INTERNAL".equalsIgnoreCase(ticketType)) {
            out.write(ESC_DOUBLE_BOTH);
            out.write(ESC_BOLD_ON);
            writeLine(out, "PRE FACTURA");
            out.write(ESC_NORMAL);
            out.write(ESC_BOLD_OFF);
            writeLine(out, "KAFFA LA ALDEA");
        } else {
            out.write(ESC_DOUBLE_BOTH);
            out.write(ESC_BOLD_ON);
            writeLine(out, "KAFFA LA ALDEA");
            out.write(ESC_NORMAL);
            out.write(ESC_BOLD_OFF);
            writeLine(out, "Nit. 66962290-7");
            writeLine(out, "Carrera 15 No 3-46, WhatsApp 3113151012");
            writeLine(out, "Circasia Quindío");
        }
        
        writeLine(out, repeat('=', paperWidth));

        // ─── Order Info ───
        out.write(ESC_ALIGN_CENTER);
        out.write(ESC_BOLD_ON);
        writeLine(out, "ORDEN #" + order.getId());
        out.write(ESC_NORMAL);
        out.write(ESC_BOLD_OFF);

        if (order.getCreatedAt() != null) {
            writeLine(out, order.getCreatedAt().format(DATE_FMT));
        }

        writeLine(out, repeat('-', paperWidth));

        // ─── Items ───
        out.write(ESC_ALIGN_LEFT);
        out.write(ESC_BOLD_ON);
        writeLine(out, padRight("CANT  DESCRIPCIÓN", paperWidth - 10) + padLeft("PRECIO", 10));
        out.write(ESC_BOLD_OFF);
        writeLine(out, repeat('-', paperWidth));

        double subtotal = 0;
        if (order.getItems() != null) {
            for (ItemCart item : order.getItems()) {
                String qty = String.valueOf(item.getQuantity());
                String name = item.getProduct().getName();
                double itemPrice = item.getProduct().getPrice();
                double lineTotal = itemPrice * item.getQuantity();
                subtotal += lineTotal;
                String priceStr = "$" + formatMoney(lineTotal);

                String leftPart = padRight(qty + "x", 5) + name;
                int maxLeft = paperWidth - priceStr.length() - 1;
                if (leftPart.length() > maxLeft) {
                    leftPart = leftPart.substring(0, maxLeft);
                }
                writeLine(out, padRight(leftPart, paperWidth - priceStr.length()) + priceStr);
            }
        }

        // ─── Isolation: Order Notes (Only INTERNAL) ───
        if ("INTERNAL".equalsIgnoreCase(ticketType) && order.getNotes() != null && !order.getNotes().isBlank()) {
            writeLine(out, "");
            out.write(ESC_BOLD_ON);
            writeLine(out, "NOTA: " + order.getNotes().toUpperCase());
            out.write(ESC_BOLD_OFF);
        }

        writeLine(out, repeat('-', paperWidth));

        // ─── Totals Section ───
        out.write(ESC_ALIGN_RIGHT);
        
        // Subtotal Line
        String subtotalLabel = "Subtotal:";
        String subtotalVal = "$" + formatMoney(subtotal);
        writeLine(out, padRight(subtotalLabel, paperWidth - subtotalVal.length()) + subtotalVal);

        // Tip Line
        if (order.getTipOrDiscountPercent() != null && order.getTipOrDiscountPercent() > 0 && order.isTip()) {
            double tipVal = subtotal * order.getTipOrDiscountPercent() / 100.0;
            String tipLabel = "Propina (" + order.getTipOrDiscountPercent().intValue() + "%):";
            String tipValStr = "$" + formatMoney(tipVal);
            writeLine(out, padRight(tipLabel, paperWidth - tipValStr.length()) + tipValStr);
        } else if (order.getTipOrDiscountPercent() != null && order.getTipOrDiscountPercent() > 0 && !order.isTip()) {
            // Discount Line (Optional but keeps mathematical consistency)
            double discVal = subtotal * order.getTipOrDiscountPercent() / 100.0;
            String discLabel = "Descuento (" + order.getTipOrDiscountPercent().intValue() + "%):";
            String discValStr = "-$" + formatMoney(discVal);
            writeLine(out, padRight(discLabel, paperWidth - discValStr.length()) + discValStr);
        }

        writeLine(out, repeat('-', paperWidth));

        // TOTAL Line
        out.write(ESC_BOLD_ON);
        out.write(ESC_DOUBLE_HEIGHT);
        String totalLabel = "TOTAL:";
        String totalVal = "$" + formatMoney(order.getTotal());
        writeLine(out, padRight(totalLabel, paperWidth - totalVal.length()) + totalVal);
        out.write(ESC_NORMAL);
        out.write(ESC_BOLD_OFF);

        // ─── Footer ───
        out.write(ESC_ALIGN_CENTER);
        writeLine(out, repeat('-', paperWidth));
        
        if ("CUSTOMER".equalsIgnoreCase(ticketType)) {
            writeLine(out, "gracias por tu compra");
            writeLine(out, "instagram: @kaffa.laaldea");
        } else {
            writeLine(out, "CONTROL INTERNO");
        }
        
        writeLine(out, "");

        // Feed, Cut and Beep
        out.write(ESC_FEED_LINES);
        out.write(GS_CUT_PARTIAL);
        if ("CUSTOMER".equalsIgnoreCase(ticketType)) {
            out.write(ESC_BEEP);
        }

        return out.toByteArray();
    }

    private void sendToSpooler(byte[] data) throws Exception {
        PrintService printService = findPrintService(printerName);
        if (printService == null) {
            logger.error("❌ Printer '{}' NOT found in the system (CUPS). Check the name.", printerName);
            return;
        }

        DocFlavor flavor = DocFlavor.BYTE_ARRAY.AUTOSENSE;
        Doc doc = new SimpleDoc(data, flavor, null);
        DocPrintJob job = printService.createPrintJob();

        job.print(doc, null);
    }

    private PrintService findPrintService(String name) {
        PrintService[] printServices = PrintServiceLookup.lookupPrintServices(null, null);
        for (PrintService service : printServices) {
            if (service.getName().equalsIgnoreCase(name)) {
                return service;
            }
        }
        return null;
    }

    private void writeLine(ByteArrayOutputStream out, String text) throws Exception {
        out.write(text.getBytes(StandardCharsets.UTF_8));
        out.write(LF);
    }

    private String repeat(char c, int count) {
        return String.valueOf(c).repeat(Math.max(0, count));
    }

    private String padRight(String text, int width) {
        if (text.length() >= width) return text.substring(0, width);
        return text + " ".repeat(width - text.length());
    }

    private String padLeft(String text, int width) {
        if (text.length() >= width) return text.substring(0, width);
        return " ".repeat(width - text.length()) + text;
    }

    private String formatMoney(double amount) {
        return String.format("%,.0f", amount);
    }
}
