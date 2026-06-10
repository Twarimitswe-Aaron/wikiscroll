<script lang="ts">
    import { api } from '$lib/api/client';
    import EventCard from '$lib/components/EventCard.svelte';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    
    let query = $state($page.url.searchParams.get('q') || '');
    let events = $state<Record<string, unknown>[]>([]);
    let loading = $state(false);
    let error = $state('');
    let searched = $state(false);

    onMount(() => {
        if (query.trim()) {
            handleSearch();
        }
    });

    async function handleSearch() {
        if (!query.trim()) return;
        
        loading = true;
        error = '';
        searched = true;

        try {
            const response = await api.get<{ content: Record<string, unknown>[] }>(`/events/search?query=${encodeURIComponent(query)}&page=0&size=20`, { requireAuth: false });
            events = response.content || [];
        } catch (err: unknown) {
            error = (err as Error).message || 'Failed to search events';
        } finally {
            loading = false;
        }
    }

    let searchTimeout: ReturnType<typeof setTimeout> | undefined;
    function debounceSearch() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (query.trim().length > 2) {
                handleSearch();
            }
        }, 500);
    }
</script>

<div class="max-w-3xl mx-auto">
    <div class="mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Search History</h1>
        <p class="mt-2 text-gray-500">Find historical events by keyword, location, or era.</p>
    </div>

    <div class="mb-8">
        <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>
            </div>
            <input 
                type="text" 
                bind:value={query}
                oninput={debounceSearch}
                onkeydown={(e) => e.key === 'Enter' && handleSearch()}
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors" 
                placeholder="Search for battles, empires, figures..."
            >
        </div>
    </div>

    {#if loading}
        <div class="flex justify-center py-12">
            <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    {:else if error}
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p class="text-red-600">{error}</p>
        </div>
    {:else if searched && events.length === 0}
        <div class="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No results found</h3>
            <p class="mt-1 text-sm text-gray-500">We couldn't find anything matching "{query}". Try adjusting your search.</p>
        </div>
    {:else if events.length > 0}
        <div class="space-y-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Results ({events.length})</h2>
            {#each events as event (event.id)}
                <EventCard {event} />
            {/each}
        </div>
    {/if}
</div>
