package kaffaapp.kaffa_server;

import kaffaapp.kaffa_server.dao.OrderDAO;
import kaffaapp.kaffa_server.dao.ProductDAO;
import kaffaapp.kaffa_server.dao.CategoryDAO;
import kaffaapp.kaffa_server.model.Category;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.List;

@SpringBootApplication
public class KaffaServerApplication {
	private static final Logger logger = LoggerFactory.getLogger(KaffaServerApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(KaffaServerApplication.class, args);
	}

	@Bean
	CommandLineRunner init(ProductDAO productDAO, OrderDAO orderDAO, CategoryDAO categoryDAO) {
		return args -> {
			try {
				logger.info("Initializing database tables...");
				categoryDAO.createTableIfNotExists();
				productDAO.createTableIfNotExists();
				orderDAO.createTableIfNotExists();
				logger.info("Tables checked.");

				if (categoryDAO.isEmpty()) {
					logger.info("Seeding categories...");
					seedCategories(categoryDAO);
					logger.info("Categories seeded.");
				}

				if (productDAO.isEmpty()) {
					logger.info("Seeding products...");
					seedProducts(productDAO, categoryDAO);
					logger.info("Products seeded.");
				}
				logger.info("Database initialization complete.");
			} catch (Exception e) {
				logger.error("Error during database initialization: {}", e.getMessage(), e);
				// We don't rethrow to allow the application to start even if seeding fails
			}
		};
	}

	private void seedCategories(CategoryDAO dao) throws Exception {
		dao.insert(new Category(0, "Bebidas Calientes", "Cafés, chocolates, tés, coladas, aromáticas y más"));
		dao.insert(new Category(0, "Frías de Café", "Cold brew, Granizados, Malteadas"));
		dao.insert(new Category(0, "Jugos - Frappés - Malteadas", "Jugos naturales, frappés y malteadas"));
		dao.insert(new Category(0, "Sodas Italianas", "Refrescantes sodas de frutas"));
		dao.insert(new Category(0, "Limonadas Frapée", "Natural, Coco, Cereza..."));
		dao.insert(new Category(0, "Smoothies", "Base cremosa de fruta 100% natural"));
		dao.insert(new Category(0, "Funcionales", "Batidos saludables y detox"));
		dao.insert(new Category(0, "Tartas, Waffles y Más", "Postres y acompañamientos"));
		dao.insert(new Category(0, "Hojaldrados", "Croissants y masas artesanales"));
		dao.insert(new Category(0, "Rellenos", "Croissants rellenos salados y dulces"));
		dao.insert(new Category(0, "Cervezas y Bebidas", "Agua, Gaseosa, Cervezas"));
		dao.insert(new Category(0, "Cocteles con Licor", "Margaritas, Daikiris, Mojitos..."));
		dao.insert(new Category(0, "Cocteles sin Licor", "San Francisco, Pasión..."));
		dao.insert(new Category(0, "Hamburguesas", "Artesanales de la Aldea"));
		dao.insert(new Category(0, "Picadas y Carnes", "Picadas, pinchos y alitas"));
		dao.insert(new Category(0, "Salchipapa", "Salchipapas sencilla y mixta"));
		dao.insert(new Category(0, "Patacones", "Sencillo, mixto y ranchero"));
		dao.insert(new Category(0, "Para Compartir", "Nachos, empanadas, tostones..."));
		dao.insert(new Category(0, "Sandwich y Wraps", "Sandwich de pollo y wraps"));
		dao.insert(new Category(0, "Desgranados", "Maicitos con proteína"));
	}

