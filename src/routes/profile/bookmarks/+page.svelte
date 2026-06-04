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

    async function loadBookmarks(isLoadMore = false) {
        if (!isLoadMore) {
            loading = true;
            page = 0;
        } else {
            loadingMore = true;
        }
        
        try {
            const response = await api.get<{ content: any[], last: boolean }>(`/users/bookmarks?page=${page}&size=10`);
            
            if (isLoadMore) {
                events = [...events, ...response.content];
            } else {
                events = response.content;
            }
            
            hasNext = !response.last;
            page++;
        } catch (err: unknown) {
            error = (err as Error).message || 'Failed to load bookmarks';
        } finally {
            loading = false;
            loadingMore = false;
        }
    }

    onMount(() => {
        loadBookmarks();
    });
</script>

<div>
    <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Your Bookmarks</h2>
        <p class="mt-1 text-sm text-gray-500">Saved historical events you want to revisit.</p>
    </div>

    {#if loading}
        <div class="flex justify-center py-12">
            <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    {:else if error}
        <div class="bg-red-50 p-4 rounded-md">
            <p class="text-red-700">{error}</p>
        </div>
    {:else if events.length === 0}
        <div class="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No bookmarks</h3>
            <p class="mt-1 text-sm text-gray-500">You haven't saved any historical events yet.</p>
            <div class="mt-6">
                <a href="/" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    Explore Feed
                </a>
            </div>
        </div>
    {:else}
        <div class="space-y-6">
            {#each events as event (event.id)}
                <EventCard {event} />
            {/each}
        </div>
        
        {#if hasNext}
            <div class="mt-6 flex justify-center">
                <button 
                    onclick={() => loadBookmarks(true)}
                    disabled={loadingMore}
                    class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {loadingMore ? 'Loading...' : 'Load More'}
                </button>
            </div>
        {/if}
    {/if}
</div>
