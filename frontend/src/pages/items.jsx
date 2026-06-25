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
      <div