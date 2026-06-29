import { useState, useEffect } from 'react';
import './catalog.css';

const API = '/api';
const PLACEHOLDER = 'https://placehold.co/400x300/f1f5f9/94a3b8?text=No+Image';

function Catalog() {
  const [items, setItems]     = useState([]);
  const [brands, setBrands]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/items/catalog`).then(r => r.json()),
      fetch(`${API}/brands/all`).then(r => r.json()),
    ]).then(([itemsData, brandsData]) => {
      setItems(itemsData);
      setBrands(brandsData);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const filtered = items.filter(item => {
    const matchName  = item.name.toLowerCase().includes(search.toLowerCase());
    const matchBrand = brandFilter ? item.brandId === parseInt(brandFilter) : true;
    return matchName && matchBrand;
  });

  const groupedByBrand = brands.map(brand => ({
    brand,
    items: filtered.filter(item => item.brandId === brand.id)
  })).filter(group => group.items.length > 0);

  if (loading) {
    return (
      <div className="catalog-loading">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="catalog-page">

      {/* Search Bar */}
      <div className="catalog-topbar">
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="catalog-search"
        />
        <select
          value={brandFilter}
          onChange={e => setBrandFilter(e.target.value)}
          className="catalog-select">
          <option value="">All Brands</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        {(search || brandFilter) && (
          <button className="catalog-clear"
            onClick={() => { setSearch(''); setBrandFilter(''); }}>
            ✕ Clear
          </button>
        )}
        <span className="catalog-count">{filtered.length} products</span>
      </div>

      {/* No Results */}
      {filtered.length === 0 && (
        <div className="catalog-empty">
          <p>😕 No products found</p>
        </div>
      )}

      {/* Products Grouped by Brand */}
      {groupedByBrand.map(({ brand, items: brandItems }) => (
        <div key={brand.id} className="brand-section">
          <div className="brand-header">
            <h2>{brand.name} Products</h2>
            <span className="brand-count">{brandItems.length} items</span>
          </div>
          <div className="catalog-grid">
            {brandItems.map(item => (
              <div key={item.id} className="product-card"
                onClick={() => setSelected(item)}>
                <div className="product-image-wrap">
                  <img
                    src={item.imageUrl || PLACEHOLDER}
                    alt={item.name}
                    className="product-image"
                    onError={e => { e.target.src = PLACEHOLDER; }}
                  />
                  {item.category && (
                    <span className="product-badge">{item.category}</span>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-name">{item.name}</h3>
                  <p className="product-price">
                    Rs. {Number(item.amount).toLocaleString()}
                  </p>
                  <div className="product-meta-row">
                    <span className="product-brand-tag">🏷️ {item.brand?.name}</span>
                    {item.model && (
                      <span className="product-model-tag">📦 {item.model?.name}</span>
                    )}
                  </div>
                  {item.description && (
                    <p className="product-desc">{item.description}</p>
                  )}
                  <span className="product-link">View details →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Detail Popup */}
      {selected && (
        <div className="catalog-overlay" onClick={() => setSelected(null)}>
          <div className="catalog-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-x" onClick={() => setSelected(null)}>✕</button>
            <img
              src={selected.imageUrl || PLACEHOLDER}
              alt={selected.name}
              className="modal-image"
              onError={e => { e.target.src = PLACEHOLDER; }}
            />
            <div className="modal-body">
              <h2 className="modal-title">{selected.name}</h2>
              <p className="modal-price">
                Rs. {Number(selected.amount).toLocaleString()}
              </p>
              <div className="modal-details">
                <div className="modal-row">
                  <span>Brand</span>
                  <strong>{selected.brand?.name}</strong>
                </div>
                {selected.model && (
                  <div className="modal-row">
                    <span>Model</span>
                    <strong>{selected.model?.name}</strong>
                  </div>
                )}
                {selected.category && (
                  <div className="modal-row">
                    <span>Category</span>
                    <strong>{selected.category}</strong>
                  </div>
                )}
                <div className="modal-row">
                  <span>Date Added</span>
                  <strong>{new Date(selected.createdAt).toLocaleDateString()}</strong>
                </div>
              </div>
              {selected.description && (
                <div className="modal-desc">
                  <h4>Description</h4>
                  <p>{selected.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Catalog;