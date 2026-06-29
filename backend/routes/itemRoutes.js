const express = require('express');
const router  = express.Router();
const prisma  = require('../prisma');

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

// GET all items — paginated
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
        skip, take: parseInt(limit), where, orderBy,