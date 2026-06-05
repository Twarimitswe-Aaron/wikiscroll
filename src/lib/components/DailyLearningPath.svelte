<script lang="ts">
    import { authStore } from '$lib/stores/auth';
    import { onMount } from 'svelte';
    import { resolve } from '$app/paths';

    let user = $derived($authStore.user);
    let isAuthenticated = $derived($authStore.isAuthenticated);

    interface PathItem {
        category: string;
        title: string;
        description: string;
        searchQuery: string;
        pageTitle: string;
        imageUrl: string;
    }

    let items = $state<PathItem[]>([
        {
            category: 'history',
            title: 'World War II',
            description: 'Key events of WWII',
            searchQuery: 'World War II',
            pageTitle: 'World_War_II',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/World_War_II_Stalingrad_German_soldiers_1942.jpg/320px-World_War_II_Stalingrad_German_soldiers_1942.jpg'
        },
        {
            category: 'science',
            title: 'Black Holes',
            description: 'Curvature of spacetime',
            searchQuery: 'Black hole',
            pageTitle: 'Black_hole',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/M87_Black_Hole_Image_Chirp_Algorithm_Recovery.jpg/320px-M87_Black_Hole_Image_Chirp_Algorithm_Recovery.jpg'
        },
        {
            category: 'tech',
            title: 'TCP/IP Protocol',
            description: 'Internet communications suite',
            searchQuery: 'TCP/IP',
            pageTitle: 'Internet_protocol_suite',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Internet_map_1024.jpg/320px-Internet_map_1024.jpg'
        },
        {
            category: 'biography',
            title: 'Alan Turing',
            description: 'Father of computer science',
            searchQuery: 'Alan Turing',
            pageTitle: 'Alan_Turing',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Alan_Turing_Aged_16.jpg/320px-Alan_Turing_Aged_16.jpg'
        }
    ]);

    function handleLearnClick(query: string) {
        window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }

    function handleLogout() {
        authStore.logout();
        window.location.href = '/login';
    }

    onMount(async () => {
        // Query official Wikipedia REST API for up-to-date thumbnails and brief abstracts
        await Promise.all(items.map(async (item, index) => {
            try {
                const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${item.pageTitle}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.thumbnail && data.thumbnail.source) {
                        items[index].imageUrl = data.thumbnail.source;
                    }
                    if (data.description) {
                        items[index].description = data.description;
                    }
                }
            } catch (err) {
                console.warn(`Failed to fetch Wikipedia thumbnail for ${item.title}:`, err);
            }
        }));
    });
</script>

<div class="w-full text-white bg-black pt-2.5 font-sans">
    <!-- Active User Profile Section -->
    <div class="flex items-center mb-7 gap-4">
        <div class="w-14 h-14 rounded-full bg-linear-to-tr from-yellow-500 via-pink-500 to-red-500 p-[2px] shrink-0">
            <div class="w-full h-full rounded-full bg-black flex items-center justify-center font-bold text-lg text-white">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
        </div>
        <div class="flex flex-col grow min-w-0">
            <span class="text-[15px] font-semibold text-neutral-100 leading-tight">{user?.username || 'guest_reader'}</span>
            <span class="text-sm text-neutral-400 leading-tight overflow-hidden text-ellipsis whitespace-nowrap">{user?.email || 'Guest Explorer'}</span>
        </div>
        {#if isAuthenticated}
            <button class="bg-transparent border-0 text-[#0095f6] text-xs font-bold cursor-pointer p-0 hover:text-sky-200 no-underline" onclick={handleLogout}>Logout</button>
        {:else}
            <a href={resolve('/login')} class="bg-transparent border-0 text-[#0095f6] text-xs font-bold cursor-pointer p-0 hover:text-sky-200 no-underline">Login</a>
        {/if}
    </div>

    <!-- Suggested Header -->
    <div class="flex justify-between items-center mb-4 border-b border-neutral-900 pb-2">
        <span class="text-[15px] font-bold text-neutral-400">Daily Learning Path</span>
        <span class="text-xs font-semibold text-neutral-500">Every day</span>
    </div>

    <!-- Curated Suggestions List (Larger Size with Images) -->
    <div class="flex flex-col gap-[18px] mb-7">
        {#each items as item (item.searchQuery)}
            <div class="flex items-center gap-4">
                <div class="w-[52px] h-[52px] rounded-full overflow-hidden border-2 border-neutral-800 shrink-0 bg-neutral-900">
                    <img src={item.imageUrl} alt={item.title} class="w-full h-full object-cover" />
                </div>
                <div class="flex flex-col grow min-w-0">
                    <button class="text-sm font-semibold text-neutral-100 text-left bg-transparent border-0 p-0 cursor-pointer hover:underline" onclick={() => handleLearnClick(item.searchQuery)}>
                        {item.category}
                    </button>
                    <span class="text-sm font-medium text-white leading-tight mt-0.5 truncate">{item.title}</span>
                    <span class="text-xs text-neutral-400 leading-tight mt-0.5 truncate">{item.description}</span>
                </div>
                <button class="bg-[#0095f6] border-0 text-white text-xs font-bold cursor-pointer py-1.5 px-3.5 rounded-lg transition-colors duration-200 hover:bg-[#1877f2]" onclick={() => handleLearnClick(item.searchQuery)}>
                    Learn
                </button>
            </div>
        {/each}
    </div>

    <!-- Footer & Copyright Links -->
    <div class="border-t border-neutral-900 pt-4">
        <nav class="text-[11px] text-neutral-500 leading-normal mb-4 flex gap-1.5 flex-wrap">
            <a href={resolve('/about' as '/login')} class="text-neutral-500 hover:underline no-underline">About</a> · 
            <a href={resolve('/help' as '/login')} class="text-neutral-500 hover:underline no-underline">Help</a> · 
            <a href={resolve('/api' as '/login')} class="text-neutral-500 hover:underline no-underline">API</a> · 
            <a href={resolve('/privacy' as '/login')} class="text-neutral-500 hover:underline no-underline">Privacy</a> · 
            <a href={resolve('/terms' as '/login')} class="text-neutral-500 hover:underline no-underline">Terms</a> · 
            <a href={resolve('/locations' as '/login')} class="text-neutral-500 hover:underline no-underline">Locations</a>
        </nav>
        <p class="text-[11px] text-neutral-500 uppercase tracking-wider m-0">© 2026 WIKHISTORY FROM WIKIPEDIA</p>
    </div>
</div>
