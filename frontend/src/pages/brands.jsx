import { useState, useEffect, useCallback } from 'react';

const API = 'https://inventory-management-system-nine-ochre.vercel.app';

function SortIcon({ col, sort }) {
  if (sort.sortBy !== col) return <span className="sort-icon">↕</span>;
  return <span className="sort-icon active">{sort.sortOrder === 'asc' ? '↑' : '↓'}</span>;
}

function Brands() {
  const [brands, setBrands]         = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [sort, setSort]             = useState({ sortBy: 'id', sortOrder: 'asc' });
  const [loading, setLoading]       = useState(false);
  const [modal, setModal]           = useState({ open: false, mode: 'add', brand: null });
  const [form, setForm]             = useState({ name: '' });
  const [formError, setFormError]   = useState('');
  const [delDialog, setDelDialog]   = useState({ open: false, brand: null });
  const [delError, setDelError]     = useState('');

  const fetchBrands = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10, ...sort });
      const res = await fetch(`${API}/brands?${params}`);
      const data = await res.json();
      setBrands(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    fetchBrands(1);
  }, [sort]);

  const handleSort = (col) => {
    setSort(prev => ({
      sortBy: col,
      sortOrder: prev.sortBy === col && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const openAdd = () => {
    setForm({ name: '' });
    setFormError('');
    setModal({ open: true, mode: 'add', brand: null });
  };

  const openEdit = (brand) => {
    setForm({ name: brand.name });
    setFormError('');
    setModal({ open: true, mode: 'edit', brand });
  };

  const closeModal = () => {
    setModal(p => ({ ...p, open: false }));
  };

  const handleFormSubmit = async () => {
    setFormError('');
    if (!form.name.trim()) {
      return setFormError('Name is required');
    }
    const url = modal.mode === 'add' ? `${API}/brands` : `${API}/brands/${modal.brand.id}`;
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
      fetchBrands(modal.mode === 'add' ? 1 : pagination.page);
    } catch {
      setFormError('Request failed. Is backend running?');
    }
  };

  const openDelDialog = (brand) => {
    setDelError('');
    setDelDialog({ open: true, brand });
  };

  const handleDelete = async () => {
    setDelError('');
    try {
      const res = await fetch(`${API}/brands/${delDialog.brand.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const e = await res.json();
        return setDelError(e.error);
      }
      setDelDialog({ open: false, brand: null });
      fetchBrands(pagination.page);
    } catch {
      setDelError('Request failed.');
    }
  };

  return (
    <div className="page">

      <div className="page-header">
        <h1>Brands</h1>
        <button className="btn btn-primary" onClick={openAdd}>
          + Add New Brand
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
              <th>Items Count</th>
              <th>Models Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center">Loading...</td>
              </tr>
            ) : brands.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">No brands found</td>
              </tr>
            ) : (
              brands.map(brand => (
                <tr key={brand.id}>
                  <td>{brand.id}</td>
                  <td><strong>{brand.name}</strong></td>
                  <td><span className="badge">{brand._count.items}</span></td>
                  <td><span className="badge">{brand._count.models}</span></td>
                  <td>
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={() => openEdit(brand)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={() => openDelDialog(brand)}>
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
        <span>Total: {pagination.total} brands</span>
        <div className="pagination-controls">
          <button
            className="btn btn-sm btn-ghost"
            disabled={pagination.page <= 1}
            onClick={() => fetchBrands(pagination.page - 1)}>
            Prev
          </button>
          <span>Page {pagination.page} of {pagination.totalPages || 1}</span>
          <button
            className="btn btn-sm btn-ghost"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchBrands(pagination.page + 1)}>
            Next
          </button>
        </div>
      </div>

      {modal.open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal.mode === 'add' ? 'Add New Brand' : 'Edit Brand'}</h2>
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
                  placeholder="Brand name"
                  value={form.name}
                  onChange={e => setForm({ name: e.target.value })}
                />
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
              <h2>Delete Brand</h2>
            </div>
            <div className="modal-body">
              {delError ? (
                <p className="error-msg">{delError}</p>
              ) : (
                <p style={{ color: '#475569' }}>
                  Delete <strong>{delDialog.brand?.name}</strong>?
                  This will also remove all its models.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-ghost"
                onClick={() => setDelDialog({ open: false, brand: null })}>
                {delError ? 'Close' : 'Cancel'}
              </button>
              {!delError && (
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Brands;