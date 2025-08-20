// MedicinesList.tsx
import React, { useState, useEffect } from 'react';
import { useCart } from '../Cart/CartContext';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import AddMedicineModal from './AddMedicineModal';
import EditMedicineModal from './EditMedicineModal'; // Import the new modal
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Package,
  Calendar,
  DollarSign,
  Building,
  ShoppingCart,
} from 'lucide-react';

interface Medicine {
  id: number;
  name: string;
  brand: string;
  category: string; // Changed to string
  price: number;
  stock: number;
  expiryDate: string;
  description: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  image?: string;
}

interface MedicineAPIData {
  id?: number; // Optional for POST (add), typically required for PUT/PATCH (edit)
  name: string;
  brand: string;
  description: string;
  price: number;
  quantityInStock: number;
  expiryDate: string;
  categoryId: number; // Matches API's 'CategoryId'
}

interface MedicinesListProps {
  userRole: string;
}

const MedicineCard: React.FC<{
  medicine: Medicine;
  userRole: string;
  onEdit?: (medicine: Medicine) => void;
  onDelete?: (medicineId: number) => void;
}> = ({ medicine, userRole, onEdit, onDelete }) => {
  const { dispatch } = useCart();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMedicineImage = (category: string, name: string) => {
    const imageMap: { [key: string]: string } = {
      'Painkiller': 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Antibiotic': 'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Blood Pressure': 'https://images.pexels.com/photos/3683098/pexels-photo-3683098.jpeg?auto=compress&cs=tinysrgb&w=400', // Assuming this category might exist
      'Vitamins': 'https://images.pexels.com/photos/3683101/pexels-photo-3683101.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Diabetes': 'https://images.pexels.com/photos/3683089/pexels-photo-3683089.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Heart Disease': 'https://images.pexels.com/photos/3683071/pexels-photo-3683071.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Anti-allergic': 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400', // Example for new categories
      'Antipyretic': 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400', // Example for new categories
      // Add more mappings for new categories from your API if needed
    };

    return (
      medicine.image ||
      imageMap[category] ||
      'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400'
    );
  };

  const addToCart = () => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: medicine.id,
        name: medicine.name,
        brand: medicine.brand,
        price: medicine.price,
        image: getMedicineImage(medicine.category, medicine.name),
        category: medicine.category,
      },
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative h-48 bg-gradient-to-br from-teal-50 to-blue-50 overflow-hidden">
        <img
          src={getMedicineImage(medicine.category, medicine.name)}
          alt={medicine.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400';
          }}
        />

        <div className="absolute top-3 right-3">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
              medicine.status
            )}`}
          >
            {medicine.status}
          </span>
        </div>

        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 text-xs font-medium bg-white bg-opacity-90 text-gray-700 rounded-full">
            {medicine.category}
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
              {medicine.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Building className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-500">{medicine.brand}</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {medicine.description}
        </p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-500">Price</span>
            </div>
            <span className="font-semibold text-gray-900">
              ${medicine.price}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-500">Stock</span>
            </div>
            <span
              className={`font-semibold ${
                medicine.stock < 20 ? 'text-red-600' : 'text-gray-900'
              }`}
            >
              {medicine.stock} units
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-500">Expires</span>
            </div>
            <span className="text-sm text-gray-900">
              {medicine.expiryDate}
            </span>
          </div>
        </div>

        {medicine.stock < 20 && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg mb-4 border border-red-100">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-700">Low stock alert</span>
          </div>
        )}

        {(userRole === 'Admin' || userRole === 'Pharmacist') && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit && onEdit(medicine)}
              className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 text-sm"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete && onDelete(medicine.id)}
              className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center space-x-2 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        )}

        {userRole === 'Customer' && (
          <button
            onClick={addToCart}
            disabled={medicine.stock === 0}
            className={`w-full px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 font-medium ${
              medicine.stock === 0
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{medicine.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

const MedicinesList: React.FC<MedicinesListProps> = ({ userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / pageSize);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // New state for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicines = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://localhost:7171/api/Medicines/paged?page=${page}&pageSize=${pageSize}`
      );
      if (!response.ok) throw new Error('Failed to fetch medicines');

      const data = await response.json();
      // Directly access $values from the top-level 'values' object
      const values = data.values?.$values || [];

      const idMap: Record<string, any> = { [data.$id]: data }; // Initialize with top-level data
      for (const item of values) {
        if (item.$id) {
          idMap[item.$id] = item;
        }
        if (item.category?.$id) {
          idMap[item.category.$id] = item.category;
        }
      }

      const resolveRef = (item: any) => (item?.$ref ? idMap[item.$ref] : item);

      const transformed: Medicine[] = values.map((item: any) => {
        const resolvedCategory = resolveRef(item.category);
        const categoryName = resolvedCategory?.name || 'General';

        return {
          id: item.medicineId,
          name: item.name,
          brand: item.brand,
          description: item.description,
          price: item.price,
          stock: item.quantityInStock,
          expiryDate: item.expiryDate, // Directly use the string
          category: categoryName,
          status:
            item.quantityInStock === 0
              ? 'Out of Stock'
              : item.quantityInStock < 20
              ? 'Low Stock'
              : 'In Stock',
        };
      });

      setMedicines(transformed);
      setTotalCount(data.totalCount);
      setCurrentPage(data.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = async (medicineData: {
    name: string;
    brand: string;
    description: string;
    price: number;
    quantityInStock: number;
    expiryDate: string;
    categoryId: number; // Add categoryId here for the new medicine
  }) => {
    try {
      setLoading(true);
      const response = await fetch('https://localhost:7171/api/Medicines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(medicineData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        console.error('API Error Response:', errorData);
        throw new Error(`Failed to add medicine: ${errorData.message || 'Unknown error'}`);
      }

      await fetchMedicines(currentPage);
      setIsAddModalOpen(false);
      // toast.success('Medicine added successfully!');
    } catch (error: any) {
      console.error('Error adding medicine:', error);
      alert(`Failed to add medicine: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setIsEditModalOpen(true);
  };

  const handleUpdateMedicine = async (medicineData: MedicineAPIData) => {
    if (!medicineData.id) {
      console.error("Medicine ID is missing for update operation.");
      alert("Failed to update medicine: ID missing.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`https://localhost:7171/api/Medicines/${medicineData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(medicineData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        console.error('API Error Response:', errorData);
        throw new Error(`Failed to update medicine: ${errorData.message || 'Unknown error'}`);
      }

      await fetchMedicines(currentPage); // Re-fetch to show updated data
      setIsEditModalOpen(false); // Close modal on success
      setEditingMedicine(null); // Clear editing state
      // toast.success('Medicine updated successfully!');
    } catch (error: any) {
      console.error('Error updating medicine:', error);
      alert(`Failed to update medicine: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedicine = (medicineId: number) => {
    confirmAlert({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this medicine?',
      buttons: [
        {
          label: 'Yes, Delete',
          onClick: async () => {
            try {
              const response = await fetch(
                `https://localhost:7171/api/Medicines/${medicineId}`,
                {
                  method: 'DELETE',
                }
              );

              if (!response.ok) throw new Error('Failed to delete medicine.');

              await fetchMedicines(currentPage);
              // toast.success('Medicine deleted successfully!');
            } catch (error: any) {
              console.error('Error deleting medicine:', error);
              alert(`Failed to delete medicine. Please try again: ${error.message}`);
            }
          },
        },
        {
          label: 'Cancel',
          onClick: () => {},
        },
      ],
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchMedicines(newPage);
    }
  };

  useEffect(() => {
    fetchMedicines(currentPage);
  }, [currentPage]);

  const categories = [
    'All',
    'Painkiller',
    'Antibiotic',
    'Anti-allergic',
    'Antipyretic',
    'Diabetes',
    // Add any other categories you expect from your API here
  ];

  const filteredMedicines = medicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === 'All' || medicine.category === selectedCategory)
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading medicines...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => fetchMedicines(currentPage)}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medicines</h2>
          <p className="text-gray-600">Manage your medicine inventory</p>
        </div>
        {(userRole === 'Admin' || userRole === 'Pharmacist') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Medicine</span>
          </button>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {filteredMedicines.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No medicines found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedicines.map((medicine) => (
            <MedicineCard
              key={medicine.id}
              medicine={medicine}
              userRole={userRole}
              onEdit={handleEditClick}
              onDelete={handleDeleteMedicine}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-100"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 rounded border text-sm ${
                  currentPage === pageNum
                    ? 'bg-teal-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                {pageNum}
              </button>
            )
          )}

          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      )}

      <AddMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddMedicine}
        mode="add"
      />

      {/* New Edit Medicine Modal */}
      <EditMedicineModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMedicine(null); // Clear editing state when closing
        }}
        onSave={handleUpdateMedicine}
        editingMedicine={editingMedicine}
      />
    </div>
  );
};

export default MedicinesList;