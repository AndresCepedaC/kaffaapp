package kaffaapp.kaffa_server.service;

import kaffaapp.kaffa_server.dao.CategoryDAO;
import kaffaapp.kaffa_server.model.Category;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.List;

@Service
public class CategoryService {

    private static final Logger logger = LoggerFactory.getLogger(CategoryService.class);

    private final CategoryDAO categoryDAO;

    public CategoryService(CategoryDAO categoryDAO) {
        this.categoryDAO = categoryDAO;
    }

    public List<Category> getAllCategories() {
        try {
            return categoryDAO.findAll();
        } catch (SQLException e) {
            logger.error("Error fetching categories: {}", e.getMessage(), e);
            throw new RuntimeException("No se pudieron obtener las categorías", e);
        }
    }

    public Category createCategory(Category category) {
        validateCategory(category);
        try {
            return categoryDAO.insert(category);
        } catch (SQLException e) {
            logger.error("Error creating category: {}", e.getMessage(), e);
            throw new RuntimeException("No se pudo crear la categoría", e);
        }
    }

    public Category updateCategory(int id, Category category) {
        validateCategory(category);
        try {
            category.setId(id);
            categoryDAO.update(category);
            return category;
        } catch (SQLException e) {
            logger.error("Error updating category {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("No se pudo actualizar la categoría", e);
        }
    }

    public void deleteCategory(int id) {
        try {
            categoryDAO.delete(id);
            logger.info("Deleted category with id: {}", id);
        } catch (SQLException e) {
            logger.error("Error deleting category {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("No se pudo eliminar la categoría", e);
        }
    }

    private void validateCategory(Category category) {
        if (category.getName() == null || category.getName().isBlank()) {
            throw new IllegalArgumentException("El nombre de la categoría es obligatorio");
        }
    }
}
