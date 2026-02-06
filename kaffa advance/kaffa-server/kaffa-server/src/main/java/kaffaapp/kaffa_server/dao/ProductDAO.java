package kaffaapp.kaffa_server.dao;

import kaffaapp.kaffa_server.model.Category;
import kaffaapp.kaffa_server.model.Product;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Component
public class ProductDAO {

    private final DataSource dataSource;

    public ProductDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    private Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }

    public void createTableIfNotExists() throws SQLException {
        String sql = """
            CREATE TABLE IF NOT EXISTS product (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                category_id INTEGER,
                active INTEGER DEFAULT 1
            )
            """;
        try (Connection c = getConnection();
             Statement st = c.createStatement()) {
            st.execute(sql);
        }
    }

    public boolean isEmpty() throws SQLException {
        String sql = "SELECT COUNT(*) FROM product";
        try (Connection c = getConnection();
             Statement st = c.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            return rs.next() && rs.getInt(1) == 0;
        }
    }

    public void insertRaw(String name, String description, double price) throws SQLException {
        String sql = "INSERT INTO product(name, description, price, category_id, active) VALUES(?,?,?,?,1)";
        try (Connection c = getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, name);
            ps.setString(2, description);
            ps.setDouble(3, price);
            ps.setInt(4, 0);
            ps.executeUpdate();
        }
    }

    public List<Product> findAll() throws SQLException {
        List<Product> list = new ArrayList<>();
        String sql = "SELECT id, name, description, price, category_id, active FROM product";
        try (Connection c = getConnection();
             Statement st = c.createStatement();
             ResultSet rs = st.executeQuery(sql)) {

            while (rs.next()) {
                Category cat = new Category();
                cat.setId(rs.getInt("category_id"));
                Product p = new Product(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("description"),
                        rs.getDouble("price"),
                        cat,
                        rs.getInt("active") == 1
                );
                list.add(p);
            }
        }
        return list;
    }
    public Product insert(Product product) throws SQLException {
        String sql = "INSERT INTO product(name, description, price, category_id, active) VALUES(?,?,?,?,?)";
        try (Connection c = getConnection();
             PreparedStatement ps = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, product.getName());
            ps.setString(2, product.getDescription());
            ps.setDouble(3, product.getPrice());
            ps.setInt(4, product.getCategory() != null ? product.getCategory().getId() : 0);
            ps.setInt(5, product.isActive() ? 1 : 0);

            ps.executeUpdate();

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    product.setId(rs.getInt(1));
                }
            }
        }
        return product;
    }

    public Product update(Product product) throws SQLException {
        String sql = "UPDATE product SET name = ?, description = ?, price = ?, category_id = ?, active = ? WHERE id = ?";
        try (Connection c = getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {

            ps.setString(1, product.getName());
            ps.setString(2, product.getDescription());
            ps.setDouble(3, product.getPrice());
            ps.setInt(4, product.getCategory() != null ? product.getCategory().getId() : 0);
            ps.setInt(5, product.isActive() ? 1 : 0);
            ps.setInt(6, product.getId());

            ps.executeUpdate();
        }
        return product;
    }

    public void delete(int id) throws SQLException {
        String sql = "DELETE FROM product WHERE id = ?";
        try (Connection c = getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {

            ps.setInt(1, id);
            ps.executeUpdate();
        }
    }

}
