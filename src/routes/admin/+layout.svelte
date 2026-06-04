<script lang="ts">
    import { authStore } from '$lib/stores/auth';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';

    let { children } = $props();
    let isChecking = $state(true);

    let user = $derived($authStore.user);
    let isAdmin = $derived(user?.role === 'ADMIN');

    onMount(() => {
        if (!isAdmin) {
            window.location.href = '/';
        } else {
            isChecking = false;
        }
    });
</script>

{#if isChecking}
    <div class="flex justify-center items-center min-h-[50vh]">
        <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
{:else if isAdmin}
    <div class="max-w-7xl mx-auto py-8">
        <div class="mb-8">
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p class="mt-2 text-gray-500">Manage users and platform content.</p>
        </div>
        
        <div class="lg:grid lg:grid-cols-12 lg:gap-8">
            <aside class="py-6 lg:col-span-3">
                <nav class="space-y-1">
                    <a href="/admin/users" class="{String($page.url.pathname) === '/admin/users' ? 'bg-indigo-50 text-indigo-700 hover:text-indigo-700 hover:bg-white' : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50'} group rounded-md px-3 py-2 flex items-center text-sm font-medium transition-colors">
                        <svg class="{String($page.url.pathname) === '/admin/users' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'} flex-shrink-0 -ml-1 mr-3 h-6 w-6 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span class="truncate">User Management</span>
                    </a>
                </nav>
            </aside>

            <main class="lg:col-span-9">
                {@render children()}
            </main>
        </div>
    </div>
{/if}
