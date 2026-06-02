const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const warehouseRoutes = require('./routes/warehouses');
const transactionRoutes = require('./routes/transactions');
const reportRoutes = require('./routes/reports');
const { authenticate } = require('./middleware');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'StockHub SMS API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', authenticate, productRoutes);
app.use('/api/warehouses', authenticate, warehouseRoutes);
app.use('/api/transactions', authenticate, transactionRoutes);
app.use('/api/reports', authenticate, reportRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || 'Server error. Please try again.' });
});

app.listen(port, () => {
  console.log(`StockHub SMS backend running on port ${port}`);
});
