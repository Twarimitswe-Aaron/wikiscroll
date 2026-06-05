<script lang="ts">
    import '../app.css';
    import { authStore } from '$lib/stores/auth';
    import { page } from '$app/stores';
    import { resolve } from '$app/paths';

    let { children } = $props();

    let isAuthenticated = $derived($authStore.isAuthenticated);
    let user = $derived($authStore.user);

    function handleLogout() {
        authStore.logout();
        window.location.href = '/login';
    }
</script>

<div class="min-h-screen bg-black flex flex-col md:flex-row font-sans text-neutral-100">
    <!-- ── Left Sidebar (Desktop/Tablet) ── -->
    <aside class="hidden md:flex flex-col w-[72px] xl:w-60 fixed inset-y-0 left-0 bg-black border-r border-neutral-800 px-3 py-6 z-40 justify-between transition-all duration-300">
        <div class="flex flex-col gap-8">
            <!-- Brand Logo / Glyph -->
            <a href={resolve('/')} class="flex items-center px-3 py-2 text-white">
                <!-- Large Logo for Desktop -->
                <span class="hidden xl:inline text-2xl font-bold font-serif tracking-tight bg-clip-text text-transparent bg-linear-to-r from-pink-500 via-red-500 to-yellow-500">
                    WikHistory
                </span>
                <!-- Small Glyph for Tablet -->
                <svg class="xl:hidden w-7 h-7 hover:scale-105 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
            </a>

            <!-- Navigation Links -->
            <nav class="flex flex-col gap-2">
                <!-- Home -->
                <a
                    href={resolve('/')}
                    class="flex items-center gap-4 px-3 py-3 rounded-lg text-sm font-semibold transition-all group hover:bg-neutral-900"
                    class:text-white={$page.url.pathname === '/'}
                    class:text-neutral-400={$page.url.pathname !== '/'}
                >
                    <svg class="w-6 h-6 transition-transform group-hover:scale-105" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span class="hidden xl:inline">Home</span>
                </a>

                <!-- Search -->
                <a
                    href={resolve('/search')}
                    class="flex items-center gap-4 px-3 py-3 rounded-lg text-sm font-semibold transition-all group hover:bg-neutral-900"
                    class:text-white={$page.url.pathname === '/search'}
                    class:text-neutral-400={$page.url.pathname !== '/search'}
                >
                    <svg class="w-6 h-6 transition-transform group-hover:scale-105" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span class="hidden xl:inline">Search</span>
                </a>

                <!-- Explore / Categories -->
                <a
                    href={resolve('/categories')}
                    class="flex items-center gap-4 px-3 py-3 rounded-lg text-sm font-semibold transition-all group hover:bg-neutral-900"
                    class:text-white={$page.url.pathname === '/categories'}
                    class:text-neutral-400={$page.url.pathname !== '/categories'}
                >
                    <svg class="w-6 h-6 transition-transform group-hover:scale-105" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                        <circle cx="12" cy="12" r="10" />
                        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                    </svg>
                    <span class="hidden xl:inline">Explore</span>
                </a>

                <!-- Create -->
                <button
                    class="flex items-center gap-4 px-3 py-3 rounded-lg text-sm font-semibold text-neutral-400 hover:text-white transition-all group hover:bg-neutral-900 w-full text-left"
                >
                    <svg class="w-6 h-6 transition-transform group-hover:scale-105" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    <span class="hidden xl:inline">Create</span>
                </button>
            </nav>
        </div>

        <!-- User Profile / Settings -->
        <div class="flex flex-col gap-2">
            {#if isAuthenticated}
                <a href={resolve('/profile')} class="flex items-center gap-3 hover:bg-neutral-900 p-2.5 rounded-xl transition-all text-neutral-300 hover:text-white">
                    <div class="h-6 w-6 rounded-full bg-linear-to-tr from-pink-500 to-yellow-500 flex items-center justify-center text-white font-bold text-[10px]">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span class="hidden xl:inline text-sm font-semibold truncate">{user?.username}</span>
                </a>
                <button
                    onclick={handleLogout}
                    class="hidden xl:flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-950/30 transition-colors w-full text-left"
                >
                    <span>Log out</span>
                </button>
            {:else}
                <a href={resolve('/login')} class="flex items-center gap-3 hover:bg-neutral-900 p-2.5 rounded-xl transition-all text-neutral-300 hover:text-white">
                    <div class="h-6 w-6 rounded-full bg-neutral-700 flex items-center justify-center text-white text-[10px]">
                        ?
                    </div>
                    <span class="hidden xl:inline text-sm font-semibold">Log in</span>
                </a>
            {/if}
        </div>
    </aside>

    <!-- ── Bottom Navigation Bar (Mobile only) ── -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-neutral-900 flex justify-around items-center h-16 z-40 px-2 shadow-lg">
        <!-- Home -->
        <a href={resolve('/')} aria-label="Home" class="flex flex-col items-center justify-center flex-1 py-1" class:text-white={$page.url.pathname === '/'} class:text-neutral-500={$page.url.pathname !== '/'}>
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        </a>

        <!-- Search -->
        <a href={resolve('/search')} aria-label="Search" class="flex flex-col items-center justify-center flex-1 py-1" class:text-white={$page.url.pathname === '/search'} class:text-neutral-500={$page.url.pathname !== '/search'}>
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
        </a>

        <!-- Explore / Categories -->
        <a href={resolve('/categories')} aria-label="Explore Categories" class="flex flex-col items-center justify-center flex-1 py-1" class:text-white={$page.url.pathname === '/categories'} class:text-neutral-500={$page.url.pathname !== '/categories'}>
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
        </a>

        <!-- Profile -->
        <a href={resolve(isAuthenticated ? '/profile' : '/login')} aria-label="Profile" class="flex flex-col items-center justify-center flex-1 py-1" class:text-white={$page.url.pathname === '/profile' || $page.url.pathname === '/login'} class:text-neutral-500={$page.url.pathname !== '/profile' && $page.url.pathname !== '/login'}>
            {#if isAuthenticated}
                <div class="h-6 w-6 rounded-full bg-linear-to-tr from-pink-500 to-yellow-500 flex items-center justify-center text-white font-bold text-[10px]">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
            {:else}
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            {/if}
        </a>
    </nav>

    <!-- ── Main Content Container ── -->
    <main class="grow md:pl-[72px] xl:pl-60 w-full min-h-screen flex flex-col pb-20 md:pb-8">
        <div class="grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {@render children()}
        </div>
    </main>
</div>
