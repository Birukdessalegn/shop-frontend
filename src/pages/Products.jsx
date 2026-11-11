import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productAPI, serialAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Plus,
  Search,
  Filter,
  Barcode,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Tag,
  DollarSign
} from 'lucide-react';
import ProductModal from '../components/ProductModal';
import AddSerialsModal from '../components/AddSerialsModal';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddSerialsOpen, setIsAddSerialsOpen] = useState(false);
  const [targetProductForSerials, setTargetProductForSerials] = useState('');

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const categories = [
    'All',
    'General',
    'Smartphones',
    'Laptops',
    'Televisions',
    'Audio & Speakers',
    'Accessories',
    'Appliances',
    'Tablets',
    'Gaming'
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
      setError(err.response?.data?.message || 'Failed to fetch products');
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
      await productAPI.update(editingProduct._id, formData);
      setSuccessMsg(`Product "${formData.name}" updated successfully`);
    } else {
      await productAPI.create(formData);
      setSuccessMsg(`Product "${formData.name}" created successfully`);
    }
    fetchProducts();
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      return;
    }
    try {
      await productAPI.delete(id);
      setSuccessMsg(`Product "${name}" deleted`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleAddSerials = async (payload) => {
    await serialAPI.addSerials(payload);
    setSuccessMsg(`Serial numbers registered successfully`);
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage electronics, hardware specifications, retail pricing, and serialized stock
          </p>
        </div>

        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg('')}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
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
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name, brand, or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-2xs'
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
          <div className="py-20 flex justify-center items-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No products found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search criteria or register a new product to your inventory.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Product & Model</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Cost / Retail Price</th>
                  <th className="px-6 py-3.5">Profit Margin</th>
                  <th className="px-6 py-3.5">Serial Inventory Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const inv = p.inventory || {};
                  const margin = p.sellingPrice - p.purchasePrice;
                  const marginPct =
                    p.sellingPrice > 0 ? ((margin / p.sellingPrice) * 100).toFixed(0) : 0;

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition">
                      {/* Product Name & Brand */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
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
                            ${p.sellingPrice?.toFixed(2)}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Cost: ${p.purchasePrice?.toFixed(2)}
                          </p>
                        </div>
                      </td>

                      {/* Margin */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          +${margin.toFixed(2)} ({marginPct}%)
                        </span>
                      </td>

                      {/* Serials Inventory Overview */}
                      <td className="px-6 py-4">
                        {p.hasSerial ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200"
                              title="Available in store"
                            >
                              {inv.availableSerials || 0} Avail
                            </span>
                            {inv.onCreditSerials > 0 && (
                              <span
                                className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-200"
                                title="On Credit"
                              >
                                {inv.onCreditSerials} On Credit
                              </span>
                            )}
                            {inv.soldSerials > 0 && (
                              <span
                                className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-200"
                                title="Sold"
                              >
                                {inv.soldSerials} Sold
                              </span>
                            )}
                            <Link
                              to={`/serials?product=${p._id}`}
                              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-2 ml-1"
                            >
                              ({inv.totalSerials || 0} total)
                            </Link>
                          </div>
                        ) : (
                          <span className="font-medium text-slate-700">
                            {p.stockQuantity} units (Bulk item)
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.hasSerial && (
                            <button
                              onClick={() => {
                                setTargetProductForSerials(p._id);
                                setIsAddSerialsOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition"
                              title="Add Serials for this product"
                            >
                              <Barcode size={15} />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
                            title="Edit product info"
                          >
                            <Edit2 size={15} />
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteProduct(p._id, p.name)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 transition"
                              title="Delete product"
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

      <AddSerialsModal
        isOpen={isAddSerialsOpen}
        onClose={() => {
          setIsAddSerialsOpen(false);
          setTargetProductForSerials('');
        }}
        onSubmit={handleAddSerials}
        products={products}
        defaultProductId={targetProductForSerials}
      />
    </div>
  );
};

export default Products;

