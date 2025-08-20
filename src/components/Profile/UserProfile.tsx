import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  Activity,
  ShoppingCart,
  CreditCard,
  Package,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

// Define the Customer interface based on the API's eager loading
// Assuming the Customer entity has these properties.
interface Customer {
  customerId: number;
  totalOrders: number;
  totalSpent: number;
  // Add other properties as needed from your Customer model
}

interface UserProfileData {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  imgURL?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  customers: Customer[]; // The new data from your API
}

interface UpdateUserDto {
  fullName: string;
  email: string;
}

interface UserProfileProps {
  userRole: string;
  userId: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userRole, userId }) => {
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfileData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = 'https://localhost:7171';

  const fetchUserProfile = async () => {
    if (!userId) {
      setLoading(false);
      setError("User ID not available. Please log in.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/Users/${userId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile for ID: ${userId}`);
      }

      const data: UserProfileData = await response.json();
      
      if (data.imgURL) {
        data.imgURL = `${API_BASE_URL}${data.imgURL}`;
      }

      setProfileData(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setIsSaving(true);

      const updateUserDto: UpdateUserDto = {
        fullName: editData.fullName || profileData?.fullName || '',
        email: editData.email || profileData?.email || '',
      };

      const response = await fetch(`${API_BASE_URL}/api/Users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateUserDto),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      await fetchUserProfile();
      setIsEditing(false);
      setEditData({});
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, and GIF images are allowed.');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image size must be less than 5MB.');
      return;
    }

    setIsUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/Users/UploadImage/${userId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || 'Failed to upload image');
        } catch (e) {
          throw new Error(errorText || 'Failed to upload image');
        }
      }

      const result = await response.json();
      setProfileData(prev => ({
        ...prev!,
        imgURL: `${API_BASE_URL}${result.imageUrl}`
      }));

    } catch (err) {
      console.error('Image upload error:', err);
      setError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const handleEdit = () => {
    setIsEditing(true);
    if (profileData) {
      setEditData({
        fullName: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        zipCode: profileData.zipCode,
      });
    }
  };

  const handleSave = () => {
    if (editData) {
      updateProfile();
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleInputChange = (field: keyof UserProfileData, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800';
      case 'Pharmacist':
        return 'bg-blue-100 text-blue-800';
      case 'Customer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-md">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={fetchUserProfile}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-md">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Profile not found for this user.</p>
        </div>
      </div>
    );
  }

  const displayFullName = isEditing
    ? `${editData.fullName || profileData.fullName}`
    : profileData.fullName;
  
  // Get customer data if it exists.
  // We assume there is only one customer per user profile for simplicity.
  const customerData = profileData.customers.length > 0 ? profileData.customers[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50 p-4 font-sans">
      <div className="flex justify-center">
        <div className="w-full max-w-4xl p-6 lg:p-12 bg-white rounded-3xl shadow-2xl border border-gray-100 space-y-8">
          {/* Header & Actions */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-gray-200">
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900">
                My Profile
              </h2>
              <p className="text-gray-600 mt-2">
                Manage your personal information and settings.
              </p>
            </div>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <button
                onClick={fetchUserProfile}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition-colors flex items-center space-x-2 shadow-lg"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    {isUploadingImage ? (
                      <div className="w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                        <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : profileData.imgURL ? (
                      <img
                        src={profileData.imgURL}
                        alt={`${profileData.fullName}'s profile`}
                        className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-28 h-28 bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                        {(profileData.fullName || '')
                          .split(' ')
                          .map((n) => n.charAt(0))
                          .join('')}
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center hover:bg-teal-700 transition-colors disabled:bg-gray-400"
                      title="Change profile picture"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mt-4">
                    {displayFullName}
                  </h3>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(
                        profileData.role
                      )}`}
                    >
                      {profileData.role}
                    </span>
                    <CheckCircle
                      className="w-5 h-5 text-green-500"
                      title="Email Verified"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-600">User ID</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {profileData.userId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        Member Since
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(profileData.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <User className="w-5 h-5 text-teal-600" />
                  <span>Personal Information</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.fullName || profileData.fullName}
                        onChange={(e) =>
                          handleInputChange('fullName', e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                        {profileData.fullName}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg flex-1">
                        {profileData.email}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={editData.phone || profileData.phone || ''}
                          onChange={(e) =>
                            handleInputChange('phone', e.target.value)
                          }
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg flex-1">
                          {profileData.phone || 'N/A'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-teal-600" />
                  <span>Address Information</span>
                </h3>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.address || profileData.address || ''}
                        onChange={(e) =>
                          handleInputChange('address', e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                        {profileData.address || 'N/A'}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.city || profileData.city || ''}
                          onChange={(e) =>
                            handleInputChange('city', e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                          {profileData.city || 'N/A'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.state || profileData.state || ''}
                          onChange={(e) =>
                            handleInputChange('state', e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                          {profileData.state || 'N/A'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.zipCode || profileData.zipCode || ''}
                          onChange={(e) =>
                            handleInputChange('zipCode', e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                          {profileData.zipCode || 'N/A'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Activity (Now dynamic) */}
              {userRole === 'Customer' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-teal-600" />
                    <span>Account Activity</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">
                            Total Orders
                          </p>
                          <p className="text-2xl font-bold text-blue-900">
                            {customerData?.totalOrders ?? 0}
                          </p>
                        </div>
                        <ShoppingCart className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">
                            Total Spent
                          </p>
                          <p className="text-2xl font-bold text-green-900">
                            ${(customerData?.totalSpent ?? 0).toFixed(2)}
                          </p>
                        </div>
                        <CreditCard className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-600">
                            Active Orders
                          </p>
                          <p className="text-2xl font-bold text-orange-900">0</p>
                        </div>
                        <Package className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
