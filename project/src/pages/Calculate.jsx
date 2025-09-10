import React, { useState } from 'react';
import { productivityService } from '../services/api';
import { Calculator, Plus, Minus, AlertCircle, CheckCircle } from 'lucide-react';

const inputOptions = [
  "Direct Labor Hours",
  "Electricity Consumption",
  "Machine Hours",
  "Raw Material Usage"
];

const outputOptions = [
  "Total Units Produced",
  "Total Revenue"
];

const Calculate = () => {
  const [inputs, setInputs] = useState([{ key: "", value: "" }]);
  const [outputs, setOutputs] = useState([{ key: "", value: "" }]);
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
      // Convert to dictionary format
      const formattedInputs = {};
      inputs.forEach(item => {
        if (item.key && item.value !== "") {
          formattedInputs[item.key] = Number(item.value);
        }
      });

      const formattedOutputs = {};
      outputs.forEach(item => {
        if (item.key && item.value !== "") {
          formattedOutputs[item.key] = Number(item.value);
        }
      });

      if (Object.keys(formattedInputs).length === 0 || Object.keys(formattedOutputs).length === 0) {
        setError("Please provide at least one valid input and one valid output.");
        setLoading(false);
        return;
      }

      const data = { inputs: formattedInputs, outputs: formattedOutputs };
      console.log("Sending payload:", data);

      const result = await productivityService.calculate(data);
      setResults(result);
    } catch (err) {
      console.error("Calculation error:", err);
      if (err.code === "ERR_NETWORK") {
        setError("Unable to connect to the server. Please ensure the backend is running on http://127.0.0.1:8000");
      } else {
        setError(err.response?.data?.message || "Calculation failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <Calculator className="mr-3" size={36} />
            Productivity Calculator
          </h1>
          <p className="text-white/70">
            Enter your inputs and outputs to calculate productivity metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="card p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Inputs Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Inputs</h3>
                  <button
                    type="button"
                    onClick={addInput}
                    className="btn-primary py-2 px-4 text-sm"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Input
                  </button>
                </div>

                <div className="space-y-3">
                  {inputs.map((input, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {/* Dropdown for input key */}
                      <select
                        value={input.key}
                        onChange={(e) => updateInput(index, "key", e.target.value)}
                        className="select-field" 
                      >
                        <option value="">-- Select Input --</option>
                        <option value="Electricity Consumption">Electricity Consumption</option>
                        <option value="Fuel Consumption">Fuel Consumption</option>
                        <option value="Compressed Air Usage">Compressed Air Usage</option>
                        <option value="Natural Gas Usage">Natural Gas Usage</option>
                        <option value="Steam Consumption">Steam Consumption</option>
                        <option value="Direct Labor Hours">Direct Labor Hours</option>
                        <option value="Indirect Labor Hours">Indirect Labor Hours</option>
                        <option value="Shift Hours">Shift Hours</option>
                        <option value="Overtime Hours">Overtime Hours</option>
                        <option value="Training Hours">Training Hours</option>
                        <option value="Raw Material A Quantity">Raw Material A Quantity</option>
                        <option value="Raw Material B Quantity">Raw Material B Quantity</option>
                        <option value="Fabric Used">Fabric Used</option>
                        <option value="Plastic Granules Used">Plastic Granules Used</option>
                        <option value="Steel Used">Steel Used</option>
                        <option value="Machine A Operating Time">Machine A Operating Time</option>
                        <option value="Machine B Downtime">Machine B Downtime</option>
                        <option value="Total Machine Uptime">Total Machine Uptime</option>
                        <option value="Maintenance Time">Maintenance Time</option>
                        <option value="Tool Change Time">Tool Change Time</option>
                        <option value="Administrative Expenses">Administrative Expenses</option>
                        <option value="Software Subscriptions">Software Subscriptions</option>
                        <option value="Telephone/Internet Bills">Telephone/Internet Bills</option>
                        <option value="Stationery Usage">Stationery Usage</option>
                        <option value="Cafeteria Cost">Cafeteria Cost</option>
                        <option value="Total Salaries">Total Salaries</option>
                        <option value="Manager Salaries">Manager Salaries</option>
                        <option value="Worker Wages">Worker Wages</option>
                        <option value="Bonus Payments">Bonus Payments</option>
                        <option value="Wage Advances">Wage Advances</option>
                        <option value="Transport Fuel Cost">Transport Fuel Cost</option>
                        <option value="Truck Usage">Truck Usage</option>
                        <option value="Freight Charges">Freight Charges</option>
                        <option value="Inbound Material Weight">Inbound Material Weight</option>
                        <option value="Outbound Product Weight">Outbound Product Weight</option>
                        <option value="Cartons Used">Cartons Used</option>
                        <option value="Labels Used">Labels Used</option>
                        <option value="Shrink Wrap Used">Shrink Wrap Used</option>
                        <option value="Packaging Tape Used">Packaging Tape Used</option>
                        <option value="Pallets Used">Pallets Used</option>
                        <option value="Test Samples Taken">Test Samples Taken</option>
                        <option value="Rejected Items">Rejected Items</option>
                        <option value="QC Labor Hours">QC Labor Hours</option>
                        <option value="QC Equipment Used">QC Equipment Used</option>
                        <option value="Lab Chemicals Used">Lab Chemicals Used</option>
                        <option value="Gloves Used">Gloves Used</option>
                        <option value="Helmets Issued">Helmets Issued</option>
                        <option value="Fire Drills Conducted">Fire Drills Conducted</option>
                        <option value="First Aid Usage">First Aid Usage</option>
                        <option value="Safety Audits">Safety Audits</option>
                        <option value="Waste Generated">Waste Generated</option>
                        <option value="Waste Recycled">Waste Recycled</option>
                        <option value="Water Used">Water Used</option>
                        <option value="Waste Water Treated">Waste Water Treated</option>
                        <option value="Carbon Emissions">Carbon Emissions</option>
                        <option value="Opening Raw Material Stock">Opening Raw Material Stock</option>
                        <option value="Closing Raw Material Stock">Closing Raw Material Stock</option>
                        <option value="Spare Parts Used">Spare Parts Used</option>
                        <option value="Inventory Turnover Rate">Inventory Turnover Rate</option>
                        <option value="Damaged Inventory">Damaged Inventory</option>
                        <option value="Purchase Orders Issued">Purchase Orders Issued</option>
                        <option value="Suppliers Contacted">Suppliers Contacted</option>
                        <option value="Material Lead Time">Material Lead Time</option>
                        <option value="Discounts Received">Discounts Received</option>
                        <option value="Delayed Deliveries">Delayed Deliveries</option>
                        <option value="Lighting Electricity Use">Lighting Electricity Use</option>
                        <option value="Cooling System Electricity Use">Cooling System Electricity Use</option>
                        <option value="Boiler Fuel Use">Boiler Fuel Use</option>
                        <option value="Elevator Energy Use">Elevator Energy Use</option>
                        <option value="CCTV Power Consumption">CCTV Power Consumption</option>
                        <option value="Forklift Operating Hours">Forklift Operating Hours</option>
                        <option value="Employee Attendance">Employee Attendance</option>
                        <option value="Product Returns">Product Returns</option>
                        <option value="Customer Complaints">Customer Complaints</option>
                        <option value="IT Downtime">IT Downtime</option>

                      </select>

                      {/* Value field */}
                      <input
                        type="number"
                        value={input.value}
                        onChange={(e) => updateInput(index, "value", e.target.value)}
                        className="select-field"
                        placeholder="Enter value"
                      />

                      {inputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInput(index)}
                          className="text-red-400 hover:text-red-300 p-2"
                        >
                          <Minus size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Outputs Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Outputs</h3>
                  
                </div>

                <div className="space-y-3">
                  {outputs.map((output, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {/* Dropdown for output key */}
                      <select
                        value={output.key}
                        onChange={(e) => updateOutput(index, "key", e.target.value)}
                        className="select-field"
                      >
                        <option value="">-- Select Output --</option>
                        <option value="Total Units Produced">Total Units Produced</option>
                        <option value="Good Units Produced">Good Units Produced</option>
                        <option value="Rejected Units">Rejected Units</option>
                        <option value="Production Rate">Production Rate</option>
                        <option value="Yield Rate">Yield Rate</option>
                        <option value="Scrap Rate">Scrap Rate</option>
                        <option value="Downtime Hours">Downtime Hours</option>
                        <option value="Machine Utilization Rate">Machine Utilization Rate</option>
                        <option value="Labor Productivity">Labor Productivity</option>
                        <option value="Energy Consumption per Unit">Energy Consumption per Unit</option>
                        <option value="Cost per Unit">Cost per Unit</option>
                        <option value="Sales Revenue">Sales Revenue</option>
                        <option value="On-Time Delivery Rate">On-Time Delivery Rate</option>
                        <option value="Defect Density">Defect Density</option>
                        <option value="Customer Returns">Customer Returns</option>
                        <option value="Carbon Emission per Unit">Carbon Emission per Unit</option>
                        <option value="Inventory Turnover">Inventory Turnover</option>
                        <option value="First Pass Yield (FPY)">First Pass Yield (FPY)</option>
                        <option value="Throughput">Throughput</option>
                        <option value="Order Fulfillment Rate">Order Fulfillment Rate</option>
                        <option value="Employee Attendance Rate">Employee Attendance Rate</option>
                        <option value="Overall Equipment Effectiveness (OEE)">Overall Equipment Effectiveness (OEE)</option>
                        <option value="Maintenance Response Time">Maintenance Response Time</option>
                        <option value="Safety Compliance Score">Safety Compliance Score</option>

                      </select>

                      {/* Value field */}
                      <input
                        type="number"
                        value={output.value}
                        onChange={(e) => updateOutput(index, "value", e.target.value)}
                        className="select-field"
                        placeholder="Enter value"
                      />

                      {outputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOutput(index)}
                          className="text-red-400 hover:text-red-300 p-2"
                        >
                          <Minus size={16} />
                        </button>
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
                {loading ? "Calculating..." : "Calculate Productivity"}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Results</h3>

            {results ? (
              <div className="space-y-4">
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center mb-4">
                  <CheckCircle className="text-green-400 mr-2" size={20} />
                  <span className="text-green-400">Calculation completed successfully!</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Combined Productivity</h4>
                    <p className="text-2xl font-bold text-primary-400">
                      {results.combined_productivity || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Single Productivity</h4>
                    <div className="space-y-1">
                      {results.single_productivity
                        ? Object.entries(results.single_productivity).map(([k, v], i) => (
                          <p key={i} className="text-white/80 text-sm">
                            • {k}: {v}
                          </p>
                        ))
                        : "N/A"}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Processed Inputs</h4>
                    <div className="space-y-1">
                      {results.processed_inputs
                        ? Object.entries(results.processed_inputs).map(([k, v], i) => (
                          <p key={i} className="text-white/80 text-sm">
                            • {k}: {v}
                          </p>
                        ))
                        : "N/A"}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Processed Outputs</h4>
                    <div className="space-y-1">
                      {results.processed_outputs
                        ? Object.entries(results.processed_outputs).map(([k, v], i) => (
                          <p key={i} className="text-white/80 text-sm">
                            • {k}: {v}
                          </p>
                        ))
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-white/60 py-8">
                <Calculator size={48} className="mx-auto mb-4 opacity-50" />
                <p>Enter your inputs and outputs, then click calculate to see results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculate;