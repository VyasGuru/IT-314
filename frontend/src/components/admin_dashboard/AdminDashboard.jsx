import { useState } from 'react';
import { ShieldCheck, MessageSquare, Home, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('listings');
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const [listings, setListings] = useState([
    { id: 1, title: 'Spacious 3BHK Villa', location: 'Surat, GJ', status: 'pending' },
    { id: 2, title: 'Cozy Studio Apartment', location: 'Ahmedabad, GJ', status: 'pending' },
    { id: 3, title: '2BHK Modern Flat', location: 'Rajkot, GJ', status: 'approved' },
  ]);

  const [issues, setIssues] = useState([
    { id: 1, subject: 'Login Issue', user: 'test@example.com', status: 'open' },
    { id: 2, subject: 'Property not visible', user: 'user@example.com', status: 'open' },
    { id: 3, subject: 'Payment failed', user: 'another@example.com', status: 'resolved' },
  ]);

  const approveListing = (id) => {
    setListings(listings.map(l => l.id === id ? { ...l, status: 'approved' } : l));
  };

  const rejectListing = (id) => {
    setListings(listings.map(l => l.id === id ? { ...l, status: 'rejected' } : l));
  };

  const resolveIssue = (id) => {
    setIssues(issues.map(i => i.id === id ? { ...i, status: 'resolved' } : i));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-gray-800 to-gray-900 text-white flex flex-col fixed h-full left-0 overflow-y-auto shadow-lg">
        <div className="p-8 text-center border-b border-white/10">
          <h3 className="text-xl font-semibold text-white mb-2">Admin Panel</h3>
          <p className="text-sm text-white/80">FindMySquare</p>
        </div>

        <nav className="flex-1 py-4">
          {[
            { id: 'listings', icon: ShieldCheck, label: 'Verify Listings' },
            { id: 'issues', icon: MessageSquare, label: 'User Issues' },
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
            {activeTab === 'listings' && 'Verify Listings'}
            {activeTab === 'issues' && 'User Issues'}
          </h1>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm">
          {activeTab === 'listings' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Pending Listings</h2>
              <div className="grid grid-cols-1 gap-6">
                {listings.filter(l => l.status === 'pending').map(listing => (
                  <div key={listing.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 p-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{listing.title}</h3>
                      <p className="text-gray-600">{listing.location}</p>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => approveListing(listing.id)} className="px-4 py-2 bg-green-500 text-white rounded-lg">Approve</button>
                      <button onClick={() => rejectListing(listing.id)} className="px-4 py-2 bg-red-500 text-white rounded-lg">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'issues' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Open Issues</h2>
              <div className="grid grid-cols-1 gap-6">
                {issues.filter(i => i.status === 'open').map(issue => (
                  <div key={issue.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 p-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{issue.subject}</h3>
                      <p className="text-gray-600">{issue.user}</p>
                    </div>
                    <button onClick={() => resolveIssue(issue.id)} className="px-4 py-2 bg-blue-500 text-white rounded-lg">Mark as Resolved</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
