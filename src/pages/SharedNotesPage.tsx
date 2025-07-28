import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Share2, Users, Eye, Trash2, Calendar, User } from 'lucide-react';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

interface SharedEntry {
  id: string;
  title: string;
  synopsis: string;
  dateCreated: string;
  lastUpdated: string;
  sharedEntries: {
    id: string;
    permission: 'read' | 'edit';
    sharedAt: string;
    sharedWith: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatar?: string;
    };
  }[];
}

const MySharedNotesPage: React.FC = () => {
  const [sharedEntries, setSharedEntries] = useState<SharedEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMySharedEntries();
  }, []);

  const fetchMySharedEntries = async () => {
    try {
      const response = await api.get('/collaboration/my-shared-entries');
      setSharedEntries(response.data.entries);
    } catch (error) {
      console.error('Failed to fetch my shared entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShare = async (shareId: string, entryTitle: string) => {
    if (!window.confirm(`Remove sharing for "${entryTitle}"?`)) {
      return;
    }

    try {
      await api.delete(`/collaboration/share/${shareId}`);
      // Refresh the list
      fetchMySharedEntries();
      toast.success('Share removed successfully');
    } catch (error) {
      toast.error('Failed to remove share');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return <LoadingSpinner text="Loading your shared notes..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Shared Notes</h1>
        <p className="text-gray-600">
          {sharedEntries.length === 0 
            ? "You haven't shared any notes yet"
            : `You have shared ${sharedEntries.length} note${sharedEntries.length === 1 ? '' : 's'}`
          }
        </p>
      </div>

      {/* Empty State */}
      {sharedEntries.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Share2 className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No shared notes yet
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Start sharing your notes with others to collaborate and get feedback. Go to any note and click the "Share" button.
          </p>
          <Link
            to="/dashboard"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Eye size={18} />
            <span>View My Notes</span>
          </Link>
        </div>
      ) : (
        /* Shared Notes List */
        <div className="space-y-6">
          {sharedEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              {/* Entry Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {entry.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{entry.synopsis}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>Created {formatDate(entry.dateCreated)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users size={14} />
                      <span>Shared with {entry.sharedEntries.length} user{entry.sharedEntries.length === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                </div>
                <Link
                  to={`/entry/${entry.id}`}
                  className="btn-secondary flex items-center space-x-2 ml-4"
                >
                  <Eye size={16} />
                  <span>View</span>
                </Link>
              </div>

              {/* Shared With List */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Shared with:</h4>
                <div className="space-y-2">
                  {entry.sharedEntries.map((share) => (
                    <div
                      key={share.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {share.sharedWith.avatar ? (
                          <img
                            src={share.sharedWith.avatar}
                            alt={`${share.sharedWith.firstName} ${share.sharedWith.lastName}`}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {getInitials(share.sharedWith.firstName, share.sharedWith.lastName)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {share.sharedWith.firstName} {share.sharedWith.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{share.sharedWith.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          share.permission === 'edit' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {share.permission === 'edit' ? 'Can Edit' : 'Read Only'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(share.sharedAt)}
                        </span>
                        <button
                          onClick={() => handleRemoveShare(share.id, entry.title)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                          title="Remove share"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySharedNotesPage;