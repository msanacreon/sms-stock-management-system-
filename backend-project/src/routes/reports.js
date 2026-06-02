const express = require('express');
const pool = require('../db');

const router = express.Router();

const groupingExpressions = {
  daily: 'DATE(transactionDate)',
  weekly: "YEARWEEK(transactionDate, 1)",
  monthly: "DATE_FORMAT(transactionDate, '%Y-%m')"
};

router.get('/available-stock', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT productCode, productName, category, quantityInStock, unitPrice,
              (quantityInStock * unitPrice) AS totalValue
       FROM Product
       ORDER BY quantityInStock DESC`
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get('/movement', async (req, res, next) => {
  try {
    const period = groupingExpressions[req.query.period] ? req.query.period : 'daily';
    const groupBy = groupingExpressions[period];

    const [rows] = await pool.query(
      `SELECT ${groupBy} AS periodLabel,
              SUM(CASE WHEN transactionType = 'IN' THEN quantityMoved ELSE 0 END) AS stockIn,
              SUM(CASE WHEN transactionType = 'OUT' THEN quantityMoved ELSE 0 END) AS stockOut,
              COUNT(*) AS transactions
       FROM StockTransaction
       GROUP BY periodLabel
       ORDER BY MIN(transactionDate) DESC`
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get('/daily', async (req, res, next) => {
  try {
    const selectedDate = req.query.date;

    if (!selectedDate) {
      return res.status(400).json({ message: 'Report date is required.' });
    }

    const [transactions] = await pool.query(
      `SELECT st.transactionId, st.transactionDate, st.quantityMoved, st.transactionType,
              st.productCode, p.productName, st.warehouseCode, w.warehouseName
       FROM StockTransaction st
       JOIN Product p ON p.productCode = st.productCode
       JOIN Warehouse w ON w.warehouseCode = st.warehouseCode
       WHERE DATE(st.transactionDate) = ?
       ORDER BY st.transactionId DESC`,
      [selectedDate]
    );

    const [totals] = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN transactionType = 'IN' THEN quantityMoved ELSE 0 END), 0) AS stockIn,
         COALESCE(SUM(CASE WHEN transactionType = 'OUT' THEN quantityMoved ELSE 0 END), 0) AS stockOut,
         COUNT(*) AS transactions
       FROM StockTransaction
       WHERE DATE(transactionDate) = ?`,
      [selectedDate]
    );

    return res.json({
      date: selectedDate,
      totals: totals[0],
      transactions
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
