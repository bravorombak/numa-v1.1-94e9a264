import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface AuthStore {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: string[];
  isAdmin: boolean;
  isEditor: boolean;
  loading: boolean;
  initialized: boolean;
  
  initialize: () => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setRoles: (roles: string[]) => void;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  roles: [],
  isAdmin: false,
  isEditor: false,
  loading: true,
  initialized: false,

  initialize: () => {
    // Set up auth state listener
    supabase.auth.onAuthStateChange((event, session) => {
      set({ session, user: session?.user ?? null });
      
      // Fetch profile and roles when session exists
      if (session?.user) {
        setTimeout(() => {
          const fetchUserData = async () => {
            try {
              // Fetch profile
              const { data: profileData } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .eq('id', session.user.id)
                .maybeSingle();
              
              // Fetch roles from user_roles table
              const { data: rolesData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id);
              
              const roles = rolesData ? rolesData.map(r => r.role) : [];
              const isAdmin = roles.includes('admin');
              const isEditor = roles.includes('editor');
              
              if (profileData) {
                set({ 
                  profile: profileData as Profile,
                  roles,
                  isAdmin,
                  isEditor,
                });
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
            } finally {
              set({ loading: false });
            }
          };
          
          fetchUserData();
        }, 0);
      } else {
        set({ profile: null, roles: [], isAdmin: false, isEditor: false, loading: false });
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null });
      
      if (session?.user) {
        setTimeout(() => {
          const fetchUserData = async () => {
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .eq('id', session.user.id)
                .maybeSingle();
              
              // Fetch roles from user_roles table
              const { data: rolesData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id);
              
              const roles = rolesData ? rolesData.map(r => r.role) : [];
              const isAdmin = roles.includes('admin');
              const isEditor = roles.includes('editor');
              
              if (profileData) {
                set({ 
                  profile: profileData as Profile,
                  roles,
                  isAdmin,
                  isEditor,
                });
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
            } finally {
              set({ loading: false, initialized: true });
            }
          };
          
          fetchUserData();
        }, 0);
      } else {
        set({ loading: false, initialized: true });
      }
    });
  },

  setSession: (session) => set({ session, user: session?.user ?? null }),
  
  setProfile: (profile) => set({ profile }),
  
  setRoles: (roles) => set({ roles }),
  
  logout: async () => {
    await supabase.auth.signOut();
    set({ 
      session: null, 
      user: null, 
      profile: null, 
      roles: [],
      isAdmin: false,
      isEditor: false,
      loading: false 
    });
  },
  
  hasRole: (role: 'admin' | 'editor' | 'user') => {
    return get().roles.includes(role);
  },
}));
