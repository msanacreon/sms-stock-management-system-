const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [warehouses] = await pool.query(
      'SELECT * FROM Warehouse ORDER BY warehouseName ASC'
    );
    res.json(warehouses);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { warehouseCode, warehouseName, warehouseLocation } = req.body;

    await pool.query(
      `INSERT INTO Warehouse (warehouseCode, warehouseName, warehouseLocation)
       VALUES (?, ?, ?)`,
      [warehouseCode, warehouseName, warehouseLocation]
    );

    res.status(201).json({ message: 'Warehouse recorded successfully.' });
  } catch (error) {
    next(error);
  }
});

router.put('/:warehouseCode', async (req, res, next) => {
  try {
    const { warehouseCode } = req.params;
    const { warehouseName, warehouseLocation } = req.body;

    const [result] = await pool.query(
      `UPDATE Warehouse
       SET warehouseName = ?, warehouseLocation = ?
       WHERE warehouseCode = ?`,
      [warehouseName, warehouseLocation, warehouseCode]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Warehouse not found.' });
    }

    return res.json({ message: 'Warehouse updated successfully.' });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:warehouseCode', async (req, res, next) => {
  try {
    const { warehouseCode } = req.params;
    const [result] = await pool.query(
      'DELETE FROM Warehouse WHERE warehouseCode = ?',
      [warehouseCode]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Warehouse not found.' });
    }

    return res.json({ message: 'Warehouse deleted successfully.' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Cannot delete a warehouse that already has stock transactions.' });
    }
    return next(error);
  }
});

module.exports = router;
