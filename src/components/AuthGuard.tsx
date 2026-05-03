import { useEffect, useState, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  role: string;
  tenant_id?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  tenantId: string | null;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  tenantId: null,
  isAuthenticated: false,
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function decodeToken(token: string): AuthUser | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    // Check expiry
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthContextType>({
    user: null,
    token: null,
    tenantId: null,
    isAuthenticated: false,
    logout: () => {},
  });
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin', { replace: true });
      return;
    }

    const user = decodeToken(token);
    if (!user) {
      localStorage.removeItem('token');
      navigate('/admin', { replace: true });
      return;
    }

    // Check role requirement
    if (requiredRole) {
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!allowedRoles.includes(user.role)) {
        navigate('/admin', { replace: true });
        return;
      }
    }

    setAuthState({
      user,
      token,
      tenantId: user.tenant_id || null,
      isAuthenticated: true,
      logout: () => {
        localStorage.removeItem('token');
        navigate('/admin', { replace: true });
      },
    });
    setChecked(true);
  }, [navigate, requiredRole]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400 font-medium">Authenticating...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}
