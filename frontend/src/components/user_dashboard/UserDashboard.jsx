import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Header } from '../landing_page/Header';
import { getUserProfile, updateUserDetails, resetPassword } from '../../services/userApi';
import { getSavedListings } from '../../services/savedListingApi';
import { getComparedProperties } from '../../services/comparisonApi';
import { getProperties } from '../../services/propertyApi';
import { formatLocation } from '../../utils/formatLocation';
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
  X // Import X for close
} from 'lucide-react';

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

      // Fetch saved listings
      try {
        const savedResponse = await getSavedListings();
        if (savedResponse?.data && Array.isArray(savedResponse.data)) {
          // Transform saved listings data to match component format
          // Backend returns: SavedListing with listingId populated, which has propertyId populated
          const transformedSaved = savedResponse.data.map((item) => {
            const listing = item.listingId || item.listing;
            const property = listing?.propertyId || listing?.property || {};

            return {
              id: item._id || item.id,
              listingId: listing?._id || item.listingId,
              property: property,
              title: property?.title || 'Property',
              price: property?.price || 'N/A',
              location: property?.location?.city
                ? `${property.location.city}, ${property.location.state || ''}`
                : 'Location N/A',
              image: property?.images?.[0] || 'https://via.placeholder.com/400',
              bedrooms: property?.bedrooms || 0,
              bathrooms: property?.bathrooms || 0,
              area: property?.size ? `${property.size} sq ft` : '0 sq ft',
              savedDate: item.createdAt || item.savedAt || new Date().toISOString()
            };
          });
          setSavedProperties(transformedSaved);
        }
      } catch (savedError) {
        console.error('Error fetching saved listings:', savedError);
        setSavedProperties([]);
      }

      // Fetch compared properties
      try {
        const comparedResponse = await getComparedProperties();
        // Backend returns an array of property objects directly (from comparison.propertyIds populated)
        if (comparedResponse?.data && Array.isArray(comparedResponse.data)) {
          // Transform compared properties data
          const transformedCompared = comparedResponse.data.map((property) => ({
            id: property._id || property.id,
            title: property.title || 'Property',
            price: property.price || 'N/A',
            location: property.location?.city
              ? `${property.location.city}, ${property.location.state || ''}`
              : 'Location N/A',
            image: property.images?.[0] || 'https://via.placeholder.com/400'
          }));
          setComparedProperties(transformedCompared);
        }
      } catch (comparedError) {
        // If no comparison found (404), it's okay - user just hasn't added any yet
        if (comparedError.response?.status !== 404) {
          console.error('Error fetching compared properties:', comparedError);
        }
        setComparedProperties([]);
      }

      // Fetch user's listed properties (properties where user is the lister)
      // Note: This would need a backend endpoint to get properties by lister
      // For now, we'll try to get all properties and filter, or use an empty array
      try {
        const propertiesResponse = await getProperties();
        if (propertiesResponse?.data && Array.isArray(propertiesResponse.data)) {
          // Filter properties where current user is the lister
          // This assumes the backend returns listing information with property
          const userListings = propertiesResponse.data
            .filter(p => p.listing?.lister?.firebaseUid === currentUser?.uid)
            .map((p) => ({
              id: p._id || p.id,
              title: p.title || 'Property',
              price: p.price || 'N/A',
              location: p.location?.city
                ? `${p.location.city}, ${p.location.state || ''}`
                : 'Location N/A',
              image: p.images?.[0] || 'https://via.placeholder.com/400',
              status: p.listing?.status || 'pending',
              views: p.listing?.views || 0,
              inquiries: p.listing?.inquiries || 0,
              listedDate: p.listing?.createdAt || p.createdAt || new Date().toISOString()
            }));
          setListedProperties(userListings);
        }
      } catch (propertiesError) {
        console.error('Error fetching listed properties:', propertiesError);
        setListedProperties([]);
      }

      // Notifications - would need a separate endpoint
      // For now, using empty array until notification API is set up
      setNotifications([]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleRemoveSaved = async (listingId) => {
    try {
      const { removeSavedListing } = await import('../../services/savedListingApi');
      await removeSavedListing(listingId);
      // Refresh saved listings
      const savedResponse = await getSavedListings();
      if (savedResponse?.data && Array.isArray(savedResponse.data)) {
        const transformedSaved = savedResponse.data.map((item) => {
          const listing = item.listingId || item.listing;
          const property = listing?.propertyId || listing?.property || {};

          return {
            id: item._id || item.id,
            listingId: listing?._id || item.listingId,
            property: property,
            title: property?.title || 'Property',
            price: property?.price || 'N/A',
            location: property?.location?.city
              ? `${property.location.city}, ${property.location.state || ''}`
              : 'Location N/A',
            image: property?.images?.[0] || 'https://via.placeholder.com/400',
            bedrooms: property?.bedrooms || 0,
            bathrooms: property?.bathrooms || 0,
            area: property?.size ? `${property.size} sq ft` : '0 sq ft',
            savedDate: item.createdAt || item.savedAt || new Date().toISOString()
          };
        });
        setSavedProperties(transformedSaved);
      }
    } catch (error) {
      console.error('Error removing saved listing:', error);
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
        const transformedCompared = comparedResponse.data.map((property) => ({
          id: property._id || property.id,
          title: property.title || 'Property',
          price: property.price || 'N/A',
          location: property.location?.city
            ? `${property.location.city}, ${property.location.state || ''}`
            : 'Location N/A',
          image: property.images?.[0] || 'https://via.placeholder.com/400'
        }));
        setComparedProperties(transformedCompared);
      } else {
        setComparedProperties([]);
      }
    } catch (error) {
      console.error('Error removing comparison:', error);
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ));
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
    console.log('Add new listing');
    alert('Add listing functionality will be implemented soon!');
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
        <aside className={`w-72 bg-gradient-to-b from-blue-600 to-blue-800 text-white flex-col fixed h-full left-0 overflow-y-auto shadow-lg rounded-r-2xl z-20 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex`}>
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
              { id: 'notifications', icon: Bell, label: 'Notifications', count: notifications.filter(n => !n.read).length, alert: true },
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
        <main className="flex-1 lg:pl-72 p-4 sm:p-8 pt-16 sm:pt-20 min-h-screen">
          <button
            className="lg:hidden fixed top-5 left-5 z-30 p-2 bg-white rounded-full shadow-md text-gray-800"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {isSidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/40 z-10"
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

          <div className="bg-white rounded-xl p-4 sm:p-8 shadow-sm">



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
                              onClick={() => handleRemoveSaved(property.listingId || property.id)}
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
                            <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
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
            {
              activeTab === 'listed' && (
                <div>
                  {listedProperties.length > 0 && (
                    <div className="flex justify-end mb-6">
                      <button
                        onClick={handleAddNewListing}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <Plus size={20} />
                        Add New Listing
                      </button>
                    </div>
                  )}

                  {listedProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {listedProperties.map(property => (
                        <div key={property.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                          <div className="relative w-full h-48 overflow-hidden group">
                            <img src={property.image} alt={property.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            <span className={`absolute top-4 right-4 px-4 py-2 rounded-full text-xs font-semibold uppercase bg-white shadow-md border-2 ${property.status === 'active' ? 'text-green-600 border-green-600' :
                              property.status === 'inactive' ? 'text-gray-600 border-gray-600' :
                                'text-amber-600 border-amber-600'
                              }`}>
                              {property.status}
                            </span>
                          </div>
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-lg font-semibold text-gray-800 flex-1">{property.title}</h3>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditListing(property.id)}
                                  className="w-9 h-9 rounded-lg bg-gray-100 text-blue-600 flex items-center justify-center transition-all duration-300 hover:bg-blue-100 hover:scale-110"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteListing(property.id)}
                                  className="w-9 h-9 rounded-lg bg-gray-100 text-red-600 flex items-center justify-center transition-all duration-300 hover:bg-red-100 hover:scale-110"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 my-4 py-4 border-t border-b border-gray-200">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-xs text-gray-500 uppercase">Views</span>
                                <span className="text-lg font-bold text-gray-800">{property.views}</span>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-xs text-gray-500 uppercase">Inquiries</span>
                                <span className="text-lg font-bold text-gray-800">{property.inquiries}</span>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-xs text-gray-500 uppercase">Listed</span>
                                <span className="text-lg font-bold text-gray-800">{new Date(property.listedDate).getDate()}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleToggleListingStatus(property.id)}
                              className={`w-full py-3 rounded-lg text-sm font-semibold transition-all duration-300 border-2 ${property.status === 'active'
                                ? 'text-green-600 border-green-600 hover:bg-green-50'
                                : 'text-blue-600 border-blue-600 hover:bg-blue-50'
                                }`}
                            >
                              {property.status === 'active' ? 'Mark as Inactive' : 'Mark as Active'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Building2 size={64} className="text-gray-300 mb-4" />
                      <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Listings Yet</h2>
                      <p className="text-gray-600 mb-6">Create your first property listing</p>
                      <button
                        onClick={handleAddNewListing}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold inline-flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <Plus size={20} />
                        Add New Listing
                      </button>
                    </div>
                  )}
                </div>
              )
            }

            {/* Comparisons Tab */}
            {
              activeTab === 'comparisons' && (
                <div>
                  {comparedProperties.length > 0 ? (
                    <>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Comparing {comparedProperties.length} Properties</h2>
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
                          className="px-4 py-2 bg-red-500 text-white rounded-lg transition-all duration-300 hover:bg-red-600"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {comparedProperties.map(property => (
                          <div key={property.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
                            <div className="relative w-full h-48 overflow-hidden">
                              <img src={property.image} alt={property.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                              <button
                                onClick={() => handleRemoveComparison(property.id)}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 text-red-500 flex items-center justify-center z-10 transition-all duration-300 hover:bg-red-500 hover:text-white shadow-sm"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            <div className="p-5">
                              <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">{property.title}</h3>
                              <p className="text-xl font-bold text-blue-600 mb-2">{property.price}</p>
                              <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <MapPin size={14} />
                                <span className="line-clamp-1">{formatLocation(property.location)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
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
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      onClick={() => markNotificationAsRead(notification.id)}
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-300 hover:bg-gray-50 hover:border-blue-600 ${notification.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-l-4 border-blue-600'
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.read ? 'bg-gray-200 text-blue-600' : 'bg-blue-200 text-blue-600'
                        }`}>
                        <Bell size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 mb-1">{notification.message}</p>
                        <p className="text-xs text-gray-500">{notification.date}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0"></div>
                      )}
                    </div>
                  ))}
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
    </>
  );
};

export default UserDashboard;
