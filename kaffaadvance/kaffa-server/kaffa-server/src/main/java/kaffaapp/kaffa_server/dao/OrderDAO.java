package kaffaapp.kaffa_server.dao;

import kaffaapp.kaffa_server.model.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.*;

@Repository
public class OrderDAO {

    private final JdbcTemplate jdbcTemplate;

    public OrderDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void createTableIfNotExists() {
        String sqlOrders = """
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT,
                total REAL,
                notes TEXT,
                tip_or_discount_percent REAL,
                is_tip INTEGER
            )
            """;
        String sqlItems = """
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                unit_price REAL NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id)
            )
            """;
        jdbcTemplate.execute(sqlOrders);
        jdbcTemplate.execute(sqlItems);

        // ─── Migration: Add payment columns if they don't exist ─────
        safeAddColumn("orders", "payment_method", "TEXT");
        safeAddColumn("orders", "amount_cash", "REAL DEFAULT 0");
        safeAddColumn("orders", "amount_bank", "REAL DEFAULT 0");
        safeAddColumn("orders", "status", "TEXT DEFAULT 'PENDING'");
    }

    private void safeAddColumn(String table, String column, String type) {
        try {
            jdbcTemplate.execute("ALTER TABLE " + table + " ADD COLUMN " + column + " " + type);
        } catch (Exception ignored) {
            // Column already exists — SQLite throws error on duplicate ALTER TABLE
        }
    }

