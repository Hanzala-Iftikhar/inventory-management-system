const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// GET all brands — paginated
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'asc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const safeSort = sortBy === 'name' ? 'name' : 'id';
    const orderBy = { [safeSort]: sortOrder === 'desc' ? 'desc' : 'asc' };

    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        skip,
        take: parseInt(limit),
        orderBy,
        include: { _count: { select: { items: true, models: true } } },
      }),
      prisma.brand.count(),
    ]);

    res.json({
      data: brands,
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

// GET all brands (no pagination) — for dropdowns
router.get('/all', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST — create brand
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

    const brand = await prisma.brand.create({
      data: { name: name.trim() },
      include: { _count: { select: { items: true, models: true } } },
    });
    res.status(201).json(brand);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Brand name already exists' });
    res.status(500).json({ error: err.message });
  }
});

// PUT — update brand
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

    const brand = await prisma.brand.update({
      where: { id: parseInt(req.params.id) },
      data: { name: name.trim() },
      include: { _count: { select: { items: true, models: true } } },
    });
    res.json(brand);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Brand name already exists' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE — blocked if brand has items (business rule CR3)
router.delete('/:id', async (req, res) => {
  try {
    const brandId = parseInt(req.params.id);

    const itemCount = await prisma.item.count({ where: { brandId } });
    if (itemCount > 0) {
      return res.status(400).json({
        error: 'This brand cannot be deleted because it contains inventory.',
      });
    }

    await prisma.model.deleteMany({ where: { brandId } });
    await prisma.brand.delete({ where: { id: brandId } });
    res.json({ message: 'Brand deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;