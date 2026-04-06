import { useMemo } from 'react';

/**
 * SEO component that dynamically injects meta tags for categories and products.
 * Uses vanilla DOM manipulation to avoid adding react-helmet dependency.
 */
export default function SEOHead({ title, description, keywords, canonical }) {
  useMemo(() => {
    // Update document title
    document.title = title || 'Kaffa La Aldea | Café · Cocina · Cocteles';

    // Update or create meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description || 'Kaffa La Aldea - Tu cafetería artesanal favorita. Café de origen, cocina artesanal, cocteles premium, waffles, hamburguesas y más. ¡Ordena en línea!';

    // Update or create meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = keywords || 'kaffa, café, cafetería, artesanal, cocteles, hamburguesas, waffles, pedidos en línea, restaurante';

    // Update or create Open Graph tags
    const ogTags = {
      'og:title': title || 'Kaffa La Aldea',
      'og:description': description || 'Tu cafetería artesanal favorita. Café de origen, cocina artesanal y cocteles premium.',
      'og:type': 'website',
      'og:site_name': 'Kaffa La Aldea',
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.content = content;
    });

    // Canonical URL
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    }
  }, [title, description, keywords, canonical]);

  return null; // This component doesn't render anything
}
