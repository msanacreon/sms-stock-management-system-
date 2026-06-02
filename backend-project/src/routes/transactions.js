const express = require('express');
const pool = require('../db');

const router = express.Router();

async function applyStockChange(connection, productCode, transactionType, quantityMoved) {
  const delta = transactionType === 'IN' ? quantityMoved : -quantityMoved;
  if (transactionType === 'OUT') {
    const [products] = await connection.query(
      'SELECT quantityInStock FROM Product WHERE productCode = ? FOR UPDATE',
      [productCode]
    );

    if (!products.length) {
      const error = new Error('Selected product does not exist.');
      error.status = 400;
      throw error;
    }

    if (Number(products[0].quantityInStock) < quantityMoved) {
      const error = new Error('Stock out quantity cannot be greater than available stock.');
      error.status = 400;
      throw error;
    }
  }

  await connection.query(
    'UPDATE Product SET quantityInStock = quantityInStock + ? WHERE productCode = ?',
    [delta, productCode]
  );
}

router.get('/', async (req, res, next) => {
  try {
    const [transactions] = await pool.query(
      `SELECT st.transactionId, st.productCode, p.productName, st.warehouseCode,
              w.warehouseName, st.transactionDate, st.quantityMoved, st.transactionType
       FROM StockTransaction st
       JOIN Product p ON p.productCode = st.productCode
       JOIN Warehouse w ON w.warehouseCode = st.warehouseCode
       ORDER BY st.transactionDate DESC, st.transactionId DESC`
    );
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { productCode, warehouseCode, transactionDate, quantityMoved, transactionType } = req.body;

    await connection.beginTransaction();
    await connection.query(
      `INSERT INTO StockTransaction
       (productCode, warehouseCode, transactionDate, quantityMoved, transactionType)
       VALUES (?, ?, ?, ?, ?)`,
      [productCode, warehouseCode, transactionDate, quantityMoved, transactionType]
    );
    await applyStockChange(connection, productCode, transactionType, Number(quantityMoved));
    await connection.commit();

    res.status(201).json({ message: 'Transaction recorded successfully.' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

router.put('/:transactionId', async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { transactionId } = req.params;
    const { productCode, warehouseCode, transactionDate, quantityMoved, transactionType } = req.body;

    await connection.beginTransaction();
    const [existingRows] = await connection.query(
      'SELECT productCode, quantityMoved, transactionType FROM StockTransaction WHERE transactionId = ?',
      [transactionId]
    );

    if (!existingRows.length) {
      await connection.rollback();
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    const previous = existingRows[0];
    await applyStockChange(
      connection,
      previous.productCode,
      previous.transactionType === 'IN' ? 'OUT' : 'IN',
      Number(previous.quantityMoved)
    );

    await connection.query(
      `UPDATE StockTransaction
       SET productCode = ?, warehouseCode = ?, transactionDate = ?, quantityMoved = ?, transactionType = ?
       WHERE transactionId = ?`,
      [productCode, warehouseCode, transactionDate, quantityMoved, transactionType, transactionId]
    );
    await applyStockChange(connection, productCode, transactionType, Number(quantityMoved));
    await connection.commit();

    return res.json({ message: 'Transaction updated successfully.' });
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally {
    connection.release();
  }
});

router.delete('/:transactionId', async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { transactionId } = req.params;

    await connection.beginTransaction();
    const [existingRows] = await connection.query(
      'SELECT productCode, quantityMoved, transactionType FROM StockTransaction WHERE transactionId = ?',
      [transactionId]
    );

    if (!existingRows.length) {
      await connection.rollback();
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    const previous = existingRows[0];
    await applyStockChange(
      connection,
      previous.productCode,
      previous.transactionType === 'IN' ? 'OUT' : 'IN',
      Number(previous.quantityMoved)
    );

    await connection.query('DELETE FROM StockTransaction WHERE transactionId = ?', [transactionId]);
    await connection.commit();

    return res.json({ message: 'Transaction deleted successfully.' });
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally {
    connection.release();
  }
});

module.exports = router;
