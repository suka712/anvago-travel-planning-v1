import { useState } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, register } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isLoginMode ? 'Login' : 'Sign Up'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLoginMode && (
          <Input
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        )}
        
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        {error && (
          <div className="p-3 bg-red-100 border-2 border-red-500 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" isLoading={isLoading}>
          {isLoginMode ? 'Login' : 'Sign Up'}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-sm text-gray-600 hover:text-black"
          >
            {isLoginMode ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </div>

        <div className="pt-4 border-t-2 border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-3">Or continue with</p>
          <div className="space-y-2">
            <Button variant="secondary" className="w-full" type="button">
              🔵 Continue with Google
            </Button>
            <Button variant="secondary" className="w-full" type="button">
              📘 Continue with Facebook
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

