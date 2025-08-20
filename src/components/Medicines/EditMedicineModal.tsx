import React, { useState, useEffect } from 'react';
import Logo from '../Layout/Logo';
import {
  X,
  Package,
  Calendar,
  DollarSign,
  FileText,
  Save,
  Tag,
} from 'lucide-react';

interface MedicineAPIData {
  id?: number;
  name: string;
  brand: string;
  description: string;
  price: number;
  quantityInStock: number;
  expiryDate: string;
  categoryId: number;
}

interface Medicine {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  expiryDate: string;
  description: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  image?: string;
}

interface CategoryResponse {
  value: number;
  label: string;
}

interface EditMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medicine: MedicineAPIData) => Promise<void>;
  editingMedicine: Medicine | null;
}

const EditMedicineModal: React.FC<EditMedicineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMedicine,
}) => {
  const [formData, setFormData] = useState<MedicineAPIData>({
    name: '',
    brand: '',
    description: '',
    price: 0,
    quantityInStock: 0,
    expiryDate: '',
    categoryId: 0,
  });

  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Fetch categories when the modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        setCategoriesLoading(true);
        setCategoriesError(null);
        try {
          const response = await fetch('https://localhost:7171/api/Categories/dropdown');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setCategories(data.$values || []);
        } catch (error: any) {
          console.error('Error fetching categories:', error);
          setCategoriesError('Failed to load categories. Please try again.');
        } finally {
          setCategoriesLoading(false);
        }
      };
      fetchCategories();
    }
  }, [isOpen]);

  // Populate form data when editingMedicine changes
  useEffect(() => {
    if (editingMedicine) {
      setFormData({
        id: editingMedicine.id,
        name: editingMedicine.name,
        brand: editingMedicine.brand,
        description: editingMedicine.description,
        price: editingMedicine.price,
        quantityInStock: editingMedicine.stock,
        expiryDate: editingMedicine.expiryDate.split('T')[0] || '',
        categoryId: getCategoryIdFromName(editingMedicine.category),
      });
    }
  }, [editingMedicine]);

  const getCategoryIdFromName = (categoryName: string): number => {
    const category = categories.find(cat => 
      cat.label.toLowerCase() === categoryName.toLowerCase()
    );
    return category ? category.value : 0;
  };

  const validateForm = () => {
    const newErrors: any = {};
    const today = new Date().toISOString().split('T')[0];

    if (!formData.name.trim()) newErrors.name = 'Medicine name is required.';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required.';
    if (!formData.description.trim()) newErrors.description = 'Description is required.';
    if (formData.price === null || formData.price === undefined || formData.price <= 0) {
      newErrors.price = 'Price must be a positive number.';
    }
    if (formData.quantityInStock === null || formData.quantityInStock === undefined || formData.quantityInStock < 0) {
      newErrors.quantityInStock = 'Stock quantity must be a non-negative number.';
    }
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required.';
    } else if (new Date(formData.expiryDate) < new Date(today)) {
      newErrors.expiryDate = 'Expiry date cannot be in the past.';
    }
    if (formData.categoryId === null || formData.categoryId === undefined || formData.categoryId <= 0) {
      newErrors.categoryId = 'Medicine category is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving medicine:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Logo size="sm" showText={false} variant="white" />
            <div>
              <h2 className="text-xl font-bold text-white">Edit Medicine Details</h2>
              <p className="text-teal-100 text-sm">
                {`Editing stock/expiry for ${editingMedicine?.name || 'medicine'}.`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto flex-grow">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Medicine Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <span>Medicine Information</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={true}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors bg-gray-100"
                  />
                </div>

                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                    Brand *
                  </label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    disabled={true}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors bg-gray-100"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Unit *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                        errors.price ? 'border-red-300' : 'border-gray-300'
                      }`}
                      aria-invalid={errors.price ? "true" : "false"}
                      aria-describedby={errors.price ? "price-error" : undefined}
                    />
                  </div>
                  {errors.price && (
                    <p id="price-error" className="text-red-600 text-sm mt-1">{errors.price}</p>
                  )}
                </div>

                {/* Category Dropdown */}
                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    {categoriesLoading ? (
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 flex items-center">
                        <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></span>
                        Loading categories...
                      </div>
                    ) : categoriesError ? (
                      <p className="text-red-600 text-sm">{categoriesError}</p>
                    ) : (
                      <select
                        id="categoryId"
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                          errors.categoryId ? 'border-red-300' : 'border-gray-300'
                        }`}
                        aria-invalid={errors.categoryId ? "true" : "false"}
                        aria-describedby={errors.categoryId ? "category-error" : undefined}
                      >
                        <option value={0}>Select a category</option>
                        {categories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  {errors.categoryId && (
                    <p id="category-error" className="text-red-600 text-sm mt-1">{errors.categoryId}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  aria-invalid={errors.description ? "true" : "false"}
                  aria-describedby={errors.description ? "description-error" : undefined}
                />
                {errors.description && (
                  <p id="description-error" className="text-red-600 text-sm mt-1">{errors.description}</p>
                )}
              </div>
            </div>

            {/* Stock and Expiry Information */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span>Stock & Expiry Information</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quantityInStock" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity in Stock *
                  </label>
                  <input
                    type="number"
                    id="quantityInStock"
                    name="quantityInStock"
                    value={formData.quantityInStock}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                      errors.quantityInStock ? 'border-red-300' : 'border-gray-300'
                    }`}
                    aria-invalid={errors.quantityInStock ? "true" : "false"}
                    aria-describedby={errors.quantityInStock ? "stock-error" : undefined}
                  />
                  {errors.quantityInStock && (
                    <p id="stock-error" className="text-red-600 text-sm mt-1">{errors.quantityInStock}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                        errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                      aria-invalid={errors.expiryDate ? "true" : "false"}
                      aria-describedby={errors.expiryDate ? "expiry-error" : undefined}
                    />
                  </div>
                  {errors.expiryDate && (
                    <p id="expiry-error" className="text-red-600 text-sm mt-1">{errors.expiryDate}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMedicineModal;