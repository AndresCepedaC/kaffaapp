package kaffaapp.kaffa_server.web;

import kaffaapp.kaffa_server.model.Category;
import kaffaapp.kaffa_server.model.Order;
import kaffaapp.kaffa_server.model.Product;
import kaffaapp.kaffa_server.service.CategoryService;
import kaffaapp.kaffa_server.service.OrderService;
import kaffaapp.kaffa_server.service.ProductService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", allowedHeaders = "*", methods = { RequestMethod.GET, RequestMethod.POST,
        RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS })
@RestController
@RequestMapping("/api")
public class ApiController {

    private final ProductService productService;
    private final OrderService orderService;
    private final CategoryService categoryService;

    public ApiController(ProductService productService, OrderService orderService, CategoryService categoryService) {
        this.productService = productService;
        this.orderService = orderService;
        this.categoryService = categoryService;
    }

    // ─── Health ───────────────────────────────────────────────

    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("message", "Kaffa Server is running");
        return status;
    }

    // ─── Products ─────────────────────────────────────────────

    @GetMapping(value = "/productos", produces = "application/json")
    public List<Product> getProductos() {
        return productService.getAllProducts();
    }

    @PostMapping(value = "/productos", consumes = "application/json", produces = "application/json")
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }

    @PutMapping(value = "/productos/{id}", consumes = "application/json", produces = "application/json")
    public Product updateProduct(@PathVariable int id, @RequestBody Product product) {
        return productService.updateProduct(id, product);
    }

    @DeleteMapping(value = "/productos/{id}")
    public void deleteProduct(@PathVariable int id) {
        productService.deleteProduct(id);
    }

    // ─── Cross-selling Recommendations ────────────────────────

    @PostMapping(value = "/productos/recommendations", consumes = "application/json", produces = "application/json")
    public List<Product> getRecommendations(@RequestBody List<Integer> cartProductIds) {
        return productService.getRecommendations(cartProductIds);
    }

    // ─── Categories ───────────────────────────────────────────

    @GetMapping(value = "/categorias", produces = "application/json")
    public List<Category> getCategorias() {
        return categoryService.getAllCategories();
    }

    @PostMapping(value = "/categorias", consumes = "application/json", produces = "application/json")
    public Category createCategory(@RequestBody Category category) {
        return categoryService.createCategory(category);
    }

    @PutMapping(value = "/categorias/{id}", consumes = "application/json", produces = "application/json")
    public Category updateCategory(@PathVariable int id, @RequestBody Category category) {
        return categoryService.updateCategory(id, category);
    }

    @DeleteMapping(value = "/categorias/{id}")
    public void deleteCategory(@PathVariable int id) {
        categoryService.deleteCategory(id);
    }

    // ─── Orders (with Printer Integration) ────────────────────

    @PostMapping(value = "/orders", consumes = "application/json", produces = "application/json")
    public Map<String, Object> createOrder(@RequestBody Order order) {
        OrderService.OrderResult result = orderService.createOrder(order);
        Map<String, Object> response = new HashMap<>();
        response.put("order", result.getOrder());
        response.put("printed", result.isPrinted());
        return response;
    }
}
