<script lang="ts">
    import { api } from '$lib/api/client';
    import AuthLayout from '$lib/components/AuthLayout.svelte';
    import { resolve } from '$app/paths';
    
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

<AuthLayout>
    <!-- Main Form Box -->
    <div class="bg-black border border-neutral-800 rounded-[1px] p-10 mb-2.5">
        <div class="flex flex-col items-center mb-6">
            <!-- App Logo/Name styled similar to Instagram script -->
            <h1 class="font-serif text-4xl font-extrabold text-neutral-100 tracking-tight mb-4">WikHistory</h1>
            <p class="text-[17px] font-semibold text-neutral-400 text-center leading-5">
                Sign up to see historical events and interact with the past.
            </p>
        </div>
        
        <!-- OR Divider -->
        <div class="flex items-center my-4 pb-2">
            <div class="flex-1 h-px bg-neutral-800"></div>
            <span class="px-4 text-[13px] font-bold text-neutral-500 uppercase">or</span>
            <div class="flex-1 h-px bg-neutral-800"></div>
        </div>

        <form class="space-y-2" onsubmit={(e) => { e.preventDefault(); handleRegister(); }}>
            {#if error}
                <div class="text-sm text-red-500 text-center mb-4">{error}</div>
            {/if}

            {#if successMessage}
                <div class="text-sm text-green-600 text-center mb-4">{successMessage}</div>
            {/if}

            <div class="relative">
                <input id="email-address" name="email" type="email" autocomplete="email" required bind:value={email}
                    class="block w-full px-2 pt-3.5 pb-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-sm focus:outline-none focus:border-neutral-600 focus:ring-0 text-neutral-100 peer placeholder-transparent" placeholder="Email">
                <label for="email-address" class="absolute left-2.5 top-1 text-[10px] text-neutral-500 transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-2.5 peer-focus:text-[10px] peer-focus:top-1 pointer-events-none">Email</label>
            </div>

            <div class="relative">
                <input id="username" name="username" type="text" required bind:value={username}
                    class="block w-full px-2 pt-3.5 pb-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-sm focus:outline-none focus:border-neutral-600 focus:ring-0 text-neutral-100 peer placeholder-transparent" placeholder="Username">
                <label for="username" class="absolute left-2.5 top-1 text-[10px] text-neutral-500 transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-2.5 peer-focus:text-[10px] peer-focus:top-1 pointer-events-none">Username</label>
            </div>
            
            <div class="relative">
                <input id="password" name="password" type="password" autocomplete="new-password" required bind:value={password}
                    class="block w-full px-2 pt-3.5 pb-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-sm focus:outline-none focus:border-neutral-600 focus:ring-0 text-neutral-100 peer placeholder-transparent" placeholder="Password">
                <label for="password" class="absolute left-2.5 top-1 text-[10px] text-neutral-500 transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-2.5 peer-focus:text-[10px] peer-focus:top-1 pointer-events-none">Password</label>
            </div>

            <p class="text-xs text-neutral-400 text-center my-4 leading-4">
                People who use our service may have uploaded your contact information to WikHistory.
            </p>

            <button type="submit" disabled={loading}
                class="w-full mt-2 py-1.5 border border-transparent text-sm font-semibold rounded-lg text-white bg-[#0095f6] hover:bg-[#1877f2] focus:outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center">
                {#if loading}
                    <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                {:else}
                    Sign up
                {/if}
            </button>
        </form>
    </div>

    <!-- Secondary Log in Box -->
    <div class="bg-black border border-neutral-800 rounded-[1px] py-5 text-center flex justify-center gap-1.5 items-center">
        <span class="text-sm text-neutral-100">Have an account?</span>
        <a href={resolve('/login' as const)} class="text-sm font-semibold text-[#0095f6] hover:text-[#1877f2] transition-colors">
            Log in
        </a>
    </div>
</AuthLayout>
