import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Header } from '../landing_page/Header';
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
  MessageSquare,
  Calendar,
  Mail,
  Phone,
  TrendingUp,
  Share2
} from 'lucide-react';

const UserDashboard = () => {
  const { currentUser, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [savedProperties, setSavedProperties] = useState([]);
  const [comparedProperties, setComparedProperties] = useState([]);
  const [listedProperties, setListedProperties] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const stats = [
    {
      label: 'Saved Properties',
      value: savedProperties.length,
      icon: Heart,
      color: 'from-rose-500 to-rose-600',
      target: 'saved'
    },
    {
      label: 'My Listings',
      value: listedProperties.length,
      icon: Building2,
      color: 'from-blue-600 to-blue-700',
      target: 'listed'
    },
    {
      label: 'Comparisons',
      value: comparedProperties.length,
      icon: GitCompare,
      color: 'from-purple-600 to-indigo-600',
      target: 'comparisons'
    },
    {
      label: 'Unread Notifications',
      value: notifications.filter(n => !n.read).length,
      icon: Bell,
      color: 'from-amber-500 to-amber-600',
      target: 'notifications'
    }
  ];

  const upcomingVisits = [
    {
      id: 1,
      property: 'Skyline Aura Residences',
      time: 'Thu, Nov 21 · 10:00 AM',
      agent: 'Priya Shah',
      location: 'Ahmedabad, GJ'
    },
    {
      id: 2,
      property: 'Sea Breeze Penthouse',
      time: 'Sat, Nov 23 · 4:30 PM',
      agent: 'Rahul Menon',
      location: 'Mumbai, MH'
    },
    {
      id: 3,
      property: 'North Park Townhomes',
      time: 'Mon, Nov 25 · 12:00 PM',
      agent: 'Kavya Desai',
      location: 'Gandhinagar, GJ'
    }
  ];

  const activityTimeline = [
    {
      id: 1,
      title: '24 people viewed Cozy Studio Apartment',
      category: 'Listing reach increased 14% this week',
      time: '2h ago',
      icon: Eye,
      accent: 'bg-violet-100 text-violet-600'
    },
    {
      id: 2,
      title: 'New inquiry from Rahul regarding Skyline Aura',
      category: 'Respond within 2 hours to keep badge',
      time: '5h ago',
      icon: MessageSquare,
      accent: 'bg-rose-100 text-rose-500'
    },
    {
      id: 3,
      title: 'You scheduled two property tours for this week',
      category: 'Both visitors requested project brochures',
      time: 'Yesterday',
      icon: Calendar,
      accent: 'bg-amber-100 text-amber-600'
    }
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
      setUserData({
        displayName: currentUser?.displayName || 'User',
        email: currentUser?.email || '',
        photoURL: currentUser?.photoURL || '',
        phone: '+91 9876543210',
        joinedDate: '2024-01-15',
        verified: true
      });

      setSavedProperties([
        {
          id: 1,
          title: 'Modern Beachfront Condo',
          price: '₹850,000',
          location: 'Mumbai, MH',
          image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
          bedrooms: 3,
          bathrooms: 2,
          area: '1,500 sq ft',
          savedDate: '2024-11-10'
        },
        {
          id: 2,
          title: 'Downtown Luxury Apartment',
          price: '₹3,200/month',
          location: 'Ahmedabad, GJ',
          image: 'https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?w=400',
          bedrooms: 2,
          bathrooms: 2,
          area: '1,200 sq ft',
          savedDate: '2024-11-12'
        }
      ]);

      setComparedProperties([
        {
          id: 3,
          title: 'Contemporary Family Home',
          price: '₹525,000',
          location: 'Baroda, GJ',
          image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400'
        }
      ]);

      setListedProperties([
        {
          id: 101,
          title: 'Spacious 3BHK Villa',
          price: '₹1,200,000',
          location: 'Surat, GJ',
          image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400',
          status: 'active',
          views: 245,
          inquiries: 12,
          listedDate: '2024-10-15'
        },
        {
          id: 102,
          title: 'Cozy Studio Apartment',
          price: '₹2,500/month',
          location: 'Ahmedabad, GJ',
          image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
          status: 'inactive',
          views: 89,
          inquiries: 3,
          listedDate: '2024-11-01'
        },
        {
          id: 103,
          title: '2BHK Modern Flat',
          price: '₹780,000',
          location: 'Rajkot, GJ',
          image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
          status: 'pending',
          views: 34,
          inquiries: 1,
          listedDate: '2024-11-10'
        }
      ]);

      setNotifications([
        {
          id: 1,
          type: 'price_drop',
          message: 'Price dropped on Modern Beachfront Condo',
          date: '2024-11-15',
          read: false
        },
        {
          id: 2,
          type: 'new_match',
          message: 'New property matches your preferences',
          date: '2024-11-14',
          read: false
        },
        {
          id: 3,
          type: 'saved',
          message: 'Property saved successfully',
          date: '2024-11-12',
          read: true
        }
      ]);

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

  const handleRemoveSaved = (propertyId) => {
    setSavedProperties(savedProperties.filter(p => p.id !== propertyId));
  };

  const handleRemoveComparison = (propertyId) => {
    setComparedProperties(comparedProperties.filter(p => p.id !== propertyId));
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
        <aside className="w-72 bg-gradient-to-b from-blue-600 to-blue-800 text-white flex flex-col fixed h-full left-0 overflow-y-auto shadow-lg rounded-r-2xl">
          <div className="p-8 text-center border-b border-white/10">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-white/20 flex items-center justify-center overflow-hidden border-3 border-white">
              {userData?.photoURL ? (
                <img src={userData.photoURL} alt={userData.displayName} className="w-full h-full object-cover" />
              ) : (
                <User size={40} />
              )}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{userData?.displayName}</h3>
            <p className="text-sm text-white/80">{userRole === 'admin' ? 'Administrator' : 'User'}</p>
          </div>

          <nav className="flex-1 py-4">
            {[
              { id: 'overview', icon: Home, label: 'Overview' },
              { id: 'saved', icon: Heart, label: 'Saved Properties', count: savedProperties.length },
              { id: 'listed', icon: Building2, label: 'My Listings', count: listedProperties.length },
              { id: 'comparisons', icon: GitCompare, label: 'Comparisons', count: comparedProperties.length },
              { id: 'notifications', icon: Bell, label: 'Notifications', count: notifications.filter(n => !n.read).length, alert: true },
              { id: 'settings', icon: Settings, label: 'Settings' }
            ].map(item => (
              <button
                key={item.id}
                className={`w-full flex items-center gap-3 px-6 py-4 text-base cursor-pointer transition-all duration-300 relative text-left hover:bg-white/10 ${
                  activeTab === item.id ? 'bg-white/20 text-white font-semibold before:content-[""] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-white' : 'text-white/90'
                }`}
                onClick={() => setActiveTab(item.id)}
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
        <main className="flex-1 pl-72 p-8 pt-20 min-h-screen">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'saved' && 'Saved Properties'}
              {activeTab === 'listed' && 'My Listings'}
              {activeTab === 'comparisons' && 'Property Comparisons'}
              {activeTab === 'notifications' && 'Notifications'}
              {activeTab === 'settings' && 'Account Settings'}
            </h1>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-8">
                <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white p-8 flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.4em] text-white/70 font-semibold">
                      Welcome back
                    </p>
                    <h2 className="text-3xl lg:text-4xl font-bold mt-3">
                      {`Good to see you, ${userData?.displayName?.split(' ')[0] || 'there'}!`}
                    </h2>
                    <p className="text-white/80 mt-3 max-w-xl">
                      You have {notifications.filter(n => !n.read).length} unread alerts and {upcomingVisits.length} upcoming visits.
                      Keep the momentum going by following up on new leads today.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-8">
                      <button
                        onClick={handleAddNewListing}
                        className="px-5 py-3 rounded-full bg-white/90 text-blue-700 font-semibold flex items-center gap-2 shadow-sm hover:-translate-y-0.5 transition-all duration-300"
                      >
                        <Plus size={18} />
                        Add new listing
                      </button>
                      <button
                        onClick={() => setActiveTab('notifications')}
                        className="px-5 py-3 rounded-full border border-white/40 text-white font-semibold flex items-center gap-2 hover:bg-white/15 transition-all duration-300"
                      >
                        <Bell size={18} />
                        Review alerts
                      </button>
                    </div>
                  </div>
                  <div className="w-full lg:w-80 grid grid-cols-2 gap-4">
                    {[
                      {
                        label: 'Response time',
                        value: '1h 20m',
                        helper: '12m faster this week'
                      },
                      {
                        label: 'Visit success',
                        value: '37%',
                        helper: '+6% vs last week'
                      },
                      {
                        label: 'Leads nurtured',
                        value: '18',
                        helper: '4 pending replies'
                      },
                      {
                        label: 'Avg. rating',
                        value: '4.8',
                        helper: 'Client satisfaction score'
                      }
                    ].map((metric, idx) => (
                      <div
                        key={idx}
                        className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center border border-white/20"
                      >
                        <p className="text-xs uppercase tracking-widest text-white/70">
                          {metric.label}
                        </p>
                        <p className="text-2xl font-bold mt-2">{metric.value}</p>
                        <p className="text-xs text-white/70 mt-1">{metric.helper}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, idx) => (
                    <button
                      key={idx}
                      className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:-translate-y-1 transition-all duration-300 hover:shadow-lg"
                      onClick={() => setActiveTab(stat.target)}
                    >
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center`}>
                        <stat.icon size={24} />
                      </div>
                      <div className="text-left">
                        <p className="text-3xl font-bold text-gray-900 leading-none">{stat.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-6 xl:col-span-2">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-[0.3em]">
                            Shortcuts
                          </p>
                          <h3 className="text-xl font-semibold text-gray-900 mt-1">
                            Make things happen faster
                          </h3>
                        </div>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                          <TrendingUp size={16} />
                          92% response rate
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        {[
                          {
                            title: 'Schedule visit',
                            subtitle: 'Send invite + itinerary',
                            icon: Calendar,
                            action: () => setActiveTab('listed')
                          },
                          {
                            title: 'Share listing',
                            subtitle: 'Send curated PDF',
                            icon: Share2,
                            action: () => alert('Share flow coming soon!')
                          },
                          {
                            title: 'Answer inquiries',
                            subtitle: '2 pending replies',
                            icon: MessageSquare,
                            action: () => setActiveTab('notifications')
                          }
                        ].map((item, idx) => (
                          <button
                            key={idx}
                            onClick={item.action}
                            className="p-4 rounded-xl border border-gray-200 text-left hover:border-blue-600 hover:bg-blue-50 transition-all duration-300"
                          >
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                              <item.icon size={18} />
                            </div>
                            <p className="font-semibold text-gray-900">{item.title}</p>
                            <p className="text-sm text-gray-500">{item.subtitle}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-[0.35em]">
                            Upcoming visits
                          </p>
                          <h3 className="text-xl font-semibold text-gray-900 mt-1">
                            This week&apos;s calendar
                          </h3>
                        </div>
                        <button className="text-sm font-semibold text-blue-600 hover:text-blue-500">
                          View calendar
                        </button>
                      </div>
                      <div className="flex flex-col gap-4">
                        {upcomingVisits.map(visit => (
                          <div
                            key={visit.id}
                            className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border border-gray-100 rounded-xl hover:border-blue-200 transition-all duration-300"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">{visit.property}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <MapPin size={14} />
                                {visit.location}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p className="font-medium text-gray-900">{visit.time}</p>
                              <p>Agent · {visit.agent}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500 uppercase tracking-[0.35em]">
                          Activity
                        </p>
                        <h3 className="text-xl font-semibold text-gray-900 mt-1">
                          What&apos;s happening today
                        </h3>
                      </div>
                      <span className="text-xs text-gray-400">Live</span>
                    </div>
                    <div className="flex flex-col gap-4">
                      {activityTimeline.map(event => (
                        <div
                          key={event.id}
                          className="flex gap-3 items-start p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${event.accent}`}>
                            <event.icon size={20} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{event.title}</p>
                            <p className="text-sm text-gray-500">{event.category}</p>
                          </div>
                          <span className="text-xs text-gray-400">{event.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Saved Properties Tab */}
            {activeTab === 'saved' && (
              <div>
                {savedProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedProperties.map(property => (
                      <div key={property.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <div className="relative w-full h-48 overflow-hidden group">
                          <img src={property.image} alt={property.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          <button
                            onClick={() => handleRemoveSaved(property.id)}
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
                            <span className="text-sm">{property.location}</span>
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
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Heart size={64} className="text-gray-300 mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Saved Properties</h2>
                    <p className="text-gray-600 mb-6">Start saving properties to view them here</p>
                    <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold inline-flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                      <Plus size={20} />
                      Browse Properties
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* My Listings Tab */}
            {activeTab === 'listed' && (
              <div>
                <div className="flex justify-end mb-6">
                  <button
                    onClick={handleAddNewListing}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <Plus size={20} />
                    Add New Listing
                  </button>
                </div>

                {listedProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listedProperties.map(property => (
                      <div key={property.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <div className="relative w-full h-48 overflow-hidden group">
                          <img src={property.image} alt={property.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          <span className={`absolute top-4 right-4 px-4 py-2 rounded-full text-xs font-semibold uppercase bg-white shadow-md border-2 ${
                            property.status === 'active' ? 'text-green-600 border-green-600' :
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
                            className={`w-full py-3 rounded-lg text-sm font-semibold transition-all duration-300 border-2 ${
                              property.status === 'active'
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
                  <div className="flex flex-col items-center justify-center py-16 text-center">
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
            )}

            {/* Comparisons Tab */}
            {activeTab === 'comparisons' && (
              <div>
                {comparedProperties.length > 0 ? (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">Comparing {comparedProperties.length} Properties</h2>
                      <button
                        onClick={() => setComparedProperties([])}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg transition-all duration-300 hover:bg-red-600"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {comparedProperties.map(property => (
                        <div key={property.id} className="relative bg-white border-2 border-gray-200 rounded-xl overflow-hidden p-4">
                          <button
                            onClick={() => handleRemoveComparison(property.id)}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center z-10 transition-all duration-300 hover:bg-red-600 hover:scale-110 text-xl leading-none"
                          >
                            ×
                          </button>
                          <img src={property.image} alt={property.title} className="w-full h-36 object-cover rounded-lg mb-4" />
                          <h3 className="text-base font-semibold text-gray-800 mb-2">{property.title}</h3>
                          <p className="text-xl font-bold text-blue-600 mb-1">{property.price}</p>
                          <p className="text-sm text-gray-600">{property.location}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <GitCompare size={64} className="text-gray-300 mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Comparisons</h2>
                    <p className="text-gray-600 mb-6">Add properties to compare them side by side</p>
                    <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold inline-flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                      <Plus size={20} />
                      Browse Properties
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="flex flex-col gap-2">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => markNotificationAsRead(notification.id)}
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-300 hover:bg-gray-50 hover:border-blue-600 ${
                      notification.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-l-4 border-blue-600'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notification.read ? 'bg-gray-200 text-blue-600' : 'bg-blue-200 text-blue-600'
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
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="flex flex-col gap-8">
                <div className="pb-8 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Profile Settings</h2>
                  <div className="flex gap-8 flex-wrap">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-30 h-30 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-blue-600">
                        {userData?.photoURL ? (
                          <img src={userData.photoURL} alt={userData.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <User size={48} className="text-gray-400" />
                        )}
                      </div>
                      <button className="px-4 py-2 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-medium transition-all duration-300 hover:bg-blue-600 hover:text-white">
                        Change Photo
                      </button>
                    </div>

                    <div className="flex-1 flex flex-col gap-4 min-w-[300px]">
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <User size={16} />
                          Display Name
                        </label>
                        <input
                          type="text"
                          defaultValue={userData?.displayName}
                          className="px-4 py-3 border border-gray-300 rounded-lg text-gray-800 bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Mail size={16} />
                          Email
                        </label>
                        <input
                          type="email"
                          defaultValue={userData?.email}
                          className="px-4 py-3 border border-gray-300 rounded-lg text-gray-800 bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Phone size={16} />
                          Phone
                        </label>
                        <input
                          type="tel"
                          defaultValue={userData?.phone}
                          className="px-4 py-3 border border-gray-300 rounded-lg text-gray-800 bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
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
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default UserDashboard;
