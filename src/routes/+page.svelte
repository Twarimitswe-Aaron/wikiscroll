<script lang="ts">
    import { api } from '$lib/api/client';
    import EventCard from '$lib/components/EventCard.svelte';
    import FeedSkeleton from '$lib/components/FeedSkeleton.svelte';
    import StoriesBar from '$lib/components/StoriesBar.svelte';
    import StoryViewer from '$lib/components/StoryViewer.svelte';
    import { onMount } from 'svelte';

    let events = $state<any[]>([]);
    let page = $state(0);
    let loading = $state(true);
    let hasNext = $state(true);
    let loadingMore = $state(false);
    let error = $state('');

    // Story viewer state
    let storiesBarRef = $state<any>();
    let viewerOpen    = $state(false);
    let viewerStories = $state<any[]>([]);
    let viewerStart   = $state(0);

    function openStory(stories: any[], index: number) {
        viewerStories = stories;
        viewerStart   = index;
        viewerOpen    = true;
    }

    function closeStory() {
        viewerOpen = false;
    }

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

    function handleScroll() {
        if (loading || loadingMore || !hasNext) return;
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 200) {
            loadFeed(true);
        }
    }
</script>

<svelte:window onscroll={handleScroll} />

<!-- Full-screen story viewer overlay -->
{#if viewerOpen}
    <StoryViewer
        stories={viewerStories}
        startIndex={viewerStart}
        onClose={closeStory}
        onStoryViewed={(id) => storiesBarRef?.markRead(id)}
    />
{/if}

<div class="max-w-[470px] mx-auto py-2">

    <!-- ── Stories bar (Today in History) ── -->
    <div class="bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden">
        <StoriesBar bind:this={storiesBarRef} onStoryOpen={openStory} />
    </div>

    <!-- ── Main feed ── -->
    {#if loading}
        <FeedSkeleton count={4} />
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
            <FeedSkeleton count={1} />
        {/if}

        {#if !hasNext && events.length > 0}
            <div class="py-8 text-center text-gray-500 text-sm">
                You've reached the end of the feed.
            </div>
        {/if}
    {/if}
</div>
