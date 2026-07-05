import express from 'express';
import upload from '../middlewares/multer.js';
import {
    getAllCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/category.controller.js';

const router = express.Router();

router.get('/', getAllCategories);
router.get('/:id', getCategory);
router.post('/', upload.single('image'), createCategory);
router.put('/:id', upload.single('image'), updateCategory);
router.delete('/:id', deleteCategory);

export default router;