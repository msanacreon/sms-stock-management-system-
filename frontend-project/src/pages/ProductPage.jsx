import { Pencil, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api';
import StatusMessage from '../components/StatusMessage';

const initialProduct = {
  productCode: '',
  productName: '',
  category: '',
  quantityInStock: '',
  unitPrice: '',
  supplierName: '',
  dateReceived: ''
};

function ProductPage() {
  const [form, setForm] = useState(initialProduct);
  const [products, setProducts] = useState([]);
  const [editingCode, setEditingCode] = useState('');
  const [status, setStatus] = useState({ message: '', type: 'success' });

  const loadProducts = async () => {
    const { data } = await api.get('/products');
    setProducts(data);
  };

  useEffect(() => {
    loadProducts().catch(() => {
      setStatus({ message: 'Unable to load products.', type: 'error' });
    });
  }, []);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const resetForm = () => {
    setForm(initialProduct);
    setEditingCode('');
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editingCode) {
        await api.put(`/products/${editingCode}`, form);
        setStatus({ message: 'Product updated successfully.', type: 'success' });
      } else {
        await api.post('/products', form);
        setStatus({ message: 'Product saved successfully.', type: 'success' });
      }
      resetForm();
      await loadProducts();
    } catch (error) {
      setStatus({ message: error.response?.data?.message || 'Unable to save product.', type: 'error' });
    }
  };

  const editProduct = (product) => {
    setEditingCode(product.productCode);
    setForm({
      productCode: product.productCode,
      productName: product.productName,
      category: product.category,
      quantityInStock: product.quantityInStock,
      unitPrice: product.unitPrice,
      supplierName: product.supplierName,
      dateReceived: String(product.dateReceived).slice(0, 10)
    });
  };

  const deleteProduct = async (productCode) => {
    try {
      await api.delete(`/products/${productCode}`);
      setStatus({ message: 'Product deleted successfully.', type: 'success' });
      await loadProducts();
      if (editingCode === productCode) {
        resetForm();
      }
    } catch (error) {
      setStatus({ message: error.response?.data?.message || 'Unable to delete product.', type: 'error' });
    }
  };

  return (
    <section>
      <div className="mb-5">
        <h2 className="page-title">Product Registration</h2>
        <p className="page-subtitle">Record product details received by StockHub Ltd.</p>
      </div>
      <StatusMessage {...status} />
      <form className="panel panel-body grid gap-4 md:grid-cols-2" onSubmit={submit}>
        <div>
          <label className="label">Product Code</label>
          <input className="field" disabled={Boolean(editingCode)} required value={form.productCode} onChange={(e) => update('productCode', e.target.value)} />
        </div>
        <div>
          <label className="label">Product Name</label>
          <input className="field" required value={form.productName} onChange={(e) => update('productName', e.target.value)} />
        </div>
        <div>
          <label className="label">Category</label>
          <input className="field" required value={form.category} onChange={(e) => update('category', e.target.value)} />
        </div>
        <div>
          <label className="label">Quantity In Stock</label>
          <input className="field" min="0" required type="number" value={form.quantityInStock} onChange={(e) => update('quantityInStock', e.target.value)} />
        </div>
        <div>
          <label className="label">Unit Price</label>
          <input className="field" min="0" required step="0.01" type="number" value={form.unitPrice} onChange={(e) => update('unitPrice', e.target.value)} />
        </div>
        <div>
          <label className="label">Supplier Name</label>
          <input className="field" required value={form.supplierName} onChange={(e) => update('supplierName', e.target.value)} />
        </div>
        <div>
          <label className="label">Date Received</label>
          <input className="field" required type="date" value={form.dateReceived} onChange={(e) => update('dateReceived', e.target.value)} />
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <button className="btn-primary w-full md:w-auto" type="submit">
            <Save size={18} />
            {editingCode ? 'Update Product' : 'Save Product'}
          </button>
          {editingCode && (
            <button className="btn-secondary w-full md:w-auto" onClick={resetForm} type="button">
              <X size={18} />
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 table-shell">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="font-bold text-ink">Product Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Supplier</th>
                <th>Date Received</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.productCode}>
                  <td className="font-bold text-slate-800">{product.productCode}</td>
                  <td>{product.productName}</td>
                  <td>{product.category}</td>
                  <td>{product.quantityInStock}</td>
                  <td>{Number(product.unitPrice || 0).toLocaleString()} RWF</td>
                  <td>{product.supplierName}</td>
                  <td>{String(product.dateReceived).slice(0, 10)}</td>
                  <td className="flex gap-2">
                    <button className="btn-secondary" onClick={() => editProduct(product)} title="Edit product" type="button">
                      <Pencil size={16} />
                    </button>
                    <button className="btn-danger" onClick={() => deleteProduct(product.productCode)} title="Delete product" type="button">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!products.length && (
                <tr>
                  <td className="py-8 text-center text-slate-500" colSpan="8">No products recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default ProductPage;
