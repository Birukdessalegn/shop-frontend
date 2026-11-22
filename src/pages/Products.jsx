import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Boxes,
  ShieldAlert
} from 'lucide-react';
import ProductModal from '../components/ProductModal';
import AddStockModal from '../components/AddStockModal';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProductForStock, setSelectedProductForStock] = useState(null);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);

  const { isAdmin, isStock, canManageStock } = useAuth();

  const categories = [
    'All',
    'Computers & PCs',
    'Laptops',
    'Smartphones',
    'Televisions',
    'Audio & Speakers',
    'Accessories',
    'Appliances',
    'Tablets',
    'Gaming',
    'General'
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (search) params.search = search;
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const res = await productAPI.getAll(params);
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const handleCreateOrUpdateProduct = async (formData) => {
    if (editingProduct) {
      await productAPI.update(editingProduct._id || editingProduct.id, formData);
      setSuccessMsg(`Item "${formData.name}" updated successfully.`);
    } else {
      await productAPI.create(formData);
      setSuccessMsg(`Item "${formData.name}" registered with ${formData.stockQuantity} pcs in stock.`);
    }
    fetchProducts();
  };

  const handleAddStock = async (id, payload) => {
    const res = await productAPI.addStock(id, payload);
    setSuccessMsg(res.data.message || 'Stock updated successfully!');
    fetchProducts();
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from catalog?`)) {
      return;
    }
    try {
      await productAPI.delete(id);
      setSuccessMsg(`Item "${name}" deleted.`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item');
    }
  };

  if (!canManageStock) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-lg mx-auto mt-12">
        <ShieldAlert size={40} className="text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-red-900 mb-1">Access Restricted</h2>
        <p className="text-sm text-red-700">
          Stock & Inventory management is restricted to Stock handlers and Administrators. Please use the <strong>Sell / POS</strong> page to sell items.
        </p>
      </div>
    );
  }

  // Quick stats
  const totalItemsCount = products.length;
  const totalPiecesInStock = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Boxes size={22} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Items & Stock</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Total Catalog: <strong>{totalItemsCount}</strong> items • Currently in Store: <strong className="text-indigo-600">{totalPiecesInStock}</strong> pieces
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManageStock && (
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
            >
              <Plus size={15} />
              <span>Register New Item</span>
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900 font-bold">
            &times;
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by item name, brand, or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading shop items...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No items found</p>
            <p className="text-xs text-slate-400 mt-1">
              {search || selectedCategory !== 'All'
                ? 'Try adjusting your search filters'
                : 'Get started by clicking "Register New Item" above'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Item & Model</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Cost / Sell Price</th>
                  <th className="px-6 py-3.5">Profit Margin</th>
                  <th className="px-6 py-3.5 text-center">In Stock</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const cost = p.purchasePrice || 0;
                  const sell = p.sellingPrice || 0;
                  const margin = sell - cost;
                  const marginPct = cost > 0 ? ((margin / cost) * 100).toFixed(1) : 0;
                  const qty = p.stockQuantity || 0;

                  return (
                    <tr key={p._id || p.id} className="hover:bg-slate-50/60 transition">
                      {/* Name & Brand */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                            <Package size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                            <p className="text-[11px] text-slate-500">
                              {p.brand && <span className="font-medium text-slate-700">{p.brand}</span>}
                              {p.model && <span> • Model: {p.model}</span>}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {p.category}
                        </span>
                      </td>

                      {/* Cost / Retail */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 text-sm">
                            ${sell.toFixed(2)}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Cost: ${cost.toFixed(2)}
                          </p>
                        </div>
                      </td>

                      {/* Margin */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          +${margin.toFixed(2)} ({marginPct}%)
                        </span>
                      </td>

                      {/* Stock Quantity */}
                      <td className="px-6 py-4 text-center">
                        {qty > 0 ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {qty} Pcs
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                            Out of Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Add Stock Button */}
                          {canManageStock && (
                            <button
                              onClick={() => {
                                setSelectedProductForStock(p);
                                setIsAddStockOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition flex items-center gap-1"
                              title="Add more pieces to stock"
                            >
                              <PlusCircle size={14} />
                              <span>+ Stock</span>
                            </button>
                          )}

                          {/* Edit Button */}
                          {canManageStock && (
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
                              title="Edit item info"
                            >
                              <Edit2 size={15} />
                            </button>
                          )}

                          {/* Delete Button */}
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteProduct(p._id || p.id, p.name)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 transition"
                              title="Delete item"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleCreateOrUpdateProduct}
        product={editingProduct}
      />

      <AddStockModal
        isOpen={isAddStockOpen}
        onClose={() => {
          setIsAddStockOpen(false);
          setSelectedProductForStock(null);
        }}
        onSubmit={handleAddStock}
        product={selectedProductForStock}
      />
    </div>
  );
};

export default Products;
