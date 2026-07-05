import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api.js";

// Icons
import { FaArrowLeft, FaEdit, FaTrash, FaBox, FaTag } from "react-icons/fa";
import { MdCategory, MdInventory, MdDateRange } from "react-icons/md";
import { GiPerfumeBottle } from "react-icons/gi";
import { IoChevronForward } from "react-icons/io5";

// Image Helper
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.data);
    } catch (error) {
      console.error("Error fetching product:", error);
      alert("Product not found!");
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${id}`);
      setDeleteDialog(false);
      navigate("/products");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(error.response?.data?.message || "Cannot delete product!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-[rgba(99,102,241,0.1)] border-t-[#6366f1] rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const allImages = product.images?.length > 0 
    ? product.images.map(img => img.url) 
    : [product.mainImage];

  return (
    <div className="min-h-screen max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-sm text-[#8892b0] mb-6"
      >
        <Link to="/products" className="hover:text-[#6366f1] transition-colors">Products</Link>
        <IoChevronForward className="text-xs" />
        <span className="text-[#e2e8f0]">{product.name}</span>
      </motion.div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#e2e8f0] tracking-wide flex items-center gap-3">
            <FaBox className="text-[#6366f1]" />
            Product Details
          </h1>
          <p className="text-[#8892b0] text-sm mt-1">View and manage product information</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(99,102,241,0.2)] text-[#a8b4d0] text-sm hover:bg-[rgba(99,102,241,0.1)] transition-all duration-200"
          >
            <FaArrowLeft className="text-xs" />
            Back
          </button>
          <Link
            to={`/products/edit/${id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] text-[#6366f1] text-sm hover:bg-[rgba(99,102,241,0.2)] transition-all duration-200"
          >
            <FaEdit className="text-xs" />
            Edit
          </Link>
          <button
            onClick={() => setDeleteDialog(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#fc8181] text-sm hover:bg-[rgba(239,68,68,0.2)] transition-all duration-200"
          >
            <FaTrash className="text-xs" />
            Delete
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {/* Main Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden border border-[rgba(99,102,241,0.15)] bg-gradient-to-b from-[rgba(17,24,56,0.4)] to-[rgba(8,11,24,0.4)]">
            {allImages[activeImage] ? (
              <img
                src={getImageUrl(allImages[activeImage])}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <GiPerfumeBottle className="text-8xl text-[rgba(99,102,241,0.2)]" />
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all duration-200 ${
                    activeImage === index 
                      ? "border-[#6366f1] shadow-[0_0_15px_rgba(99,102,241,0.3)]" 
                      : "border-[rgba(99,102,241,0.15)] hover:border-[rgba(99,102,241,0.4)]"
                  }`}
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`thumbnail-${index}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Title & Status */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-[#e2e8f0]">{product.name}</h2>
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  product.isActive
                    ? "bg-[rgba(34,197,94,0.1)] text-[#4ade80] border border-[rgba(34,197,94,0.2)]"
                    : "bg-[rgba(239,68,68,0.1)] text-[#fc8181] border border-[rgba(239,68,68,0.2)]"
                }`}
              >
                {product.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-[#8892b0] text-sm leading-relaxed">{product.desc || "No description available"}</p>
          </div>

          {/* Price */}
          <div className="bg-gradient-to-r from-[rgba(99,102,241,0.1)] to-[rgba(139,92,246,0.05)] border border-[rgba(99,102,241,0.15)] rounded-xl p-5">
            <p className="text-xs text-[#8892b0] uppercase tracking-wider mb-1">Price</p>
            <p className="text-3xl font-bold text-[#6366f1]">Rs. {product.price.toLocaleString()}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.1)] rounded-xl p-4">
              <div className="flex items-center gap-2 text-[#8892b0] text-xs mb-2">
                <MdCategory className="text-[#6366f1]" />
                Category
              </div>
              <p className="text-[#e2e8f0] font-medium">{product.category?.name || "N/A"}</p>
            </div>

            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.1)] rounded-xl p-4">
              <div className="flex items-center gap-2 text-[#8892b0] text-xs mb-2">
                <MdInventory className="text-[#6366f1]" />
                Stock
              </div>
              <p className={`font-medium ${product.stock < 10 ? "text-[#fc8181]" : "text-[#e2e8f0]"}`}>
                {product.stock} units
              </p>
              {product.stock < 10 && (
                <p className="text-xs text-[#fc8181] mt-1">Low stock warning!</p>
              )}
            </div>

            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.1)] rounded-xl p-4">
              <div className="flex items-center gap-2 text-[#8892b0] text-xs mb-2">
                <FaTag className="text-[#6366f1]" />
                Product ID
              </div>
              <p className="text-[#e2e8f0] font-medium text-xs font-mono">{product._id}</p>
            </div>

            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.1)] rounded-xl p-4">
              <div className="flex items-center gap-2 text-[#8892b0] text-xs mb-2">
                <MdDateRange className="text-[#6366f1]" />
                Created
              </div>
              <p className="text-[#e2e8f0] font-medium text-sm">
                {new Date(product.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-xs text-[#8892b0]">
            Last updated: {new Date(product.updatedAt).toLocaleString()}
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteDialog(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-gradient-to-b from-[rgba(17,24,56,0.98)] to-[rgba(8,11,24,0.98)] border border-[rgba(239,68,68,0.2)] rounded-2xl p-6 max-w-md mx-4 w-full"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] flex items-center justify-center">
                <FaTrash className="text-2xl text-[#fc8181]" />
              </div>
              <h3 className="text-xl font-semibold text-[#e2e8f0] mb-2">Delete Product</h3>
              <p className="text-[#8892b0] text-sm mb-6">
                Are you sure you want to delete "{product.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteDialog(false)}
                  className="px-6 py-2.5 rounded-xl border border-[rgba(99,102,241,0.2)] text-[#a8b4d0] text-sm font-medium hover:bg-[rgba(99,102,241,0.1)] transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white text-sm font-medium hover:shadow-[0_4px_20px_rgba(239,68,68,0.3)] transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;