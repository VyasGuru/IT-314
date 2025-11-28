import { useState, useEffect } from 'react';
import axios from "axios";
import { getAuth } from "firebase/auth";
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Header } from '../landing_page/Header';
import { PropertyDetails } from '../landing_page/PropertyDetails';
import { getUserProfile, updateUserDetails, resetPassword } from '../../services/userApi';
import { getSavedListings, removeSavedListing } from '../../services/savedListingApi';
import { getComparedProperties } from '../../services/comparisonApi';
import { getUserNotifications, markUserNotificationAsRead } from '../../services/notificationApi';
import { formatLocation } from '../../utils/formatLocation';
import MyListings from './MyListings';
import {
  User,
  Heart,
  GitCompare,
  Settings,
  LogOut,
  Home,
  Bell,
  MapPin,
  Building2,
  Edit,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Lock,
  MessageSquare,
  Calendar,
  Mail,
  Phone,
  TrendingUp,
  Share2,
  Menu, // Import Menu icon for hamburger
  X, // Import X for close
  RefreshCcw // Import Refresh icon

} from 'lucide-react';

const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "N/A";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

const ComparisonTableRow = ({ label, values }) => (
  <div
    className="grid gap-4 py-4 border-b last:border-b-0"
    style={{ gridTemplateColumns: `200px repeat(${values.length}, minmax(200px, 1fr))` }}
  >
    <div className="text-sm font-semibold text-gray-500">{label}</div>
    {values.map((value, index) => (
      <div key={`${label}-${index}`} className="text-sm text-gray-900">
        {value}
      </div>
    ))}
  </div>
);

const UserDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar
  const { currentUser, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('saved');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [savedProperties, setSavedProperties] = useState([]);
  const [comparedProperties, setComparedProperties] = useState([]);
  const [listedProperties, setListedProperties] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    photo: null
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddListingOpen, setIsAddListingOpen] = useState(false);
  const [newListing, setNewListing] = useState({
    title: "",
    description: "",
    yearBuild: "",
    propertyType: "",
    price: "",
    size: "",
    bedrooms: "",
    bathrooms: "",
    balconies: "",
    amenities: {
      parking: false,
      gym: false,
      swimmingPool: false,
      wifi: false,
      security: false,
      powerBackup: false,
      garden: false,
      lift: false,
      clubhouse: false,
      playArea: false,
      furnished: false
    },
    location: {
      street: "",
      city: "",
      state: "",
      country: "",
      locality: "",
      zipCode: "",
      latitude: "",
      longitude: ""
    },
    images: []
  });
  const [images, setImages] = useState([]);

  const attributeRows = [
    {
      label: "Price",
      getValue: (property) => property?.price || "N/A", // Price is already formatted in dashboard data usually, but let's check
    },
    {
      label: "Location",
      getValue: (property) => formatLocation(property?.location),
    },
    {
      label: "Type",
      getValue: (property) =>
        property?.propertyType
          ? property.propertyType.replace(/^\w/, (c) => c.toUpperCase())
          : "N/A",
    },
    {
      label: "Size",
      getValue: (property) =>
        property?.size ? `${property.size} sq ft` : property?.area || "N/A",
    },
    {
      label: "Bedrooms",
      getValue: (property) => property?.bedrooms ?? "N/A",
    },
    {
      label: "Bathrooms",
      getValue: (property) => property?.bathrooms ?? "N/A",
    },
    {
      label: "Year Built",
      getValue: (property) => property?.yearBuild || property?.yearBuilt || "N/A",
    },
    {
      label: "Status",
      getValue: (property) =>
        property?.status
          ? property.status.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase())
          : "N/A",
    },
    {
      label: "Key Amenities",
      getValue: (property) => {
        if (!property?.amenities || typeof property.amenities !== "object") {
          return "—";
        }
        const enabled = Object.entries(property.amenities)
          .filter(([, enabled]) => enabled)
          .map(([name]) =>
            name
              .replace(/([A-Z])/g, " $1")
              .replace(/^\w/, (c) => c.toUpperCase())
          );
        return enabled.length > 0 ? enabled.join(", ") : "—";
      },
    },
  ];

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [currentUser, navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch user profile from backend
      try {
        const profileResponse = await getUserProfile();
        if (profileResponse?.data) {
          const backendUser = profileResponse.data;
          setUserData({
            displayName: backendUser.name || currentUser?.displayName || 'User',
            email: backendUser.email || currentUser?.email || '',
            photoURL: backendUser.photo || currentUser?.photoURL || '',
            phone: backendUser.phone || '',
            joinedDate: backendUser.createdAt || new Date().toISOString(),
            verified: backendUser.verified || false
          });
          // Set form initial values
          setProfileForm({
            name: backendUser.name || currentUser?.displayName || '',
            phone: backendUser.phone || '',
            photo: null
          });
          setPhotoPreview(backendUser.photo || currentUser?.photoURL || null);
        } else {
          // Fallback to Firebase user data if backend profile not available
          setUserData({
            displayName: currentUser?.displayName || 'User',
            email: currentUser?.email || '',
            photoURL: currentUser?.photoURL || '',
            phone: '',
            joinedDate: new Date().toISOString(),
            verified: false
          });
          setProfileForm({
            name: currentUser?.displayName || '',
            phone: '',
            photo: null
          });
          setPhotoPreview(currentUser?.photoURL || null);
        }
      } catch (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Fallback to Firebase user data
        setUserData({
          displayName: currentUser?.displayName || 'User',
          email: currentUser?.email || '',
          photoURL: currentUser?.photoURL || '',
          phone: '',
          joinedDate: new Date().toISOString(),
          verified: false
        });
        setProfileForm({
          name: currentUser?.displayName || '',
          phone: '',
          photo: null
        });
        setPhotoPreview(currentUser?.photoURL || null);
      }

      try {
        const savedResponse = await getSavedListings();
        const savedArray = savedResponse?.data;

        if (Array.isArray(savedArray)) {
          const transformedSaved = savedArray.map((item) => {
            const listing = item.listingId || item.listing;
            const property = listing;

            return {
              id: item._id,
              listingId: listing._id,
              property,


              title: property.title,
              price: property.price,
              location: property.location?.city
                ? `${property.location.city}, ${property.location.state || ''}`
                : "Location N/A",
              image: property.images?.[0] || "https://via.placeholder.com/400",
              bedrooms: property.bedrooms,
              bathrooms: property.bathrooms,
              area: property.size ? `${property.size} sq ft` : "0 sq ft",
              savedDate: item.createdAt,
            };
          });

          setSavedProperties(transformedSaved);
        }
      } catch (savedError) {
        console.error("Error fetching saved listings:", savedError);
        setSavedProperties([]);
      }




      // Fetch compared properties
      try {
        const comparedResponse = await getComparedProperties();
        // Backend returns an array of property objects directly (from comparison.propertyIds populated)
        if (comparedResponse?.data && Array.isArray(comparedResponse.data)) {
          // Transform compared properties data
          // Transform compared properties data
          // For the table view, we need the full property objects, not just the simplified version
          // So we just set the data directly, similar to how PropertyComparisonPage does it
          setComparedProperties(comparedResponse.data);
        }
      } catch (comparedError) {
        // If no comparison found (404), it's okay - user just hasn't added any yet
        if (comparedError.response?.status !== 404) {
          console.error('Error fetching compared properties:', comparedError);
        }
        setComparedProperties([]);
      }

      // Fetch user's listed properties 

      try {
        const token = await currentUser.getIdToken();
        const response = await axios.get('/api/properties/my-listings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setListedProperties(response.data.data);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setListedProperties([]);
      }

      try {
        const notificationsResponse = await getUserNotifications({ limit: 50 });
        const payload = notificationsResponse?.data;
        const normalizedNotifications = Array.isArray(payload?.notifications)
          ? payload.notifications.map((notification) => ({
            id: notification._id,
            title: notification.title || 'Notification',
            message: notification.message || '',
            isRead: Boolean(notification.isRead),
            createdAt: notification.createdAt || notification.updatedAt,
          }))
          : [];
        setNotifications(normalizedNotifications);
      } catch (notificationError) {
        console.error('Error fetching notifications:', notificationError);
        setNotifications([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  const handleUnsave = async (savedItemId) => {
    try {
      await removeSavedListing(savedItemId);

      // forcing hard reload as not using context right now
      window.location.reload();

    } catch (err) {
      console.error("Error unsaving property:", err);
    }
  };



  const handleViewDetails = (propertyId) => {
    const saved = savedProperties.find((p) => p.listingId === propertyId);

    if (!saved) return;

    setSelectedProperty(saved.property); // full property object
    setIsDetailsOpen(true);
  };



  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };





  const handleRemoveComparison = async (propertyId) => {
    try {
      const { removePropertyFromComparison } = await import('../../services/comparisonApi');
      await removePropertyFromComparison(propertyId);
      // Refresh compared properties
      const comparedResponse = await getComparedProperties();
      if (comparedResponse?.data && Array.isArray(comparedResponse.data)) {
        // Transform compared properties data - backend returns array of property objects
        // Transform compared properties data - backend returns array of property objects
        // We need to keep the full property object for the table view to work correctly with attributeRows
        // The previous transformation was too aggressive and lost data needed for the table
        setComparedProperties(comparedResponse.data);
      } else {
        setComparedProperties([]);
      }
    } catch (error) {
      console.error('Error removing comparison:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await markUserNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteListing = (propertyId) => {
    if (globalThis.confirm('Are you sure you want to delete this listing?')) {
      setListedProperties(listedProperties.filter(p => p.id !== propertyId));
    }
  };

  const handleEditListing = (propertyId) => {
    console.log('Edit listing:', propertyId);
    alert('Edit functionality will be implemented soon!');
  };

  const handleToggleListingStatus = (propertyId) => {
    setListedProperties(listedProperties.map(p =>
      p.id === propertyId
        ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
        : p
    ));
  };

  const handleAddNewListing = () => {
    setIsAddListingOpen(true);
  };

  const handleSubmitListing = async () => {
    const auth = getAuth();
    const token = await auth.currentUser.getIdToken();
    try {
      const formData = new FormData();

      // Append text fields
      Object.keys(newListing).forEach((key) => {
        if (key === "amenities" || key === "location") {
          formData.append(key, JSON.stringify(newListing[key]));
        } else {
          formData.append(key, newListing[key]);
        }
      });

      // Append images
      for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i]); // <-- must match multer
      }
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      const response = await axios.post(
        "http://localhost:8000/api/properties/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,  // <-- REQUIRED
          },
        }

      );

      alert("Listing created successfully!");

      setIsAddListingOpen(false);
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert("Error creating listing");
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setProfileForm({ ...profileForm, photo: file });
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await updateUserDetails(
        profileForm.name,
        profileForm.phone,
        profileForm.photo
      );

      if (response?.data) {
        const updatedUser = response.data;
        setUserData({
          ...userData,
          displayName: updatedUser.name || userData.displayName,
          phone: updatedUser.phone || userData.phone,
          photoURL: updatedUser.photo || userData.photoURL
        });
        setPhotoPreview(updatedUser.photo || photoPreview);
        alert('Profile updated successfully!');
        // Refresh user data
        await fetchUserData();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    setIsResettingPassword(true);
    try {
      const response = await resetPassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      if (response?.message) {
        setPasswordSuccess('Password updated successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Clear success message after 5 seconds
        setTimeout(() => {
          setPasswordSuccess('');
        }, 5000);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      if (error.response?.data?.message) {
        setPasswordError(error.response.data.message);
      } else if (error.response?.status === 401) {
        setPasswordError('Invalid current password. Please try again.');
      } else {
        setPasswordError('Failed to update password. Please try again.');
      }
    } finally {
      setIsResettingPassword(false);
    }
  };

  const headerUser = currentUser
    ? {
      name: currentUser.displayName || currentUser.email,
      email: currentUser.email,
      picture: currentUser.photoURL,
      role: userRole,
    }
    : null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className={`w-72 bg-gradient-to-b from-blue-600 to-blue-800 text-white flex-col fixed h-[calc(100vh-4rem)] top-16 left-0 overflow-y-auto shadow-lg rounded-r-2xl z-40 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex`}>
          <div className="p-8 text-center border-b border-white/10">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-white/20 flex items-center justify-center overflow-hidden border-3 border-white">
              {(userData?.photoURL || photoPreview) ? (
                <img src={photoPreview || userData.photoURL} alt={userData?.displayName || 'User'} className="w-full h-full object-cover" />
              ) : (
                <User size={40} />
              )}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{userData?.displayName || 'User'}</h3>
            <p className="text-sm text-white/80">{userRole === 'admin' ? 'Administrator' : 'User'}</p>
          </div>

          <nav className="flex-1 py-4">
            {[
              { id: 'saved', icon: Heart, label: 'Saved Properties', count: savedProperties.length },
              { id: 'listed', icon: Building2, label: 'My Listings', count: listedProperties.length },
              { id: 'comparisons', icon: GitCompare, label: 'Comparisons', count: comparedProperties.length },
              { id: 'notifications', icon: Bell, label: 'Notifications', count: notifications.filter(n => !n.isRead).length, alert: true },
              { id: 'settings', icon: Settings, label: 'Settings' }
            ].map(item => (
              <button
                key={item.id}
                className={`w-full flex items-center gap-3 px-6 py-4 text-base cursor-pointer transition-all duration-300 relative text-left hover:bg-white/10 ${activeTab === item.id ? 'bg-white/20 text-white font-semibold before:content-[""] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-white' : 'text-white/90'
                  }`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false); // Close on selection on mobile
                }}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.count > 0 && (
                  <span className={`ml-auto px-2 py-1 rounded-xl text-xs font-semibold ${item.alert ? 'bg-red-500 text-white' : 'bg-white/30 text-white'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-white/10">
            <button
              className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 border-none text-white rounded-lg cursor-pointer transition-all duration-300 hover:bg-white/20"
              onClick={handleSignOut}
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-72 p-4 sm:p-8 pt-16 sm:pt-20 min-h-screen min-w-0">
          <button
            className="lg:hidden fixed top-20 left-5 z-30 p-2 bg-white rounded-full shadow-md text-gray-800"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {isSidebarOpen && (
            <div
              className="lg:hidden fixed left-0 right-0 bottom-0 top-16 bg-black/40 z-30"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              {activeTab === 'saved' && 'Saved Properties'}
              {activeTab === 'listed' && 'My Listings'}
              {activeTab === 'comparisons' && 'Property Comparisons'}
              {activeTab === 'notifications' && 'Notifications'}
              {activeTab === 'settings' && 'Account Settings'}
            </h1>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-8 shadow-sm max-w-full">



            {/* Saved Properties Tab */}
            {
              activeTab === 'saved' && (
                <div>
                  {savedProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {savedProperties.map(property => (
                        <div key={property.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                          <div className="relative w-full h-48 overflow-hidden group">
                            <img src={property.image} alt={property.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            <button
                              onClick={() => handleUnsave(property.listingId || property.id)}
                              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white text-pink-600 flex items-center justify-center transition-all duration-300 shadow-md hover:bg-pink-600 hover:text-white hover:scale-110"
                            >
                              <Heart size={20} fill="currentColor" />
                            </button>
                          </div>
                          <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{property.title}</h3>
                            <p className="text-2xl font-bold text-blue-600 mb-3">{property.price}</p>
                            <div className="flex items-center gap-2 text-gray-600 mb-4">
                              <MapPin size={16} />
                              <span className="text-sm">{formatLocation(property.location)}</span>
                            </div>
                            <div className="flex gap-4 mb-4 pt-4 border-t border-gray-200">
                              <span className="text-sm text-gray-600">{property.bedrooms} Beds</span>
                              <span className="text-sm text-gray-600">{property.bathrooms} Baths</span>
                              <span className="text-sm text-gray-600">{property.area}</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-4">Saved on {property.savedDate}</p>
                            <button
                              onClick={() => handleViewDetails(property.listingId || property.id)}
                              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Heart size={64} className="text-gray-300 mb-4" />
                      <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Saved Properties</h2>
                      <p className="text-gray-600 mb-6">Start saving properties to view them here</p>
                      <button
                        onClick={() => navigate('/properties')}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold inline-flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <Plus size={20} />
                        Browse Properties
                      </button>
                    </div>
                  )}
                </div>
              )
            }

            {/* My Listings Tab */}
            {activeTab === 'listed' && <MyListings listings={listedProperties} />}

            {/* Comparisons Tab */}
            {
              activeTab === 'comparisons' && (
                <div>

                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Comparing {comparedProperties.length} Properties</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const { getComparedProperties } = await import('../../services/comparisonApi');
                            const response = await getComparedProperties();
                            if (response?.data) setComparedProperties(response.data);
                          } catch (error) {
                            console.error('Error refreshing comparison:', error);
                          }
                        }}
                        className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <RefreshCcw className="h-4 w-4" />
                        <span className="hidden sm:inline">Refresh</span>
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const { clearComparison } = await import('../../services/comparisonApi');
                            await clearComparison();
                            setComparedProperties([]);
                          } catch (error) {
                            console.error('Error clearing comparison:', error);
                          }
                        }}
                        className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Clear All</span>
                      </button>
                    </div>
                  </div>

                  {comparedProperties.length > 0 ? (
                    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                      <div
                        className="grid gap-4 border-b px-6 py-6"
                        style={{ gridTemplateColumns: `200px repeat(${comparedProperties.length}, minmax(200px, 1fr))` }}
                      >
                        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                          Overview
                        </div>
                        {comparedProperties.map((property) => (
                          <div
                            key={property._id || property.id}
                            className="rounded-xl border border-gray-100 p-4 shadow-sm"
                          >
                            <div className="aspect-video rounded-lg overflow-hidden mb-3">
                              <img
                                src={property?.images?.[0] || "/placeholder.jpg"}
                                alt={property?.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = "/placeholder.jpg";
                                }}
                              />
                            </div>
                            <p className="font-semibold text-gray-900 mb-1">
                              {property?.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatLocation(property?.location)}
                            </p>
                            <button
                              className="mt-4 text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                              onClick={() => handleRemoveComparison(property._id || property.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="px-6">
                        {attributeRows.map((row) => (
                          <ComparisonTableRow
                            key={row.label}
                            label={row.label}
                            values={comparedProperties.map((property) => row.getValue(property))}
                          />
                        ))}
                      </div>
                    </div>

                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-gray-50">
                      <GitCompare size={64} className="text-gray-300 mb-4" />
                      <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Comparisons</h2>
                      <p className="text-gray-600 mb-6">Add properties to compare them side by side</p>
                      <button
                        onClick={() => navigate('/properties')}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold inline-flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <Plus size={20} />
                        Browse Properties
                      </button>
                    </div>
                  )}

                </div>
              )
            }

            {/* Notifications Tab */}
            {
              activeTab === 'notifications' && (
                <div className="flex flex-col gap-2">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <Bell size={32} className="mb-3" />
                      <p>No notifications yet.</p>
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        onClick={() => markNotificationAsRead(notification.id)}
                        className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-300 hover:bg-gray-50 hover:border-blue-600 ${notification.isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-l-4 border-blue-600'
                          }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.isRead ? 'bg-gray-200 text-blue-600' : 'bg-blue-200 text-blue-600'
                          }`}>
                          <Bell size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 mb-1">{notification.title}</p>
                          <p className="text-sm text-gray-600 mb-1">{notification.message || 'No additional details provided.'}</p>
                          <p className="text-xs text-gray-500">{notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}</p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0"></div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )
            }

            {/* Settings Tab */}
            {
              activeTab === 'settings' && (
                <div className="flex flex-col gap-8">
                  <form onSubmit={handleProfileUpdate} className="pb-8 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Profile Settings</h2>
                    <div className="flex gap-8 flex-wrap">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-30 h-30 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-blue-600">
                          {photoPreview ? (
                            <img src={photoPreview} alt={profileForm.name || 'User'} className="w-full h-full object-cover" />
                          ) : (
                            <User size={48} className="text-gray-400" />
                          )}
                        </div>
                        <label className="px-4 py-2 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-medium transition-all duration-300 hover:bg-blue-600 hover:text-white cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                          Change Photo
                        </label>
                      </div>

                      <div className="flex-1 flex flex-col gap-4 min-w-[300px]">
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <User size={16} />
                            Display Name
                          </label>
                          <input
                            type="text"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            className="px-4 py-3 border border-gray-300 rounded-lg text-gray-800 bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Mail size={16} />
                            Email
                          </label>
                          <input
                            type="email"
                            value={userData?.email || ''}
                            disabled
                            className="px-4 py-3 border border-gray-300 rounded-lg text-gray-500 bg-gray-100 cursor-not-allowed"
                          />
                          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Phone size={16} />
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="px-4 py-3 border border-gray-300 rounded-lg text-gray-800 bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white"
                            placeholder="Enter 10-digit phone number"
                            pattern="[0-9]{10}"
                            maxLength="10"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isUpdating}
                          className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </form>

                  <div className="pb-8 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Change Password</h2>
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Lock size={16} />
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white pr-10"
                            placeholder="Enter your current password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Lock size={16} />
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white pr-10"
                            placeholder="Enter your new password (min 6 characters)"
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Lock size={16} />
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white pr-10"
                            placeholder="Confirm your new password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      {passwordError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-red-600 text-sm">{passwordError}</p>
                        </div>
                      )}

                      {passwordSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-green-600 text-sm">{passwordSuccess}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isResettingPassword}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isResettingPassword ? 'Updating Password...' : 'Update Password'}
                      </button>
                    </form>
                  </div>

                  <div className="pb-8 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Preferences</h2>
                    <div className="flex flex-col gap-4">
                      {[
                        { title: 'Email Notifications', desc: 'Receive email updates about your properties' },
                        { title: 'Price Alerts', desc: 'Get notified when prices change' },
                        { title: 'New Listings', desc: 'Receive alerts for new properties' }
                      ].map((pref, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-1">{pref.title}</h3>
                            <p className="text-sm text-gray-600">{pref.desc}</p>
                          </div>
                          <label className="relative inline-block w-12 h-6 cursor-pointer">
                            <input type="checkbox" className="opacity-0 w-0 h-0 peer" />
                            <span className="absolute inset-0 bg-gray-300 rounded-full transition-all duration-400 peer-checked:bg-blue-600 before:absolute before:content-[''] before:h-4.5 before:w-4.5 before:left-0.75 before:bottom-0.75 before:bg-white before:rounded-full before:transition-all before:duration-400 peer-checked:before:translate-x-6"></span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                    <h2 className="text-xl font-bold text-red-800 mb-4">Danger Zone</h2>
                    <button className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold transition-all duration-300 hover:bg-red-600">
                      Delete Account
                    </button>
                  </div>
                </div>
              )
            }
          </div >
        </main >
      </div >
      {isDetailsOpen && selectedProperty && (
        <PropertyDetails
          property={selectedProperty}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedProperty(null);
          }}
        />
      )}

      {
        isAddListingOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl w-[700px] max-h-[90vh] overflow-y-auto">

              <h2 className="text-2xl font-bold mb-4">Create New Listing</h2>

              {/* TITLE */}
              <input
                className="w-full p-2 border rounded mb-3"
                placeholder="Title"
                value={newListing.title}
                onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
              />

              {/* DESCRIPTION */}
              <textarea
                className="w-full p-2 border rounded mb-3"
                placeholder="Description"
                value={newListing.description}
                onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
              />

              {/* PRICE */}
              <input
                className="w-full p-2 border rounded mb-3"
                placeholder="Price"
                type="number"
                value={newListing.price}
                onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
              />

              {/* YEAR */}
              <input
                className="w-full p-2 border rounded mb-3"
                placeholder="Year Built"
                type="number"
                value={newListing.yearBuild}
                onChange={(e) =>
                  setNewListing({ ...newListing, yearBuild: e.target.value })
                }
              />

              {/* LOCATION */}
              <h3 className="font-semibold mt-4">Location</h3>
              <input className="w-full p-2 border rounded mb-3" placeholder="Street"
                onChange={(e) => setNewListing({
                  ...newListing,
                  location: { ...newListing.location, street: e.target.value }
                })}
              />

              <input className="w-full p-2 border rounded mb-3" placeholder="City"
                onChange={(e) => setNewListing({
                  ...newListing,
                  location: { ...newListing.location, city: e.target.value }
                })}
              />

              <input
                className="border p-2 rounded w-full"
                placeholder="Locality"
                required
                value={newListing.location.locality}
                onChange={(e) =>
                  setNewListing({
                    ...newListing,
                    location: { ...newListing.location, locality: e.target.value }
                  })
                }
              />

              <select
                required
                className="border p-2 rounded w-full"
                value={newListing.propertyType}
                onChange={(e) =>
                  setNewListing({ ...newListing, propertyType: e.target.value })
                }
              >
                <option value="">Select Property Type</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
                <option value="rental">Rental</option>
              </select>

              <input className="border p-2 rounded w-full" placeholder="Number of balconies"
                type="number"
                required
                min="0"
                value={newListing.balconies}
                onChange={(e) =>
                  setNewListing({ ...newListing, balconies: Number(e.target.value) })
                }

              />
              <input className="w-full p-2 border rounded mb-3" placeholder="State"
                onChange={(e) => setNewListing({
                  ...newListing,
                  location: { ...newListing.location, state: e.target.value }
                })}
              />

              <input className="w-full p-2 border rounded mb-3" placeholder="Country"
                onChange={(e) => setNewListing({
                  ...newListing,
                  location: { ...newListing.location, country: e.target.value }
                })}
              />

              <input className="w-full p-2 border rounded mb-3" placeholder="Zip Code"
                onChange={(e) => setNewListing({
                  ...newListing,
                  location: { ...newListing.location, zipCode: e.target.value }
                })}
              />

              <input className="w-full p-2 border rounded mb-3" placeholder="Latitude"
                onChange={(e) => setNewListing({
                  ...newListing,
                  location: { ...newListing.location, latitude: e.target.value }
                })}
              />

              <input className="w-full p-2 border rounded mb-3" placeholder="Longitude"
                onChange={(e) => setNewListing({
                  ...newListing,
                  location: { ...newListing.location, longitude: e.target.value }
                })}
              />
              <input
                type="number"
                required
                min="1"
                value={newListing.size}
                onChange={(e) =>
                  setNewListing({ ...newListing, size: Number(e.target.value) })
                }
                className="border p-2 rounded w-full"
                placeholder="Enter property size (sq ft)"
              />
              <input
                type="number"
                required
                min="0"
                value={newListing.bedrooms}
                onChange={(e) =>
                  setNewListing({ ...newListing, bedrooms: Number(e.target.value) })
                }
                className="border p-2 rounded w-full"
                placeholder="Number of bedrooms"
              />
              <input
                type="number"
                required
                min="0"
                value={newListing.bathrooms}
                onChange={(e) =>
                  setNewListing({ ...newListing, bathrooms: Number(e.target.value) })
                }
                className="border p-2 rounded w-full"
                placeholder="Number of bathrooms"
              />

              {/* IMAGES */}
              <h3 className="font-semibold mt-4">Images</h3>
              <input
                type="file"
                multiple
                onChange={(e) => setImages([...e.target.files])}
              />

              {/* SUBMIT BUTTON */}
              <button
                onClick={handleSubmitListing}
                className="w-full py-3 bg-blue-600 text-white rounded-lg mt-4"
              >
                Submit Listing
              </button>

              <button
                onClick={() => setIsAddListingOpen(false)}
                className="w-full py-3 bg-gray-300 text-black rounded-lg mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )
      }

    </>
  );
};

export default UserDashboard;