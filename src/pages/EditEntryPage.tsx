import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Save, ArrowLeft, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Entry, UpdateEntryData } from "../types";
import api from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const EditEntryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateEntryData>();

  const watchedContent = watch("content", "");

  useEffect(() => {
    if (id) {
      fetchEntry(id);
    }
  }, [id]);

  const fetchEntry = async (entryId: string) => {
    try {
      const response = await api.get(`/entry/${entryId}`);
      const entryData = response.data.entry;
      setEntry(entryData);

      // Pre-populate form
      setValue("title", entryData.title);
      setValue("synopsis", entryData.synopsis);
      setValue("content", entryData.content);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error("Note not found");
        navigate("/dashboard");
      } else {
        toast.error("Failed to load note");
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UpdateEntryData) => {
    if (!entry) return;

    setIsSubmitting(true);
    try {
      await api.patch(`/entry/${entry.id}`, data);
      toast.success("Note updated successfully!");
      navigate(`/entry/${entry.id}`);
    } catch (error) {
      toast.error("Failed to update note");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading note..." />;
  }

  if (!entry) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Note not found
        </h2>
        <p className="text-gray-600 mb-6">
          The note you're trying to edit doesn't exist or has been deleted.
        </p>
        <button onClick={() => navigate("/dashboard")} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/entry/${entry.id}`)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Note</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Eye size={18} />
            <span>{showPreview ? "Edit" : "Preview"}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Title *
          </label>
          <input
            {...register("title", {
              required: "Title is required",
              minLength: {
                value: 3,
                message: "Title must be at least 3 characters",
              },
            })}
            type="text"
            className="input-field text-lg font-medium"
            placeholder="Enter your note title..."
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Synopsis */}
        <div>
          <label
            htmlFor="synopsis"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Synopsis *
          </label>
          <textarea
            {...register("synopsis", {
              required: "Synopsis is required",
              minLength: {
                value: 10,
                message: "Synopsis must be at least 10 characters",
              },
            })}
            rows={3}
            className="input-field resize-none"
            placeholder="Brief summary of your note..."
          />
          {errors.synopsis && (
            <p className="mt-1 text-sm text-red-600">
              {errors.synopsis.message}
            </p>
          )}
        </div>

        {/* Content */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Content *{" "}
            {!showPreview && (
              <span className="text-gray-500">(Markdown supported)</span>
            )}
          </label>

          {showPreview ? (
            <div className="min-h-[400px] p-4 border border-gray-300 rounded-lg bg-gray-50">
              <div className="prose max-w-none">
                <ReactMarkdown>
                  {watchedContent || "Nothing to preview yet..."}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <textarea
              {...register("content", {
                required: "Content is required",
                minLength: {
                  value: 20,
                  message: "Content must be at least 20 characters",
                },
              })}
              rows={15}
              className="input-field resize-none font-mono text-sm"
              placeholder="Write your note content here..."
            />
          )}
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">
              {errors.content.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(`/entry/${entry.id}`)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="loading-spinner"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Update Note</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEntryPage;
