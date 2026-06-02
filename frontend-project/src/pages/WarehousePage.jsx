import { Pencil, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api';
import StatusMessage from '../components/StatusMessage';

const initialWarehouse = {
  warehouseCode: '',
  warehouseName: '',
  warehouseLocation: ''
};

function WarehousePage() {
  const [form, setForm] = useState(initialWarehouse);
  const [warehouses, setWarehouses] = useState([]);
  const [editingCode, setEditingCode] = useState('');
  const [status, setStatus] = useState({ message: '', type: 'success' });

  const loadWarehouses = async () => {
    const { data } = await api.get('/warehouses');
    setWarehouses(data);
  };

  useEffect(() => {
    loadWarehouses().catch(() => {
      setStatus({ message: 'Unable to load warehouses.', type: 'error' });
    });
  }, []);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const resetForm = () => {
    setForm(initialWarehouse);
    setEditingCode('');
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editingCode) {
        await api.put(`/warehouses/${editingCode}`, form);
        setStatus({ message: 'Warehouse updated successfully.', type: 'success' });
      } else {
        await api.post('/warehouses', form);
        setStatus({ message: 'Warehouse saved successfully.', type: 'success' });
      }
      resetForm();
      await loadWarehouses();
    } catch (error) {
      setStatus({ message: error.response?.data?.message || 'Unable to save warehouse.', type: 'error' });
    }
  };

  const editWarehouse = (warehouse) => {
    setEditingCode(warehouse.warehouseCode);
    setForm({
      warehouseCode: warehouse.warehouseCode,
      warehouseName: warehouse.warehouseName,
      warehouseLocation: warehouse.warehouseLocation
    });
  };

  const deleteWarehouse = async (warehouseCode) => {
    try {
      await api.delete(`/warehouses/${warehouseCode}`);
      setStatus({ message: 'Warehouse deleted successfully.', type: 'success' });
      await loadWarehouses();
      if (editingCode === warehouseCode) {
        resetForm();
      }
    } catch (error) {
      setStatus({ message: error.response?.data?.message || 'Unable to delete warehouse.', type: 'error' });
    }
  };

  return (
    <section>
      <div className="mb-5">
        <h2 className="page-title">Warehouse Registration</h2>
        <p className="page-subtitle">Record warehouses used for stock movement.</p>
      </div>
      <StatusMessage {...status} />
      <form className="panel panel-body grid gap-4 md:grid-cols-3" onSubmit={submit}>
        <div>
          <label className="label">Warehouse Code</label>
          <input className="field" disabled={Boolean(editingCode)} required value={form.warehouseCode} onChange={(e) => update('warehouseCode', e.target.value)} />
        </div>
        <div>
          <label className="label">Warehouse Name</label>
          <input className="field" required value={form.warehouseName} onChange={(e) => update('warehouseName', e.target.value)} />
        </div>
        <div>
          <label className="label">Warehouse Location</label>
          <input className="field" required value={form.warehouseLocation} onChange={(e) => update('warehouseLocation', e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2 md:col-span-3">
          <button className="btn-primary" type="submit">
            <Save size={18} />
            {editingCode ? 'Update Warehouse' : 'Save Warehouse'}
          </button>
          {editingCode && (
            <button className="btn-secondary" onClick={resetForm} type="button">
              <X size={18} />
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 table-shell">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="font-bold text-ink">Warehouse Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((warehouse) => (
                <tr key={warehouse.warehouseCode}>
                  <td className="font-bold text-slate-800">{warehouse.warehouseCode}</td>
                  <td>{warehouse.warehouseName}</td>
                  <td>{warehouse.warehouseLocation}</td>
                  <td className="flex gap-2">
                    <button className="btn-secondary" onClick={() => editWarehouse(warehouse)} title="Edit warehouse" type="button">
                      <Pencil size={16} />
                    </button>
                    <button className="btn-danger" onClick={() => deleteWarehouse(warehouse.warehouseCode)} title="Delete warehouse" type="button">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!warehouses.length && (
                <tr>
                  <td className="py-8 text-center text-slate-500" colSpan="4">No warehouses recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default WarehousePage;
