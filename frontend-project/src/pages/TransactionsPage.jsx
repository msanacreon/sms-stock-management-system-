import { Pencil, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api';
import StatusMessage from '../components/StatusMessage';

const initialTransaction = {
  productCode: '',
  warehouseCode: '',
  transactionDate: '',
  quantityMoved: '',
  transactionType: 'IN'
};

function TransactionsPage() {
  const [form, setForm] = useState(initialTransaction);
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState({ message: '', type: 'success' });

  const loadData = async () => {
    const [productsResponse, warehousesResponse, transactionsResponse] = await Promise.all([
      api.get('/products'),
      api.get('/warehouses'),
      api.get('/transactions')
    ]);
    setProducts(productsResponse.data);
    setWarehouses(warehousesResponse.data);
    setTransactions(transactionsResponse.data);
  };

  useEffect(() => {
    loadData().catch(() => {
      setStatus({ message: 'Unable to load transaction data.', type: 'error' });
    });
  }, []);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const resetForm = () => {
    setForm(initialTransaction);
    setEditingId(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await api.put(`/transactions/${editingId}`, form);
        setStatus({ message: 'Transaction updated successfully.', type: 'success' });
      } else {
        await api.post('/transactions', form);
        setStatus({ message: 'Transaction saved successfully.', type: 'success' });
      }
      resetForm();
      await loadData();
    } catch (error) {
      setStatus({ message: error.response?.data?.message || 'Unable to save transaction.', type: 'error' });
    }
  };

  const edit = (transaction) => {
    setEditingId(transaction.transactionId);
    setForm({
      productCode: transaction.productCode,
      warehouseCode: transaction.warehouseCode,
      transactionDate: String(transaction.transactionDate).slice(0, 10),
      quantityMoved: transaction.quantityMoved,
      transactionType: transaction.transactionType
    });
  };

  const remove = async (transactionId) => {
    try {
      await api.delete(`/transactions/${transactionId}`);
      setStatus({ message: 'Transaction deleted successfully.', type: 'success' });
      await loadData();
    } catch (error) {
      setStatus({ message: error.response?.data?.message || 'Unable to delete transaction.', type: 'error' });
    }
  };

  return (
    <section>
      <div className="mb-5">
        <h2 className="page-title">Stock Transactions</h2>
        <p className="page-subtitle">Record stock in and stock out activities, then retrieve, update, or delete transaction records.</p>
      </div>
      <StatusMessage {...status} />
      <form className="panel panel-body mb-6 grid gap-4 md:grid-cols-5" onSubmit={submit}>
        <div>
          <label className="label">Product</label>
          <select className="field" required value={form.productCode} onChange={(e) => update('productCode', e.target.value)}>
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.productCode} value={product.productCode}>{product.productName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Warehouse</label>
          <select className="field" required value={form.warehouseCode} onChange={(e) => update('warehouseCode', e.target.value)}>
            <option value="">Select warehouse</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.warehouseCode} value={warehouse.warehouseCode}>{warehouse.warehouseName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input className="field" required type="date" value={form.transactionDate} onChange={(e) => update('transactionDate', e.target.value)} />
        </div>
        <div>
          <label className="label">Quantity Moved</label>
          <input className="field" min="1" required type="number" value={form.quantityMoved} onChange={(e) => update('quantityMoved', e.target.value)} />
        </div>
        <div>
          <label className="label">Type</label>
          <select className="field" value={form.transactionType} onChange={(e) => update('transactionType', e.target.value)}>
            <option value="IN">Stock In</option>
            <option value="OUT">Stock Out</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2 md:col-span-5">
          <button className="btn-primary" type="submit">
            <Save size={18} />
            {editingId ? 'Update Transaction' : 'Save Transaction'}
          </button>
          {editingId && (
            <button className="btn-secondary" onClick={resetForm} type="button">
              <X size={18} />
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="table-shell">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Warehouse</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.transactionId}>
                  <td>{String(transaction.transactionDate).slice(0, 10)}</td>
                  <td className="font-semibold text-slate-800">{transaction.productName}</td>
                  <td>{transaction.warehouseName}</td>
                  <td>{transaction.quantityMoved}</td>
                  <td>
                    <span className={`rounded px-2 py-1 text-xs font-bold ${transaction.transactionType === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {transaction.transactionType === 'IN' ? 'Stock In' : 'Stock Out'}
                    </span>
                  </td>
                  <td className="flex gap-2">
                    <button className="btn-secondary" onClick={() => edit(transaction)} title="Edit transaction" type="button">
                      <Pencil size={16} />
                    </button>
                    <button className="btn-danger" onClick={() => remove(transaction.transactionId)} title="Delete transaction" type="button">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!transactions.length && (
                <tr>
                  <td className="py-8 text-center text-slate-500" colSpan="6">No transactions recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default TransactionsPage;
