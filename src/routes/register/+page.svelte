<script lang="ts">
    import { api } from '$lib/api/client';
    
    let username = $state('');
    let email = $state('');
    let password = $state('');
    let loading = $state(false);
    let error = $state('');
    let successMessage = $state('');

    async function handleRegister() {
        if (!username || !email || !password) {
            error = 'Please fill in all fields';
            return;
        }

        if (password.length < 5) {
            error = 'Password must be at least 5 characters long';
            return;
        }

        loading = true;
        error = '';
        successMessage = '';

        try {
            const response = await api.post<{ message: string }>('/auth/register', {
                username,
                email,
                password
            }, { requireAuth: false });

            successMessage = response.message || 'Registration successful. Please check your email to verify your account.';
            // Clear form
            username = '';
            email = '';
            password = '';
        } catch (err: unknown) {
            error = (err as Error).message || 'Failed to register. Please try again.';
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Create an account
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
                Already have an account?
                <a href="/login" class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                    Sign in here
                </a>
            </p>
        </div>
        
        <form class="mt-8 space-y-6" onsubmit={(e) => { e.preventDefault(); handleRegister(); }}>
            {#if error}
                <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                    <p class="text-sm text-red-700">{error}</p>
                </div>
            {/if}

            {#if successMessage}
                <div class="bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
                    <p class="text-sm text-green-700">{successMessage}</p>
                </div>
            {/if}

            <div class="rounded-md shadow-sm space-y-4">
                <div>
                    <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input id="username" name="username" type="text" required bind:value={username}
                        class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="coolhistorian">
                </div>
                <div>
                    <label for="email-address" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                    <input id="email-address" name="email" type="email" autocomplete="email" required bind:value={email}
                        class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="you@example.com">
                </div>
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input id="password" name="password" type="password" autocomplete="new-password" required bind:value={password}
                        class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Minimum 5 characters">
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
                        Creating account...
                    {:else}
                        Create Account
                    {/if}
                </button>
            </div>
        </form>
    </div>
</div>
