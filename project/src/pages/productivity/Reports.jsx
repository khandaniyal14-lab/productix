import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  BarChart3,
  ChevronDown,
  Download,
  Package,
  Boxes,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
} from "lucide-react";

const Reports = () => {
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchReport, setBatchReport] = useState(null);
  const [dailyReport, setDailyReport] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const axiosInstance = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    axiosInstance
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      axiosInstance
        .get(`/batches/${selectedProduct}`)
        .then((res) => setBatches(res.data))
        .catch((err) => console.error(err));
    } else {
      setBatches([]);
    }
    setSelectedBatch(null);
  }, [selectedProduct]);

  useEffect(() => {
    if (selectedBatch) {
      setLoading(true);
      const reportPromise = axiosInstance.get(`/batches/${selectedBatch}/report`);
      const dailyPromise = axiosInstance.get(`/batches/${selectedBatch}/daily_report`);
      const trendPromise = axiosInstance.get(`/batches/${selectedBatch}/trend`);

      Promise.all([reportPromise, dailyPromise, trendPromise])
        .then(([reportRes, dailyRes, trendRes]) => {
          console.log("Batch Report:", reportRes.data);
          console.log("Daily Report:", dailyRes.data);
          console.log("Trend Report:", trendRes.data);

          setBatchReport(reportRes.data);
          setDailyReport(dailyRes.data.daily_summary || []);
          setTrendData(trendRes.data.trend_last_3_shifts || []);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setBatchReport(null);
      setDailyReport([]);
      setTrendData([]);
    }
  }, [selectedBatch]);

  const handleExport = async () => {
    if (!selectedBatch) return;
    try {
      const res = await axiosInstance.get(`/batches/${selectedBatch}/export`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `batch_${selectedBatch}_report.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-sm shadow-lg">
          <p className="label text-white/80">{`${label}`}</p>
          {payload.map((pld, index) => (
            <p key={index} style={{ color: pld.color }}>
              {`${pld.name}: ${Number(pld.value).toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 rounded-lg text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-purple-400" />
            Batch Reports & Analysis
          </h1>
          <p className="text-white/40 text-sm">
            Select a product and batch to view detailed reports and trends.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Product Selector */}
            <div className="relative">
              <label className="block text-white/60 text-sm font-medium mb-2">
                Product
              </label>
              <Package className="absolute top-11 left-4 w-5 h-5 text-white/30" />
              <select
                value={selectedProduct || ""}
                onChange={(e) => setSelectedProduct(Number(e.target.value))}
                className="w-full bg-gray-800 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white appearance-none"
              >
                <option value="" disabled>
                  Select Product...
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute top-11 right-4 w-5 h-5 text-white/30" />
            </div>

            {/* Batch Selector */}
            <div className="relative">
              <label className="block text-white/60 text-sm font-medium mb-2">
                Batch
              </label>
              <Boxes className="absolute top-11 left-4 w-5 h-5 text-white/30" />
              <select
                value={selectedBatch || ""}
                onChange={(e) => setSelectedBatch(Number(e.target.value))}
                className="w-full bg-gray-800 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white appearance-none"
                disabled={!batches.length}
              >
                <option value="" disabled className="text-gray-400 bg-gray-800">
                  Select Batch...
                </option>
                {batches.map((b) => (
                  <option
                    key={b.id}
                    value={b.id}
                    className="text-white bg-gray-800"
                  >
                    {b.batch_number}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute top-11 right-4 w-5 h-5 text-white/30" />
            </div>

            {/* Export */}
            <button
              onClick={handleExport}
              disabled={!selectedBatch}
              className="w-full px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" /> Export Excel
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-16 text-white/60">
            Loading report data...
          </div>
        )}

        {!loading && selectedBatch && batchReport && (
          <div className="space-y-8">
            {/* KPI Summary */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-6">
                Batch wise Summary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Dynamic totals */}
                {Object.entries(batchReport.totals || {}).map(([k, v]) => (
                  <div
                    key={k}
                    className="bg-white/5 border border-white/10 rounded-xl p-4"
                  >
                    <p className="text-white/60 text-sm">{k}</p>
                    <p className="text-2xl font-bold text-white">
                      {Number(v ?? 0).toLocaleString()}
                    </p>
                  </div>
                ))}

                {/* Always present fields */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-white/60 text-sm">Total input Cost</p>
                  <p className="text-2xl font-bold text-white">
                    ${Number(batchReport?.total_input_cost ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-white/60 text-sm">Input Cost per Unit</p>
                  <p className="text-2xl font-bold text-white">
                    ${Number(batchReport?.input_cost_per_unit ?? 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-white/60 text-sm">Combined Productivity Ratio</p>
                  <p className="text-2xl font-bold text-white">
                    {Number(batchReport?.Combined_productivity_ratio ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            {/* Per-Input Productivity & Cost Summary */}
            {batchReport?.per_input_stats && (
              <div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  Input-wise Breakdown
                </h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-white/60 text-sm">
                        <th className="px-4 py-2">Input</th>
                        <th className="px-4 py-2">Total Used</th>
                        <th className="px-4 py-2">Unit Price</th>
                        <th className="px-4 py-2">Total Cost</th>
                        <th className="px-4 py-2">Cost per Output Unit</th>
                        <th className="px-4 py-2">Productivity Ratio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(batchReport.per_input_stats).map(([key, stats]) => (
                        <tr
                          key={key}
                          className="bg-white/5 border border-white/10 text-white rounded-xl"
                        >
                          <td className="px-4 py-2 font-medium">{key}</td>
                          <td className="px-4 py-2">{stats.total_used}</td>
                          <td className="px-4 py-2">${stats.unit_price.toFixed(2)}</td>
                          <td className="px-4 py-2">${stats.total_cost.toFixed(2)}</td>
                          <td className="px-4 py-2">
                            ${stats.cost_per_output_unit.toFixed(2)}
                          </td>
                          <td className="px-4 py-2">
                            {stats.productivity_ratio.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}


            {/* Daily Report */}
            {dailyReport.length > 0 && (
              <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                <h3 className="text-2xl font-semibold text-white mb-6">
                  Daily Production Summary
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-sm text-white/60">
                          Date
                        </th>
                        {Object.keys(dailyReport[0].totals || {}).map((k) => (

                          <th
                            key={k}
                            className="px-4 py-3 text-left text-sm text-white/60"
                          >
                            {k}
                          </th>
                        ))}

                      </tr>
                    </thead>
                    <tbody>
                      {dailyReport.map((d) => (
                        <tr key={d.date} className="border-b border-white/10">
                          <td className="px-4 py-4">{d.date}</td>
                          {Object.entries(d.totals || {}).map(([k, v]) => (
                            <td key={k} className="px-4 py-4">
                              {Number(v ?? 0).toLocaleString()}
                            </td>
                          ))}

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Trend Charts */}
            {trendData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Output & Cost */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6 h-96">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    <BarChartIcon className="w-6 h-6 inline text-blue-400 mr-2" />
                    Output & Cost / Shift
                  </h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={trendData}>
                      <CartesianGrid stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="shift" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="output_units" name="Output Units" fill="#a855f7" />
                      <Bar dataKey="total_cost" name="Total Cost" fill="#34d399" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Productivity */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6 h-96">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    <LineChartIcon className="w-6 h-6 inline text-yellow-400 mr-2" />
                    Productivity Ratio / Shift
                  </h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={trendData}>
                      <CartesianGrid stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="shift" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="productivity_ratio"
                        stroke="#facc15"
                        strokeWidth={2}
                        dot
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
