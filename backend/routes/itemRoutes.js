const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// Helper function — builds search/filter conditions
function buildWhere({ name, brandId, modelId, dateFrom, dateTo }) {
  const where = {};
  if (name)    where.name    = { contains: name };
  if (brandId) where.brandId = parseInt(brandId);
  if (modelId) where.modelId = parseInt(modelId);
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo)   where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z');
  }
  return where;
}

// GET all items — paginated, sorted, searchable
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const where = buildWhere(req.query);

    const allowedSort = { id: true, name: true, amount: true, createdAt: true };
    const safeSort    = allowedSort[sortBy] ? sortBy : 'createdAt';
    const orderBy     = { [safeSort]: sortOrder === 'asc' ? 'asc' : 'desc' };

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        skip,
        take: parseInt(limit),
        where,
        orderBy,
        include: {
          brand: { select: { name: true } },
          model: { select: { name: true } },
        },
      }),
      prisma.item.count({ where }),
    ]);

    res.json({
      data: items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /items/export — download as CSV (respects search filters)
// IMPORTANT: this must be ABOVE the /:id route
router.get('/export', async (req, res) => {
  try {
    const where = buildWhere(req.query);

    const items = await prisma.item.findMany({
      where,
      include: {
        brand: { select: { name: true } },
        model: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const escape = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

    const headers = ['ID', 'Name', 'Amount', 'Brand', 'Model', 'Date Added'];
    const rows    = items.map((i) => [
      i.id,
      escape(i.name),
      i.amount,
      escape(i.brand?.name),
      escape(i.model?.name || ''),
      new Date(i.createdAt).toISOString().split('T')[0],
    ]);

    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="items.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST — create item
router.post('/', async (req, res) => {
  try {
    const { name, amount, brandId, modelId } = req.body;
    if (!name?.trim())                          return res.status(400).json({ error: 'Name is required' });
    if (amount === undefined || isNaN(amount))  return res.status(400).json({ error: 'Valid amount is required' });
    if (!brandId)                               return res.status(400).json({ error: 'Brand is required' });

    const item = await prisma.item.create({
      data: {
        name:    name.trim(),
        amount:  parseFloat(amount),
        brandId: parseInt(brandId),
        modelId: modelId ? parseInt(modelId) : null,
      },
      include: {
        brand: { select: { name: true } },
        model: { select: { name: true } },
      },
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT — update item
router.put('/:id', async (req, res) => {
  try {
    const { name, amount, brandId, modelId } = req.body;
    if (!name?.trim())                          return res.status(400).json({ error: 'Name is required' });
    if (amount === undefined || isNaN(amount))  return res.status(400).json({ error: 'Valid amount is required' });
    if (!brandId)                               return res.status(400).json({ error: 'Brand is required' });

    const item = await prisma.item.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name:    name.trim(),
        amount:  parseFloat(amount),
        brandId: parseInt(brandId),
        modelId: modelId ? parseInt(modelId) : null,
      },
      include: {
        brand: { select: { name: true } },
        model: { select: { name: true } },
      },
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE — delete single item
router.delete('/:id', async (req, res) => {
  try {
    await prisma.item.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;