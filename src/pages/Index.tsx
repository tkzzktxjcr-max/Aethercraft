import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { OriginPackSelector } from '@/components/game/OriginPackSelector';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, FlaskConical, User, LogIn, AlertCircle } from 'lucide-react';
import { loginWithEmail, registerWithEmail } from '@/lib/auth';
import { showError, showSuccess } from '@/utils/toast';

export default function Index() {
  const { playerName, setPlayerName, initAuth } = useGameStore();
  const [step, setStep] = useState<'auth' | 'name' | 'packs'>('auth');
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleGuest = async () => {
    setIsLoading(true);
    setAuthError('');
    try {
      await initAuth();
      setStep('packs');
    } catch (e: any) {
      setAuthError(e?.message || 'Failed to start guest session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (playerName.trim()) setStep('packs');
  };

  const handleLogin = async () => {
    setAuthError('');
    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter both email and password');
      return;
    }
    setIsLoading(true);
    try {
      if (isRegister) {
        await registerWithEmail(email, password, playerName || 'Alchemist');
        showSuccess('Account created successfully!');
      } else {
        await loginWithEmail(email, password);
        showSuccess('Logged in successfully!');
      }
      await initAuth();
      setStep('packs');
    } catch (e: any) {
      setAuthError(e?.message || 'Authentication failed');
      showError(e?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6"
      style={{
        background: 'linear-gradient(135deg, hsl(260, 20%, 96%) 0%, hsl(280, 25%, 92%) 100%)',
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl opacity-20"
            style={{
              width: 180 + i * 40,
              height: 180 + i * 40,
              background:
                i % 3 === 0
                  ? 'hsl(270, 80%, 65%)'
                  : i % 3 === 1
                    ? 'hsl(195, 90%, 55%)'
                    : 'hsl(145, 75%, 45%)',
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 4) * 20}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, 20, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 10 + i * 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 1.5,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-200 mb-5">
            <FlaskConical className="w-8 h-8 text-violet-600" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-indigo-900 mb-4 tracking-tight">
            AetherCraft
          </h1>
          <p className="text-lg md:text-xl text-indigo-900/50 max-w-md mx-auto font-medium">
            Discover infinite combinations. Craft your world from pure essence.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="max-w-sm mx-auto"
            >
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-xl space-y-4">
                <h2 className="text-lg font-bold text-indigo-900 text-center">Welcome, Alchemist</h2>

                <Button
                  className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-semibold"
                  onClick={handleGuest}
                  disabled={isLoading}
                >
                  <User className="w-4 h-4 mr-2" />
                  {isLoading ? 'Loading...' : 'Play as Guest'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-indigo-100" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-indigo-900/50">or use a name</span>
                  </div>
                </div>

                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name..."
                  className="bg-white/60 border-indigo-100 h-11"
                  maxLength={20}
                  onKeyDown={(e) => e.key === 'Enter' && playerName.trim() && handleContinue()}
                />
                <Button
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                  disabled={!playerName.trim()}
                  onClick={handleContinue}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Continue
                </Button>

                <Button
                  variant="ghost"
                  className="w-full h-10 text-indigo-900/60 hover:text-indigo-900"
                  onClick={() => {
                    setShowLogin(!showLogin);
                    setAuthError('');
                  }}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {showLogin ? 'Hide login' : 'Sign In / Register'}
                </Button>

                {showLogin && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-3 pt-2"
                  >
                    {authError && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{authError}</span>
                      </div>
                    )}
                    <Input
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/60 border-indigo-100 h-10"
                      type="email"
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/60 border-indigo-100 h-10"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 h-10 border-indigo-200"
                        onClick={() => {
                          setIsRegister(!isRegister);
                          setAuthError('');
                        }}
                      >
                        {isRegister ? 'Switch to Login' : 'Switch to Register'}
                      </Button>
                      <Button 
                        className="flex-1 h-10 bg-violet-600" 
                        onClick={handleLogin}
                        disabled={isLoading}
                      >
                        {isLoading ? '...' : (isRegister ? 'Register' : 'Login')}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {step === 'packs' && (
            <motion.div
              key="packs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-center text-xl font-bold text-indigo-900 mb-8">
                Choose your Origin
              </h2>
              <OriginPackSelector />
              <button
                onClick={() => setStep('auth')}
                className="block mx-auto mt-8 text-sm text-indigo-900/40 hover:text-indigo-900 font-medium transition-colors"
              >
                ← Back to auth
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}