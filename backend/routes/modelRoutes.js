const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// GET all models — paginated
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'asc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orderBy =
      sortBy === 'brand'
        ? { brand: { name: sortOrder === 'desc' ? 'desc' : 'asc' } }
        : { [sortBy]: sortOrder === 'desc' ? 'desc' : 'asc' };

    const [models, total] = await Promise.all([
      prisma.model.findMany({
        skip,
        take: parseInt(limit),
        orderBy,
        include: {
          brand: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.model.count(),
    ]);

    res.json({
      data: models,
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

// GET all models (no pagination) — for dropdowns
router.get('/all', async (req, res) => {
  try {
    const models = await prisma.model.findMany({
      select: { id: true, name: true, brandId: true },
      orderBy: { name: 'asc' },
    });
    res.json(models);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET models by brand — for item form dropdown
router.get('/by-brand/:brandId', async (req, res) => {
  try {
    const models = await prisma.model.findMany({
      where: { brandId: parseInt(req.params.brandId) },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    res.json(models);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST — create model
router.post('/', async (req, res) => {
  try {
    const { name, brandId } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!brandId) return res.status(400).json({ error: 'Brand is required' });

    const model = await prisma.model.create({
      data: { name: name.trim(), brandId: parseInt(brandId) },
      include: {
        brand: { select: { name: true } },
        _count: { select: { items: true } },
      },
    });
    res.status(201).json(model);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT — update model
router.put('/:id', async (req, res) => {
  try {
    const { name, brandId } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!brandId) return res.status(400).json({ error: 'Brand is required' });

    const model = await prisma.model.update({
      where: { id: parseInt(req.params.id) },
      data: { name: name.trim(), brandId: parseInt(brandId) },
      include: {
        brand: { select: { name: true } },
        _count: { select: { items: true } },
      },
    });
    res.json(model);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE — removes related items first, then deletes model
router.delete('/:id', async (req, res) => {
  try {
    const modelId = parseInt(req.params.id);
    await prisma.item.deleteMany({ where: { modelId } });
    await prisma.model.delete({ where: { id: modelId } });
    res.json({ message: 'Model deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;