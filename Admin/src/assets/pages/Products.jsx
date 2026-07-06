// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Link } from "react-router-dom";
// import api from "../services/api.js";
// import Modal from "../components/Modal.jsx";
// import ConfirmDialog from "../components/ConfirmDialog.jsx";

// // Icons
// import { FaBox, FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa";
// import { IoSearch, IoClose, IoFilter } from "react-icons/io5";
// import { GiPerfumeBottle } from "react-icons/gi";

// // ✅ IMAGE HELPER - Full URL banane ke liye
// const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// const getImageUrl = (imagePath) => {
//   if (!imagePath) return null;
//   if (imagePath.startsWith('http')) return imagePath;
//   return `${API_BASE_URL}${imagePath}`;
// };

// const Products = () => {
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [priceRange, setPriceRange] = useState({ min: "", max: "" });
//   const [showFilters, setShowFilters] = useState(false);
//   const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: "" });

//   useEffect(() => {
//     fetchProducts();
//     fetchCategories();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get("/products");
//       setProducts(res.data.data || []);
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCategories = async () => {
//     try {
//       const res = await api.get("/categories");
//       setCategories(res.data.data || []);
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//     }
//   };

//   const handleDelete = async () => {
//     try {
//       await api.delete(`/products/${deleteDialog.id}`);
//       setDeleteDialog({ isOpen: false, id: null, name: "" });
//       fetchProducts();
//     } catch (error) {
//       console.error("Error deleting product:", error);
//       alert(error.response?.data?.message || "Cannot delete product!");
//     }
//   };

//   const filteredProducts = products.filter((product) => {
//     const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory = selectedCategory ? product.category?._id === selectedCategory : true;
//     const matchesMinPrice = priceRange.min ? product.price >= Number(priceRange.min) : true;
//     const matchesMaxPrice = priceRange.max ? product.price <= Number(priceRange.max) : true;
//     return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
//   });

//   const clearFilters = () => {
//     setSearchTerm("");
//     setSelectedCategory("");
//     setPriceRange({ min: "", max: "" });
//   };

//   const hasActiveFilters = searchTerm || selectedCategory || priceRange.min || priceRange.max;

//   return (
//     <div className="min-h-screen">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
//         <div>
//           <h1 className="text-3xl font-bold text-[#e2e8f0] tracking-wide flex items-center gap-3">
//             <FaBox className="text-[#6366f1]" />
//             Products
//           </h1>
//           <p className="text-[#8892b0] text-sm mt-1">Manage your perfume inventory</p>
//         </div>
//         <Link
//           to="/products/new"
//           className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-xl text-sm font-medium hover:shadow-[0_4px_20px_rgba(99,102,241,0.3)] transition-all duration-200 hover:scale-105 active:scale-95"
//         >
//           <FaPlus className="text-sm" />
//           Add Product
//         </Link>
//       </div>

//       {/* Search & Filters */}
//       <div className="flex flex-col sm:flex-row gap-3 mb-6">
//         <div className="relative flex-1">
//           <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8892b0] text-lg" />
//           <input
//             type="text"
//             placeholder="Search products..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.1)] rounded-xl pl-12 pr-4 py-3 text-[#e2e8f0] text-sm placeholder-[#8892b0] focus:outline-none focus:border-[rgba(99,102,241,0.4)] focus:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all duration-200"
//           />
//           {searchTerm && (
//             <button
//               onClick={() => setSearchTerm("")}
//               className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8892b0] hover:text-[#e2e8f0]"
//             >
//               <IoClose />
//             </button>
//           )}
//         </div>
//         <button
//           onClick={() => setShowFilters(!showFilters)}
//           className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${showFilters || hasActiveFilters
//               ? "bg-[rgba(99,102,241,0.15)] border-[rgba(99,102,241,0.3)] text-[#6366f1]"
//               : "bg-[rgba(255,255,255,0.03)] border-[rgba(99,102,241,0.1)] text-[#a8b4d0] hover:border-[rgba(99,102,241,0.3)]"
//             }`}
//         >
//           <IoFilter />
//           Filters
//           {hasActiveFilters && (
//             <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
//           )}
//         </button>
//       </div>

//       {/* Filter Panel */}
//       <AnimatePresence>
//         {showFilters && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: "auto", opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             transition={{ duration: 0.3 }}
//             className="overflow-hidden mb-6"
//           >
//             <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.1)] rounded-xl p-4 flex flex-col sm:flex-row gap-4">
//               <div className="flex-1">
//                 <label className="block text-xs text-[#8892b0] mb-2">Category</label>
//                 <select
//                   value={selectedCategory}
//                   onChange={(e) => setSelectedCategory(e.target.value)}
//                   className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(99,102,241,0.15)] rounded-xl px-4 py-2.5 text-[#e2e8f0] text-sm focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
//                 >
//                   <option value="" className="bg-[#0c1220]">All Categories</option>
//                   {categories.map((cat) => (
//                     <option key={cat._id} value={cat._id} className="bg-[#0c1220]">
//                       {cat.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="flex-1">
//                 <label className="block text-xs text-[#8892b0] mb-2">Min Price</label>
//                 <input
//                   type="number"
//                   placeholder="0"
//                   value={priceRange.min}
//                   onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
//                   className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(99,102,241,0.15)] rounded-xl px-4 py-2.5 text-[#e2e8f0] text-sm focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
//                 />
//               </div>
//               <div className="flex-1">
//                 <label className="block text-xs text-[#8892b0] mb-2">Max Price</label>
//                 <input
//                   type="number"
//                   placeholder="99999"
//                   value={priceRange.max}
//                   onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
//                   className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(99,102,241,0.15)] rounded-xl px-4 py-2.5 text-[#e2e8f0] text-sm focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
//                 />
//               </div>
//               <div className="flex items-end">
//                 <button
//                   onClick={clearFilters}
//                   className="px-4 py-2.5 rounded-xl border border-[rgba(99,102,241,0.2)] text-[#a8b4d0] text-sm hover:bg-[rgba(99,102,241,0.1)] transition-all duration-200"
//                 >
//                   Clear
//                 </button>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Products Table */}
//       {loading ? (
//         <div className="flex items-center justify-center py-20">
//           <div className="w-8 h-8 border-2 border-[rgba(99,102,241,0.1)] border-t-[#6366f1] rounded-full animate-spin" />
//         </div>
//       ) : (
//         <div className="bg-gradient-to-b from-[rgba(17,24,56,0.4)] to-[rgba(8,11,24,0.4)] border border-[rgba(99,102,241,0.1)] rounded-2xl overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-[rgba(99,102,241,0.1)]">
//                   <th className="text-left text-xs font-semibold text-[#8892b0] uppercase tracking-wider px-6 py-4">Product</th>
//                   <th className="text-left text-xs font-semibold text-[#8892b0] uppercase tracking-wider px-6 py-4">Category</th>
//                   <th className="text-left text-xs font-semibold text-[#8892b0] uppercase tracking-wider px-6 py-4">Price</th>
//                   <th className="text-left text-xs font-semibold text-[#8892b0] uppercase tracking-wider px-6 py-4">Stock</th>
//                   <th className="text-left text-xs font-semibold text-[#8892b0] uppercase tracking-wider px-6 py-4">Status</th>
//                   <th className="text-right text-xs font-semibold text-[#8892b0] uppercase tracking-wider px-6 py-4">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <AnimatePresence>
//                   {filteredProducts.map((product, index) => (
//                     <motion.tr
//                       key={product._id}
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       exit={{ opacity: 0 }}
//                       transition={{ duration: 0.2, delay: index * 0.03 }}
//                       className="border-b border-[rgba(99,102,241,0.05)] hover:bg-[rgba(99,102,241,0.05)] transition-colors duration-200 group"
//                     >
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-3">
//                           <div className="w-12 h-12 rounded-xl overflow-hidden border border-[rgba(99,102,241,0.15)] flex-shrink-0">
//                             {product.mainImage || product.images?.[0]?.url ? (
//                               <img
//                                 src={getImageUrl(product.mainImage || product.images[0].url)}  // ✅ FIXED
//                                 alt={product.name}
//                                 className="w-full h-full object-cover"
//                                 onError={(e) => { e.target.src = "/placeholder.png"; }}  // ✅ FALLBACK
//                               />
//                             ) : (
//                               <div className="w-full h-full flex items-center justify-center bg-[rgba(99,102,241,0.1)]">
//                                 <GiPerfumeBottle className="text-lg text-[rgba(99,102,241,0.3)]" />
//                               </div>
//                             )}
//                           </div>
//                           <div>
//                             <h4 className="text-sm font-medium text-[#e2e8f0]">{product.name}</h4>
//                             <p className="text-xs text-[#8892b0] line-clamp-1">{product.desc}</p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className="text-sm text-[#a8b4d0]">{product.category?.name || "N/A"}</span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className="text-sm font-semibold text-[#6366f1]">Rs. {product.price.toLocaleString()}</span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className={`text-sm ${product.stock < 10 ? "text-[#fc8181]" : "text-[#a8b4d0]"}`}>
//                           {product.stock}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span
//                           className={`text-xs px-3 py-1 rounded-full ${product.isActive
//                               ? "bg-[rgba(34,197,94,0.1)] text-[#4ade80] border border-[rgba(34,197,94,0.2)]"
//                               : "bg-[rgba(239,68,68,0.1)] text-[#fc8181] border border-[rgba(239,68,68,0.2)]"
//                             }`}
//                         >
//                           {product.isActive ? "Active" : "Inactive"}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center justify-end gap-2">
//                           <Link
//                             to={`/products/${product._id}`}
//                             className="w-8 h-8 rounded-lg bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.15)] text-[#6366f1] flex items-center justify-center hover:bg-[rgba(99,102,241,0.2)] transition-all duration-200"
//                           >
//                             <FaEye className="text-xs" />
//                           </Link>
//                           <Link
//                             to={`/products/edit/${product._id}`}
//                             className="w-8 h-8 rounded-lg bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.15)] text-[#6366f1] flex items-center justify-center hover:bg-[rgba(99,102,241,0.2)] transition-all duration-200"
//                           >
//                             <FaEdit className="text-xs" />
//                           </Link>
//                           <button
//                             onClick={() => setDeleteDialog({ isOpen: true, id: product._id, name: product.name })}
//                             className="w-8 h-8 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.15)] text-[#fc8181] flex items-center justify-center hover:bg-[rgba(239,68,68,0.2)] transition-all duration-200"
//                           >
//                             <FaTrash className="text-xs" />
//                           </button>
//                         </div>
//                       </td>

//                       <th className="text-left text-xs font-semibold text-[#8892b0] uppercase tracking-wider px-6 py-4">Views</th>
//                       <td className="px-6 py-4">
//                         <span className="text-sm text-[#a8b4d0]">{product.impressions || 0}</span>
//                       </td>

//                     </motion.tr>
//                   ))}
//                 </AnimatePresence>
//               </tbody>
//             </table>
//           </div>

//           {/* Empty State */}
//           {filteredProducts.length === 0 && (
//             <div className="text-center py-16">
//               <GiPerfumeBottle className="text-6xl text-[rgba(99,102,241,0.2)] mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-[#e2e8f0] mb-2">No products found</h3>
//               <p className="text-[#8892b0] text-sm">Try adjusting your search or filters</p>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Delete Confirmation */}
//       <ConfirmDialog
//         isOpen={deleteDialog.isOpen}
//         onClose={() => setDeleteDialog({ isOpen: false, id: null, name: "" })}
//         onConfirm={handleDelete}
//         title="Delete Product"
//         message={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone.`}
//       />
//     </div>
//   );
// };

// export default Products;


// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Link } from "react-router-dom";
// import api from "../services/api.js";
// import Modal from "../components/Modal.jsx";
// import ConfirmDialog from "../components/ConfirmDialog.jsx";

// // Icons
// import { FaBox, FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa";
// import { IoSearch, IoClose, IoFilter } from "react-icons/io5";
// import { GiPerfumeBottle } from "react-icons/gi";

// // ✅ IMAGE HELPER - Full URL banane ke liye
// const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// const getImageUrl = (imagePath) => {
//   if (!imagePath) return null;
//   if (imagePath.startsWith('http')) return imagePath;
//   return `${API_BASE_URL}${imagePath}`;
// };

// const Products = () => {
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [priceRange, setPriceRange] = useState({ min: "", max: "" });
//   const [showFilters, setShowFilters] = useState(false);
//   const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: "" });

//   useEffect(() => {
//     fetchProducts();
//     fetchCategories();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get("/products");
//       setProducts(res.data.data || []);
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCategories = async () => {
//     try {
//       const res = await api.get("/categories");
//       setCategories(res.data.data || []);
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//     }
//   };

//   const handleDelete = async () => {
//     try {
//       await api.delete(`/products/${deleteDialog.id}`);
//       setDeleteDialog({ isOpen: false, id: null, name: "" });
//       fetchProducts();
//     } catch (error) {
//       console.error("Error deleting product:", error);
//       alert(error.response?.data?.message || "Cannot delete product!");
//     }
//   };

//   const filteredProducts = products.filter((product) => {
//     const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory = selectedCategory ? product.category?._id === selectedCategory : true;
//     const matchesMinPrice = priceRange.min ? product.price >= Number(priceRange.min) : true;
//     const matchesMaxPrice = priceRange.max ? product.price <= Number(priceRange.max) : true;
//     return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
//   });

//   const clearFilters = () => {
//     setSearchTerm("");
//     setSelectedCategory("");
//     setPriceRange({ min: "", max: "" });
//   };

//   const hasActiveFilters = searchTerm || selectedCategory || priceRange.min || priceRange.max;

//   return (
//     <div className="min-h-screen pb-8 px-2 sm:px-4">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-bold text-[#e2e8f0] tracking-wide flex items-center gap-3">
//             <FaBox className="text-[#6366f1] text-2xl" />
//             Products
//           </h1>
//           <p className="text-[#8892b0] text-xs sm:text-sm mt-1">Manage your perfume inventory</p>
//         </div>
//         <Link
//           to="/products/new"
//           className="flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-xl text-sm font-medium hover:shadow-[0_4px_20px_rgba(99,102,241,0.3)] transition-all duration-200 hover:scale-105 active:scale-95 w-full sm:w-auto"
//         >
//           <FaPlus className="text-sm" />
//           Add Product
//         </Link>
//       </div>

//       {/* Search & Filters */}
//       <div className="flex flex-col sm:flex-row gap-3 mb-4">
//         <div className="relative flex-1">
//           <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8892b0] text-lg" />
//           <input
//             type="text"
//             placeholder="Search products..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.1)] rounded-xl pl-12 pr-12 py-3 text-[#e2e8f0] text-sm placeholder-[#8892b0] focus:outline-none focus:border-[rgba(99,102,241,0.4)] focus:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all duration-200"
//           />
//           {searchTerm && (
//             <button
//               onClick={() => setSearchTerm("")}
//               className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8892b0] hover:text-[#e2e8f0]"
//             >
//               <IoClose />
//             </button>
//           )}
//         </div>
//         <button
//           onClick={() => setShowFilters(!showFilters)}
//           className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 w-full sm:w-auto ${
//             showFilters || hasActiveFilters
//               ? "bg-[rgba(99,102,241,0.15)] border-[rgba(99,102,241,0.3)] text-[#6366f1]"
//               : "bg-[rgba(255,255,255,0.03)] border-[rgba(99,102,241,0.1)] text-[#a8b4d0] hover:border-[rgba(99,102,241,0.3)]"
//           }`}
//         >
//           <IoFilter />
//           Filters
//           {hasActiveFilters && (
//             <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
//           )}
//         </button>
//       </div>

//       {/* Filter Panel */}
//       <AnimatePresence>
//         {showFilters && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: "auto", opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             transition={{ duration: 0.3 }}
//             className="overflow-hidden mb-6"
//           >
//             <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.1)] rounded-xl p-4 space-y-4">
//               <div>
//                 <label className="block text-xs text-[#8892b0] mb-2">Category</label>
//                 <select
//                   value={selectedCategory}
//                   onChange={(e) => setSelectedCategory(e.target.value)}
//                   className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(99,102,241,0.15)] rounded-xl px-4 py-2.5 text-[#e2e8f0] text-sm focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
//                 >
//                   <option value="" className="bg-[#0c1220]">All Categories</option>
//                   {categories.map((cat) => (
//                     <option key={cat._id} value={cat._id} className="bg-[#0c1220]">
//                       {cat.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-xs text-[#8892b0] mb-2">Min Price</label>
//                   <input
//                     type="number"
//                     placeholder="0"
//                     value={priceRange.min}
//                     onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
//                     className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(99,102,241,0.15)] rounded-xl px-4 py-2.5 text-[#e2e8f0] text-sm focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs text-[#8892b0] mb-2">Max Price</label>
//                   <input
//                     type="number"
//                     placeholder="99999"
//                     value={priceRange.max}
//                     onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
//                     className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(99,102,241,0.15)] rounded-xl px-4 py-2.5 text-[#e2e8f0] text-sm focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
//                   />
//                 </div>
//               </div>
//               <button
//                 onClick={clearFilters}
//                 className="w-full px-4 py-2.5 rounded-xl border border-[rgba(99,102,241,0.2)] text-[#a8b4d0] text-sm hover:bg-[rgba(99,102,241,0.1)] transition-all duration-200"
//               >
//                 Clear All Filters
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Products - Mobile Cards / Desktop Table */}
//       {loading ? (
//         <div className="flex items-center justify-center py-20">
//           <div className="w-8 h-8 border-2 border-[rgba(99,102,241,0.1)] border-t-[#6366f1] rounded-full animate-spin" />
//         </div>
//       ) : (
//         <>
//           {/* Mobile View - Cards */}
//           <div className="sm:hidden space-y-4">
//             <AnimatePresence>
//               {filteredProducts.map((product, index) => (
//                 <motion.div
//                   key={product._id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, scale: 0.9 }}
//                   transition={{ duration: 0.3, delay: index * 0.05 }}
//                   className="bg-gradient-to-b from-[rgba(17,24,56,0.6)] to-[rgba(8,11,24,0.6)] border border-[rgba(99,102,241,0.1)] rounded-2xl p-4"
//                 >
//                   {/* Product Header */}
//                   <div className="flex items-start gap-3">
//                     <div className="w-16 h-16 rounded-xl overflow-hidden border border-[rgba(99,102,241,0.15)] flex-shrink-0">
//                       {product.mainImage || product.images?.[0]?.url ? (
//                         <img
//                           src={getImageUrl(product.mainImage || product.images[0].url)}
//                           alt={product.name}
//                           className="w-full h-full object-cover"
//                           onError={(e) => { e.target.src = "/placeholder.png"; }}
//                         />
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center bg-[rgba(99,102,241,0.1)]">
//                           <GiPerfumeBottle className="text-2xl text-[rgba(99,102,241,0.3)]" />
//                         </div>
//                       )}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <h4 className="text-sm font-medium text-[#e2e8f0] truncate">{product.name}</h4>
//                       <p className="text-xs text-[#8892b0] line-clamp-2 mt-1">{product.desc || "No description"}</p>
//                       <span className="text-xs text-[#6366f1] bg-[rgba(99,102,241,0.1)] px-2 py-0.5 rounded-full inline-block mt-2">
//                         {product.category?.name || "N/A"}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Product Details */}
//                   <div className="mt-3 pt-3 border-t border-[rgba(99,102,241,0.08)] grid grid-cols-3 gap-2">
//                     <div>
//                       <p className="text-xs text-[#8892b0]">Price</p>
//                       <p className="text-sm font-semibold text-[#6366f1]">Rs. {product.price.toLocaleString()}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-[#8892b0]">Stock</p>
//                       <p className={`text-sm font-medium ${product.stock < 10 ? "text-[#fc8181]" : "text-[#a8b4d0]"}`}>
//                         {product.stock}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-[#8892b0]">Status</p>
//                       <span
//                         className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
//                           product.isActive
//                             ? "bg-[rgba(34,197,94,0.1)] text-[#4ade80] border border-[rgba(34,197,94,0.2)]"
//                             : "bg-[rgba(239,68,68,0.1)] text-[#fc8181] border border-[rgba(239,68,68,0.2)]"
//                         }`}
//                       >
//                         {product.isActive ? "Active" : "Inactive"}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Actions */}
//                   <div className="mt-3 pt-3 border-t border-[rgba(99,102,241,0.08)] flex items-center justify-end gap-2">
//                     <Link
//                       to={`/products/${product._id}`}
//                       className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.15)] text-[#6366f1] text-xs hover:bg-[rgba(99,102,241,0.2)] transition-all duration-200"
//                     >
//                       <FaEye className="text-xs" /> View
//                     </Link>
//                     <Link
//                       to={`/products/edit/${product._id}`}
//                       className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.15)] text-[#6366f1] text-xs hover:bg-[rgba(99,102,241,0.2)] transition-all duration-200"
//                     >
//                       <FaEdit className="text-xs" /> Edit
//                     </Link>
//                     <button
//                       onClick={() => setDeleteDialog({ isOpen: true, id: product._id, name: product.name })}
//                       className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.15)] text-[#fc8181] text-xs hover:bg-[rgba(239,68,68,0.2)] transition-all duration-200"
//                     >
//                       <FaTrash className="text-xs" /> Delete
//                     </button>
//                   </div>
//                 </motion.div>
//               ))}
//             </AnimatePresence>
//           </div>

//           {/* Desktop View - Table */}
//           <div className="hidden sm:block bg-gradient-to-b from-[rgba(17,24,56,0.4)] to-[rgba(8,11,24,0.4)] border border-[rgba(99,102,241,0.1)] rounded-2xl overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b border-[rgba(99,102,241,0.1)]">
//                     <th className="text-left text-xs font-semibold text-[#8892b0] uppercase tracking-wider px-6 py-4">Product</th>
//                     <th className="text-left text-xs font-semibold text-[#8892b0] uppercase tracking-wider px-6 py-4">Category</th>
//                     <th className="text-left text-xs font-semibold text-[#8892b0] uppercase tracking-wider px-6 py-4">Price</th>
//                     <th className="text-left text-xs font-semibold text-[#8892b0] uppercase tracking-wider px-6 py-4">Stock</th>
//                     <th className="text-left text-xs font-semibold text-[#8892b0] uppercase tracking-wider px-6 py-4">Status</th>
//                     <th className="text-left text-xs font-semibold text-[#8892b0] uppercase tracking-wider px-6 py-4">Views</th>
//                     <th className="text-right text-xs font-semibold text-[#8892b0] uppercase tracking-wider px-6 py-4">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <AnimatePresence>
//                     {filteredProducts.map((product, index) => (
//                       <motion.tr
//                         key={product._id}
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         exit={{ opacity: 0 }}
//                         transition={{ duration: 0.2, delay: index * 0.03 }}
//                         className="border-b border-[rgba(99,102,241,0.05)] hover:bg-[rgba(99,102,241,0.05)] transition-colors duration-200 group"
//                       >
//                         <td className="px-6 py-4">
//                           <div className="flex items-center gap-3">
//                             <div className="w-12 h-12 rounded-xl overflow-hidden border border-[rgba(99,102,241,0.15)] flex-shrink-0">
//                               {product.mainImage || product.images?.[0]?.url ? (
//                                 <img
//                                   src={getImageUrl(product.mainImage || product.images[0].url)}
//                                   alt={product.name}
//                                   className="w-full h-full object-cover"
//                                   onError={(e) => { e.target.src = "/placeholder.png"; }}
//                                 />
//                               ) : (
//                                 <div className="w-full h-full flex items-center justify-center bg-[rgba(99,102,241,0.1)]">
//                                   <GiPerfumeBottle className="text-lg text-[rgba(99,102,241,0.3)]" />
//                                 </div>
//                               )}
//                             </div>
//                             <div>
//                               <h4 className="text-sm font-medium text-[#e2e8f0]">{product.name}</h4>
//                               <p className="text-xs text-[#8892b0] line-clamp-1">{product.desc}</p>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <span className="text-sm text-[#a8b4d0]">{product.category?.name || "N/A"}</span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <span className="text-sm font-semibold text-[#6366f1]">Rs. {product.price.toLocaleString()}</span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <span className={`text-sm ${product.stock < 10 ? "text-[#fc8181]" : "text-[#a8b4d0]"}`}>
//                             {product.stock}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <span
//                             className={`text-xs px-3 py-1 rounded-full ${
//                               product.isActive
//                                 ? "bg-[rgba(34,197,94,0.1)] text-[#4ade80] border border-[rgba(34,197,94,0.2)]"
//                                 : "bg-[rgba(239,68,68,0.1)] text-[#fc8181] border border-[rgba(239,68,68,0.2)]"
//                             }`}
//                           >
//                             {product.isActive ? "Active" : "Inactive"}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <span className="text-sm text-[#a8b4d0]">{product.impressions || 0}</span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center justify-end gap-2">
//                             <Link
//                               to={`/products/${product._id}`}
//                               className="w-8 h-8 rounded-lg bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.15)] text-[#6366f1] flex items-center justify-center hover:bg-[rgba(99,102,241,0.2)] transition-all duration-200"
//                             >
//                               <FaEye className="text-xs" />
//                             </Link>
//                             <Link
//                               to={`/products/edit/${product._id}`}
//                               className="w-8 h-8 rounded-lg bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.15)] text-[#6366f1] flex items-center justify-center hover:bg-[rgba(99,102,241,0.2)] transition-all duration-200"
//                             >
//                               <FaEdit className="text-xs" />
//                             </Link>
//                             <button
//                               onClick={() => setDeleteDialog({ isOpen: true, id: product._id, name: product.name })}
//                               className="w-8 h-8 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.15)] text-[#fc8181] flex items-center justify-center hover:bg-[rgba(239,68,68,0.2)] transition-all duration-200"
//                             >
//                               <FaTrash className="text-xs" />
//                             </button>
//                           </div>
//                         </td>
//                       </motion.tr>
//                     ))}
//                   </AnimatePresence>
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Empty State */}
//           {filteredProducts.length === 0 && (
//             <div className="text-center py-16">
//               <GiPerfumeBottle className="text-6xl text-[rgba(99,102,241,0.2)] mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-[#e2e8f0] mb-2">No products found</h3>
//               <p className="text-[#8892b0] text-sm">Try adjusting your search or filters</p>
//             </div>
//           )}
//         </>
//       )}

