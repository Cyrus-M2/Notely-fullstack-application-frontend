import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Save, ArrowLeft, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { CreateEntryData } from "../types";
import api from "../utils/api";
import toast from "react-hot-toast";

const NewEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateEntryData>();

  const watchedContent = watch("content", "");

  const onSubmit = async (data: CreateEntryData) => {
    setIsLoading(true);
    try {
      const response = await api.post("/entries", data);
      toast.success("Note created successfully!");
      navigate(`/entry/${response.data.entry.id}`);
    } catch (error) {
      toast.error("Failed to create note");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Create New Note</h1>
        </div>
        <div className="flex items-center space-x-3 lg:flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="btn-secondary flex items-center space-x-2 text-sm"
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
            className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
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
            className="input-field text-base sm:text-lg font-medium"
            placeholder="Enter your note title..."
          />
          {errors.title && (
            <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Synopsis */}
        <div>
          <label
            htmlFor="synopsis"
            className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
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
            rows={2}
            className="input-field resize-none text-sm sm:text-base"
            placeholder="Brief summary of your note..."
          />
          {errors.synopsis && (
            <p className="mt-1 text-xs sm:text-sm text-red-600">
              {errors.synopsis.message}
            </p>
          )}
        </div>

        {/* Content */}
        <div>
          <label
            htmlFor="content"
            className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
          >
            Content *{" "}
            {!showPreview && (
              <span className="text-gray-500">(Markdown supported)</span>
            )}
          </label>

          {showPreview ? (
            <div className="min-h-[300px] sm:min-h-[400px] p-3 sm:p-4 border border-gray-300 rounded-lg bg-gray-50 overflow-auto">
              <div className="prose prose-sm sm:prose-base max-w-none">
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
              rows={12}
              className="input-field resize-none font-mono text-xs sm:text-sm"
              placeholder="Write your note content here... You can use Markdown formatting:

 # Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*

- Bullet point
- Another point

1. Numbered list
2. Another item

> Blockquote

`code snippet`

```
code block
```"
            />
          )}
          {errors.content && (
            <p className="mt-1 text-xs sm:text-sm text-red-600">
              {errors.content.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 sm:pt-6 border-t border-gray-200 space-y-3 sm:space-y-0">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="btn-secondary text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Create Note</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewEntryPage;
