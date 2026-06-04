<script lang="ts">
    import { page } from '$app/stores';
    import { authStore } from '$lib/stores/auth';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    
    let { children } = $props();

    onMount(() => {
        if (!$authStore.isAuthenticated) {
            goto('/login');
        }
    });
</script>

<div class="max-w-7xl mx-auto py-8">
    <div class="lg:grid lg:grid-cols-12 lg:gap-8">
        <aside class="py-6 lg:col-span-3">
            <nav class="space-y-1">
                <a href="/profile" class="{$page.url.pathname === '/profile' ? 'bg-indigo-50 text-indigo-700 hover:text-indigo-700 hover:bg-white' : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50'} group rounded-md px-3 py-2 flex items-center text-sm font-medium transition-colors">
                    <svg class="{$page.url.pathname === '/profile' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'} flex-shrink-0 -ml-1 mr-3 h-6 w-6 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span class="truncate">Profile</span>
                </a>

                <a href="/profile/bookmarks" class="{$page.url.pathname === '/profile/bookmarks' ? 'bg-indigo-50 text-indigo-700 hover:text-indigo-700 hover:bg-white' : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50'} group rounded-md px-3 py-2 flex items-center text-sm font-medium transition-colors">
                    <svg class="{$page.url.pathname === '/profile/bookmarks' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'} flex-shrink-0 -ml-1 mr-3 h-6 w-6 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span class="truncate">Bookmarks</span>
                </a>

                <a href="/profile/categories" class="{$page.url.pathname === '/profile/categories' ? 'bg-indigo-50 text-indigo-700 hover:text-indigo-700 hover:bg-white' : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50'} group rounded-md px-3 py-2 flex items-center text-sm font-medium transition-colors">
                    <svg class="{$page.url.pathname === '/profile/categories' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'} flex-shrink-0 -ml-1 mr-3 h-6 w-6 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span class="truncate">Followed Categories</span>
                </a>
            </nav>
        </aside>

        <main class="lg:col-span-9">
            {@render children()}
        </main>
    </div>
</div>
