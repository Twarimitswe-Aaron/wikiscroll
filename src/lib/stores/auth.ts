import { writable } from 'svelte/store';

interface User {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    role: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
}

const isBrowser = typeof window !== 'undefined';

function createAuthStore() {
    let initialToken = null;
    let initialUser = null;

    if (isBrowser) {
        initialToken = localStorage.getItem('jwt_token');
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                initialUser = JSON.parse(userStr);
            } catch (e) {
                console.error('Failed to parse user from local storage');
            }
        }
    }

    const { subscribe, set, update } = writable<AuthState>({
        token: initialToken,
        user: initialUser,
        isAuthenticated: !!initialToken
    });

    return {
        subscribe,
        login: (token: string, user: User) => {
            if (isBrowser) {
                localStorage.setItem('jwt_token', token);
                localStorage.setItem('user', JSON.stringify(user));
            }
            set({ token, user, isAuthenticated: true });
        },
        logout: () => {
            if (isBrowser) {
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('user');
            }
            set({ token: null, user: null, isAuthenticated: false });
        },
        updateUser: (user: Partial<User>) => {
            update(state => {
                const newUser = state.user ? { ...state.user, ...user } : null;
                if (isBrowser && newUser) {
                    localStorage.setItem('user', JSON.stringify(newUser));
                }
                return { ...state, user: newUser as User };
            });
        }
    };
}

export const authStore = createAuthStore();
