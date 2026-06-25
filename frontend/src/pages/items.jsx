import { useState, useEffect, useCallback } from 'react';

const API = '/api';
const emptyForm   = { name: '', amount: '', brandId: '', modelId: '' };
const emptySearch = { name: '', brandId: '', modelId: '', dateFrom: '', dateTo: '' };

function SortIcon({ col, sort }) {
  if (sort.sortBy !== col) return <span className="sort-icon">↕</span>;
  return <span className="sort-icon active">{sort.sortOrder === 'asc' ? '↑' : '↓'}</span>;
}

function Items() {
  const [items, setItems]               = useState([]);
  const [pagination, setPagination]     = useState({ total: 0, page: 1, totalPages: 1 });
  const [sort, setSort]                 = useState({ sortBy: 'createdAt', sortOrder: 'desc' });
  const [loading, setLoading]           = useState(false);
  const [search, setSearch]             = useState(emptySearch);
  const [appliedSearch, setAppliedSearch] = useState(emptySearch);
  const [brands, setBrands]             = useState([]);
  const [allModels, setAllModels]       = useState([]);
  const [formModels, setFormModels]     = useState([]);
  const [modal, setModal]               = useState({ open: false, mode: 'add', item: null });
  const [form, setForm]                 = useState(emptyForm);
  const [formError, setFormError]       = useState('');
  const [delDialog, setDelDialog]       = useState({ open: false, id: null });

  useEffect(() => {
    fetch(`${API}/brands/all`).then(r => r.json()).then(setBrands).catch(console.error);
    fetch(`${API}/models/all`).then(r => r.json()).then(setAllModels).catch(console.error);
  }, []);

  const fetchItems = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10, ...sort });
      Object.entries(appliedSearch).forEach(([k, v]) => { if (v) params.set(k, v); });
      const res  = await fetch(`${API}/items?${params}`);
      const data = await res.json();
      setItems(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sort, appliedSearch]);

  useEffect(() => { fetchItems(1); }, [sort, appliedSearch]);

  const handleSort = (col) => {
    setSort(prev => ({
      sortBy: col,
      sortOrder: prev.sortBy === col && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const applySearch = () => setAppliedSearch({ ...search });
  const clearSearch = () => { setSearch(emptySearch); setAppliedSearch(emptySearch); };

  const searchModels = search.brandId
    ? allModels.filter(m => m.brandId === parseInt(search.brandId))
    : allModels;

  const openAdd = () => {
    setForm(emptyForm);
    setFormModels([]);
    setFormError('');
    setModal({ open: true, mode: 'add', item: null });
  };

  const openEdit = (item) => {
    setForm({ name: item.name, amount: item.amount, brandId: item.brandId, modelId: item.modelId || '' });
    setFormError('');
    if (item.brandId) {
      fetch(`${API}/models/by-brand/${item.brandId}`).then(r => r.json()).then(setFormModels);
    }
    setModal({ open: true, mode: 'edit', item });
  };

  const closeModal = () => setModal(p => ({ ...p, open: false }));

  const handleFormBrand = (brandId) => {
    setForm(p => ({ ...p, brandId, modelId: '' }));
    if (brandId) {
      fetch(`${API}/models/by-brand/${brandId}`).then(r => r.json()).then(setFormModels);
    } else {
      setFormModels([]);
    }
  };

  const handleFormSubmit = async () => {
    setFormError('');
    if (!form.name.trim())                          return setFormError('Name is required');
    if (form.amount === '' || isNaN(form.amount))   return setFormError('Valid amount is required');
    if (!form.brandId)                              return setFormError('Brand is required');

    const url    = modal.mode === 'add' ? `${API}/items` : `${API}/items/${modal.item.id}`;
    const method = modal.mode === 'add' ? 'POST' : 'PUT';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const e = await res.json(); return setFormError(e.error); }
      closeModal();
      fetchItems(modal.mode === 'add' ? 1 : pagination.page);
    } catch {
      setFormError('Request failed. Is backend running?');
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`${API}/items/${delDialog.id}`, { method: 'DELETE' });
      setDelDialog({ open: false, id: null });
      fetchItems(pagination.page);
    } catch (err) { console.error(err); }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    Object.entries(appliedSearch).forEach(([k, v]) => { if (v) params.set(k, v); });
    window.open(`${API}/items/export?${params}`, '_blank');
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Items</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleExport}>⬇ Export CSV</button>
          <button className="btn btn-primary" onClick={openAdd}>+ Add New Item</button>
        </div>
      </div>

      <div className="search-box">
        <input
          type="text" placeholder="Search by name…"
          value={search.name}
          onChange={e => setSearch(p => ({ ...p, name: e.target.value }))}
          style={{ minWidth: 160 }}
        />
        <select value={search.brandId} onChange={e => setSearch(p => ({ ...p, brandId: e.target.value, modelId: '' }))}>
          <option value="">All Brands</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={search.modelId} onChange={e => setSearch(p => ({ ...p, modelId: e.target.value }))}>
          <option value="">All Models</option>
          {searchModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <input type="date" value={search.dateFrom} onChange={e => setSearch(p => ({ ...p, dateFrom: e.target.value }))} />
        <span>to</span>
        <input type="date" value={search.dateTo}   onChange={e => setSearch(p => ({ ...p, dateTo: e.target.value }))} />
        <button className="btn btn-primary" onClick={applySearch}>Search</button>
        <button className="btn btn-ghost"   onClick={clearSearch}>Clear</button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>ID <SortIcon col="id" sort={sort} /></th>
              <th onClick={() => handleSort('name')}>Name <SortIcon col="name" sort={sort} /></th>
              <th onClick={() => handleSort('amount')}>Amount <SortIcon col="amount" sort={sort} /></th>
              <th>Brand</th>
              <th>Model</th>
              <th onClick={() => handleSort('createdAt')}>Date Added <SortIcon col="createdAt" sort={sort} /></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="text-center">No items found</td></tr>
            ) : items.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>Rs. {Number(item.amount).toLocaleString()}</td>
                <td>{item.brand?.name || '—'}</td>
                <td>{item.model?.name || '—'}</td>
                <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-sm btn-edit"   onClick={() => openEdit(item)}>Edit</button>
                  <button className="btn btn-sm btn-delete" onClick={() => setDelDialog({ open: true, id: item.id })}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>Total: {pagination.total} items</span>
        <div className="pagination-controls">
          <button className="btn btn-sm btn-ghost" disabled={pagination.page <= 1} onClick={() => fetchItems(pagination.page - 1)}>← Prev</button>
          <span>Page {pagination.page} of {pagination.totalPages || 1}</span>
          <button className="btn btn-sm btn-ghost" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchItems(pagination.page + 1)}>Next →</button>
        </div>
      </div>

      {modal.open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal.mode === 'add' ? 'Add New Item' : 'Edit Item'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {formError && <p className="error-msg">{formError}</p>}
              <div className="form-group">
                <label>Name *</label>
                <input type="text" placeholder="Item name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Amount *</label>
                <input type="number" placeholder="0" min="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Brand *</label>
                <select value={form.brandId} onChange={e => handleFormBrand(e.target.value)}>
                  <option value="">Select Brand</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Model (optional)</label>
                <select value={form.modelId} disabled={!form.brandId} onChange={e => setForm(p => ({ ...p, modelId: e.target.value }))}>
                  <option value="">No Model</option>
                  {formModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleFormSubmit}>Save</button>
            </div>
          </div>
        </div>
      )}

      {delDialog.open && (
        <div className="modal-overlay">
          <div className="modal modal-sm">
            <div className="modal-header"><h2>Confirm Delete</h2></div>
            <div className="modal-body">
              <p style={{ color: '#475569' }}>Are you sure you want to delete this item?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDelDialog({ open: false, id: null })}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Items;