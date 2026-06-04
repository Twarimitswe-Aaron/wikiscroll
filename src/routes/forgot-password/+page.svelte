<script lang="ts">
    import { api } from '$lib/api/client';
    
    let email = $state('');
    let loading = $state(false);
    let error = $state('');
    let successMessage = $state('');

    async function handleForgotPassword() {
        if (!email) {
            error = 'Please enter your email address';
            return;
        }

        loading = true;
        error = '';
        successMessage = '';

        try {
            await api.post('/auth/forgot-password', { email }, { requireAuth: false });
            // API returns success even if email doesn't exist for security
            successMessage = 'If an account exists with that email, a password reset link has been sent.';
            email = '';
        } catch (err: unknown) {
            error = (err as Error).message || 'An error occurred. Please try again.';
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Reset your password
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
            </p>
        </div>
        
        <form class="mt-8 space-y-6" onsubmit={(e) => { e.preventDefault(); handleForgotPassword(); }}>
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
                    <label for="email-address" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                    <input id="email-address" name="email" type="email" autocomplete="email" required bind:value={email}
                        class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="you@example.com">
                </div>
            </div>

            <div class="flex items-center justify-between">
                <div class="text-sm">
                    <a href="/login" class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                        Back to sign in
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
                        Sending link...
                    {:else}
                        Send reset link
                    {/if}
                </button>
            </div>
        </form>
    </div>
</div>
