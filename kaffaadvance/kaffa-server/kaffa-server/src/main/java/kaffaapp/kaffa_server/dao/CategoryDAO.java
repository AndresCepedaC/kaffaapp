package kaffaapp.kaffa_server.dao;

import kaffaapp.kaffa_server.model.Category;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Component
public class CategoryDAO {

    private final DataSource dataSource;

    public CategoryDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    private Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }

    public void createTableIfNotExists() throws SQLException {
        String sql = """
                CREATE TABLE IF NOT EXISTS category (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT
                )
                """;
        try (Connection c = getConnection();
                Statement st = c.createStatement()) {
            st.execute(sql);
        }
    }

    public List<Category> findAll() throws SQLException {
        List<Category> list = new ArrayList<>();
        String sql = "SELECT id, name, description FROM category";
        try (Connection c = getConnection();
                Statement st = c.createStatement();
                ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) {
                list.add(new Category(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("description")));
            }
        }
        return list;
    }

    public Category findById(int id) throws SQLException {
        String sql = "SELECT id, name, description FROM category WHERE id = ?";
        try (Connection c = getConnection();
                PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new Category(
                            rs.getInt("id"),
                            rs.getString("name"),
                            rs.getString("description"));
                }
            }
        }
        return null;
    }

    public Category insert(Category category) throws SQLException {
        String sql = "INSERT INTO category(name, description) VALUES(?,?)";
        try (Connection c = getConnection();
                PreparedStatement ps = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, category.getName());
            ps.setString(2, category.getDescription());
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    category.setId(rs.getInt(1));
                }
            }
        }
        return category;
    }

    public void update(Category category) throws SQLException {
        String sql = "UPDATE category SET name = ?, description = ? WHERE id = ?";
        try (Connection c = getConnection();
                PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, category.getName());
            ps.setString(2, category.getDescription());
            ps.setInt(3, category.getId());
            ps.executeUpdate();
        }
    }

    public void delete(int id) throws SQLException {
        String sql = "DELETE FROM category WHERE id = ?";
        try (Connection c = getConnection();
                PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.executeUpdate();
        }
    }

    public boolean isEmpty() throws SQLException {
        String sql = "SELECT COUNT(*) FROM category";
        try (Connection c = getConnection();
                Statement st = c.createStatement();
                ResultSet rs = st.executeQuery(sql)) {
            return rs.next() && rs.getInt(1) == 0;
        }
    }
}
