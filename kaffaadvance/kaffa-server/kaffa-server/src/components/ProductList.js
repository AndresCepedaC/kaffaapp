import React from "react";

export default function ProductList({ products, onAdd }) {
  return (
    <div style={{ flex: 1, marginRight: 16 }}>
      <h2>Productos</h2>
      <div style={{ maxHeight: 300, overflowY: "auto", border: "1px solid #ccc" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.description}</td>
                <td>{p.price}</td>
                <td>
                  <button onClick={() => onAdd(p)}>Agregar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
