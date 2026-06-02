import { RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api';
import StatusMessage from '../components/StatusMessage';

function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [period, setPeriod] = useState('daily');
  const [reportDate, setReportDate] = useState(today);
  const [stock, setStock] = useState([]);
  const [movement, setMovement] = useState([]);
  const [dailyReport, setDailyReport] = useState({
    date: today,
    totals: { stockIn: 0, stockOut: 0, transactions: 0 },
    transactions: []
  });
  const [status, setStatus] = useState({ message: '', type: 'success' });

  const loadReports = async () => {
    const [stockResponse, movementResponse, dailyResponse] = await Promise.all([
      api.get('/reports/available-stock'),
      api.get(`/reports/movement?period=${period}`),
      api.get(`/reports/daily?date=${reportDate}`)
    ]);
    setStock(stockResponse.data);
    setMovement(movementResponse.data);
    setDailyReport(dailyResponse.data);
  };

  useEffect(() => {
    loadReports().catch(() => {
      setStatus({ message: 'Unable to load reports.', type: 'error' });
    });
  }, [period]);

  const generateDailyReport = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.get(`/reports/daily?date=${reportDate}`);
      setDailyReport(data);
      setStatus({ message: `Daily report generated for ${reportDate}.`, type: 'success' });
    } catch (error) {
      setStatus({ message: error.response?.data?.message || 'Unable to generate daily report.', type: 'error' });
    }
  };

  const totalValue = stock.reduce((sum, item) => sum + Number(item.totalValue || 0), 0);
  const totalStock = stock.reduce((sum, item) => sum + Number(item.quantityInStock || 0), 0);

  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="page-title">Inventory Reports</h2>
          <p className="page-subtitle">Daily, weekly, and monthly summaries for available stock, stock in, and stock out.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['daily', 'weekly', 'monthly'].map((item) => (
            <button
              className={`h-10 rounded px-4 text-sm font-bold ${period === item ? 'bg-brand text-white' : 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50'}`}
              key={item}
              onClick={() => setPeriod(item)}
              type="button"
            >
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
          <button className="btn-secondary" onClick={loadReports} title="Refresh reports" type="button">
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>
      <StatusMessage {...status} />

      <form className="panel panel-body mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between" onSubmit={generateDailyReport}>
        <div>
          <h3 className="text-lg font-black text-ink">Generate Daily Report</h3>
          <p className="mt-1 text-sm text-slate-600">Select a transaction date to view stock in and stock out movement for that day.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div>
            <label className="label">Report Date</label>
            <input className="field min-w-[210px]" required type="date" value={reportDate} onChange={(event) => setReportDate(event.target.value)} />
          </div>
          <button className="btn-primary" type="submit">Generate Report</button>
        </div>
      </form>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <p className="text-sm font-semibold text-slate-500">Daily Stock In</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{dailyReport.totals.stockIn || 0}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm font-semibold text-slate-500">Daily Stock Out</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">{dailyReport.totals.stockOut || 0}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm font-semibold text-slate-500">Daily Transactions</p>
          <p className="mt-2 text-3xl font-bold text-ink">{dailyReport.totals.transactions || 0}</p>
        </div>
      </div>

      <div className="mb-6 table-shell">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="font-bold text-ink">Daily Report for {dailyReport.date}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Warehouse</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {dailyReport.transactions.map((transaction) => (
                <tr key={transaction.transactionId}>
                  <td className="font-semibold text-slate-800">{transaction.productName}</td>
                  <td>{transaction.warehouseName}</td>
                  <td>
                    <span className={`rounded px-2 py-1 text-xs font-bold ${transaction.transactionType === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {transaction.transactionType === 'IN' ? 'Stock In' : 'Stock Out'}
                    </span>
                  </td>
                  <td>{transaction.quantityMoved}</td>
                  <td>{String(transaction.transactionDate).slice(0, 10)}</td>
                </tr>
              ))}
              {!dailyReport.transactions.length && (
                <tr>
                  <td className="py-8 text-center text-slate-500" colSpan="5">No transactions found for this date.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <p className="text-sm font-semibold text-slate-500">Available Units</p>
          <p className="mt-2 text-3xl font-bold text-ink">{totalStock}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm font-semibold text-slate-500">Inventory Value</p>
          <p className="mt-2 text-3xl font-bold text-ink">{totalValue.toLocaleString()} RWF</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm font-semibold text-slate-500">Tracked Products</p>
          <p className="mt-2 text-3xl font-bold text-ink">{stock.length}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="table-shell">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="font-bold text-ink">Available Stock</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Value</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((item) => (
                  <tr key={item.productCode}>
                    <td className="font-semibold text-slate-800">{item.productName}</td>
                    <td>{item.category}</td>
                    <td>{item.quantityInStock}</td>
                    <td>{Number(item.totalValue || 0).toLocaleString()} RWF</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-shell">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="font-bold text-ink">Stock Movement</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Stock In</th>
                  <th className="px-4 py-3">Stock Out</th>
                  <th className="px-4 py-3">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {movement.map((item) => (
                  <tr key={item.periodLabel}>
                    <td className="font-semibold text-slate-800">{item.periodLabel}</td>
                    <td className="text-emerald-700">{item.stockIn}</td>
                    <td className="text-amber-700">{item.stockOut}</td>
                    <td>{item.transactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReportsPage;
