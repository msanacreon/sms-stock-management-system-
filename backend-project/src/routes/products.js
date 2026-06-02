const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [products] = await pool.query(
      'SELECT * FROM Product ORDER BY productName ASC'
    );
    res.json(products);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const {
      productCode,
      productName,
      category,
      quantityInStock,
      unitPrice,
      supplierName,
      dateReceived
    } = req.body;

    await pool.query(
      `INSERT INTO Product
       (productCode, productName, category, quantityInStock, unitPrice, supplierName, dateReceived)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [productCode, productName, category, quantityInStock, unitPrice, supplierName, dateReceived]
    );

    res.status(201).json({ message: 'Product recorded successfully.' });
  } catch (error) {
    next(error);
  }
});

router.put('/:productCode', async (req, res, next) => {
  try {
    const { productCode } = req.params;
    const {
      productName,
      category,
      quantityInStock,
      unitPrice,
      supplierName,
      dateReceived
    } = req.body;

    const [result] = await pool.query(
      `UPDATE Product
       SET productName = ?, category = ?, quantityInStock = ?, unitPrice = ?,
           supplierName = ?, dateReceived = ?
       WHERE productCode = ?`,
      [productName, category, quantityInStock, unitPrice, supplierName, dateReceived, productCode]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.json({ message: 'Product updated successfully.' });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:productCode', async (req, res, next) => {
  try {
    const { productCode } = req.params;
    const [result] = await pool.query(
      'DELETE FROM Product WHERE productCode = ?',
      [productCode]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Cannot delete a product that already has stock transactions.' });
    }
    return next(error);
  }
});

module.exports = router;
