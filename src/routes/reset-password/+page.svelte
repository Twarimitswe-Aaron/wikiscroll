<script lang="ts">
    import { api } from '$lib/api/client';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';

    let token = $state('');
    let newPassword = $state('');
    let loading = $state(false);
    let verifying = $state(true);
    let error = $state('');
    let tokenError = $state('');
    let successMessage = $state('');

    onMount(async () => {
        token = $page.url.searchParams.get('token') || '';
        
        if (!token) {
            tokenError = 'Invalid or missing password reset token.';
            verifying = false;
            return;
        }

        try {
            // Verify token is valid
            await api.get(`/auth/verify-reset-token?token=${encodeURIComponent(token)}`, { requireAuth: false });
            verifying = false;
        } catch (err: unknown) {
            tokenError = (err as Error).message || 'This password reset link is invalid or has expired.';
            verifying = false;
        }
    });

    async function handleResetPassword() {
        if (!newPassword || newPassword.length < 5) {
            error = 'Password must be at least 5 characters long';
            return;
        }

        loading = true;
        error = '';
        successMessage = '';

        try {
            await api.post('/auth/reset-password', {
                token,
                newPassword
            }, { requireAuth: false });

            successMessage = 'Your password has been successfully reset. You can now sign in with your new password.';
            newPassword = '';
        } catch (err: unknown) {
            error = (err as Error).message || 'Failed to reset password. Please try again.';
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Create new password
            </h2>
        </div>
        
        {#if verifying}
            <div class="flex justify-center py-8">
                <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        {:else if tokenError}
            <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mt-4">
                <p class="text-sm text-red-700">{tokenError}</p>
                <div class="mt-4">
                    <a href="/forgot-password" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        Request a new reset link
                    </a>
                </div>
            </div>
        {:else}
            <form class="mt-8 space-y-6" onsubmit={(e) => { e.preventDefault(); handleResetPassword(); }}>
                {#if error}
                    <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                        <p class="text-sm text-red-700">{error}</p>
                    </div>
                {/if}

                {#if successMessage}
                    <div class="bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
                        <p class="text-sm text-green-700">{successMessage}</p>
                        <div class="mt-4">
                            <a href="/login" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                Proceed to login
                            </a>
                        </div>
                    </div>
                {:else}
                    <div class="rounded-md shadow-sm space-y-4">
                        <div>
                            <label for="new-password" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input id="new-password" name="newPassword" type="password" required bind:value={newPassword}
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
                                Resetting password...
                            {:else}
                                Reset Password
                            {/if}
                        </button>
                    </div>
                {/if}
            </form>
        {/if}
    </div>
</div>
