<script lang="ts">
    import { api } from '$lib/api/client';
    import EventCard from '$lib/components/EventCard.svelte';
    import { onMount } from 'svelte';
    
    let events = $state<any[]>([]);
    let page = $state(0);
    let loading = $state(true);
    let hasNext = $state(true);
    let loadingMore = $state(false);
    let error = $state('');

    async function loadFeed(isLoadMore = false) {
        if (!isLoadMore) {
            loading = true;
            page = 0;
        } else {
            loadingMore = true;
        }
        
        try {
            const response = await api.get<{ events: any[], hasNext: boolean }>(`/feed?page=${page}&size=10`, { requireAuth: false });
            
            if (isLoadMore) {
                events = [...events, ...response.events];
            } else {
                events = response.events;
            }
            
            hasNext = response.hasNext;
            page++;
        } catch (err: unknown) {
            error = (err as Error).message || 'Failed to load feed';
        } finally {
            loading = false;
            loadingMore = false;
        }
    }

    onMount(() => {
        loadFeed();
    });

    // Simple infinite scroll detector
    function handleScroll() {
        if (loading || loadingMore || !hasNext) return;
        
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 200) {
            loadFeed(true);
        }
    }
</script>

<svelte:window onscroll={handleScroll} />

<div class="max-w-[470px] mx-auto py-2">
    {#if loading}
        <div class="flex justify-center py-12">
            <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    {:else if error}
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p class="text-red-600 mb-4">{error}</p>
            <button onclick={() => loadFeed(false)} class="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                Try Again
            </button>
        </div>
    {:else if events.length === 0}
        <div class="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center">
            <h3 class="text-lg font-medium text-gray-900">No events found</h3>
            <p class="mt-1 text-gray-500">Check back later for more historical content.</p>
        </div>
    {:else}
        <div class="space-y-4">
            {#each events as event (event.id || event.wikipediaPageId || Math.random())}
                <EventCard {event} />
            {/each}
        </div>
        
        {#if loadingMore}
            <div class="flex justify-center py-6">
                <svg class="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        {/if}
        
        {#if !hasNext && events.length > 0}
            <div class="py-8 text-center text-gray-500 text-sm">
                You've reached the end of the feed.
            </div>
        {/if}
    {/if}
</div>
