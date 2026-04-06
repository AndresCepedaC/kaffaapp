package kaffaapp.kaffa_server.dao;

import kaffaapp.kaffa_server.model.Category;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

@Repository
public class CategoryDAO {

    private final JdbcTemplate jdbcTemplate;

    public CategoryDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Category> rowMapper = (rs, rowNum) -> new Category(
            rs.getInt("id"),
            rs.getString("name"),
            rs.getString("description"));

    public void createTableIfNotExists() {
        String sql = """
                CREATE TABLE IF NOT EXISTS category (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT
                )
                """;
        jdbcTemplate.execute(sql);
    }

    public List<Category> findAll() {
        String sql = "SELECT id, name, description FROM category";
        return jdbcTemplate.query(sql, rowMapper);
    }

    public Category findById(int id) {
        String sql = "SELECT id, name, description FROM category WHERE id = ?";
        List<Category> results = jdbcTemplate.query(sql, rowMapper, id);
        return results.isEmpty() ? null : results.get(0);
    }

    public Category insert(Category category) {
        String sql = "INSERT INTO category(name, description) VALUES(?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, category.getName());
            ps.setString(2, category.getDescription());
            return ps;
        }, keyHolder);

        if (keyHolder.getKey() != null) {
            category.setId(keyHolder.getKey().intValue());
        }
        return category;
    }

    public void update(Category category) {
        String sql = "UPDATE category SET name = ?, description = ? WHERE id = ?";
        jdbcTemplate.update(sql, category.getName(), category.getDescription(), category.getId());
    }

    public void delete(int id) {
        String sql = "DELETE FROM category WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public boolean isEmpty() {
        String sql = "SELECT COUNT(*) FROM category";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
        return count != null && count == 0;
    }
}
