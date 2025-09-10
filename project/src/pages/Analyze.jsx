import React, { useState } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Lightbulb, AlertCircle } from 'lucide-react';
import { analysisService } from '../services/api';

const inputOptions = [
  "Direct Labor Hours", "Electricity Consumption", "Machine Hours", "Raw Material Usage",
  "Fuel Consumption", "Compressed Air Usage", "Natural Gas Usage", "Steam Consumption",
  "Indirect Labor Hours", "Shift Hours", "Overtime Hours", "Training Hours",
  "Raw Material A Quantity", "Raw Material B Quantity", "Fabric Used", "Plastic Granules Used",
  "Steel Used", "Machine A Operating Time", "Machine B Downtime", "Total Machine Uptime",
  "Maintenance Time", "Tool Change Time", "Administrative Expenses", "Software Subscriptions",
  "Telephone/Internet Bills", "Stationery Usage", "Cafeteria Cost", "Total Salaries",
  "Manager Salaries", "Worker Wages", "Bonus Payments", "Wage Advances", "Transport Fuel Cost",
  "Truck Usage", "Freight Charges", "Inbound Material Weight", "Outbound Product Weight",
  "Cartons Used", "Labels Used", "Shrink Wrap Used", "Packaging Tape Used", "Pallets Used",
  "Test Samples Taken", "Rejected Items", "QC Labor Hours", "QC Equipment Used", "Lab Chemicals Used",
  "Gloves Used", "Helmets Issued", "Fire Drills Conducted", "First Aid Usage", "Safety Audits",
  "Waste Generated", "Waste Recycled", "Water Used", "Waste Water Treated", "Carbon Emissions",
  "Opening Raw Material Stock", "Closing Raw Material Stock", "Spare Parts Used",
  "Inventory Turnover Rate", "Damaged Inventory", "Purchase Orders Issued", "Suppliers Contacted",
  "Material Lead Time", "Discounts Received", "Delayed Deliveries", "Lighting Electricity Use",
  "Cooling System Electricity Use", "Boiler Fuel Use", "Elevator Energy Use", "CCTV Power Consumption",
  "Forklift Operating Hours", "Employee Attendance", "Product Returns", "Customer Complaints",
  "IT Downtime"
];


const outputOptions = [
  "Total Units Produced", "Good Units Produced", "Rejected Units",
  "Production Rate", "Yield Rate", "Scrap Rate", "Downtime Hours",
  "Machine Utilization Rate", "Labor Productivity", "Energy Consumption per Unit",
  "Cost per Unit", "Sales Revenue", "On-Time Delivery Rate", "Defect Density",
  "Customer Returns", "Carbon Emission per Unit", "Inventory Turnover",
  "First Pass Yield (FPY)", "Throughput", "Order Fulfillment Rate",
  "Employee Attendance Rate", "Overall Equipment Effectiveness (OEE)",
  "Maintenance Response Time", "Safety Compliance Score"
];

