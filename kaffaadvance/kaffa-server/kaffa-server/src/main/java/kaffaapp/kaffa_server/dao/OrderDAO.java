package kaffaapp.kaffa_server.dao;

import kaffaapp.kaffa_server.model.ItemCart;
import kaffaapp.kaffa_server.model.Order;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDateTime;

@Component
public class OrderDAO {

    private final DataSource dataSource;

    public OrderDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    private Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }

    public void createTableIfNotExists() throws SQLException {
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
        try (Connection c = getConnection();
             Statement st = c.createStatement()) {
            st.execute(sqlOrders);
            st.execute(sqlItems);
        }
    }

    public Order insert(Order order) throws SQLException {
        // calcular subtotal desde items
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

        String sqlOrder = """
            INSERT INTO orders(created_at, total, notes,
                               tip_or_discount_percent, is_tip)
            VALUES(?,?,?,?,?)
            """;
        String sqlItem = """
            INSERT INTO order_items(order_id, product_id, quantity, unit_price)
            VALUES(?,?,?,?)
            """;

        try (Connection c = getConnection()) {
            c.setAutoCommit(false);

            try (PreparedStatement psOrder =
                         c.prepareStatement(sqlOrder, Statement.RETURN_GENERATED_KEYS)) {
                psOrder.setString(1, order.getCreatedAt().toString());
                psOrder.setDouble(2, order.getTotal());
                psOrder.setString(3, order.getNotes());
                psOrder.setDouble(4, percent);
                psOrder.setInt(5, order.isTip() ? 1 : 0);
                psOrder.executeUpdate();

                try (ResultSet rs = psOrder.getGeneratedKeys()) {
                    if (rs.next()) {
                        order.setId(rs.getInt(1));
                    }
                }
            }

            try (PreparedStatement psItem = c.prepareStatement(sqlItem)) {
                for (ItemCart item : order.getItems()) {
                    psItem.setInt(1, order.getId());
                    psItem.setInt(2, item.getProduct().getId());
                    psItem.setInt(3, item.getQuantity());
                    psItem.setDouble(4, item.getProduct().getPrice());
                    psItem.addBatch();
                }
                psItem.executeBatch();
            }

            c.commit();
        }

        return order;
    }
}
