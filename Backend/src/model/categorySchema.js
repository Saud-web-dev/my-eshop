import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {  
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    desc: {
        type: String,
        trim: true,
    },
    image: {
        url: { type: String },
        filename: { type: String }
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true
});

const Category = mongoose.model('Category', categorySchema);
export default Category;