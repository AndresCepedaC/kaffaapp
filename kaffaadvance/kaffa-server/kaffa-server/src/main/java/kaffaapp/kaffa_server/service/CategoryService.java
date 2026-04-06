package kaffaapp.kaffa_server.service;

import kaffaapp.kaffa_server.dao.CategoryDAO;
import kaffaapp.kaffa_server.model.Category;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryDAO categoryDAO;

    public CategoryService(CategoryDAO categoryDAO) {
        this.categoryDAO = categoryDAO;
    }

    public List<Category> getAllCategories() {
        return categoryDAO.findAll();
    }

    public Category createCategory(Category category) {
        validateCategory(category);
        return categoryDAO.insert(category);
    }

    public Category updateCategory(int id, Category category) {
        validateCategory(category);
        category.setId(id);
        categoryDAO.update(category);
        return category;
    }

    public void deleteCategory(int id) {
        categoryDAO.delete(id);
    }

    private void validateCategory(Category category) {
        if (category.getName() == null || category.getName().isBlank()) {
            throw new IllegalArgumentException("El nombre de la categoría es obligatorio");
        }
    }
}
