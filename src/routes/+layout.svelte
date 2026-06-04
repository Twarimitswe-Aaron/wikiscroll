<script lang="ts">
	import '../app.css';
	import { authStore } from '$lib/stores/auth';
	import { page } from '$app/stores';

	let { children } = $props();

    let isAuthenticated = $derived($authStore.isAuthenticated);
    let user = $derived($authStore.user);

    function handleLogout() {
        authStore.logout();
        window.location.href = '/login';
    }
</script>

<div class="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
    <!-- Navbar -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16 items-center">
                <div class="flex items-center">
                    <a href="/" class="flex-shrink-0 flex items-center">
                        <span class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            WikHistory
                        </span>
                    </a>
                    <nav class="ml-10 hidden md:flex space-x-8">
                        <a href="/" class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors" class:text-indigo-600={$page.url.pathname === '/'}>Feed</a>
                        <a href="/search" class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors" class:text-indigo-600={$page.url.pathname === '/search'}>Search</a>
                        <a href="/categories" class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors" class:text-indigo-600={$page.url.pathname === '/categories'}>Categories</a>
                    </nav>
                </div>
                
                <div class="flex items-center space-x-4">
                    {#if isAuthenticated}
                        <div class="hidden md:flex items-center space-x-4">
                            <a href="/profile" class="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                <div class="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span class="text-sm font-medium text-gray-700">{user?.username}</span>
                            </a>
                            <button onclick={handleLogout} class="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors">
                                Logout
                            </button>
                        </div>
                    {:else}
                        <div class="flex space-x-4">
                            <a href="/login" class="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors py-2">Log in</a>
                            <a href="/register" class="text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md transition-colors shadow-sm">Sign up</a>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {@render children()}
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p class="text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Wikipedia History Feed. All rights reserved.
            </p>
        </div>
    </footer>
</div>
