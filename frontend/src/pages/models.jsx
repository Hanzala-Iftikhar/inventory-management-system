import { useState, useEffect, useCallback } from 'react';

const API = 'https://inventory-management-system-nine-ochre.vercel.app/api';

function SortIcon({ col, sort }) {
  if (sort.sortBy !== col) return <span className="sort-icon">↕</span>;
  return <span className="sort-icon active">{sort.sortOrder === 'asc' ? '↑' : '↓'}</span>;
}

function Models() {
  const [models, setModels]         = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [sort, setSort]             = useState({ sortBy: 'id', sortOrder: 'asc' });
  const [loading, setLoading]       = useState(false);
  const [brands, setBrands]         = useState([]);
  const [modal, setModal]           = useState({ open: false, mode: 'add', model: null });
  const [form, setForm]             = useState({ name: '', brandId: '' });
  const [formError, setFormError]   = useState('');
  const [delDialog, setDelDialog]   = useState({ open: false, model: null });

  useEffect(() => {
    fetch(`${API}/brands/all`)
      .then(r => r.json())
      .then(setBrands)
      .catch(console.error);
  }, []);

  const fetchModels = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10, ...sort });
      const res = await fetch(`${API}/models?${params}`);
      const data = await res.json();
      setModels(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    fetchModels(1);
  }, [sort]);

  const handleSort = (col) => {
    setSort(prev => ({
      sortBy: col,
      sortOrder: prev.sortBy === col && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const openAdd = () => {
    setForm({ name: '', brandId: '' });
    setFormError('');
    setModal({ open: true, mode: 'add', model: null });
  };

  const openEdit = (model) => {
    setForm({ name: model.name, brandId: model.brand?.id || model.brandId });
    setFormError('');
    setModal({ open: true, mode: 'edit', model });
  };

  const closeModal = () => {
    setModal(p => ({ ...p, open: false }));
  };

  const handleFormSubmit = async () => {
    setFormError('');
    if (!form.name.trim()) return setFormError('Name is required');
    if (!form.brandId) return setFormError('Brand is required');

    const url = modal.mode === 'add' ? `${API}/models` : `${API}/models/${modal.model.id}`;
    const method = modal.mode === 'add' ? 'POST' : 'PUT';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const e = await res.json();
        return setFormError(e.error);
      }
      closeModal();
      fetchModels(modal.mode === 'add' ? 1 : pagination.page);
    } catch {
      setFormError('Request failed. Is backend running?');
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`${API}/models/${delDialog.model.id}`, {
        method: 'DELETE',
      });
      setDelDialog({ open: false, model: null });
      fetchModels(pagination.page);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page">

      <div className="page-header">
        <h1>Models</h1>
        <button className="btn btn-primary" onClick={openAdd}>
          + Add New Model
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>
                ID <SortIcon col="id" sort={sort} />
              </th>
              <th onClick={() => handleSort('name')}>
                Name <SortIcon col="name" sort={sort} />
              </th>
              <th onClick={() => handleSort('brand')}>
                Brand <SortIcon col="brand" sort={sort} />
              </th>
              <th>Items Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center">Loading...</td>
              </tr>
            ) : models.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">No models found</td>
              </tr>
            ) : (
              models.map(model => (
                <tr key={model.id}>
                  <td>{model.id}</td>
                  <td>{model.name}</td>
                  <td>{model.brand?.name || '—'}</td>
                  <td><span className="badge">{model._count.items}</span></td>
                  <td>
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={() => openEdit(model)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={() => setDelDialog({ open: true, model })}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>Total: {pagination.total} models</span>
        <div className="pagination-controls">
          <button
            className="btn btn-sm btn-ghost"
            disabled={pagination.page <= 1}
            onClick={() => fetchModels(pagination.page - 1)}>
            Prev
          </button>
          <span>Page {pagination.page} of {pagination.totalPages || 1}</span>
          <button
            className="btn btn-sm btn-ghost"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchModels(pagination.page + 1)}>
            Next
          </button>
        </div>
      </div>

      {modal.open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal.mode === 'add' ? 'Add New Model' : 'Edit Model'}</h2>
              <button className="modal-close" onClick={closeModal}>X</button>
            </div>
            <div className="modal-body">
              {formError && (
                <p className="error-msg">{formError}</p>
              )}
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  placeholder="Model name"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Brand *</label>
                <select
                  value={form.brandId}
                  onChange={e => setForm(p => ({ ...p, brandId: e.target.value }))}>
                  <option value="">Select Brand</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
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
            <div className="modal-header">
              <h2>Delete Model</h2>
            </div>
            <div className="modal-body">
              <p style={{ color: '#475569' }}>
                Delete <strong>{delDialog.model?.name}</strong>?
                All items linked to this model will also be removed.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-ghost"
                onClick={() => setDelDialog({ open: false, model: null })}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Models;