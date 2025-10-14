import React, { useEffect, useState } from "react";
import { Clock, Save, AlertCircle } from "lucide-react";
import api from "../../services/api";
import Toast from "../../components/toast";

const ShiftEntry = () => {
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [productFields, setProductFields] = useState({
    input_fields: [],
    output_fields: [],
  });
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [shiftData, setShiftData] = useState({
    product_id: "",
    batch_id: "",
    date: "",
    shift_no: "morning",
    input_materials: {},
    output_products: {},
  });

  // Fetch products initially
  useEffect(() => {
    fetchProducts();
  }, []);

  // When product changes → load batches + fields
  useEffect(() => {
    if (shiftData.product_id) {
      fetchProductDataAndBatches(shiftData.product_id);
      setShiftData((s) => ({
        ...s,
        batch_id: "",
        input_materials: {},
        output_products: {},
      }));
    } else {
      setBatches([]);
      setProductFields({ input_fields: [], output_fields: [] });
    }
  }, [shiftData.product_id]);

  // Fetch all products
  const fetchProducts = async () => {
    setLoadingProducts(true);
    setError(null);
    try {
      const res = await api.get("/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch product fields + related batches
  const fetchProductDataAndBatches = async (productId) => {
    setLoadingBatches(true);
    setError(null);
    try {
      const res = await api.get(`/shifts/product/${productId}/fields`);
      const data = res.data;

      setProductFields({
        input_fields: data.input_fields || [],
        output_fields: data.output_fields || [],
      });

      const batchRes = await api.get(`/batches/${productId}`);
      setBatches(batchRes.data || []);
    } catch (err) {
      console.error("Error fetching product fields or batches:", err);
      setError("Failed to load product fields or batches");
    } finally {
      setLoadingBatches(false);
    }
  };

  // Handle input updates
  const handleInputChange = (fieldName, type, value) => {
    if (type === "input") {
      setShiftData((s) => ({
        ...s,
        input_materials: {
          ...s.input_materials,
          [fieldName]: {
            ...s.input_materials[fieldName],
            amount: value,
          },
        },
      }));
    } else if (type === "input_price") {
      setShiftData((s) => ({
        ...s,
        input_materials: {
          ...s.input_materials,
          [fieldName]: {
            ...s.input_materials[fieldName],
            unit_price: value,
          },
        },
      }));
    } else if (type === "output") {
      setShiftData((s) => ({
        ...s,
        output_products: {
          ...s.output_products,
          [fieldName]: {
            ...s.output_products[fieldName],
            amount: value,
          },
        },
      }));
    }
  };

  // Utility: capitalize shift name
  const capitalize = (s) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;

  // Validate required fields
  const validateForm = () => {
    if (!shiftData.product_id) return setError("Please select a product.");
    if (!shiftData.batch_id) return setError("Please select a batch.");
    if (!shiftData.date) return setError("Please select a date.");
    if (!shiftData.shift_no) return setError("Please select a shift.");
    setError(null);
    return true;
  };

  // Format API error messages
  const formatApiError = (err) => {
    if (!err?.response?.data) return err.message || "Unknown error";
    const data = err.response.data;
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((d) => {
          const loc = Array.isArray(d.loc) ? d.loc.join(".") : d.loc;
          return `${loc} - ${d.msg}`;
        })
        .join(", ");
    }
    return data.detail || data.message || JSON.stringify(data);
  };

  // Submit shift entry
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setError(null);

    const payload = {
      product_id: Number(shiftData.product_id),
      batch_id: Number(shiftData.batch_id),
      date: shiftData.date,
      shift_no: capitalize(shiftData.shift_no),
      input_materials: shiftData.input_materials,
      output_products: shiftData.output_products,
    };

    try {
      await api.post("/shifts", payload);
      setToast({ type: "success", message: "Shift entry saved successfully!" });

      // Reset form
      setShiftData({
        product_id: "",
        batch_id: "",
        date: "",
        shift_no: "morning",
        input_materials: {},
        output_products: {},
      });
      setBatches([]);
      setProductFields({ input_fields: [], output_fields: [] });
    } catch (err) {
      console.error("Error saving shift entry", err);
      setToast({ type: "error", message: formatApiError(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 rounded-lg">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Clock className="w-10 h-10 text-purple-400" />
            Shift Entry
          </h1>
          <p className="text-white/40 text-sm">
            Record production data for each shift
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-8 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 p-8"
        >
          {/* Product & Batch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                Product
              </label>
              <select
                value={shiftData.product_id}
                onChange={(e) =>
                  setShiftData({ ...shiftData, product_id: e.target.value })
                }
                className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white"
              >
                <option value="">
                  {loadingProducts ? "Loading products..." : "Select Product"}
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                Batch
              </label>
              <select
                value={shiftData.batch_id}
                onChange={(e) =>
                  setShiftData({ ...shiftData, batch_id: e.target.value })
                }
                disabled={!shiftData.product_id || loadingBatches}
                className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white"
              >
                <option value="">
                  {loadingBatches ? "Loading batches..." : "Select Batch"}
                </option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batch_number} — {b.start_date}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Shift */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/60 text-sm mb-2">Date</label>
              <input
                type="date"
                value={shiftData.date}
                onChange={(e) =>
                  setShiftData({ ...shiftData, date: e.target.value })
                }
                className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Shift</label>
              <select
                value={shiftData.shift_no}
                onChange={(e) =>
                  setShiftData({ ...shiftData, shift_no: e.target.value })
                }
                className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white"
              >
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>
          </div>

          {/* Input Fields */}
          {productFields.input_fields.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Input Materials</h3>
              {productFields.input_fields.map((field) => (
                <div
                  key={field}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <label className="text-white/60 text-sm">
                      {field} Amount
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0"
                      value={shiftData.input_materials[field]?.amount || ""}
                      onChange={(e) =>
                        handleInputChange(field, "input", e.target.value)
                      }
                      className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm">
                      {field} Unit Price (optional)
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0"
                      value={shiftData.input_materials[field]?.unit_price || ""}
                      onChange={(e) =>
                        handleInputChange(field, "input_price", e.target.value)
                      }
                      className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Output Fields */}
          {productFields.output_fields.length > 0 && (
            <div className="space-y-4 mt-6">
              <h3 className="text-white font-semibold">Output Products</h3>
              {productFields.output_fields.map((field) => (
                <div key={field}>
                  <label className="text-white/60 text-sm">{field} Amount</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    value={shiftData.output_products[field]?.amount || ""}
                    onChange={(e) =>
                      handleInputChange(field, "output", e.target.value)
                    }
                    className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 text-white"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={
                saving ||
                !shiftData.product_id ||
                !shiftData.batch_id ||
                !shiftData.date
              }
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-5 h-5 inline-block mr-2" /> Save Shift Entry
                </>
              )}
            </button>
          </div>
        </form>

        {/* Toast */}
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ShiftEntry;
