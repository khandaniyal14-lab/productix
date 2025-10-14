import React, { useEffect, useState } from "react";
import { Package, Plus, Edit2, Search, X, Loader2 } from "lucide-react";
import api from "../../services/api";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load products");
      setLoading(false);
    }
  };

  // Handle Add
  const handleAdd = async (e) => {
    e.preventDefault();

    const newProduct = {
      id: products.length + 1,
      name,
      description
    };
    setProducts([...products, newProduct]);

    setShowAdd(false);
    setName("");
    setDescription("");

    try {
      await api.post("/products", { name, description });
      fetchProducts();
    } catch {
      alert("Failed to add product");
    }
  };

  // Handle Edit
  const handleEdit = async (e) => {
    e.preventDefault();

    setProducts(products.map(p =>
      p.id === editProduct.id ? { ...p, name, description } : p
    ));

    setShowEdit(false);
    setEditProduct(null);
    setName("");
    setDescription("");

    try {
      await api.put(`/products/${editProduct.id}`, { name, description });
      fetchProducts();
    } catch {
      alert("Failed to edit product");
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 rounded-lg">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Products
            </h1>
            <p className="text-white/40 text-sm">Manage your product catalog</p>
          </div>


        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
          />
        </div>

        {/* Products Grid/Table */}
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-6 text-white/60 font-semibold text-sm uppercase tracking-wider">ID</th>
                  <th className="text-left py-4 px-6 text-white/60 font-semibold text-sm uppercase tracking-wider">Name</th>
                  <th className="text-left py-4 px-6 text-white/60 font-semibold text-sm uppercase tracking-wider">Description</th>
                  <th className="text-right py-4 px-6 text-white/60 font-semibold text-sm uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12">
                      <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <p className="text-white/40">No products found</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p, index) => (
                    <tr
                      key={p.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 text-purple-300 font-semibold text-sm">
                          {p.id}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                            <Package className="w-5 h-5 text-purple-400" />
                          </div>
                          <span className="text-white font-medium">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-white/60">
                        {p.description || <span className="text-white/30 italic">No description</span>}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-lg text-white text-sm font-medium transition-all duration-300 hover:scale-105"
                          onClick={() => {
                            setEditProduct(p);
                            setName(p.name);
                            setDescription(p.description || "");
                            setShowEdit(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Products Count */}
        <div className="mt-4 text-center text-white/40 text-sm">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Add Product Modal */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-white font-bold flex items-center gap-2">
                <Plus className="w-6 h-6 text-purple-400" />
                Add Product
              </h2>
              <button
                onClick={() => setShowAdd(false)}
                className="text-white/40 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">Product Name</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                  placeholder="Enter product name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 min-h-[100px] resize-none"
                  placeholder="Enter product description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAdd}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                >
                  Create Product
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-semibold text-white transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-white font-bold flex items-center gap-2">
                <Edit2 className="w-6 h-6 text-purple-400" />
                Edit Product
              </h2>
              <button
                onClick={() => setShowEdit(false)}
                className="text-white/40 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">Product Name</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                  placeholder="Enter product name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 min-h-[100px] resize-none"
                  placeholder="Enter product description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleEdit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEdit(false)}
                  className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-semibold text-white transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;