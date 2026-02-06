package kaffaapp.kaffa_server.web;

import kaffaapp.kaffa_server.dao.OrderDAO;
import kaffaapp.kaffa_server.dao.ProductDAO;
import kaffaapp.kaffa_server.model.Order;
import kaffaapp.kaffa_server.model.Product;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;


@CrossOrigin(
        origins = "http://localhost:3000",
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
@RestController
@RequestMapping("/api")
public class ApiController {

    private final ProductDAO productDAO;
    private final OrderDAO orderDAO;

    public ApiController(ProductDAO productDAO, OrderDAO orderDAO) {
        this.productDAO = productDAO;
        this.orderDAO = orderDAO;
    }

    @GetMapping(value = "/productos", produces = "application/json")
    public List<Product> getProductos() throws SQLException {
        return productDAO.findAll();
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
