package kaffaapp.kaffa_server.service;

import kaffaapp.kaffa_server.dao.ProductDAO;
import kaffaapp.kaffa_server.model.Product;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

    private final ProductDAO productDAO;

    public ProductService(ProductDAO productDAO) {
        this.productDAO = productDAO;
    }

    public List<Product> getAllProducts() {
        try {
            return productDAO.findAll();
        } catch (SQLException e) {
            logger.error("Error fetching products: {}", e.getMessage(), e);
            throw new RuntimeException("No se pudieron obtener los productos", e);
        }
    }

    public Product createProduct(Product product) {
        validateProduct(product);
        try {
            logger.info("Creating product: {} - ${}", product.getName(), product.getPrice());
            return productDAO.insert(product);
        } catch (SQLException e) {
            logger.error("Error creating product: {}", e.getMessage(), e);
            throw new RuntimeException("No se pudo crear el producto", e);
        }
    }

    public Product updateProduct(int id, Product product) {
        validateProduct(product);
        try {
            product.setId(id);
            return productDAO.update(product);
        } catch (SQLException e) {
            logger.error("Error updating product {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("No se pudo actualizar el producto", e);
        }
    }

    public void deleteProduct(int id) {
        try {
            productDAO.delete(id);
            logger.info("Deleted product with id: {}", id);
        } catch (SQLException e) {
            logger.error("Error deleting product {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("No se pudo eliminar el producto", e);
        }
    }

    /**
     * Cross-selling: Given a list of product IDs currently in the cart,
     * recommend up to 2 products from the same categories that are NOT in the cart.
     */
    public List<Product> getRecommendations(List<Integer> cartProductIds) {
        try {
            List<Product> allProducts = productDAO.findAll();

            // Find categories of products currently in the cart
            List<Integer> cartCategoryIds = allProducts.stream()
                    .filter(p -> cartProductIds.contains(p.getId()))
                    .filter(p -> p.getCategory() != null)
                    .map(p -> p.getCategory().getId())
                    .distinct()
                    .collect(Collectors.toList());

            // Find products in the same categories that are NOT in the cart
            List<Product> recommendations = allProducts.stream()
                    .filter(p -> !cartProductIds.contains(p.getId()))
                    .filter(p -> p.getCategory() != null && cartCategoryIds.contains(p.getCategory().getId()))
                    .collect(Collectors.toList());

            // Shuffle to add variety and return max 2
            Collections.shuffle(recommendations);
            return recommendations.stream().limit(2).collect(Collectors.toList());
        } catch (SQLException e) {
            logger.error("Error fetching recommendations: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    private void validateProduct(Product product) {
        if (product.getName() == null || product.getName().isBlank()) {
            throw new IllegalArgumentException("El nombre del producto es obligatorio");
        }
        if (product.getPrice() < 0) {
            throw new IllegalArgumentException("El precio no puede ser negativo");
        }
    }
}
