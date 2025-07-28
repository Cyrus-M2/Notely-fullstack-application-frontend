import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Sparkles, Wand2, Search, Tag, ArrowRight, Plus, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

interface EnhanceTextForm {
  text: string;
  type: 'grammar' | 'summarize' | 'expand';
}

interface TagSuggestionForm {
  content: string;
}

interface SmartSearchForm {
  query: string;
}

interface GenerateNoteForm {
  topic: string;
  type: 'informative' | 'creative' | 'technical' | 'personal';
  length: 'short' | 'medium' | 'long';
}

const AIAssistantPage: React.FC = () => {
  const navigate = useNavigate();
  const [enhancedText, setEnhancedText] = useState<string>('');
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [contentSuggestions, setContentSuggestions] = useState<string[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  const {
    register: registerEnhance,
    handleSubmit: handleEnhanceSubmit,
    formState: { errors: enhanceErrors },
  } = useForm<EnhanceTextForm>();

  const {
    register: registerTags,
    handleSubmit: handleTagsSubmit,
    formState: { errors: tagsErrors },
  } = useForm<TagSuggestionForm>();

  const {
    register: registerSearch,
    handleSubmit: handleSearchSubmit,
    formState: { errors: searchErrors },
  } = useForm<SmartSearchForm>();

  const {
    register: registerGenerate,
    handleSubmit: handleGenerateSubmit,
    watch: watchGenerate,
    formState: { errors: generateErrors },
  } = useForm<GenerateNoteForm>();

  const watchedTopic = watchGenerate('topic', '');

  const onEnhanceSubmit = async (data: EnhanceTextForm) => {
    setIsEnhancing(true);
    try {
      const response = await api.post('/ai/enhance-text', data);
      setEnhancedText(response.data.enhancedText);
      toast.success('Text enhanced successfully!');
    } catch (error) {
      toast.error('Failed to enhance text');
    } finally {
      setIsEnhancing(false);
    }
  };

  const onTagsSubmit = async (data: TagSuggestionForm) => {
    setIsGeneratingTags(true);
    try {
      const response = await api.post('/ai/suggest-tags', data);
      setTagSuggestions(response.data.suggestions);
      toast.success('Tag suggestions generated!');
    } catch (error) {
      toast.error('Failed to generate tag suggestions');
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const onSearchSubmit = async (data: SmartSearchForm) => {
    setIsSearching(true);
    try {
      const response = await api.get(`/ai/smart-search?query=${encodeURIComponent(data.query)}`);
      setSearchResults(response.data.entries);
      toast.success(`Found ${response.data.entries.length} relevant notes`);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const onGenerateSubmit = async (data: GenerateNoteForm) => {
    setIsGeneratingNote(true);
    try {
      const response = await api.post('/ai/generate-note', data);
      toast.success('AI note generated successfully!');
      navigate(`/entry/${response.data.entry.id}`);
    } catch (error) {
      toast.error('Failed to generate note');
    } finally {
      setIsGeneratingNote(false);
    }
  };

  const generateContentSuggestions = async () => {
    if (!watchedTopic.trim()) {
      toast.error('Please enter a topic first');
      return;
    }

    setIsGeneratingSuggestions(true);
    try {
      const response = await api.post('/ai/content-suggestions', { topic: watchedTopic });
      setContentSuggestions(response.data.suggestions);
      toast.success('Content suggestions generated!');
    } catch (error) {
      toast.error('Failed to generate suggestions');
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Writing Assistant</h1>
        <p className="text-gray-600">Enhance your writing with AI-powered tools</p>
      </div>

      {/* AI Note Generation */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">AI Note Generation</h2>
        </div>
        
        <form onSubmit={handleGenerateSubmit(onGenerateSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic *
              </label>
              <input
                {...registerGenerate('topic', {
                  required: 'Topic is required',
                  minLength: { value: 3, message: 'Topic must be at least 3 characters' }
                })}
                type="text"
                className="input-field"
                placeholder="e.g., Machine Learning, Cooking Tips, Project Management..."
              />
              {generateErrors.topic && (
                <p className="mt-1 text-sm text-red-600">{generateErrors.topic.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note Type *
              </label>
              <select
                {...registerGenerate('type', { required: 'Please select note type' })}
                className="input-field"
              >
                <option value="">Select type...</option>
                <option value="informative">Informative Guide</option>
                <option value="creative">Creative Exploration</option>
                <option value="technical">Technical Documentation</option>
                <option value="personal">Personal Reflection</option>
              </select>
              {generateErrors.type && (
                <p className="mt-1 text-sm text-red-600">{generateErrors.type.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Length *
              </label>
              <select
                {...registerGenerate('length', { required: 'Please select length' })}
                className="input-field"
              >
                <option value="">Select length...</option>
                <option value="short">Short (~200 words)</option>
                <option value="medium">Medium (~500 words)</option>
                <option value="long">Long (~800+ words)</option>
              </select>
              {generateErrors.length && (
                <p className="mt-1 text-sm text-red-600">{generateErrors.length.message}</p>
              )}
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={generateContentSuggestions}
                disabled={isGeneratingSuggestions || !watchedTopic.trim()}
                className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isGeneratingSuggestions ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Getting Ideas...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Get Content Ideas</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isGeneratingNote}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isGeneratingNote ? (
              <>
                <div className="loading-spinner"></div>
                <span>Generating Note...</span>
              </>
            ) : (
              <>
                <Plus size={18} />
                <span>Generate AI Note</span>
              </>
            )}
          </button>
        </form>

        {contentSuggestions.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-3">Content Ideas for "{watchedTopic}":</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {contentSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-2 bg-white rounded border border-blue-200 text-sm text-blue-800"
                >
                  {suggestion}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Text Enhancement */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Wand2 className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Text Enhancement</h2>
          </div>
          
          <form onSubmit={handleEnhanceSubmit(onEnhanceSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text to enhance
              </label>
              <textarea
                {...registerEnhance('text', {
                  required: 'Text is required',
                  minLength: { value: 10, message: 'Text must be at least 10 characters' }
                })}
                rows={4}
                className="input-field resize-none"
                placeholder="Enter text you want to improve..."
              />
              {enhanceErrors.text && (
                <p className="mt-1 text-sm text-red-600">{enhanceErrors.text.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enhancement type
              </label>
              <select
                {...registerEnhance('type', { required: 'Please select enhancement type' })}
                className="input-field"
              >
                <option value="">Select type...</option>
                <option value="grammar">Fix Grammar</option>
                <option value="summarize">Summarize</option>
                <option value="expand">Expand Content</option>
              </select>
              {enhanceErrors.type && (
                <p className="mt-1 text-sm text-red-600">{enhanceErrors.type.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isEnhancing}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isEnhancing ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Enhancing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Enhance Text</span>
                </>
              )}
            </button>
          </form>

          {enhancedText && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Enhanced Text:</h3>
              <p className="text-green-800">{enhancedText}</p>
            </div>
          )}
        </div>

        {/* Tag Suggestions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Tag className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Smart Tag Suggestions</h2>
          </div>
          
          <form onSubmit={handleTagsSubmit(onTagsSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note content
              </label>
              <textarea
                {...registerTags('content', {
                  required: 'Content is required',
                  minLength: { value: 20, message: 'Content must be at least 20 characters' }
                })}
                rows={6}
                className="input-field resize-none"
                placeholder="Paste your note content here to get tag suggestions..."
              />
              {tagsErrors.content && (
                <p className="mt-1 text-sm text-red-600">{tagsErrors.content.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isGeneratingTags}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isGeneratingTags ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Tag size={18} />
                  <span>Generate Tags</span>
                </>
              )}
            </button>
          </form>

          {tagSuggestions.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">Suggested Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {tagSuggestions.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Smart Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Search className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Smart Search</h2>
        </div>
        
        <form onSubmit={handleSearchSubmit(onSearchSubmit)} className="mb-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                {...registerSearch('query', {
                  required: 'Search query is required',
                  minLength: { value: 3, message: 'Query must be at least 3 characters' }
                })}
                type="text"
                className="input-field"
                placeholder="Search your notes with natural language..."
              />
              {searchErrors.query && (
                <p className="mt-1 text-sm text-red-600">{searchErrors.query.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSearching ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search size={18} />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
        </form>

        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Search Results ({searchResults.length}):</h3>
            {searchResults.map((entry) => (
              <div key={entry.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{entry.title}</h4>
                    <p className="text-gray-600 text-sm mb-2">{entry.synopsis}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Relevance: {entry.relevanceScore}/10</span>
                      <span>Updated: {new Date(entry.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 ml-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Features Info */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">AI Note Generation</p>
            <p className="text-sm text-gray-600">Generate complete notes on any topic automatically</p>
          </div>
          <div className="text-center">
            <Wand2 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Text Enhancement</p>
            <p className="text-sm text-gray-600">Improve grammar, summarize, or expand your content</p>
          </div>
          <div className="text-center">
            <Tag className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Smart Tags</p>
            <p className="text-sm text-gray-600">Get intelligent tag suggestions for better organization</p>
          </div>
          <div className="text-center">
            <Search className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Smart Search</p>
            <p className="text-sm text-gray-600">Find notes using natural language queries</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;