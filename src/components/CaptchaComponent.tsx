import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import api from '../utils/api';

interface CaptchaComponentProps {
  onCaptchaChange: (id: string, text: string) => void;
  error?: string;
}

const CaptchaComponent: React.FC<CaptchaComponentProps> = ({ onCaptchaChange, error }) => {
  const [captchaId, setCaptchaId] = useState<string>('');
  const [captchaImage, setCaptchaImage] = useState<string>('');
  const [captchaText, setCaptchaText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const generateCaptcha = async () => {
    setLoading(true);
    setCaptchaText('');
    try {
      console.log('Generating captcha from:', `${import.meta.env.VITE_API_URL || 'https://notely-fullstack-application-backend.onrender.com/api'}/captcha/generate`);
      
      const response = await api.get('/captcha/generate');
      console.log('Generated captcha:', response.data.id);
      setCaptchaId(response.data.id);
      setCaptchaImage(response.data.image);
      onCaptchaChange(response.data.id, '');
    } catch (error) {
      console.error('Failed to generate captcha:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    console.log('Captcha text changed:', text);
    setCaptchaText(text);
    onCaptchaChange(captchaId, text);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Confirm you are robot *
      </label>
      
      <div className="flex items-center space-x-3">
        <div className="relative">
          {loading ? (
            <div className="w-[150px] h-[50px] bg-gray-100 rounded border flex items-center justify-center">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <img
              src={captchaImage}
              alt="Captcha"
              className="w-[150px] h-[50px] border rounded bg-gray-50"
            />
          )}
        </div>
        
        <button
          type="button"
          onClick={generateCaptcha}
          disabled={loading}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
          title="Generate new captcha"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      
      <input
        type="text"
        value={captchaText}
        onChange={handleTextChange}
        className={`input-field ${error ? 'border-red-500' : ''}`}
        placeholder="Enter the text shown above"
        maxLength={5}
        autoComplete="off"
      />
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      <p className="text-xs text-gray-500">
        Enter the 5 characters shown in the image above
      </p>
    </div>
  );
};

export default CaptchaComponent;