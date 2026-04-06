import { useState, useEffect, useMemo } from 'react';
import { getCategories, getProducts } from '../services/api';

export default function useProducts() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getCategories(), getProducts()])
      .then(([catData, prodData]) => {
        setCategories(catData);
        setProducts(prodData);
        if (catData.length > 0) setSelectedCategory(catData[0].id);
        setError(null);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
      })
      .finally(() => {
        setTimeout(() => setIsLoading(false), 400);
      });
  }, []);

  const filteredProducts = useMemo(() => {
    if (searchTerm) {
      return products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory) {
      return products.filter(p => !p.category || p.category.id === selectedCategory);
    }
    return products;
  }, [products, searchTerm, selectedCategory]);

  return {
    categories,
    products,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    isLoading,
    error,
    filteredProducts,
  };
}
