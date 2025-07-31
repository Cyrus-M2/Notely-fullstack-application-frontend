import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, User, Share2, Users, Eye, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Entry } from '../types';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

interface ShareDetails {
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
}

const EntryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showShareDetails, setShowShareDetails] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'read' | 'edit'>('read');
  const [isSharing, setIsSharing] = useState(false);
  const [shareDetails, setShareDetails] = useState<ShareDetails[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEntry(id);
    }
  }, [id]);

  const fetchEntry = async (entryId: string) => {
    try {
      const response = await api.get(`/entry/${entryId}`);
      setEntry(response.data.entry);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Note not found');
        navigate('/dashboard');
      } else {
        toast.error('Failed to load note');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchShareDetails = async () => {
    if (!entry) return;
    
    setLoadingShares(true);
    try {
      const response = await api.get(`/collaboration/entry/${entry.id}/shares`);
      setShareDetails(response.data.shares);
    } catch (error) {
      console.error('Failed to fetch share details:', error);
    } finally {
      setLoadingShares(false);
    }
  };

  const handleDelete = async () => {
    if (!entry || !window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await api.delete(`/entry/${entry.id}`);
      toast.success('Note moved to trash');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry || !shareEmail.trim()) return;

    setIsSharing(true);
    try {
      await api.post('/collaboration/share', {
        entryId: entry.id,
        shareWithEmail: shareEmail.trim(),
        permission: sharePermission
      });
      toast.success('Note shared successfully!');
      setShowShareModal(false);
      setShareEmail('');
      // Refresh share details if modal is open
      if (showShareDetails) {
        fetchShareDetails();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to share note');
    } finally {
      setIsSharing(false);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    if (!window.confirm('Remove this share?')) return;

    try {
      await api.delete(`/collaboration/share/${shareId}`);
      toast.success('Share removed successfully');
      fetchShareDetails(); // Refresh the list
    } catch (error) {
      toast.error('Failed to remove share');
    }
  };

  const handleShowShareDetails = () => {
    setShowShareDetails(true);
    fetchShareDetails();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <LoadingSpinner text="Loading note..." />;
  }

  if (!entry) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Note not found</h2>
        <p className="text-gray-600 mb-6">
          The note you're looking for doesn't exist or has been deleted.
        </p>
        <Link to="/dashboard" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">{entry.title}</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 break-words">{entry.synopsis}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:flex-shrink-0">
          <button
            onClick={handleShowShareDetails}
            className="btn-secondary flex items-center justify-center space-x-2 text-sm"
          >
            <Eye size={16} />
            <span>View Shares</span>
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="btn-secondary flex items-center justify-center space-x-2 text-sm"
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>
          <Link
            to={`/entry/${entry.id}/edit`}
            className="btn-secondary flex items-center justify-center space-x-2 text-sm"
          >
            <Edit size={16} />
            <span>Edit</span>
          </Link>
          <button
            onClick={handleDelete}
            className="btn-danger flex items-center justify-center space-x-2 text-sm"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Meta Information */}
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <User size={14} className="sm:w-4 sm:h-4" />
            <span>By {user?.firstName} {user?.lastName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar size={14} className="sm:w-4 sm:h-4" />
            <span>Created {formatDate(entry.dateCreated)}</span>
          </div>
          {entry.lastUpdated !== entry.dateCreated && (
            <div className="flex items-center space-x-2">
              <Calendar size={14} className="sm:w-4 sm:h-4" />
              <span>Updated {formatDate(entry.lastUpdated)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Share Note</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleShare} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Share with (email)
                </label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="input-field text-sm"
                  placeholder="Enter email address..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Permission
                </label>
                <select
                  value={sharePermission}
                  onChange={(e) => setSharePermission(e.target.value as 'read' | 'edit')}
                  className="input-field text-sm"
                >
                  <option value="read">Read Only</option>
                  <option value="edit">Can Edit</option>
                </select>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSharing}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isSharing ? 'Sharing...' : 'Share Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Details Modal */}
      {showShareDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Sharing Details</h3>
              <button
                onClick={() => setShowShareDetails(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            {loadingShares ? (
              <div className="text-center py-8">
                <div className="loading-spinner mx-auto mb-2"></div>
                <p className="text-gray-600">Loading share details...</p>
              </div>
            ) : shareDetails.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Not shared yet</h4>
                <p className="text-sm sm:text-base text-gray-600 mb-4">This note hasn't been shared with anyone.</p>
                <button
                  onClick={() => {
                    setShowShareDetails(false);
                    setShowShareModal(true);
                  }}
                  className="btn-primary text-sm"
                >
                  Share Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  This note is shared with {shareDetails.length} user{shareDetails.length === 1 ? '' : 's'}:
                </p>
                {shareDetails.map((share) => (
                  <div
                    key={share.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg space-y-3 sm:space-y-0"
                  >
                    <div className="flex items-center space-x-3">
                      {share.sharedWith.avatar ? (
                        <img
                          src={share.sharedWith.avatar}
                          alt={`${share.sharedWith.firstName} ${share.sharedWith.lastName}`}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0">
                          {getInitials(share.sharedWith.firstName, share.sharedWith.lastName)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base break-words">
                          {share.sharedWith.firstName} {share.sharedWith.lastName}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 break-all">{share.sharedWith.email}</p>
                        <p className="text-xs text-gray-500">
                          Shared {new Date(share.sharedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-3 sm:flex-shrink-0">
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        share.permission === 'edit' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {share.permission === 'edit' ? 'Can Edit' : 'Read Only'}
                      </span>
                      <button
                        onClick={() => handleRemoveShare(share.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                        title="Remove share"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowShareDetails(false);
                      setShowShareModal(true);
                    }}
                    className="btn-primary w-full text-sm"
                  >
                    Share with Someone Else
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
        <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 mt-6 sm:mt-8 first:mt-0 break-words">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4 mt-6 sm:mt-8 break-words">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-700 mb-2 sm:mb-3 mt-4 sm:mt-6 break-words">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-3 sm:mb-4 break-words">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-3 sm:mb-4 space-y-1 text-sm sm:text-base">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-3 sm:mb-4 space-y-1 text-sm sm:text-base">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-600 break-words">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-3 sm:pl-4 py-2 mb-3 sm:mb-4 bg-gray-50 italic text-gray-700 text-sm sm:text-base break-words">
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono text-gray-800 break-all">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-gray-100 p-2 sm:p-4 rounded-lg mb-3 sm:mb-4 overflow-x-auto text-xs sm:text-sm">
                  {children}
                </pre>
              ),
            }}
          >
            {entry.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 space-y-3 sm:space-y-0">
        <Link
          to="/dashboard"
          className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors duration-200"
        >
          ← Back to Dashboard
        </Link>
        <div className="flex items-center space-x-3">
          <Link
            to={`/entry/${entry.id}/edit`}
            className="btn-secondary text-sm"
          >
            Edit Note
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EntryDetailPage;