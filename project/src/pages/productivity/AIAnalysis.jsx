import React, { useState, useEffect } from "react";
import {
  Activity,
  Package,
  Layers,
  ChevronDown,
  AlertCircle,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import api from "../../services/api";

const AIAnalysisPage = () => {
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        setProducts(res.data);
      } catch {
        setError("Failed to load products");
      }
    };
    fetchProducts();
  }, []);

  // Fetch batches whenever a product is selected
  useEffect(() => {
    if (!selectedProduct) {
      setBatches([]);
      setSelectedBatch("");
      return;
    }

    const fetchBatches = async () => {
      try {
        const res = await api.get(`/batches/${selectedProduct}`);
        setBatches(res.data);
      } catch {
        setError("Failed to load batches for this product");
      }
    };

    fetchBatches();
  }, [selectedProduct]);

  // Run AI Analysis
  const handleAnalyze = async () => {
    if (!selectedBatch) {
      setError("Please select a batch to analyze.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await api.get(`/batches/${selectedBatch}/ai_analysis`);
      console.log("AI Analysis Result:", res.data);
      setResult(res.data);
    } catch {
      setError("The AI analysis failed or no data was returned. Please try another batch.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 rounded-lg">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent flex items-center gap-3">
            <Activity className="w-10 h-10 text-purple-400" />
            AI-Powered Analysis
          </h1>
          <p className="text-white/40 text-sm">
            Get predictive insights and actionable recommendations for your production batches
          </p>
        </div>

        {/* Selection Form */}
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Selector */}
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2 flex items-center gap-2">
                <Package className="w-4 h-4" /> Product
              </label>
              <div className="relative">
                <select
                  className="w-full bg-gray-800 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white appearance-none"
                  value={selectedProduct}
                  onChange={(e) => {
                    setSelectedProduct(e.target.value);
                    setResult(null);
                    setError("");
                  }}
                >
                  <option value="">Select Product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute top-1/2 -translate-y-1/2 right-4 w-5 h-5 text-white/30 pointer-events-none" />
              </div>
            </div>

            {/* Batch Selector */}
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4" /> Batch
              </label>
              <div className="relative">
                <select
                  className="w-full bg-gray-800 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white appearance-none"
                  value={selectedBatch}
                  onChange={(e) => {
                    setSelectedBatch(e.target.value);
                    setResult(null);
                    setError("");
                  }}
                  disabled={!selectedProduct || batches.length === 0}
                >
                  <option value="">
                    {!selectedProduct ? "Select a product first..." : "Select Batch..."}
                  </option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.batch_no || b.batch_number}</option>
                  ))}
                </select>
                <ChevronDown className="absolute top-1/2 -translate-y-1/2 right-4 w-5 h-5 text-white/30 pointer-events-none" />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <button
            className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
            onClick={handleAnalyze}
            disabled={loading || !selectedBatch}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Run AI Analysis
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {!loading && result && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">Analysis Complete</h2>
                  <p className="text-white/60 text-sm">Batch: {result.batch_no}</p>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="text-blue-400" size={20} />
                  <h4 className="text-white/80 font-medium">Predicted Output (Next Shift)</h4>
                </div>
                <p className="text-4xl font-bold text-blue-300 mb-2">
                  {result.predicted_output_next_shift?.toLocaleString() || "N/A"}
                </p>
                <p className="text-blue-400/60 text-sm">Units</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="text-yellow-400" size={20} />
                  <h4 className="text-white/80 font-medium">Top Inefficiency Source</h4>
                </div>
                <p className="text-xl font-bold text-yellow-300 mb-2">
                  {result.top_3_inefficiencies?.[0]?.source || "N/A"}
                </p>
                <p className="text-yellow-400/60 text-sm">
                  {result.top_inefficiency_scores?.[0] || 0}% impact
                </p>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Top 3 Inefficiencies */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h4 className="text-white text-lg font-bold mb-6">Top 3 Inefficiencies</h4>
                {result.top_3_inefficiencies?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 mb-4 border border-white/20 rounded-xl hover:bg-white/5 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-yellow-400 font-bold text-sm px-2 py-1 rounded bg-yellow-500/10">
                        #{idx + 1}
                      </span>
                      <span className="text-yellow-400 font-semibold text-sm">
                        {result.top_inefficiency_scores?.[idx] || 0}%
                      </span>
                    </div>
                    <p className="text-white font-semibold text-md mb-1">{item.source}</p>
                    <p className="text-white/60 text-sm leading-relaxed">{item.explanation}</p>
                  </div>
                ))}
              </div>

              {/* AI Recommendations */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h4 className="text-white text-lg font-bold mb-6">AI Recommendations</h4>
                {result.ai_recommendations?.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 mb-4 border border-white/20 rounded-xl hover:bg-white/5 transition-all duration-200"
                  >
                    <span className="text-blue-400 font-bold mr-2">#{idx + 1}</span>
                    <span className="text-white text-sm leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !result && (
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-16 text-center">
            <BarChart3 className="w-20 h-20 text-white/20 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-white mb-2">Ready for AI Analysis</h3>
            <p className="text-white/40 text-sm">
              Select a product and batch above, then click "Run AI Analysis" to get intelligent insights and predictions
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysisPage;
