import React, { useState, useEffect } from 'react';
import Logo from '../Layout/Logo';
import {
  X,
  Package,
  Calendar,
  DollarSign,
  FileText,
  Save,
  Tag, // New icon for category
} from 'lucide-react';

// Interface for Category dropdown items from the API
interface CategoryResponse {
  value: number; // Represents CategoryId
  label: string; // Represents Category Name
}

// Define the Medicine interface to precisely match your API's POST/PUT requirements
// 'id' is optional for 'add' but required for 'edit' if the API expects it in the body.
// Assuming your PUT/PATCH API for updating medicine would also accept these fields.
interface MedicineAPIData {
  id?: number; // Optional for POST (add), typically required for PUT/PATCH (edit)
  name: string;
  brand: string;
  description: string;
  price: number;
  quantityInStock: number; // Matches API's 'quantityInStock'
  expiryDate: string;
  categoryId: number; // Matches API's 'CategoryId'
}

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onSave now expects data matching the API's structure
  // The parent component (MedicinesList) will handle the specific API call (POST/PUT)
  onSave: (medicineData: MedicineAPIData) => Promise<void>; // Added Promise<void> for async operations
  mode: 'add' | 'edit';
  existingMedicine?: MedicineAPIData; // Pass the medicine object when editing
}

const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  existingMedicine,
}) => {
  const [formData, setFormData] = useState<MedicineAPIData>({
    id: existingMedicine?.id,
    name: existingMedicine?.name || '',
    brand: existingMedicine?.brand || '',
    description: existingMedicine?.description || '',
    price: existingMedicine?.price || 0,
    quantityInStock: existingMedicine?.quantityInStock || 0,
    expiryDate: existingMedicine?.expiryDate || '',
    categoryId: existingMedicine?.categoryId || 0, // Initialize with existing or default
  });

  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryResponse[]>([]); // State to store fetched categories
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Fetch categories when the modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        setCategoriesLoading(true);
        setCategoriesError(null);
        try {
          // Adjust this URL if your categories dropdown API is different
          const response = await fetch('https://localhost:7171/api/Categories/dropdown');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          // Assuming data.$values contains the array of categories with 'value' and 'label'
          // Make sure your backend's dropdown API returns objects with 'value' and 'label' properties.
          // If it returns CategoryId and Name, you'll need to map them:
          // data.$values.map((cat: any) => ({ value: cat.categoryId, label: cat.name }))
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
  }, [isOpen]); // Only re-run when isOpen changes

  // Use useEffect to reset form data when modal opens/changes mode/existingMedicine
  useEffect(() => {
    if (isOpen) {
      setFormData({
        id: existingMedicine?.id,
        name: existingMedicine?.name || '',
        brand: existingMedicine?.brand || '',
        description: existingMedicine?.description || '',
        price: existingMedicine?.price || 0,
        quantityInStock: existingMedicine?.quantityInStock || 0,
        expiryDate: existingMedicine?.expiryDate || '',
        categoryId: existingMedicine?.categoryId || 0, // Ensure categoryId is reset
      });
      setErrors({}); // Clear errors when modal opens
    }
  }, [isOpen, existingMedicine, mode]);

  const validateForm = () => {
    const newErrors: any = {};
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    // Only validate these required fields for 'add' mode
    if (mode === 'add') {
      if (!formData.name.trim()) newErrors.name = 'Medicine name is required.';
      if (!formData.brand.trim()) newErrors.brand = 'Brand is required.';
      if (!formData.description.trim()) newErrors.description = 'Description is required.';
      if (formData.price === null || formData.price === undefined || formData.price <= 0) {
        newErrors.price = 'Price must be a positive number.';
      }
    }

    // Always validate quantityInStock, expiryDate, and categoryId for both modes
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
      // Prepare the data to be sent, strictly matching your API's format
      // Note: 'id' should only be included for 'edit' operations if your API requires it in the body.
      const dataToSave: MedicineAPIData = {
        name: formData.name,
        brand: formData.brand,
        description: formData.description,
        price: parseFloat(formData.price.toString()), // Ensure number format
        quantityInStock: parseInt(formData.quantityInStock.toString()), // Ensure integer format
        expiryDate: formData.expiryDate,
        categoryId: formData.categoryId,
      };

      if (mode === 'edit' && existingMedicine?.id) {
        dataToSave.id = existingMedicine.id; // Include ID for existing medicine for PUT/PATCH
      }

      await onSave(dataToSave); // Call the parent's onSave function

      // Reset form fields only after successful save and if in 'add' mode
      if (mode === 'add') {
        setFormData({
          name: '',
          brand: '',
          description: '',
          price: 0,
          quantityInStock: 0,
          expiryDate: '',
          categoryId: 0, // Reset category selection
        });
      }
      setErrors({}); // Clear errors
      onClose(); // Close modal on successful save
    } catch (error) {
      console.error('Error saving medicine:', error);
      // Error handling is gracefully delegated to the parent component (MedicinesList)
      // which should display a toast or alert.
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
    // Clear the specific error when the user starts typing in that field
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  const modalTitle = mode === 'add' ? 'Add New Medicine' : 'Edit Medicine Details';
  const modalSubtitle =
    mode === 'add'
      ? 'Enter medicine details and initial stock.'
      : `Editing stock/expiry for ${existingMedicine?.name || 'medicine'}.`; // Improved placeholder for edit mode
  const submitButtonText = mode === 'add' ? 'Add Medicine' : 'Save Changes';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Logo size="sm" showText={false} variant="white" />
            <div>
              <h2 className="text-xl font-bold text-white">{modalTitle}</h2>
              <p className="text-teal-100 text-sm">{modalSubtitle}</p>
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
                    // Disable in edit mode if these are not editable via your API's PUT
                    disabled={mode === 'edit'}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    } ${mode === 'edit' ? 'bg-gray-100' : ''}`}
                    placeholder="Enter medicine name"
                    aria-invalid={errors.name ? "true" : "false"}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-red-600 text-sm mt-1">{errors.name}</p>
                  )}
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
                    disabled={mode === 'edit'}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                      errors.brand ? 'border-red-300' : 'border-gray-300'
                    } ${mode === 'edit' ? 'bg-gray-100' : ''}`}
                    placeholder="Enter brand name"
                    aria-invalid={errors.brand ? "true" : "false"}
                    aria-describedby={errors.brand ? "brand-error" : undefined}
                  />
                  {errors.brand && (
                    <p id="brand-error" className="text-red-600 text-sm mt-1">{errors.brand}</p>
                  )}
                </div>

                {mode === 'add' && ( // Only show price for 'add' mode
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
                        value={formData.price === 0 ? '' : formData.price} // Display empty string for 0 in add mode for better UX
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                          errors.price ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                        aria-invalid={errors.price ? "true" : "false"}
                        aria-describedby={errors.price ? "price-error" : undefined}
                      />
                    </div>
                    {errors.price && (
                      <p id="price-error" className="text-red-600 text-sm mt-1">{errors.price}</p>
                    )}
                  </div>
                )}

                {/* Category Dropdown */}
                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    {categoriesLoading ? (
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 flex items-center">
                        <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></span>{' '}
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

              {mode === 'add' && ( // Only show description for 'add' mode
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
                    placeholder="Enter medicine description"
                    aria-invalid={errors.description ? "true" : "false"}
                    aria-describedby={errors.description ? "description-error" : undefined}
                  />
                  {errors.description && (
                    <p id="description-error" className="text-red-600 text-sm mt-1">{errors.description}</p>
                  )}
                </div>
              )}
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
                    {mode === 'add' ? 'Initial Stock *' : 'Quantity in Stock *'}
                  </label>
                  <input
                    type="number"
                    id="quantityInStock"
                    name="quantityInStock"
                    value={formData.quantityInStock === 0 && mode === 'add' ? '' : formData.quantityInStock} // Better UX for add mode
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                      errors.quantityInStock ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter quantity"
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
                    <span>{submitButtonText}</span>
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

export default AddMedicineModal;