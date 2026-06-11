<script lang="ts">
    import { api } from '$lib/api/client';
    import { authStore, type User } from '$lib/stores/auth';
    import AuthLayout from '$lib/components/AuthLayout.svelte';
    import { resolve } from '$app/paths';
    
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
            const response = await api.post<{ token: string, user: User }>('/auth/authenticate', {
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

<AuthLayout>
    <!-- Main Form Box -->
    <div class="bg-black border border-neutral-800 rounded-[1px] p-10 mb-2.5">

        
        <form class="space-y-3.5" onsubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            {#if error}
                <div class="text-sm text-red-500 text-center mb-4">{error}</div>
            {/if}

            <div class="relative">
                <input id="email-address" name="email" type="email" autocomplete="email" required bind:value={email}
                    class="block w-full px-2 pt-3.5 pb-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-sm focus:outline-none focus:border-neutral-600 focus:ring-0 text-neutral-100 peer placeholder-transparent" placeholder="Email address">
                <label for="email-address" class="absolute left-2.5 top-1 text-[10px] text-neutral-500 transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-2.5 peer-focus:text-[10px] peer-focus:top-1 pointer-events-none">Email address</label>
            </div>
            
            <div class="relative">
                <input id="password" name="password" type="password" autocomplete="current-password" required bind:value={password}
                    class="block w-full px-2 pt-3.5 pb-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-sm focus:outline-none focus:border-neutral-600 focus:ring-0 text-neutral-100 peer placeholder-transparent" placeholder="Password">
                <label for="password" class="absolute left-2.5 top-1 text-[10px] text-neutral-500 transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-2.5 peer-focus:text-[10px] peer-focus:top-1 pointer-events-none">Password</label>
            </div>

            <button type="submit" disabled={loading}
                class="w-full mt-2 py-1.5 border border-transparent text-sm font-semibold rounded-lg text-white bg-[#0095f6] hover:bg-[#1877f2] focus:outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center">
                {#if loading}
                    <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                {:else}
                    Log in
                {/if}
            </button>

            <!-- OR Divider -->
            <div class="flex items-center my-4 pt-2">
                <div class="flex-1 h-px bg-neutral-800"></div>
                <span class="px-4 text-[13px] font-bold text-neutral-500 uppercase">or</span>
                <div class="flex-1 h-px bg-neutral-800"></div>
            </div>

            <div class="text-center text-xs mt-4">
                <a href={resolve('/forgot-password' as const)} class="text-neutral-400 hover:text-neutral-300 transition-colors">
                    Forgot password?
                </a>
            </div>
        </form>
    </div>

    <!-- Secondary Sign Up Box -->
    <div class="bg-black border border-neutral-800 rounded-[1px] py-5 text-center flex justify-center gap-1.5 items-center">
        <span class="text-sm text-neutral-100">Don't have an account?</span>
        <a href={resolve('/register' as const)} class="text-sm font-semibold text-[#0095f6] hover:text-[#1877f2] transition-colors">
            Sign up
        </a>
    </div>
</AuthLayout>
