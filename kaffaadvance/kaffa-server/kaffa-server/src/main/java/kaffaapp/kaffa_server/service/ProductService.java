package kaffaapp.kaffa_server.service;

import kaffaapp.kaffa_server.dao.ProductDAO;
import kaffaapp.kaffa_server.model.Product;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductDAO productDAO;

    public ProductService(ProductDAO productDAO) {
        this.productDAO = productDAO;
    }

    public List<Product> getAllProducts() {
        return productDAO.findAll();
    }

    public Product createProduct(Product product) {
        validateProduct(product);
        return productDAO.insert(product);
    }

    public Product updateProduct(int id, Product product) {
        validateProduct(product);
        product.setId(id);
        return productDAO.update(product);
    }

    public void deleteProduct(int id) {
        productDAO.delete(id);
    }

    /**
     * Cross-selling: Given a list of product IDs currently in the cart,
     * recommend up to 2 products from the same categories that are NOT in the cart.
     */
    public List<Product> getRecommendations(List<Integer> cartProductIds) {
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
