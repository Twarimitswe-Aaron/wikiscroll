<script lang="ts">
    import { api } from '$lib/api/client';
    import { authStore } from '$lib/stores/auth';
    
    let email = $state('');
    let password = $state('');
    let loading = $state(false);
    let error = $state('');

    async function handleLogin() {
        if (!email || !password) {
            error = 'Please fill in all fields';
            return;
        }

        loading = true;
        error = '';

        try {
            const response = await api.post<{ token: string, user: any }>('/auth/authenticate', {
                email,
                password
            }, { requireAuth: false });

            authStore.login(response.token, response.user);
            window.location.href = '/';
        } catch (err: unknown) {
            error = (err as Error).message || 'Failed to login. Please check your credentials.';
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Welcome back
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
                Or
                <a href="/register" class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                    create a new account
                </a>
            </p>
        </div>
        
        <form class="mt-8 space-y-6" onsubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            {#if error}
                <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            {/if}

            <div class="rounded-md shadow-sm space-y-4">
                <div>
                    <label for="email-address" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                    <input id="email-address" name="email" type="email" autocomplete="email" required bind:value={email}
                        class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="you@example.com">
                </div>
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input id="password" name="password" type="password" autocomplete="current-password" required bind:value={password}
                        class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="••••••••">
                </div>
            </div>

            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                    <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                        Remember me
                    </label>
                </div>

                <div class="text-sm">
                    <a href="/forgot-password" class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                        Forgot your password?
                    </a>
                </div>
            </div>

            <div>
                <button type="submit" disabled={loading}
                    class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                    {#if loading}
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                    {:else}
                        Sign in
                    {/if}
                </button>
            </div>
        </form>
    </div>
</div>
