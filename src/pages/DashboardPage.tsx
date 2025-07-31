import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Calendar, Edit, Trash2, Eye, BarChart3, Sparkles, Share2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import type { Entry } from '../types';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await api.get('/entries');
      setEntries(response.data.entries);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await api.delete(`/entry/${entryId}`);
      setEntries(entries.filter(entry => entry.id !== entryId));
      toast.success('Note moved to trash');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return <LoadingSpinner text="Loading your notes..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600">
            {entries.length === 0 
              ? "You don't have any notes yet. Create your first note to get started!"
              : `You have ${entries.length} note${entries.length === 1 ? '' : 's'}`
            }
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0">
          <Link
            to="/analytics"
            className="btn-secondary flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <BarChart3 size={18} />
            <span>Analytics</span>
          </Link>
          <Link
            to="/ai-assistant"
            className="btn-secondary flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <Sparkles size={18} />
            <span>AI Assistant</span>
          </Link>
          <Link
            to="/new-entry"
            className="btn-primary flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <Plus size={20} />
            <span>New Note</span>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      {entries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Notes</p>
                <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
              </div>
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">
                  {entries.filter(entry => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(entry.dateCreated) > weekAgo;
                  }).length}
                </p>
              </div>
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Features</p>
                <p className="text-sm font-medium text-blue-600">Available</p>
              </div>
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sharing</p>
                <p className="text-sm font-medium text-blue-600">Enabled</p>
              </div>
              <Share2 className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}
      {/* Empty State */}
      {entries.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No notes yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start capturing your thoughts and ideas. Create your first note to begin your journey with Notely.
          </p>
          <Link
            to="/new-entry"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create Your First Note</span>
          </Link>
        </div>
      ) : (
        /* Notes Grid */
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="card card-hover p-4 sm:p-6 transition-all duration-200"
            >
              {/* Entry Header */}
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 flex-1 pr-2">
                  {entry.title}
                </h3>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Link
                    to={`/entry/${entry.id}`}
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="View note"
                  >
                    <Eye size={14} className="sm:w-4 sm:h-4" />
                  </Link>
                  <Link
                    to={`/entry/${entry.id}/edit`}
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="Edit note"
                  >
                    <Edit size={14} className="sm:w-4 sm:h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="Delete note"
                  >
                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>

              {/* Synopsis */}
              <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-3">
                {truncateText(entry.synopsis, 120)}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span className="text-xs sm:text-sm">{formatDate(entry.lastUpdated)}</span>
                </div>
                <Link
                  to={`/entry/${entry.id}`}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 text-xs sm:text-sm"
                >
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;