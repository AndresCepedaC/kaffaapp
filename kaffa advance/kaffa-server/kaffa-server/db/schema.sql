CREATE TABLE IF NOT EXISTS product (
                                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                                       name TEXT NOT NULL,
                                       description TEXT,
                                       price REAL NOT NULL,
                                       category_id INTEGER,
                                       active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
                                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                                      created_at TEXT,
                                      total REAL,
                                      notes TEXT,
                                      tip_or_discount_percent REAL,
                                      is_tip INTEGER
);

CREATE TABLE IF NOT EXISTS order_items (
                                           id INTEGER PRIMARY KEY AUTOINCREMENT,
                                           order_id INTEGER NOT NULL,
                                           product_id INTEGER NOT NULL,
                                           quantity INTEGER NOT NULL,
                                           unit_price REAL NOT NULL,
                                           FOREIGN KEY (order_id) REFERENCES orders(id)
    );