    @Transactional
    public Order insert(Order order) {
        // Calculate subtotal from items
        double subtotal = 0;
        for (ItemCart item : order.getItems()) {
            subtotal += item.getProduct().getPrice() * item.getQuantity();
        }

        double percent = order.getTipOrDiscountPercent() != null
                ? order.getTipOrDiscountPercent()
                : 0.0;
        double total;
        if (order.isTip()) {
            total = subtotal * (1 + percent / 100.0);
        } else {
            total = subtotal * (1 - percent / 100.0);
        }
        order.setTotal(total);
        order.setCreatedAt(LocalDateTime.now());

        // Default status to PENDING if not set
        if (order.getStatus() == null) {
            order.setStatus("PENDING");
        }

        String sqlOrder = """
            INSERT INTO orders(created_at, total, notes,
                               tip_or_discount_percent, is_tip,
                               payment_method, amount_cash, amount_bank, status)
            VALUES(?,?,?,?,?,?,?,?,?)
            """;
        String sqlItem = """
            INSERT INTO order_items(order_id, product_id, quantity, unit_price)
            VALUES(?,?,?,?)
            """;

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sqlOrder, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, order.getCreatedAt().toString());
            ps.setDouble(2, order.getTotal());
            ps.setString(3, order.getNotes());
            ps.setDouble(4, percent);
            ps.setInt(5, order.isTip() ? 1 : 0);
            ps.setString(6, order.getPaymentMethod());
            ps.setDouble(7, order.getAmountCash() != null ? order.getAmountCash() : 0.0);
            ps.setDouble(8, order.getAmountBank() != null ? order.getAmountBank() : 0.0);
            ps.setString(9, order.getStatus());
            return ps;
        }, keyHolder);

        if (keyHolder.getKey() != null) {
            order.setId(keyHolder.getKey().intValue());
        }

        jdbcTemplate.batchUpdate(sqlItem, order.getItems(), order.getItems().size(),
                (PreparedStatement ps, ItemCart item) -> {
                    ps.setInt(1, order.getId());
                    ps.setInt(2, item.getProduct().getId());
                    ps.setInt(3, item.getQuantity());
                    ps.setDouble(4, item.getProduct().getPrice());
                });

        return order;
    }

    // ─── List all orders with items ──────────────────────────────

    public List<Order> findAll() {
        String sql = buildSelectSql(null);
        return hydrateOrders(sql);
    }

    public Optional<Order> findById(int id) {
        String sql = buildSelectSql("o.id = ?");
        List<Order> orders = hydrateOrders(sql, id);
        return orders.isEmpty() ? Optional.empty() : Optional.of(orders.get(0));
    }

    @Transactional
    public Order update(Order order) {
        String sqlUpdateOrder = """
            UPDATE orders SET total = ?, notes = ?,
                              tip_or_discount_percent = ?, is_tip = ?,
                              payment_method = ?, amount_cash = ?, amount_bank = ?, status = ?
            WHERE id = ?
            """;
        jdbcTemplate.update(sqlUpdateOrder,
                order.getTotal(),
                order.getNotes(),
                order.getTipOrDiscountPercent() != null ? order.getTipOrDiscountPercent() : 0.0,
                order.isTip() ? 1 : 0,
                order.getPaymentMethod(),
                order.getAmountCash() != null ? order.getAmountCash() : 0.0,
                order.getAmountBank() != null ? order.getAmountBank() : 0.0,
                order.getStatus(),
                order.getId());

        // Delete old items and re-insert
        jdbcTemplate.update("DELETE FROM order_items WHERE order_id = ?", order.getId());

        String sqlItem = """
            INSERT INTO order_items(order_id, product_id, quantity, unit_price)
            VALUES(?,?,?,?)
            """;
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            jdbcTemplate.batchUpdate(sqlItem, order.getItems(), order.getItems().size(),
                    (PreparedStatement ps, ItemCart item) -> {
                        ps.setInt(1, order.getId());
                        ps.setInt(2, item.getProduct().getId());
                        ps.setInt(3, item.getQuantity());
                        ps.setDouble(4, item.getProduct().getPrice());
                    });
        }

        return order;
    }

    /**
     * Updates only the payment fields (no items touched).
     */
    @Transactional
    public void updatePayment(Order order) {
        String sql = """
            UPDATE orders SET payment_method = ?, amount_cash = ?, amount_bank = ?, status = ?
            WHERE id = ?
            """;
        jdbcTemplate.update(sql,
                order.getPaymentMethod(),
                order.getAmountCash() != null ? order.getAmountCash() : 0.0,
                order.getAmountBank() != null ? order.getAmountBank() : 0.0,
                order.getStatus(),
                order.getId());
    }

    @Transactional
    public void deleteById(int id) {
        jdbcTemplate.update("DELETE FROM order_items WHERE order_id = ?", id);
        jdbcTemplate.update("DELETE FROM orders WHERE id = ?", id);
    }

    // ─── Daily Summary ───────────────────────────────────────────

    public DailyClosing getDailySummary(String date) {
        String sql = """
            SELECT COUNT(*) as order_count,
                   COALESCE(SUM(amount_cash), 0) as total_cash,
                   COALESCE(SUM(amount_bank), 0) as total_bank,
                   COALESCE(SUM(total), 0) as grand_total
            FROM orders
            WHERE status = 'PAID'
              AND DATE(created_at) = ?
            """;
        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
            DailyClosing dc = new DailyClosing();
            dc.setDate(date);
            dc.setOrderCount(rs.getInt("order_count"));
            dc.setTotalCash(rs.getDouble("total_cash"));
            dc.setTotalBank(rs.getDouble("total_bank"));
            dc.setGrandTotal(rs.getDouble("grand_total"));
            return dc;
        }, date);
    }

    /**
     * Aggregated daily closings for every day in a given month (YYYY-MM).
     */
    public List<DailyClosing> getMonthlySummary(String yearMonth) {
        String sql = """
            SELECT DATE(created_at) as closing_date,
                   COUNT(*) as order_count,
                   COALESCE(SUM(amount_cash), 0) as total_cash,
                   COALESCE(SUM(amount_bank), 0) as total_bank,
                   COALESCE(SUM(total), 0) as grand_total
            FROM orders
            WHERE status = 'PAID'
              AND strftime('%Y-%m', created_at) = ?
            GROUP BY DATE(created_at)
            ORDER BY closing_date ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            DailyClosing dc = new DailyClosing();
            dc.setDate(rs.getString("closing_date"));
            dc.setOrderCount(rs.getInt("order_count"));
            dc.setTotalCash(rs.getDouble("total_cash"));
            dc.setTotalBank(rs.getDouble("total_bank"));
            dc.setGrandTotal(rs.getDouble("grand_total"));
            return dc;
        }, yearMonth);
    }

    // ─── Private helpers ─────────────────────────────────────────

    private String buildSelectSql(String whereClause) {
        String base = """
            SELECT o.id AS order_id, o.created_at, o.total, o.notes,
                   o.tip_or_discount_percent, o.is_tip,
                   o.payment_method, o.amount_cash, o.amount_bank, o.status,
                   oi.id AS item_id, oi.product_id, oi.quantity, oi.unit_price,
                   p.name AS product_name, p.description AS product_desc,
                   p.price AS product_price, p.active AS product_active,
                   p.image_url AS product_image,
                   c.id AS category_id, c.name AS category_name, c.description AS category_desc
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN product p ON oi.product_id = p.id
            LEFT JOIN category c ON p.category_id = c.id
            """;
        if (whereClause != null) {
            base += " WHERE " + whereClause;
        }
        base += " ORDER BY o.created_at DESC, o.id DESC";
        return base;
    }

    private List<Order> hydrateOrders(String sql, Object... args) {
        Map<Integer, Order> orderMap = new LinkedHashMap<>();

        jdbcTemplate.query(sql, (rs) -> {
            int orderId = rs.getInt("order_id");

            Order order = orderMap.get(orderId);
            if (order == null) {
                order = new Order();
                order.setId(orderId);
                String createdAtStr = rs.getString("created_at");
                if (createdAtStr != null) {
                    order.setCreatedAt(LocalDateTime.parse(createdAtStr));
                }
                order.setTotal(rs.getDouble("total"));
                order.setNotes(rs.getString("notes"));
                double tipPercent = rs.getDouble("tip_or_discount_percent");
                order.setTipOrDiscountPercent(tipPercent);
                order.setTip(rs.getInt("is_tip") == 1);
                // Payment fields
                order.setPaymentMethod(rs.getString("payment_method"));
                order.setAmountCash(rs.getDouble("amount_cash"));
                order.setAmountBank(rs.getDouble("amount_bank"));
                order.setStatus(rs.getString("status"));
                order.setItems(new ArrayList<>());
                orderMap.put(orderId, order);
            }

            int itemId = rs.getInt("item_id");
            if (!rs.wasNull() && itemId > 0) {
                Product product = new Product();
                product.setId(rs.getInt("product_id"));
                product.setName(rs.getString("product_name"));
                product.setDescription(rs.getString("product_desc"));
                product.setPrice(rs.getDouble("product_price"));
                product.setActive(rs.getInt("product_active") == 1);
                product.setImageUrl(rs.getString("product_image"));

                int catId = rs.getInt("category_id");
                if (!rs.wasNull() && catId > 0) {
                    Category cat = new Category();
                    cat.setId(catId);
                    cat.setName(rs.getString("category_name"));
                    cat.setDescription(rs.getString("category_desc"));
                    product.setCategory(cat);
                }

                ItemCart item = new ItemCart(product, rs.getInt("quantity"));
                order.getItems().add(item);
            }
        }, args);

        return new ArrayList<>(orderMap.values());
    }
}