const Analyze = () => {
  // State
  const [inputs, setInputs] = useState([{ key: "", value: "" }]);
  const [outputs, setOutputs] = useState([{ key: "", value: "" }]);
  const [combinedProductivity, setCombinedProductivity] = useState("");
  const [singleProductivity, setSingleProductivity] = useState("");
  const [targetedProductivity, setTargetedProductivity] = useState("");
  const [standardProductivity, setStandardProductivity] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Input handlers
  const addInput = () => setInputs([...inputs, { key: "", value: "" }]);
  const removeInput = (index) => setInputs(inputs.filter((_, i) => i !== index));
  const updateInput = (index, field, value) => {
    const newInputs = [...inputs];
    newInputs[index][field] = value;
    setInputs(newInputs);
  };

  // Output handlers
  const addOutput = () => setOutputs([...outputs, { key: "", value: "" }]);
  const removeOutput = (index) => setOutputs(outputs.filter((_, i) => i !== index));
  const updateOutput = (index, field, value) => {
    const newOutputs = [...outputs];
    newOutputs[index][field] = value;
    setOutputs(newOutputs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Convert inputs/outputs arrays to objects
      const formattedInputs = {};
      inputs.forEach(item => {
        if (item.key && item.value !== "") formattedInputs[item.key] = Number(item.value);
      });

      const formattedOutputs = {};
      outputs.forEach(item => {
        if (item.key && item.value !== "") formattedOutputs[item.key] = Number(item.value);
      });

      // Build single_productivity object
      const singleProductivityObj = {};
      Object.entries(formattedInputs).forEach(([inputKey, inputVal]) => {
        Object.entries(formattedOutputs).forEach(([outputKey, outputVal]) => {
          singleProductivityObj[`${inputKey} / ${outputKey}`] =
            ((inputVal / outputVal) * 100).toFixed(2).toString();
        });
      });

      const payload = {
        combined_productivity: combinedProductivity.toString(),
        single_productivity: singleProductivity.toString(),
        targeted_productivity: targetedProductivity.toString(),
        standard_productivity: standardProductivity.toString(),
        inputs: formattedInputs,
        outputs: formattedOutputs,
        single_productivity: singleProductivityObj
      };

      console.log("Payload sent to /analyze:", payload);

      const result = await analysisService.analyze(payload);
      setResults(result);
    } catch (err) {
      console.error("Analysis error:", err);
      if (err.code === "ERR_NETWORK") {
        setError("Unable to connect to the server. Please ensure the backend is running on http://127.0.0.1:8000");
      } else {
        setError(err.response?.data?.message || "Analysis failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <BarChart3 className="mr-3" size={36} />
            AI Analysis
          </h1>
          <p className="text-white/70">
            Get intelligent insights and predictions about your productivity patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Analysis Form */}
          <div className="card p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Combined Productivity (%)</label>
                  <input
                    type="number"
                    value={combinedProductivity}
                    onChange={(e) => setCombinedProductivity(e.target.value)}
                    className="input-field"
                    placeholder="85.5"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="form-label">Single Productivity (%)</label>
                  <input
                    type="number"
                    value={singleProductivity}
                    onChange={(e) => setSingleProductivity(e.target.value)}
                    className="input-field"
                    placeholder="75.2"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Targeted Productivity (%)</label>
                  <input
                    type="number"
                    value={targetedProductivity}
                    onChange={(e) => setTargetedProductivity(e.target.value)}
                    className="input-field"
                    placeholder="90.0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="form-label">Standard Productivity (%)</label>
                  <input
                    type="number"
                    value={standardProductivity}
                    onChange={(e) => setStandardProductivity(e.target.value)}
                    className="input-field"
                    placeholder="80.0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Inputs */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="form-label mb-0">Inputs</label>
                  <button type="button" onClick={addInput} className="btn-primary py-1 px-3 text-sm">
                    Add Input
                  </button>
                </div>
                <div className="space-y-2">
                  {inputs.map((input, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <select
                        value={input.key}
                        onChange={(e) => updateInput(index, "key", e.target.value)}
                        className="select-field"
                      >
                        <option value="">-- Select Input --</option>
                        {inputOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={input.value}
                        onChange={(e) => updateInput(index, "value", e.target.value)}
                        className="select-field"
                        placeholder="Value"
                      />
                      {inputs.length > 1 && (
                        <button type="button" onClick={() => removeInput(index)} className="text-red-400 hover:text-red-300 px-2">×</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Outputs */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="form-label mb-0">Outputs</label>
                  <button type="button" onClick={addOutput} className="btn-secondary py-1 px-3 text-sm">
                    Add Output
                  </button>
                </div>
                <div className="space-y-2">
                  {outputs.map((output, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <select
                        value={output.key}
                        onChange={(e) => updateOutput(index, "key", e.target.value)}
                        className="select-field"
                      >
                        <option value="">-- Select Output --</option>
                        {outputOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={output.value}
                        onChange={(e) => updateOutput(index, "value", e.target.value)}
                        className="select-field"
                        placeholder="Value"
                      />
                      {outputs.length > 1 && (
                        <button type="button" onClick={() => removeOutput(index)} className="text-red-400 hover:text-red-300 px-2">×</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center">
                  <AlertCircle className="text-red-400 mr-2" size={20} />
                  <span className="text-red-400">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Analyzing..." : "Analyze Productivity"}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Analysis Results</h3>
            {results ? (
              <div className="space-y-6">
                {/* Efficiency Score */}
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="text-green-400 mr-2" size={20} />
                    <h4 className="text-white font-semibold">Efficiency Score</h4>
                  </div>
                  <p className="text-3xl font-bold text-green-400">
                    {results.efficiency_score || "N/A"}
                  </p>
                </div>

                {/* AI Prediction */}
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <BarChart3 className="text-primary-400 mr-2" size={20} />
                    <h4 className="text-white font-semibold">AI Prediction</h4>
                  </div>
                  <p className="text-white/80">{results.ai_prediction || "No prediction available"}</p>
                </div>

                {/* Top Inefficiencies */}
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <AlertTriangle className="text-yellow-400 mr-2" size={20} />
                    <h4 className="text-white font-semibold">Top Inefficiencies</h4>
                  </div>
                  <div className="space-y-2">
                    {results.top_inefficiencies?.split("\n").map((ineff, i) => (
                      <div key={i} className="flex items-start space-x-2">
                        <span className="text-yellow-400 mt-1">•</span>
                        <p className="text-white/80 text-sm">{ineff}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Prescriptions */}
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Lightbulb className="text-blue-400 mr-2" size={20} />
                    <h4 className="text-white font-semibold">AI Prescriptions</h4>
                  </div>
                  <div className="space-y-2">
                    {results.ai_prescriptions?.split("\n").map((presc, i) => (
                      <div key={i} className="flex items-start space-x-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <p className="text-white/80 text-sm">{presc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-white/60 py-8">
                <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                <p>Fill out the form and click analyze to see AI insights.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyze;