//       {/* Delete Confirmation */}
//       <ConfirmDialog
//         isOpen={deleteDialog.isOpen}
//         onClose={() => setDeleteDialog({ isOpen: false, id: null, name: "" })}
//         onConfirm={handleDelete}
//         title="Delete Product"
//         message={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone.`}
//       />
//     </div>
//   );
// };

// export default Products;



import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

// Icons
import { FaBox, FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { IoSearch, IoClose, IoFilter } from "react-icons/io5";
import { GiPerfumeBottle } from "react-icons/gi";

// ✅ IMAGE HELPER - Full URL banane ke liye
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: "" });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      setProducts(res.data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${deleteDialog.id}`);
      setDeleteDialog({ isOpen: false, id: null, name: "" });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(error.response?.data?.message || "Cannot delete product!");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.category?._id === selectedCategory : true;
    const matchesMinPrice = priceRange.min ? product.price >= Number(priceRange.min) : true;
    const matchesMaxPrice = priceRange.max ? product.price <= Number(priceRange.max) : true;
    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setPriceRange({ min: "", max: "" });
  };

  const hasActiveFilters = searchTerm || selectedCategory || priceRange.min || priceRange.max;

  return (
    <div className="min-h-screen pb-8 px-2 sm:px-4 lg:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#e2e8f0] tracking-wide flex items-center gap-3">
            <FaBox className="text-[#6366f1] text-2xl" />
            Products
          </h1>
          <p className="text-[#8892b0] text-xs sm:text-sm mt-1">Manage your perfume inventory</p>
        </div>
        <Link
          to="/products/new"
          className="flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-xl text-sm font-medium hover:shadow-[0_4px_20px_rgba(99,102,241,0.3)] transition-all duration-200 hover:scale-105 active:scale-95 w-full sm:w-auto"
        >
          <FaPlus className="text-sm" />
          Add Product
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8892b0] text-lg" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.1)] rounded-xl pl-12 pr-12 py-3 text-[#e2e8f0] text-sm placeholder-[#8892b0] focus:outline-none focus:border-[rgba(99,102,241,0.4)] focus:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all duration-200"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8892b0] hover:text-[#e2e8f0]"
            >
              <IoClose />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 w-full sm:w-auto ${
            showFilters || hasActiveFilters
              ? "bg-[rgba(99,102,241,0.15)] border-[rgba(99,102,241,0.3)] text-[#6366f1]"
              : "bg-[rgba(255,255,255,0.03)] border-[rgba(99,102,241,0.1)] text-[#a8b4d0] hover:border-[rgba(99,102,241,0.3)]"
          }`}
        >
          <IoFilter />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
          )}
        </button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.1)] rounded-xl p-4 space-y-4">
              <div>
                <label className="block text-xs text-[#8892b0] mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(99,102,241,0.15)] rounded-xl px-4 py-2.5 text-[#e2e8f0] text-sm focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                >
                  <option value="" className="bg-[#0c1220]">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id} className="bg-[#0c1220]">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#8892b0] mb-2">Min Price</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(99,102,241,0.15)] rounded-xl px-4 py-2.5 text-[#e2e8f0] text-sm focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8892b0] mb-2">Max Price</label>
                  <input
                    type="number"
                    placeholder="99999"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(99,102,241,0.15)] rounded-xl px-4 py-2.5 text-[#e2e8f0] text-sm focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                  />
                </div>
              </div>
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2.5 rounded-xl border border-[rgba(99,102,241,0.2)] text-[#a8b4d0] text-sm hover:bg-[rgba(99,102,241,0.1)] transition-all duration-200"
              >
                Clear All Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[rgba(99,102,241,0.1)] border-t-[#6366f1] rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Mobile View - Cards (xs to md) */}
          <div className="md:hidden space-y-4">
            <AnimatePresence>
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-gradient-to-b from-[rgba(17,24,56,0.6)] to-[rgba(8,11,24,0.6)] border border-[rgba(99,102,241,0.1)] rounded-2xl p-4"
                >
                  {/* Product Header */}
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-[rgba(99,102,241,0.15)] flex-shrink-0">
                      {product.mainImage || product.images?.[0]?.url ? (
                        <img
                          src={getImageUrl(product.mainImage || product.images[0].url)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = "/placeholder.png"; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[rgba(99,102,241,0.1)]">
                          <GiPerfumeBottle className="text-2xl text-[rgba(99,102,241,0.3)]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-[#e2e8f0] truncate">{product.name}</h4>
                      <p className="text-xs text-[#8892b0] line-clamp-2 mt-1">{product.desc || "No description"}</p>
                      <span className="text-xs text-[#6366f1] bg-[rgba(99,102,241,0.1)] px-2 py-0.5 rounded-full inline-block mt-2">
                        {product.category?.name || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="mt-3 pt-3 border-t border-[rgba(99,102,241,0.08)] grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-[#8892b0]">Price</p>
                      <p className="text-sm font-semibold text-[#6366f1]">Rs. {product.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8892b0]">Stock</p>
                      <p className={`text-sm font-medium ${product.stock < 10 ? "text-[#fc8181]" : "text-[#a8b4d0]"}`}>
                        {product.stock}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8892b0]">Status</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
                          product.isActive
                            ? "bg-[rgba(34,197,94,0.1)] text-[#4ade80] border border-[rgba(34,197,94,0.2)]"
                            : "bg-[rgba(239,68,68,0.1)] text-[#fc8181] border border-[rgba(239,68,68,0.2)]"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 pt-3 border-t border-[rgba(99,102,241,0.08)] flex items-center justify-end gap-2">
                    <Link
                      to={`/products/${product._id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.15)] text-[#6366f1] text-xs hover:bg-[rgba(99,102,241,0.2)] transition-all duration-200"
                    >
                      <FaEye className="text-xs" /> View
                    </Link>
                    <Link
                      to={`/products/edit/${product._id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.15)] text-[#6366f1] text-xs hover:bg-[rgba(99,102,241,0.2)] transition-all duration-200"
                    >
                      <FaEdit className="text-xs" /> Edit
                    </Link>
                    <button
                      onClick={() => setDeleteDialog({ isOpen: true, id: product._id, name: product.name })}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.15)] text-[#fc8181] text-xs hover:bg-[rgba(239,68,68,0.2)] transition-all duration-200"
                    >
                      <FaTrash className="text-xs" /> Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Tablet View - Grid (md to lg) */}
          <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-gradient-to-b from-[rgba(17,24,56,0.6)] to-[rgba(8,11,24,0.6)] border border-[rgba(99,102,241,0.1)] rounded-2xl p-4"
                >
                  {/* Product Image */}
                  <div className="w-full h-40 rounded-xl overflow-hidden border border-[rgba(99,102,241,0.15)] mb-3">
                    {product.mainImage || product.images?.[0]?.url ? (
                      <img
                        src={getImageUrl(product.mainImage || product.images[0].url)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "/placeholder.png"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[rgba(99,102,241,0.1)]">
                        <GiPerfumeBottle className="text-4xl text-[rgba(99,102,241,0.3)]" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <h4 className="text-sm font-medium text-[#e2e8f0] truncate">{product.name}</h4>
                  <p className="text-xs text-[#8892b0] line-clamp-1 mt-1">{product.category?.name || "N/A"}</p>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#6366f1]">Rs. {product.price.toLocaleString()}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        product.isActive
                          ? "bg-[rgba(34,197,94,0.1)] text-[#4ade80] border border-[rgba(34,197,94,0.2)]"
                          : "bg-[rgba(239,68,68,0.1)] text-[#fc8181] border border-[rgba(239,68,68,0.2)]"
                      }`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[rgba(99,102,241,0.08)] flex items-center justify-between">
                    <span className={`text-xs ${product.stock < 10 ? "text-[#fc8181]" : "text-[#a8b4d0]"}`}>
                      Stock: {product.stock}
                    </span>
                    <div className="flex gap-1">
                      <Link
                        to={`/products/${product._id}`}
                        className="w-7 h-7 rounded-lg bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.15)] text-[#6366f1] flex items-center justify-center hover:bg-[rgba(99,102,241,0.2)] transition-all duration-200"
                      >
                        <FaEye className="text-xs" />
                      </Link>
                      <Link
                        to={`/products/edit/${product._id}`}
                        className="w-7 h-7 rounded-lg bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.15)] text-[#6366f1] flex items-center justify-center hover:bg-[rgba(99,102,241,0.2)] transition-all duration-200"
                      >
                        <FaEdit className="text-xs" />
                      </Link>
                      <button
                        onClick={() => setDeleteDialog({ isOpen: true, id: product._id, name: product.name })}
                        className="w-7 h-7 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.15)] text-[#fc8181] flex items-center justify-center hover:bg-[rgba(239,68,68,0.2)] transition-all duration-200"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Desktop View - Table (lg and above) */}
          <div className="hidden lg:block bg-gradient-to-b from-[rgba(17,24,56,0.4)] to-[rgba(8,11,24,0.4)] border border-[rgba(99,102,241,0.1)] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(99,102,241,0.1)]">
                    <th className="text-left text-xs font-semibold text-[#8892b0] uppercase tracking-wider px-6 py-4">Product</th>
                    <th className="text-left text-xs font-semibold text-[#8892b0] uppercase tracking-wider px-6 py-4">Category</th>
                    <th className="text-left text-xs font-semibold text-[#8892b0] uppercase tracking-wider px-6 py-4">Price</th>
                    <th className="text-left text-xs font-semibold text-[#8892b0] uppercase tracking-wider px-6 py-4">Stock</th>
                    <th className="text-left text-xs font-semibold text-[#8892b0] uppercase tracking-wider px-6 py-4">Status</th>
                    <th className="text-left text-xs font-semibold text-[#8892b0] uppercase tracking-wider px-6 py-4">Views</th>
                    <th className="text-right text-xs font-semibold text-[#8892b0] uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredProducts.map((product, index) => (
                      <motion.tr
                        key={product._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className="border-b border-[rgba(99,102,241,0.05)] hover:bg-[rgba(99,102,241,0.05)] transition-colors duration-200 group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-[rgba(99,102,241,0.15)] flex-shrink-0">
                              {product.mainImage || product.images?.[0]?.url ? (
                                <img
                                  src={getImageUrl(product.mainImage || product.images[0].url)}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.src = "/placeholder.png"; }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[rgba(99,102,241,0.1)]">
                                  <GiPerfumeBottle className="text-lg text-[rgba(99,102,241,0.3)]" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-[#e2e8f0]">{product.name}</h4>
                              <p className="text-xs text-[#8892b0] line-clamp-1">{product.desc}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#a8b4d0]">{product.category?.name || "N/A"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-[#6366f1]">Rs. {product.price.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm ${product.stock < 10 ? "text-[#fc8181]" : "text-[#a8b4d0]"}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs px-3 py-1 rounded-full ${
                              product.isActive
                                ? "bg-[rgba(34,197,94,0.1)] text-[#4ade80] border border-[rgba(34,197,94,0.2)]"
                                : "bg-[rgba(239,68,68,0.1)] text-[#fc8181] border border-[rgba(239,68,68,0.2)]"
                            }`}
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#a8b4d0]">{product.impressions || 0}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/products/${product._id}`}
                              className="w-8 h-8 rounded-lg bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.15)] text-[#6366f1] flex items-center justify-center hover:bg-[rgba(99,102,241,0.2)] transition-all duration-200"
                            >
                              <FaEye className="text-xs" />
                            </Link>
                            <Link
                              to={`/products/edit/${product._id}`}
                              className="w-8 h-8 rounded-lg bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.15)] text-[#6366f1] flex items-center justify-center hover:bg-[rgba(99,102,241,0.2)] transition-all duration-200"
                            >
                              <FaEdit className="text-xs" />
                            </Link>
                            <button
                              onClick={() => setDeleteDialog({ isOpen: true, id: product._id, name: product.name })}
                              className="w-8 h-8 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.15)] text-[#fc8181] flex items-center justify-center hover:bg-[rgba(239,68,68,0.2)] transition-all duration-200"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <GiPerfumeBottle className="text-6xl text-[rgba(99,102,241,0.2)] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#e2e8f0] mb-2">No products found</h3>
              <p className="text-[#8892b0] text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null, name: "" })}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default Products;