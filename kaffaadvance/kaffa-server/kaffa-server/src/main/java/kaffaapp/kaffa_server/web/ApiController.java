package kaffaapp.kaffa_server.web;

import kaffaapp.kaffa_server.dao.OrderDAO;
import kaffaapp.kaffa_server.dao.ProductDAO;
import kaffaapp.kaffa_server.model.Order;
import kaffaapp.kaffa_server.model.Product;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;

@CrossOrigin(origins = "*", allowedHeaders = "*", methods = { RequestMethod.GET, RequestMethod.POST,
        RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS })
@RestController
@RequestMapping("/api")
public class ApiController {

    private final ProductDAO productDAO;
    private final OrderDAO orderDAO;
    private final kaffaapp.kaffa_server.dao.CategoryDAO categoryDAO;

    public ApiController(ProductDAO productDAO, OrderDAO orderDAO, kaffaapp.kaffa_server.dao.CategoryDAO categoryDAO) {
        this.productDAO = productDAO;
        this.orderDAO = orderDAO;
        this.categoryDAO = categoryDAO;
    }

    @GetMapping(value = "/productos", produces = "application/json")
    public List<Product> getProductos() throws SQLException {
        return productDAO.findAll();
    }

    @GetMapping(value = "/categorias", produces = "application/json")
    public List<kaffaapp.kaffa_server.model.Category> getCategorias() throws SQLException {
        return categoryDAO.findAll();
    }

    @PostMapping(value = "/categorias", consumes = "application/json", produces = "application/json")
    public kaffaapp.kaffa_server.model.Category createCategory(
            @RequestBody kaffaapp.kaffa_server.model.Category category) throws SQLException {
        return categoryDAO.insert(category);
    }

    @PutMapping(value = "/categorias/{id}", consumes = "application/json", produces = "application/json")
    public kaffaapp.kaffa_server.model.Category updateCategory(@PathVariable int id,
            @RequestBody kaffaapp.kaffa_server.model.Category category) throws SQLException {
        category.setId(id);
        categoryDAO.update(category);
        return category;
    }

    @DeleteMapping(value = "/categorias/{id}")
    public void deleteCategory(@PathVariable int id) throws SQLException {
        categoryDAO.delete(id);
    }

    @PostMapping(value = "/orders", consumes = "application/json", produces = "application/json")
    public Order createOrder(@RequestBody Order order) throws SQLException {
        return orderDAO.insert(order);
    }

    @PostMapping(value = "/productos", consumes = "application/json", produces = "application/json")
    public Product createProduct(@RequestBody Product product) throws SQLException {
        System.out.println("Creando producto: " + product.getName() + " - " + product.getPrice());
        return productDAO.insert(product);
    }

    @PutMapping(value = "/productos/{id}", consumes = "application/json", produces = "application/json")
    public Product updateProduct(@PathVariable int id, @RequestBody Product product) throws SQLException {
        product.setId(id);
        return productDAO.update(product);
    }

    @DeleteMapping(value = "/productos/{id}")
    public void deleteProduct(@PathVariable int id) throws SQLException {
        productDAO.delete(id);
    }

}
