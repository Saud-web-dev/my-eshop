import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api.js";
import ImagePreview from "../components/ImagePreview.jsx";

// Icons
import { FaBox, FaArrowLeft, FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoChevronDown } from "react-icons/io5";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    desc: "",
    category: "",
    stock: "",
    isActive: true,
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    fetchCategories();
    if (isEditing) fetchProduct();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      const product = res.data.data;
      setFormData({
        name: product.name,
        price: product.price,
        desc: product.desc || "",
        category: product.category?._id || "",
        stock: product.stock,
        isActive: product.isActive,
      });
      setExistingImages(product.images || []);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...files]);
  };

  const removeNewImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (filename, index) => {
    try {
      await api.delete(`/products/${id}/images/${filename}`);
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error removing image:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("price", formData.price);
      data.append("desc", formData.desc);
      data.append("category", formData.category);
      data.append("stock", formData.stock);
      data.append("isActive", formData.isActive);

      imageFiles.forEach((file) => {
        data.append("images", file);
      });

      if (isEditing) {
        await api.put(`/products/${id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/products", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate("/products");
    } catch (error) {
      console.error("Error saving product:", error);
      alert(error.response?.data?.message || "Something went wrong!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[rgba(99,102,241,0.1)] border-t-[#6366f1] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/products")}
          className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.1)] text-[#a8b4d0] flex items-center justify-center hover:bg-[rgba(99,102,241,0.1)] hover:text-[#6366f1] transition-all duration-200"
        >
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#e2e8f0] tracking-wide flex items-center gap-3">
            <FaBox className="text-[#6366f1]" />
            {isEditing ? "Edit Product" : "Add Product"}
          </h1>
          <p className="text-[#8892b0] text-sm mt-1">
            {isEditing ? "Update product details" : "Create a new perfume product"}
          </p>
        </div>
      </div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit}
        className="bg-gradient-to-b from-[rgba(17,24,56,0.4)] to-[rgba(8,11,24,0.4)] border border-[rgba(99,102,241,0.1)] rounded-2xl p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm text-[#a8b4d0] mb-2">Product Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.15)] rounded-xl px-4 py-3 text-[#e2e8f0] text-sm focus:outline-none focus:border-[rgba(99,102,241,0.4)] focus:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all duration-200"
              placeholder="e.g., Dior Sauvage"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm text-[#a8b4d0] mb-2">Price (Rs.) *</label>
            <input
              type="number"
              required
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.15)] rounded-xl px-4 py-3 text-[#e2e8f0] text-sm focus:outline-none focus:border-[rgba(99,102,241,0.4)] focus:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all duration-200"
              placeholder="12000"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-[#a8b4d0] mb-2">Category *</label>
            <div className="relative">
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.15)] rounded-xl px-4 py-3 text-[#e2e8f0] text-sm focus:outline-none focus:border-[rgba(99,102,241,0.4)] appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#0c1220]">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id} className="bg-[#0c1220]">
                    {cat.name}
                  </option>
                ))}
              </select>
              <IoChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8892b0] pointer-events-none" />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm text-[#a8b4d0] mb-2">Stock *</label>
            <input
              type="number"
              required
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.15)] rounded-xl px-4 py-3 text-[#e2e8f0] text-sm focus:outline-none focus:border-[rgba(99,102,241,0.4)] focus:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all duration-200"
              placeholder="50"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-[#a8b4d0] mb-2">Description</label>
          <textarea
            rows="4"
            value={formData.desc}
            onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
            className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.15)] rounded-xl px-4 py-3 text-[#e2e8f0] text-sm focus:outline-none focus:border-[rgba(99,102,241,0.4)] focus:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all duration-200 resize-none"
            placeholder="Product description..."
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm text-[#a8b4d0] mb-2">Product Images</label>
          
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-[#8892b0] mb-2">Current Images</p>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((img, index) => (
                  <div key={index} className="relative group w-24 h-24 rounded-xl overflow-hidden border border-[rgba(99,102,241,0.15)]">
                    <img src={img.url} alt={`product-${index}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.filename, index)}
                        className="text-white hover:text-[#fc8181] transition-colors duration-200"
                      >
                        <MdDelete className="text-xl" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
              id="product-images"
            />
            <label
              htmlFor="product-images"
              className="flex items-center justify-center w-full h-32 border-2 border-dashed border-[rgba(99,102,241,0.2)] rounded-xl cursor-pointer hover:border-[rgba(99,102,241,0.4)] hover:bg-[rgba(99,102,241,0.05)] transition-all duration-200"
            >
              <div className="text-center">
                <FaPlus className="text-2xl text-[#6366f1] mx-auto mb-2" />
                <span className="text-sm text-[#8892b0]">Click to upload images (max 5)</span>
              </div>
            </label>
          </div>

          {/* New Image Previews */}
          {imageFiles.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-[#8892b0] mb-2">New Images</p>
              <div className="flex flex-wrap gap-3">
                {imageFiles.map((file, index) => (
                  <div key={index} className="relative group w-24 h-24 rounded-xl overflow-hidden border border-[rgba(99,102,241,0.15)]">
                    <img src={URL.createObjectURL(file)} alt={`new-${index}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="text-white hover:text-[#fc8181] transition-colors duration-200"
                      >
                        <MdDelete className="text-xl" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Toggle */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[rgba(255,255,255,0.1)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#6366f1] peer-checked:to-[#8b5cf6]"></div>
          </label>
          <span className="text-sm text-[#a8b4d0]">Active Product</span>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4 border-t border-[rgba(99,102,241,0.1)]">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="flex-1 py-3 rounded-xl border border-[rgba(99,102,241,0.2)] text-[#a8b4d0] text-sm font-medium hover:bg-[rgba(99,102,241,0.1)] transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white text-sm font-medium hover:shadow-[0_4px_20px_rgba(99,102,241,0.3)] transition-all duration-200 disabled:opacity-50"
          >
            {submitting ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default ProductForm;