package kaffaapp.kaffa_server.dao;

import kaffaapp.kaffa_server.model.Category;
import kaffaapp.kaffa_server.model.Product;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

@Repository
public class ProductDAO {

    private final JdbcTemplate jdbcTemplate;

    public ProductDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Product> rowMapper = (rs, rowNum) -> {
        Category cat = null;
        int catId = rs.getInt("category_id");
        if (catId > 0) {
            cat = new Category();
            cat.setId(catId);
            cat.setName(rs.getString("category_name"));
            cat.setDescription(rs.getString("category_desc"));
        }

        return new Product(
                rs.getInt("id"),
                rs.getString("name"),
                rs.getString("description"),
                rs.getDouble("price"),
                cat,
                rs.getInt("active") == 1,
                rs.getString("image_url")
        );
    };

    public void createTableIfNotExists() {
        String sql = """
                CREATE TABLE IF NOT EXISTS product (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    price REAL NOT NULL,
                    category_id INTEGER,
                    active INTEGER DEFAULT 1,
                    image_url TEXT
                )
                """;
        jdbcTemplate.execute(sql);
    }

    public boolean isEmpty() {
        String sql = "SELECT COUNT(*) FROM product";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
        return count != null && count == 0;
    }

    public void insertRaw(String name, String description, double price, int categoryId, String imageUrl) {
        String sql = "INSERT INTO product(name, description, price, category_id, active, image_url) VALUES(?,?,?,?,1,?)";
        jdbcTemplate.update(sql, name, description, price, categoryId, imageUrl);
    }

    public List<Product> findAll() {
        String sql = """
                SELECT p.id, p.name, p.description, p.price, p.category_id, p.active, p.image_url,
                       c.name as category_name, c.description as category_desc
                FROM product p
                LEFT JOIN category c ON p.category_id = c.id
                """;
        return jdbcTemplate.query(sql, rowMapper);
    }

    public Product insert(Product product) {
        String sql = "INSERT INTO product(name, description, price, category_id, active, image_url) VALUES(?,?,?,?,?,?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, product.getName());
            ps.setString(2, product.getDescription());
            ps.setDouble(3, product.getPrice());
            ps.setInt(4, product.getCategory() != null ? product.getCategory().getId() : 0);
            ps.setInt(5, product.isActive() ? 1 : 0);
            ps.setString(6, product.getImageUrl());
            return ps;
        }, keyHolder);

        if (keyHolder.getKey() != null) {
            product.setId(keyHolder.getKey().intValue());
        }
        return product;
    }

    public Product update(Product product) {
        String sql = "UPDATE product SET name = ?, description = ?, price = ?, category_id = ?, active = ?, image_url = ? WHERE id = ?";
        jdbcTemplate.update(sql,
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getCategory() != null ? product.getCategory().getId() : 0,
                product.isActive() ? 1 : 0,
                product.getImageUrl(),
                product.getId());
        return product;
    }

    public void delete(int id) {
        String sql = "DELETE FROM product WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

}
