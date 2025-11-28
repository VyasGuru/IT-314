import { useEffect, useState } from 'react';
import { ShieldCheck, MessageSquare, LogOut, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const STORAGE_KEY = 'adminDashboardActiveTab';
const RESOLUTION_OPTIONS = [
  'We addressed the reported issue and everything looks good now.',
  'Listing details were updated based on your feedback.',
  'We could not reproduce the problem, but we will keep monitoring it.',
  'Thanks for reaching out—no further action is required at this moment.'
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(STORAGE_KEY) || 'listings';
    }
    return 'listings';
  });
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

  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [issuesError, setIssuesError] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [resolutionModalIssue, setResolutionModalIssue] = useState(null);
  const [resolutionSelections, setResolutionSelections] = useState([]);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customResolutionMessage, setCustomResolutionMessage] = useState('');
  const [resolutionError, setResolutionError] = useState('');
  const [resolutionSubmitting, setResolutionSubmitting] = useState(false);

  const fetchIssues = async () => {
    setIssuesLoading(true);
    setIssuesError(null);
    try {
      const response = await api.get('/notifications/admin', {
        params: { type: 'message' },
      });
      const notifications = response?.data?.data?.notifications || [];
      const mapped = notifications.map((item) => ({
        id: item._id,
        subject: item.title || 'User query',
        user: item.metadata?.sentByEmail || item.metadata?.sentByName || 'Unknown user',
        status: item.isRead ? 'resolved' : 'open',
        details: item.message,
        metadata: item.metadata || {},
        createdAt: item.createdAt,
      }));
      setIssues(mapped);
    } catch (error) {
      console.error('Failed to load admin issues', error);
      setIssuesError('Unable to load user issues right now.');
    } finally {
      setIssuesLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, activeTab);
    }

    if (activeTab === 'issues') {
      fetchIssues();
    }
  }, [activeTab]);

  const approveListing = (id) => {
    setListings(listings.map(l => l.id === id ? { ...l, status: 'approved' } : l));
  };

  const rejectListing = (id) => {
    setListings(listings.map(l => l.id === id ? { ...l, status: 'rejected' } : l));
  };

  const resolveIssue = async (id, resolutionMessages = []) => {
    try {
      await api.patch(`/notifications/admin/${id}/read`, { resolutionMessages });
      setIssues((prev) => prev.map((issue) => (issue.id === id ? { ...issue, status: 'resolved', resolutionMessages } : issue)));
      if (selectedIssue?.id === id) {
        setSelectedIssue((prev) => prev ? { ...prev, status: 'resolved', resolutionMessages } : prev);
      }
    } catch (error) {
      console.error('Failed to mark issue as resolved', error);
      throw error;
    }
  };

  const openResolutionModal = (issue) => {
    setResolutionModalIssue(issue);
    setResolutionSelections([]);
    setIsOtherSelected(false);
    setCustomResolutionMessage('');
    setResolutionError('');
  };

  const closeResolutionModal = () => {
    if (resolutionSubmitting) {
      return;
    }
    setResolutionModalIssue(null);
    setResolutionSelections([]);
    setIsOtherSelected(false);
    setCustomResolutionMessage('');
    setResolutionError('');
  };

  const toggleResolutionSelection = (message) => {
    setResolutionSelections((prev) =>
      prev.includes(message)
        ? prev.filter((item) => item !== message)
        : [...prev, message]
    );
  };

  const handleResolutionSubmit = async () => {
    const trimmedCustom = customResolutionMessage.trim();
    const messages = [...resolutionSelections];

    if (isOtherSelected && !trimmedCustom) {
      setResolutionError('Enter a custom message or uncheck the Other option.');
      return;
    }

    if (isOtherSelected && trimmedCustom) {
      messages.push(trimmedCustom);
    }

    if (messages.length === 0) {
      setResolutionError('Select at least one response or provide a custom message.');
      return;
    }

    setResolutionError('');
    setResolutionSubmitting(true);

    try {
      await resolveIssue(resolutionModalIssue.id, messages);
      setResolutionSubmitting(false);
      closeResolutionModal();
    } catch (error) {
      setResolutionError('Unable to mark the issue as resolved. Please try again.');
      setResolutionSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-linear-to-b from-gray-800 to-gray-900 text-white flex flex-col fixed h-full left-0 overflow-y-auto shadow-lg">
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Open Issues</h2>
                <button
                  onClick={fetchIssues}
                  className="px-4 py-2 text-sm text-white bg-gray-800 rounded-lg"
                  disabled={issuesLoading}
                >
                  {issuesLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              {issuesError && (
                <div className="mb-4 rounded-md bg-red-50 p-4 text-red-600 text-sm">
                  {issuesError}
                </div>
              )}
              {issuesLoading && !issues.length ? (
                <p className="text-gray-500">Loading issues...</p>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {issues.filter((i) => i.status === 'open').length === 0 ? (
                    <p className="text-gray-500">No open issues at the moment.</p>
                  ) : (
                    issues
                      .filter((i) => i.status === 'open')
                      .map((issue) => (
                        <div
                          key={issue.id}
                          className="bg-white rounded-xl overflow-hidden border border-gray-200 p-6 flex justify-between items-center gap-4"
                        >
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800">{issue.subject}</h3>
                            <p className="text-gray-600">{issue.user}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedIssue(issue)}
                              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg flex items-center gap-2"
                            >
                              <Eye size={16} /> Details
                            </button>
                            <button
                              onClick={() => openResolutionModal(issue)}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                            >
                              Mark as Resolved
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {selectedIssue && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Submitted by</p>
                <h3 className="text-xl font-semibold text-gray-900">{selectedIssue.metadata?.sentByName || selectedIssue.user}</h3>
                <p className="text-sm text-gray-600">{selectedIssue.metadata?.sentByEmail || 'No email provided'}</p>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Subject</p>
              <p className="text-lg text-gray-900">{selectedIssue.subject}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Message</p>
              <div className="mt-2 p-4 rounded-xl bg-gray-50 text-gray-800 whitespace-pre-wrap text-sm">
                {selectedIssue.details || 'No message provided'}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedIssue(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
              >
                Close
              </button>
              {selectedIssue.status !== 'resolved' && (
                <button
                  onClick={() => openResolutionModal(selectedIssue)}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {resolutionModalIssue && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Confirm Resolution</h3>
                <p className="text-sm text-gray-600">Select what should be sent to the user.</p>
              </div>
              <button
                onClick={closeResolutionModal}
                className="text-gray-500 hover:text-gray-700"
                disabled={resolutionSubmitting}
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {RESOLUTION_OPTIONS.map((option) => (
                <label key={option} className="flex items-start gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={resolutionSelections.includes(option)}
                    onChange={() => toggleResolutionSelection(option)}
                    disabled={resolutionSubmitting}
                  />
                  <span>{option}</span>
                </label>
              ))}

              <label className="flex items-start gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={isOtherSelected}
                  onChange={(event) => {
                    setIsOtherSelected(event.target.checked);
                    if (!event.target.checked) {
                      setCustomResolutionMessage('');
                    }
                  }}
                  disabled={resolutionSubmitting}
                />
                <span>Other (type your own message)</span>
              </label>

              {isOtherSelected && (
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-800"
                  rows={3}
                  placeholder="Write a custom message for the user"
                  value={customResolutionMessage}
                  onChange={(event) => setCustomResolutionMessage(event.target.value)}
                  disabled={resolutionSubmitting}
                />
              )}

              {resolutionError && (
                <p className="text-sm text-red-600">{resolutionError}</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeResolutionModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
                disabled={resolutionSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleResolutionSubmit}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white"
                disabled={resolutionSubmitting}
              >
                {resolutionSubmitting ? 'Saving...' : 'Send & Resolve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
