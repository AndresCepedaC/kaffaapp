package kaffaapp.kaffa_server;

import kaffaapp.kaffa_server.dao.OrderDAO;
import kaffaapp.kaffa_server.dao.ProductDAO;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class KaffaServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(KaffaServerApplication.class, args);
	}

	@Bean
	CommandLineRunner init(ProductDAO productDAO, OrderDAO orderDAO) {
		return args -> {
			productDAO.createTableIfNotExists();
			orderDAO.createTableIfNotExists();
			if (productDAO.isEmpty()) {
				seedProducts(productDAO);
			}
		};
	}

	private void seedProducts(ProductDAO dao) throws Exception {
		// Pega aquí tus dao.insertRaw("...", "...", precio);
		// puedes empezar por unos pocos para probar
		dao.insertRaw("Hamburguesa Sencilla", "Carne, queso, tocineta, lechuga...", 19000);
		dao.insertRaw("Limonada Natural", "Limonada frappé natural", 8000);
	}
}
