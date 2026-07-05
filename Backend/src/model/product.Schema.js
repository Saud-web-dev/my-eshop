import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {  
        type: String,
        trim: true,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    desc: {
        type: String,
        trim: true,
    },
    // ✅ Local images array
    images: [{
        url: { type: String, required: true },
        filename: { type: String }
    }],
    mainImage: {
        type: String,
        default: ''
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    stock: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;