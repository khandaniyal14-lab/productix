import React, { useState, useEffect } from "react";
import { Plus, Trash2, Eye, EyeOff, ArrowRight } from "lucide-react";
import api from "../services/api";

const OrgAdminDashboard = () => {
  const [tab, setTab] = useState("users"); // tabs: users, products
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [inputs, setInputs] = useState([{ key: "" }]);
  const [outputs, setOutputs] = useState([{ key: "" }]);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [showPassword, setShowPassword] = useState({});
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Fetch users and products
  useEffect(() => {
    fetchUsers();
    fetchProducts();
  }, []);

  const fetchUsers = async () => {
    const res = await api.get("/users/");
    const orgUsers = res.data.filter(user => user.role === "org_user");
    setUsers(orgUsers);
  };

  const fetchProducts = async () => {
    const res = await api.get("/products/");
    setProducts(res.data);
  };

  // ---------------- Users CRUD ----------------
  const addUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) return;
    await api.post("/users/", { ...newUser, role: "org_user" });
    setNewUser({ name: "", email: "", password: "" });
    fetchUsers();
  };

  const deleteUser = async (id) => {
    await api.delete(`/users/${id}`);
    fetchUsers();
  };

  // ---------------- Products CRUD ----------------
  const addProduct = async () => {
    const payload = {
      name: productName,
      description: productDescription,
      input_fields: inputs.map((i) => i.key),
      output_fields: outputs.map((o) => o.key),
    };
    await api.post("/products/", payload);
    setProductName("");
    setProductDescription("");
    setInputs([{ key: "" }]);
    setOutputs([{ key: "" }]);
    fetchProducts();
  };

  const deleteProduct = async (id) => {
    await api.delete(`/products/${id}`);
    fetchProducts();
  };

  // ---------------- Dynamic Inputs/Outputs ----------------
  const addInput = () => setInputs([...inputs, { key: "" }]);
  const removeInput = (index) =>
    setInputs(inputs.filter((_, i) => i !== index));
  const updateInput = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index].key = value;
    setInputs(newInputs);
  };

  const addOutput = () => setOutputs([...outputs, { key: "" }]);
  const removeOutput = (index) =>
    setOutputs(outputs.filter((_, i) => i !== index));
  const updateOutput = (index, value) => {
    const newOutputs = [...outputs];
    newOutputs[index].key = value;
    setOutputs(newOutputs);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {["users", "products"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl font-medium ${tab === t
              ? "bg-purple-500 text-white"
              : "bg-white/5 text-white/50"
              }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {tab === "users" && (
        <div className="space-y-4">
          {/* New User Form */}
          <form
            onSubmit={addUser}
            className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2"
          >
            <h3 className="text-white font-medium mb-2">Add New User</h3>
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) =>
                setNewUser({ ...newUser, name: e.target.value })
              }
              className="w-full p-2 rounded-xl bg-white/10 text-white"
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              className="w-full p-2 rounded-xl bg-white/10 text-white"
            />
            <div className="flex gap-2 items-center">
              <input
                type={showPassword["new"] ? "text" : "password"}
                placeholder="Password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="w-full p-2 rounded-xl bg-white/10 text-white"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword({ ...showPassword, new: !showPassword["new"] })
                }
              >
                {showPassword["new"] ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl"
            >
              <Plus size={16} /> Add User
            </button>
          </form>

          {/* Existing Users */}
          {users.map((user) => (
            <div
              key={user.id}
              className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10"
            >
              <div>
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-white/60 text-sm">{user.email}</p>
                <p className="text-white/60 text-sm flex items-center gap-2">
                  Password:{" "}
                  <span>{showPassword[user.id] ? user.password : "***"}</span>
                  <button
                    onClick={() =>
                      setShowPassword({
                        ...showPassword,
                        [user.id]: !showPassword[user.id],
                      })
                    }
                  >
                    {showPassword[user.id] ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => deleteUser(user.id)}
                  className="p-2 text-red-400 rounded-lg hover:bg-red-500/10"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Products Tab */}
      {tab === "products" && (
        <div className="space-y-6">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Product Name"
              className="w-full mb-2 p-2 rounded-xl bg-white/10 text-white"
            />
            <input
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Product Description"
              className="w-full mb-4 p-2 rounded-xl bg-white/10 text-white"
            />
            <div className="flex gap-2 mb-2">
              <button
                onClick={addInput}
                className="p-2 bg-purple-500/50 rounded-lg"
              >
                Add Input
              </button>
              <button
                onClick={addOutput}
                className="p-2 bg-emerald-500/50 rounded-lg"
              >
                Add Output
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-4">
              {/* Inputs Column */}
              <div>
                <h4 className="text-white/70 mb-2 font-medium">Inputs</h4>
                {inputs.map((i, idx) => (
                  <div key={idx} className="flex gap-2 items-center mb-2">
                    <input
                      value={i.key}
                      onChange={(e) => updateInput(idx, e.target.value)}
                      className="w-full p-2 rounded-xl bg-white/10 text-white"
                      placeholder="Input Field"
                    />
                    <button
                      onClick={() => removeInput(idx)}
                      className="p-2 text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Outputs Column */}
              <div>
                <h4 className="text-white/70 mb-2 font-medium">Outputs</h4>
                {outputs.map((o, idx) => (
                  <div key={idx} className="flex gap-2 items-center mb-2">
                    <input
                      value={o.key}
                      onChange={(e) => updateOutput(idx, e.target.value)}
                      className="w-full p-2 rounded-xl bg-white/10 text-white"
                      placeholder="Output Field"
                    />
                    <button
                      onClick={() => removeOutput(idx)}
                      className="p-2 text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={addProduct}
              className="px-4 py-2 bg-purple-500 text-white rounded-xl"
            >
              Save Product
            </button>
          </div>

          {products.map((product) => (
            <div
              key={product.id}
              className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10"
            >
              <div>
                <p className="text-white font-medium">{product.name}</p>
                <p className="text-white/60 text-sm">{product.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="p-2 text-red-400 rounded-lg hover:bg-red-500/10"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrgAdminDashboard;
