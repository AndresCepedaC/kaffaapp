package kaffaapp.kaffa_server.web;

import kaffaapp.kaffa_server.model.Category;
import kaffaapp.kaffa_server.model.DailyClosing;
import kaffaapp.kaffa_server.model.Order;
import kaffaapp.kaffa_server.model.Product;
import kaffaapp.kaffa_server.service.CashService;
import kaffaapp.kaffa_server.service.CategoryService;
import kaffaapp.kaffa_server.service.OrderService;
import kaffaapp.kaffa_server.service.ProductService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
    private final CashService cashService;

    public ApiController(ProductService productService, OrderService orderService,
                         CategoryService categoryService, CashService cashService) {
        this.productService = productService;
        this.orderService = orderService;
        this.categoryService = categoryService;
        this.cashService = cashService;
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

    // ─── Orders ───────────────────────────────────────────────

    @PostMapping(value = "/orders", consumes = "application/json", produces = "application/json")
    public Map<String, Object> createOrder(@RequestBody Order order) {
        Order created = orderService.createOrder(order);
        Map<String, Object> response = new HashMap<>();
        response.put("order", created);
        return response;
    }

    @GetMapping(value = "/orders", produces = "application/json")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @PutMapping(value = "/orders/{id}", consumes = "application/json", produces = "application/json")
    public Order updateOrder(@PathVariable int id, @RequestBody Order order) {
        return orderService.updateOrder(id, order);
    }

    @DeleteMapping(value = "/orders/{id}")
    public void deleteOrder(@PathVariable int id) {
        orderService.deleteOrder(id);
    }

    // ─── On-Demand Printing ──────────────────────────────────

    @PostMapping(value = "/orders/{id}/print-internal", produces = "application/json")
    public Map<String, Object> printInternal(@PathVariable int id) {
        boolean printed = orderService.printInternal(id);
        Map<String, Object> response = new HashMap<>();
        response.put("printed", printed);
        return response;
    }

    @PostMapping(value = "/orders/{id}/print-customer", produces = "application/json")
    public Map<String, Object> printCustomer(@PathVariable int id) {
        boolean printed = orderService.printCustomer(id);
        Map<String, Object> response = new HashMap<>();
        response.put("printed", printed);
        return response;
    }

    // ─── Payment ─────────────────────────────────────────────

    @PostMapping(value = "/orders/{id}/pay", consumes = "application/json", produces = "application/json")
    public Order payOrder(@PathVariable int id, @RequestBody Map<String, Object> body) {
        String paymentMethod = (String) body.get("paymentMethod");
        Double amountCash = body.get("amountCash") != null
                ? ((Number) body.get("amountCash")).doubleValue() : null;
        Double amountBank = body.get("amountBank") != null
                ? ((Number) body.get("amountBank")).doubleValue() : null;

        return cashService.processPayment(id, paymentMethod, amountCash, amountBank);
    }

    // ─── Cash Register / Daily Closing ───────────────────────

    @GetMapping(value = "/cash/today", produces = "application/json")
    public DailyClosing getCashToday() {
        return cashService.getDailyClosing(LocalDate.now().toString());
    }

    @GetMapping(value = "/cash/closing", produces = "application/json")
    public DailyClosing getCashClosing(@RequestParam(defaultValue = "") String date) {
        return cashService.getDailyClosing(date.isBlank() ? LocalDate.now().toString() : date);
    }

    @GetMapping(value = "/cash/export", produces = "text/csv; charset=UTF-8")
    public org.springframework.http.ResponseEntity<String> exportMonthlyCsv(@RequestParam(defaultValue = "") String yearMonth) {
        String csv = cashService.generateMonthlyCsv(yearMonth);
        String filename = "kaffa_reporte_" + (yearMonth.isBlank() ? LocalDate.now().toString() : yearMonth) + ".csv";
        
        return org.springframework.http.ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(csv);
    }
}
