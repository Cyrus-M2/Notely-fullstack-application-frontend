import React, { useState, useEffect } from "react";
import { RotateCcw, Trash2, Calendar, AlertCircle } from "lucide-react";
import type { Entry } from "../types";
import api from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const TrashPage: React.FC = () => {
  const [deletedEntries, setDeletedEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeletedEntries();
  }, []);

  const fetchDeletedEntries = async () => {
    try {
      const response = await api.get("/entries/trash");
      setDeletedEntries(response.data.entries);
    } catch (error) {
      console.error("Failed to fetch deleted entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (entryId: string) => {
    try {
      await api.patch(`/entry/restore/${entryId}`);
      setDeletedEntries(deletedEntries.filter((entry) => entry.id !== entryId));
      toast.success("Note restored successfully");
    } catch (error) {
      toast.error("Failed to restore note");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (loading) {
    return <LoadingSpinner text="Loading trash..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trash</h1>
        <p className="text-gray-600">
          {deletedEntries.length === 0
            ? "Nothing to show here"
            : `${deletedEntries.length} deleted note${
                deletedEntries.length === 1 ? "" : "s"
              }`}
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Items in trash will be permanently deleted after 30 days
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              You can restore any note from here back to your active notes.
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {deletedEntries.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trash2 className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Trash is empty
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            When you delete notes, they'll appear here. You can restore them or
            they'll be permanently deleted after 30 days.
          </p>
        </div>
      ) : (
        /* Deleted Notes Grid */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {deletedEntries.map((entry) => (
            <div
              key={entry.id}
              className="card p-6 opacity-75 hover:opacity-100 transition-opacity duration-200"
            >
              {/* Entry Header */}
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {entry.title}
                </h3>
                <button
                  onClick={() => handleRestore(entry.id)}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200 ml-2"
                  title="Restore note"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              {/* Synopsis */}
              <p className="text-gray-600 mb-4 line-clamp-3">
                {truncateText(entry.synopsis, 120)}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>Deleted {formatDate(entry.lastUpdated)}</span>
                </div>
                <button
                  onClick={() => handleRestore(entry.id)}
                  className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
                >
                  Restore
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrashPage;
