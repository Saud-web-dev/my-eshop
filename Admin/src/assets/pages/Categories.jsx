import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api.js";
import Modal from "../components/Modal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import ImagePreview from "../components/ImagePreview.jsx";

// Icons
import { MdCategory, MdAdd, MdEdit, MdDelete } from "react-icons/md";
import { IoSearch, IoClose } from "react-icons/io5";
import { GiPerfumeBottle } from "react-icons/gi";

// ✅ IMAGE HELPER - Full URL banane ke liye
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: "" });
  const [formData, setFormData] = useState({ name: "", desc: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/categories");
      setCategories(res.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("desc", formData.desc);
      if (imageFile) data.append("image", imageFile);

      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/categories", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setIsModalOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      alert(error.response?.data?.message || "Something went wrong!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/categories/${deleteDialog.id}`);
      setDeleteDialog({ isOpen: false, id: null, name: "" });
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert(error.response?.data?.message || "Cannot delete category!");
    }
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, desc: category.desc || "" });
    setImagePreview(getImageUrl(category.image?.url) || null);  // ✅ FIXED
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    resetForm();
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: "", desc: "" });
    setImageFile(null);
    setImagePreview(null);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#e2e8f0] tracking-wide flex items-center gap-3">
            <MdCategory className="text-[#6366f1]" />
            Categories
          </h1>
          <p className="text-[#8892b0] text-sm mt-1">Manage your perfume categories</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-xl text-sm font-medium hover:shadow-[0_4px_20px_rgba(99,102,241,0.3)] transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <MdAdd className="text-lg" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8892b0] text-lg" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.1)] rounded-xl pl-12 pr-4 py-3 text-[#e2e8f0] text-sm placeholder-[#8892b0] focus:outline-none focus:border-[rgba(99,102,241,0.4)] focus:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all duration-200"
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

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[rgba(99,102,241,0.1)] border-t-[#6366f1] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence>
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group bg-gradient-to-b from-[rgba(17,24,56,0.6)] to-[rgba(8,11,24,0.6)] border border-[rgba(99,102,241,0.1)] rounded-2xl overflow-hidden hover:border-[rgba(99,102,241,0.3)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  {category.image?.url ? (
                    <img
                      src={getImageUrl(category.image.url)}  // ✅ FIXED
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { e.target.style.display = 'none'; }}  // ✅ FALLBACK
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[rgba(99,102,241,0.1)] to-[rgba(139,92,246,0.1)]">
                      <GiPerfumeBottle className="text-5xl text-[rgba(99,102,241,0.3)]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,11,24,0.9)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => openEditModal(category)}
                      className="w-8 h-8 rounded-lg bg-[rgba(99,102,241,0.9)] text-white flex items-center justify-center hover:bg-[#6366f1] transition-colors duration-200"
                    >
                      <MdEdit className="text-sm" />
                    </button>
                    <button
                      onClick={() => setDeleteDialog({ isOpen: true, id: category._id, name: category.name })}
                      className="w-8 h-8 rounded-lg bg-[rgba(239,68,68,0.9)] text-white flex items-center justify-center hover:bg-[#ef4444] transition-colors duration-200"
                    >
                      <MdDelete className="text-sm" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-[#e2e8f0] mb-2">{category.name}</h3>
                  <p className="text-[#8892b0] text-sm line-clamp-2 mb-4">{category.desc || "No description"}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6366f1] bg-[rgba(99,102,241,0.1)] px-3 py-1 rounded-full">
                      Active
                    </span>
                    <span className="text-xs text-[#8892b0]">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCategories.length === 0 && (
        <div className="text-center py-20">
          <GiPerfumeBottle className="text-6xl text-[rgba(99,102,241,0.2)] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#e2e8f0] mb-2">No categories found</h3>
          <p className="text-[#8892b0] text-sm">Create your first category to get started</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingCategory ? "Edit Category" : "Add Category"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-[#a8b4d0] mb-2">Category Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.15)] rounded-xl px-4 py-3 text-[#e2e8f0] text-sm focus:outline-none focus:border-[rgba(99,102,241,0.4)] focus:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all duration-200"
              placeholder="e.g., Men's Perfume"
            />
          </div>

          <div>
            <label className="block text-sm text-[#a8b4d0] mb-2">Description</label>
            <textarea
              rows="3"
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(99,102,241,0.15)] rounded-xl px-4 py-3 text-[#e2e8f0] text-sm focus:outline-none focus:border-[rgba(99,102,241,0.4)] focus:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all duration-200 resize-none"
              placeholder="Brief description..."
            />
          </div>

          <div>
            <label className="block text-sm text-[#a8b4d0] mb-2">Category Image</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="category-image"
              />
              <label
                htmlFor="category-image"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-[rgba(99,102,241,0.2)] rounded-xl cursor-pointer hover:border-[rgba(99,102,241,0.4)] hover:bg-[rgba(99,102,241,0.05)] transition-all duration-200"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full object-contain rounded-lg" />
                ) : (
                  <div className="text-center">
                    <MdAdd className="text-3xl text-[#6366f1] mx-auto mb-2" />
                    <span className="text-sm text-[#8892b0]">Click to upload image</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); resetForm(); }}
              className="flex-1 py-2.5 rounded-xl border border-[rgba(99,102,241,0.2)] text-[#a8b4d0] text-sm font-medium hover:bg-[rgba(99,102,241,0.1)] transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white text-sm font-medium hover:shadow-[0_4px_20px_rgba(99,102,241,0.3)] transition-all duration-200 disabled:opacity-50"
            >
              {submitting ? "Saving..." : editingCategory ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

     // Categories.jsx - Delete dialog mein
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null, name: "" })}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteDialog.name}"? 
    ${deleteDialog.productCount > 0
            ? `Warning: ${deleteDialog.productCount} products will also be deleted!`
            : ''}`}
      />
    </div>
  );
};

export default Categories;