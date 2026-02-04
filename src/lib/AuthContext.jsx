import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authEvent, setAuthEvent] = useState(null);

  useEffect(() => {
    // Verificar sessão inicial
    checkUser();

    // Escutar mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth event:", event);
        setAuthEvent(event);

        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          setAuthError(null);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setIsLoadingAuth(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      setIsLoadingAuth(true);
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      setAuthError({
        type: 'check_failed',
        message: error.message
      });
    } finally {
      // Verifica se há tokens na URL (indica retorno de OAuth)
      // Suporta tanto Implicit Flow (hash) quanto PKCE (search param 'code')
      const isAuthRedirect = (window.location.hash && (
        window.location.hash.includes('access_token') ||
        window.location.hash.includes('refresh_token') ||
        window.location.hash.includes('error_description')
      )) || (window.location.search && (
        window.location.search.includes('code=') ||
        window.location.search.includes('error_description=')
      ));

      if (isAuthRedirect) {
        console.log('Auth redirect detected, waiting for Supabase to process session...');
      }

      if (!isAuthRedirect) {
        setIsLoadingAuth(false);
      }
    }
  };

  const signInWithEmail = async (email, password) => {
    console.log('[AuthContext] Attempting login with email:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AuthContext] Supabase login error:', error);
        throw error;
      }

      console.log('[AuthContext] Login successful:', data);
      return data;
    } catch (error) {
      console.error('[AuthContext] Login cleanup error:', error);
      setAuthError({
        type: 'login_failed',
        message: error.message,
        details: error
      });
      throw error;
    }
  };

  const signUpWithEmail = async (email, password, metadata = {}) => {
    console.log('[AuthContext] Attempting signup with email:', email);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) {
        console.error('[AuthContext] Supabase signup error:', error);
        throw error;
      }

      console.log('[AuthContext] Signup successful:', data);

      // Check if session is missing, which implies email confirmation is required
      if (data.user && !data.session) {
        console.log('[AuthContext] User created but no session. Email confirmation likely required.');
      }

      return data;
    } catch (error) {
      console.error('[AuthContext] Signup cleanup error:', error);
      setAuthError({
        type: 'signup_failed',
        message: error.message,
        details: error
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro no login com Google:', error);
      setAuthError({
        type: 'oauth_failed',
        message: error.message
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      authError,
      authEvent,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      logout,
      resetPassword,
      checkUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
