package kaffaapp.kaffa_server.service;

import kaffaapp.kaffa_server.model.ItemCart;
import kaffaapp.kaffa_server.model.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class WhatsAppService {

    private static final Logger logger = LoggerFactory.getLogger(WhatsAppService.class);
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    @Value("${kaffa.whatsapp.chat.id}")
    private String chatId;

    @Value("${kaffa.whatsapp.bot.url}")
    private String botUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Async
    public void sendOrderNotification(Order order) {
        if (chatId == null || chatId.isEmpty() || chatId.equals("123456789@g.us")) {
            logger.warn("⚠️ No valid WhatsApp chat ID configured. Skipping notification for Order #{}", order.getId());
            return;
        }

        try {
            String message = buildWhatsAppMessage(order);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("chatId", chatId);
            requestBody.put("message", message);
            
            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
            
            restTemplate.postForObject(botUrl, request, String.class);
            logger.info("✅ WhatsApp notification sent to group {} for Order #{}", chatId, order.getId());
        } catch (Exception e) {
            logger.error("❌ Failed to send WhatsApp notification for Order #{}: {}", order.getId(), e.getMessage());
        }
    }

    private String buildWhatsAppMessage(Order order) {
        StringBuilder sb = new StringBuilder();
        
        sb.append("*☕ NUEVO PEDIDO - KAFFA LA ALDEA*\n");
        sb.append("Orden #").append(order.getId()).append(" - Fecha: ");
        sb.append(order.getCreatedAt() != null ? order.getCreatedAt().format(TIME_FMT) : "N/A").append("\n\n");
        
        double subtotal = 0;
        if (order.getItems() != null) {
            for (ItemCart item : order.getItems()) {
                double lineTotal = item.getProduct().getPrice() * item.getQuantity();
                subtotal += lineTotal;
                sb.append(item.getQuantity()).append("x ")
                  .append(item.getProduct().getName())
                  .append(" - $").append(formatMoney(lineTotal)).append("\n");
            }
        }
        
        sb.append("-------------------\n");
        
        sb.append("*Subtotal:        $ ").append(formatMoney(subtotal)).append("*\n");
        
        if (order.getTipOrDiscountPercent() != null && order.getTipOrDiscountPercent() > 0 && order.isTip()) {
            double tipVal = subtotal * order.getTipOrDiscountPercent() / 100.0;
            sb.append("*Propina (").append(order.getTipOrDiscountPercent().intValue()).append("%):  $ ").append(formatMoney(tipVal)).append("*\n");
        }
        
        sb.append("*TOTAL:           $ ").append(formatMoney(order.getTotal())).append("*\n\n");
        
        if (order.getNotes() != null && !order.getNotes().isBlank()) {
            sb.append("*📝 NOTA PARA COCINA:* ").append(order.getNotes()).append("\n");
        }
        
        return sb.toString();
    }
    
    private String formatMoney(double amount) {
        return String.format("%,.0f", amount);
    }
}