	private void seedProducts(ProductDAO dao, CategoryDAO catDao) throws Exception {
		List<Category> cats = catDao.findAll();

		java.util.function.Function<String, Integer> getCatId = (name) -> cats.stream()
				.filter(c -> c.getName().equals(name)).findFirst().map(Category::getId).orElse(0);

		int catBebidasCalientes = getCatId.apply("Bebidas Calientes");
		int catFriasCafe = getCatId.apply("Frías de Café");
		int catJugos = getCatId.apply("Jugos - Frappés - Malteadas");
		int catSodas = getCatId.apply("Sodas Italianas");
		int catLimonadas = getCatId.apply("Limonadas Frapée");
		int catSmoothies = getCatId.apply("Smoothies");
		int catFuncionales = getCatId.apply("Funcionales");
		int catTartas = getCatId.apply("Tartas, Waffles y Más");
		int catHojaldrados = getCatId.apply("Hojaldrados");
		int catRellenos = getCatId.apply("Rellenos");
		int catCervezas = getCatId.apply("Cervezas y Bebidas");
		int catCoctelesLicor = getCatId.apply("Cocteles con Licor");
		int catCoctelesSin = getCatId.apply("Cocteles sin Licor");
		int catHamburguesas = getCatId.apply("Hamburguesas");
		int catPicadas = getCatId.apply("Picadas y Carnes");
		int catSalchipapa = getCatId.apply("Salchipapa");
		int catPatacones = getCatId.apply("Patacones");
		int catCompartir = getCatId.apply("Para Compartir");
		int catSandwich = getCatId.apply("Sandwich y Wraps");
		int catDesgranados = getCatId.apply("Desgranados");

		// ===== BEBIDAS CALIENTES =====
		dao.insertRaw("Americano", "", 5500.0, catBebidasCalientes, null);
		dao.insertRaw("Espresso", "", 5000.0, catBebidasCalientes, null);
		dao.insertRaw("Espresso Macchiato", "", 5500.0, catBebidasCalientes, null);
		dao.insertRaw("Italiano", "", 5500.0, catBebidasCalientes, null);
		dao.insertRaw("Campesino", "", 6500.0, catBebidasCalientes, null);
		dao.insertRaw("Carajillo", "", 10000.0, catBebidasCalientes, null);
		dao.insertRaw("Latte", "", 7000.0, catBebidasCalientes, null);
		dao.insertRaw("Bombón", "", 7500.0, catBebidasCalientes, null);
		dao.insertRaw("Café Irlandés", "", 10000.0, catBebidasCalientes, null);
		dao.insertRaw("Capuccino tradicional", "", 8000.0, catBebidasCalientes, null);
		dao.insertRaw("Capuccino Amareto", "", 10000.0, catBebidasCalientes, null);
		dao.insertRaw("Capuccino baileys", "", 10500.0, catBebidasCalientes, null);
		dao.insertRaw("Mocaccino tradicional", "", 8000.0, catBebidasCalientes, null);
		dao.insertRaw("Mocaccino con licor", "", 11500.0, catBebidasCalientes, null);

		// ===== Chocolates y Milo =====
		dao.insertRaw("Milo", "", 9500.0, catBebidasCalientes, null);
		dao.insertRaw("Chocolate en agua", "", 6500.0, catBebidasCalientes, null);
		dao.insertRaw("Chocolate en leche", "", 7500.0, catBebidasCalientes, null);
		dao.insertRaw("Choco masmelo", "", 10000.0, catBebidasCalientes, null);

		// ===== Tés y Funcionales =====
		dao.insertRaw("Té chai", "", 8500.0, catBebidasCalientes, null);
		dao.insertRaw("Té Matcha", "Té verde 100% natural", 8500.0, catBebidasCalientes, null);
		dao.insertRaw("Leche dorada", "Mezcla de cúrcuma, jengibre, canela, pimienta negra, cardamomo, anís estrellado", 8500.0, catBebidasCalientes, null);

		// ===== Aromáticas y Hervidos =====
		dao.insertRaw("Aromática", "Bolsita o panelita", 3800.0, catBebidasCalientes, null);
		dao.insertRaw("Hervidos de frutas", "Amarillos, rojos", 9000.0, catBebidasCalientes, null);

		// ===== Coladas =====
		dao.insertRaw("Colada tradicional", "", 9000.0, catBebidasCalientes, null);
		dao.insertRaw("Colada de plátano", "", 9000.0, catBebidasCalientes, null);
		dao.insertRaw("Colada con café", "", 10000.0, catBebidasCalientes, null);
		dao.insertRaw("Colada con milo", "", 10500.0, catBebidasCalientes, null);

		// ===== Experiencia Tetera =====
		dao.insertRaw("Experiencia Tetera", "Té 100% natural de hierbabuena, flor de jamaica, canela y frutos del bosque", 10000.0, catBebidasCalientes, null);

		// ===== Canelazos =====
		dao.insertRaw("Canelazo tradicional", "", 10000.0, catBebidasCalientes, null);
		dao.insertRaw("Canelazo de frutos rojos o amarillos", "", 11000.0, catBebidasCalientes, null);

		// ===== Tradición =====
		dao.insertRaw("Agua de panela", "", 5000.0, catBebidasCalientes, null);
		dao.insertRaw("Agua de panela con queso", "", 10000.0, catBebidasCalientes, null);
		dao.insertRaw("Migao", "Migao con chocolate en leche y panela. Incluye buñuelo, pandebono, pandeyuca, ducales, palito tostado, queso, leche en polvo", 19500.0, catBebidasCalientes, null);

		// ===== FRÍAS DE CAFÉ =====
		// Cold brew = café frío en vaso
		dao.insertRaw("Cold brew", "Café extraído en frío", 8000, catFriasCafe,
				"https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=300&fit=crop");
		// Iced latte
		dao.insertRaw("Latte Frío", "Café con leche y hielo", 9500, catFriasCafe,
				"https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop");
		// Caramelo macchiato = iced caramel macchiato
		dao.insertRaw("Caramelo late macchiato", "Dulce y frío", 11000, catFriasCafe,
				"https://images.unsplash.com/photo-1592663527359-cf6642f54cff?w=400&h=300&fit=crop");
		// Affogato = helado con espresso
		dao.insertRaw("Affogato", "Helado con espresso", 12000, catFriasCafe,
				"https://images.unsplash.com/photo-1579888944880-d98341245702?w=400&h=300&fit=crop");
		// Oreo Dalgona = dalgona coffee con oreo
		dao.insertRaw("Oreo Dalgona", "Café batido con oreo", 12000, catFriasCafe,
				"https://images.unsplash.com/photo-1607260550778-aa9f7b6600ef?w=400&h=300&fit=crop");
		// Granizado de café = coffee granita/frappe
		dao.insertRaw("Granizado de café", "Refrescante", 12000, catFriasCafe,
				"https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400&h=300&fit=crop");
		dao.insertRaw("Granizado de mocca", "Café y chocolate", 12500, catFriasCafe,
				"https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop");
		// Malteada de café = coffee milkshake
		dao.insertRaw("Malteada de Café", "Cremosa", 15500, catFriasCafe,
				"https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&h=300&fit=crop");
		dao.insertRaw("Malteada de mocca", "Café y chocolate", 16000, catFriasCafe,
				"https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=400&h=300&fit=crop");

		// ===== JUGOS - FRAPPÉS - MALTEADAS =====
		dao.insertRaw("Milo frío", "Refrescante", 12000, catJugos,
				"https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop");
		dao.insertRaw("Milo granizado", "Tipo frappé", 13000, catJugos,
				"https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400&h=300&fit=crop");
		dao.insertRaw("Malteada de milo", "Cremosa", 16000, catJugos,
				"https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&h=300&fit=crop");
		// Jugos de fruta = fresh fruit juice
		dao.insertRaw("Jugos de Fruta", "Mora, fresa, mango, maracuyá, guanábana", 9500, catJugos,
				"https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&h=300&fit=crop");
		// Granizado de fruta
		dao.insertRaw("Bebidas de fruta granizadas", "De fruta natural", 10000, catJugos,
				"https://images.unsplash.com/photo-1560526860-1f0e6cda0e5f?w=400&h=300&fit=crop");
		// Vanilla milkshake
		dao.insertRaw("Malteada de vainilla", "Clásica", 15500, catJugos,
				"https://images.unsplash.com/photo-1568901839119-631418a3910d?w=400&h=300&fit=crop");
		// Oreo milkshake
		dao.insertRaw("Malteada de Oreo", "Con galleta", 16000, catJugos,
				"https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=400&h=300&fit=crop");
		// Fruit milkshake = strawberry shake
		dao.insertRaw("Malteada de fruta", "Fresa, mora, maracuyá", 16000, catJugos,
				"https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop");

		// ===== SODAS ITALIANAS =====
		// Italian soda = colorful sodas
		dao.insertRaw("Soda Frutos rojos", "Con gas y fruta", 13500, catSodas,
				"https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=400&h=300&fit=crop");
		dao.insertRaw("Soda Frutos amarillos", "Tropical", 13500, catSodas,
				"https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&h=300&fit=crop");
		dao.insertRaw("Soda Sandía Lulo", "Refrescante mezcla", 13500, catSodas,
				"https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&h=300&fit=crop");
		dao.insertRaw("Soda Cereza", "Dulce y burbujeante", 13500, catSodas,
				"https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=400&h=300&fit=crop");
		dao.insertRaw("Soda Fresa", "Clásica", 13500, catSodas,
				"https://images.unsplash.com/photo-1560526860-1f0e6cda0e5f?w=400&h=300&fit=crop");
		dao.insertRaw("Soda Mango biche", "Ácida y refrescante", 13500, catSodas,
				"https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=300&fit=crop");
		dao.insertRaw("Soda Lyche", "Sabor exótico", 13500, catSodas,
				"https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&h=300&fit=crop");
		dao.insertRaw("Soda sencilla", "Agua carbonatada", 5500, catSodas,
				"https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop");
		dao.insertRaw("Adicional michelada soda", "Toque de sal y limón", 2000, catSodas,
				"https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop");

		// ===== LIMONADAS FRAPÉE =====
		// Lemonade = limonada
		dao.insertRaw("Limonada Natural", "Frappé", 8000, catLimonadas,
				"https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop");
		dao.insertRaw("Limonada Coco", "Cremosa", 11500, catLimonadas,
				"https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&h=300&fit=crop");
		dao.insertRaw("Limonada Cereza", "Dulce", 11500, catLimonadas,
				"https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=400&h=300&fit=crop");
		dao.insertRaw("Limonada Hierbabuena", "Refrescante", 10500, catLimonadas,
				"https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=300&fit=crop");
		dao.insertRaw("Limonada Piña con hierbabuena", "Tropical", 10500, catLimonadas,
				"https://images.unsplash.com/photo-1587023409531-73f5e1e8ce79?w=400&h=300&fit=crop");
		dao.insertRaw("Limonada Fresa con hierbabuena", "Frutal", 10500, catLimonadas,
				"https://images.unsplash.com/photo-1560526860-1f0e6cda0e5f?w=400&h=300&fit=crop");
		dao.insertRaw("Limonada Maracuyá, zanahoria, coco", "Mezcla exótica", 12500, catLimonadas,
				"https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=300&fit=crop");
		dao.insertRaw("Limonada Maracuyá, flor de jamaica", "Ácida y floral", 11500, catLimonadas,
				"https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&h=300&fit=crop");
		dao.insertRaw("Limonada Maracumango", "Mango y maracuyá", 11500, catLimonadas,
				"https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=300&fit=crop");
		dao.insertRaw("Limonada Mango biche", "Con sal y limón", 11500, catLimonadas,
				"https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=300&fit=crop");

		// ===== SMOOTHIES =====
		// Smoothie = berry smoothie
		dao.insertRaw("Smoothie", "Base cremosa de fruta 100% natural. Fresa, mora, maracumango", 19500, catSmoothies,
				"https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop");
		// Parfait = yogurt parfait
		dao.insertRaw("Parfait de Fruta", "200g yogurt griego, fruta fresca, granola y semillas de chía", 19500,
				catSmoothies, "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop");

		// ===== FUNCIONALES (BATIDOS) =====
		// Green juice
		dao.insertRaw("Batido VERDE", "Espinaca, pepino, jengibre, apio, manzana verde, limón", 9500, catFuncionales,
				"https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop");
		// Red berry smoothie
		dao.insertRaw("Batido ROJO", "Fresas, moras, arándanos, cerezas, yogurt griego, leche, semillas de chía, hielo",
				14500, catFuncionales,
				"https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop");
		// Yellow/pineapple smoothie
		dao.insertRaw("Batido AMARILLO", "Piña, jengibre, zumo de limón, agua de coco y hielo", 13500, catFuncionales,
				"https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=300&fit=crop");

		// ===== TARTAS, WAFFLES Y MÁS =====
		// Chocolate tart
		dao.insertRaw("Tarta 80% cacao", "Rellena de ganache de chocolate", 13000, catTartas,
				"https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop");
		// Cheesecake
		dao.insertRaw("Tarta blanda de queso", "Horneada con base de galleta, cubierta con salsa de maracuyá ó mora",
				13000, catTartas, "https://images.unsplash.com/photo-1524351199432-d330df15f4a7?w=400&h=300&fit=crop");
		// Brownie
		dao.insertRaw("Brownie con chantilly", "Brownie artesanal", 6000, catTartas,
				"https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400&h=300&fit=crop");
		// Brownie with ice cream
		dao.insertRaw("Brownie con helado y chantilly", "Brownie premium", 12000, catTartas,
				"https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&h=300&fit=crop");
		// Waffle with fruit
		dao.insertRaw("Waffle Fruta", "Con helado y chantilly", 19500, catTartas,
				"https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&h=300&fit=crop");
		// Waffle with nutella
		dao.insertRaw("Waffle Nutella", "Con fresa y chantilly", 16000, catTartas,
				"https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=400&h=300&fit=crop");

		// ===== HOJALDRADOS =====
		// Regular croissant
		dao.insertRaw("Croissant semillado",
				"Masa reposada con copos de avena, sésamo, lino, semillas de calabaza y girasol", 8000, catHojaldrados,
				"https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400&h=300&fit=crop");
		// Chocolate croissant
		dao.insertRaw("Croissant de chocolate y avellanas", "Hojaldrado con salsa de avellanas", 9000, catHojaldrados,
				"https://images.unsplash.com/photo-1623334044303-241021148842?w=400&h=300&fit=crop");
		// Raspberry croissant
		dao.insertRaw("Croissant de queso y frambuesas", "Hojaldrado con salsa de frambuesas", 9500, catHojaldrados,
				"https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=400&h=300&fit=crop");
		// Danish pastry
		dao.insertRaw("Malla hojaldrada", "Masa danesa reposada, rellena de espinaca y queso crema", 10000,
				catHojaldrados, "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop");

		// ===== RELLENOS =====
		// Ham and cheese croissant
		dao.insertRaw("Croissant jamón y queso", "Semillado relleno de jamón, queso, lechuga y tomate", 17000,
				catRellenos, "https://images.unsplash.com/photo-1600788907416-456578634209?w=400&h=300&fit=crop");
		// Egg croissant
		dao.insertRaw("Croissant huevo ranchero", "Semillado relleno de huevo, ranchera y queso", 18000, catRellenos,
				"https://images.unsplash.com/photo-1620921568790-15eea0e5e58f?w=400&h=300&fit=crop");
		// Chocolate berry croissant
		dao.insertRaw("Croissant chocolate frutos rojos", "De chocolate relleno de frutos rojos", 17000, catRellenos,
				"https://images.unsplash.com/photo-1623334044303-241021148842?w=400&h=300&fit=crop");

		// ===== CERVEZAS Y BEBIDAS =====
		// Water bottle
		dao.insertRaw("Botella de agua", "350 ml", 3500, catCervezas,
				"https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=300&fit=crop");
		// Soda bottle
		dao.insertRaw("Gaseosa personal", "Cocacola, premio, sprite, cuatro", 5500, catCervezas,
				"https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop");
		// Tamarind drink
		dao.insertRaw("Tamarindo", "Bebida refrescante", 5500, catCervezas,
				"https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&h=300&fit=crop");
		dao.insertRaw("Adicional michelada", "Sal y limón", 2000, catCervezas,
				"https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop");
		// Corona beer
		dao.insertRaw("Corona", "Cerveza importada", 11000, catCervezas,
				"https://images.unsplash.com/photo-1600788886242-5c96aabe3757?w=400&h=300&fit=crop");
		// Michelada
		dao.insertRaw("Coronita michelada", "Con mango biche ó fresa y granadina", 16500, catCervezas,
				"https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=300&fit=crop");
		// Craft beer
		dao.insertRaw("Cordilleras rosada", "Artesanal", 10500, catCervezas,
				"https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop");
		dao.insertRaw("Cordilleras rosada michelada", "Con mango ó fresa y granadina", 17000, catCervezas,
				"https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=300&fit=crop");
		// Beer
		dao.insertRaw("Club Dorada/Negra/Roja", "Nacional", 7500, catCervezas,
				"https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&h=300&fit=crop");
		dao.insertRaw("Águila Light", "Nacional", 6500, catCervezas,
				"https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&h=300&fit=crop");
		dao.insertRaw("Poker", "Nacional", 6500, catCervezas,
				"https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&h=300&fit=crop");

		// ===== COCTELES CON LICOR =====
		// Margarita
		dao.insertRaw("Margarita Tradicional", "Tequila, triple c, limón, hielo", 24000, catCoctelesLicor,
				"https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop");
		// Strawberry margarita
		dao.insertRaw("Margarita Fresa", "Con fresa", 26500, catCoctelesLicor,
				"https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400&h=300&fit=crop");
		// Piña colada
		dao.insertRaw("Piña Colada", "Ron blanco, crema de coco, piña, lecherita", 24000, catCoctelesLicor,
				"https://images.unsplash.com/photo-1587223962217-f4f58b95f319?w=400&h=300&fit=crop");
		// Daiquiri
		dao.insertRaw("Daikiri Tradicional", "Ron blanco, limón, azúcar, hielo", 22000, catCoctelesLicor,
				"https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=300&fit=crop");
		dao.insertRaw("Daikiri Maracuyá ó Fresa", "Frutal", 24500, catCoctelesLicor,
				"https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400&h=300&fit=crop");
		// Mojito
		dao.insertRaw("Mojito Cubano", "Ron, soda, limón, hierbabuena", 23500, catCoctelesLicor,
				"https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop");
		// Tequila sunrise
		dao.insertRaw("Tequila Sunrise", "Tequila, limón, naranja, granadina", 23000, catCoctelesLicor,
				"https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=400&h=300&fit=crop");

		// ===== COCTELES SIN LICOR =====
		// Virgin cocktail
		dao.insertRaw("San Francisco", "Limón, piña, naranja, granadina, soda", 17000, catCoctelesSin,
				"https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&h=300&fit=crop");
		// Passion fruit cocktail
		dao.insertRaw("Pasión", "Maracuyá, limón, mandarina, granadina", 17500, catCoctelesSin,
				"https://images.unsplash.com/photo-1560526860-1f0e6cda0e5f?w=400&h=300&fit=crop");

		// ===== HAMBURGUESAS =====
		// Classic burger
		dao.insertRaw("Hamburguesa Sencilla",
				"Carne, queso, tocineta, lechuga, cebolla caramelizada, tomate, ripio de papa y salsa la Aldea", 19000,
				catHamburguesas, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop");
		// Double burger
		dao.insertRaw("Hamburguesa Especial",
				"Doble carne, doble queso, tocineta, lechuga, cebolla caramelizada, tomate, ripio de papa", 23500,
				catHamburguesas, "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop");
		// Loaded burger
		dao.insertRaw("Caníbal",
				"Carne de res, chorizo, tocineta, huevo, queso, lechuga, cebolla caramelizada, tomate, pan apanado en doritos, ripio de papa y salsa de la Aldea",
				29500, catHamburguesas,
				"https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=300&fit=crop");

		// ===== PICADAS Y CARNES =====
		// Grilled meat platter
		dao.insertRaw("Picada para 2",
				"Carne de res, pollo, cerdo, chorizo, maduro, papa criolla, arepa, lechuga, tomate cherry, limón. Con dos salsas",
				39000, catPicadas, "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop");
		dao.insertRaw("Picada Familiar",
				"Carne de res, pollo, cerdo, chorizo, maduro, papa criolla, arepa, lechuga, tomate cherry, limón. Con dos salsas",
				72000, catPicadas, "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop");
		// Chicken skewer
		dao.insertRaw("Pincho La Aldea",
				"Pincho de pollo con 150 gr de cascos de papa, tomate, lechuga y salsa de la Aldea", 18000, catPicadas,
				"https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=300&fit=crop");
		// BBQ wings
		dao.insertRaw("Alitas BBQ", "6 unidades de alitas de pollo con 200 gr de cascos de papa, lechuga, tomate",
				23000, catPicadas, "https://images.unsplash.com/photo-1527477396000-e27163b4a5ef?w=400&h=300&fit=crop");
		// French fries
		dao.insertRaw("Porción de papas", "Papa tradicional 200 gr", 8000, catPicadas,
				"https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop");
		// Chicken nuggets
		dao.insertRaw("Nuggets", "Nuggets de pollo, 150 gr de papas a la francesa y salsa", 17500, catPicadas,
				"https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop");

		// ===== SALCHIPAPA =====
		// Fries with sausage (salchipapa)
		dao.insertRaw("Salchipapa Sencilla", "300 gr de papa y salchicha tradicional, acompañada de salsa la Aldea",
				16500, catSalchipapa,
				"https://images.unsplash.com/photo-1585109649139-366815a0d713?w=400&h=300&fit=crop");
		dao.insertRaw("Salchipapa Mixta",
				"300 gr de papa y salchicha tradicional con carne y pollo desmechado y queso montado. Con salsa de la Aldea",
				25000, catSalchipapa,
				"https://images.unsplash.com/photo-1585109649139-366815a0d713?w=400&h=300&fit=crop");

		// ===== PATACONES =====
		// Fried plantain
		dao.insertRaw("Patacón Sencillo", "Carne ó pollo desmechado en salsa de hogao, maicitos, queso", 18500,
				catPatacones, "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop");
		dao.insertRaw("Patacón Mixto", "Carne y pollo desmechado en salsa de hogao, maicitos, queso", 21000,
				catPatacones, "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop");
		dao.insertRaw("Patacón Ranchero", "Pollo desmechado en salsa de hogao, salchicha ranchera, maicitos, queso",
				21000, catPatacones,
				"https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop");

		// ===== PARA COMPARTIR =====
		// Nachos with cheese
		dao.insertRaw("Nachos Sencillos", "Nachos acompañados de queso Cheddar caliente en mesa", 18500, catCompartir,
				"https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=300&fit=crop");
		// Loaded nachos
		dao.insertRaw("Nachos Mixtos",
				"Nachos crujientes con carne y pollo desmechado en salsa de hogao. Queso Cheddar fondue", 25000,
				catCompartir, "https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=400&h=300&fit=crop");
		// Empanadas
		dao.insertRaw("Empanadas x6", "6 unidades acompañadas de salsa de la Aldea", 18000, catCompartir,
				"https://images.unsplash.com/photo-1604467707321-70d009801bf5?w=400&h=300&fit=crop");
		// Fried plantain
		dao.insertRaw("Tostón verdes con hogao", "6 unidades", 10000, catCompartir,
				"https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop");
		dao.insertRaw("Tapitas de tostón",
				"Tostón verde con carne y pollo desmechado con hogao x 6 unidades. Queso montado", 18000, catCompartir,
				"https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop");
		// Bruschetta/tostada
		dao.insertRaw("Tostaditas de hierbas", "Con carne desmechada en salsa bbq. 8 unidades", 16000, catCompartir,
				"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop");

		// ===== SANDWICH Y WRAPS =====
		// Chicken sandwich
		dao.insertRaw("Sandwich de Pollo", "Pollo desmechado, maíz tierno, lechuga, jamón y queso", 17500, catSandwich,
				"https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop");
		// Wrap
		dao.insertRaw("Wrap Proteína",
				"Pechuga asada ó carne desmechada, lechuga crespa, guacamole, queso, aros de cebolla caramelizada y tomate. Tortilla integral",
				18500, catSandwich,
				"https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop");
		dao.insertRaw("Wrap Hawaiano", "Queso, jamón, piña calada. Envuelto en tortilla integral", 15500, catSandwich,
				"https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop");

		// ===== DESGRANADOS =====
		// Corn bowl (elote)
		dao.insertRaw("Maicitos Pollo", "Pollo, queso, tocineta, maduro", 19500, catDesgranados,
				"https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop");
		dao.insertRaw("Maicitos Mixtos", "Carne, pollo, tocineta, queso, maduro", 23000, catDesgranados,
				"https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop");
		dao.insertRaw("Maicitos Rancheros", "Pollo, salchicha ranchera, tocineta, queso, maduro", 22500, catDesgranados,
				"https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop");
	}
}
