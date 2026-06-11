<script lang="ts">
    import { api } from '$lib/api/client';
    import { authStore } from '$lib/stores/auth';
    import CommentSection from './CommentSection.svelte';
    
    let { event } = $props();
    
    let isLiked = $state(false);
    let likeCount = $state(event.likeCount || 0);
    let isBookmarked = $state(false);
    let showComments = $state(false);

    let isAuthenticated = $derived($authStore.isAuthenticated);

    let isExpanded = $state(false);
    const summaryMaxLength = 100;
    let isTruncated = $derived(event.summary && event.summary.length > summaryMaxLength);
    let truncatedSummary = $derived(
        isTruncated 
            ? event.summary.slice(0, summaryMaxLength)
            : event.summary
    );

    async function handleLike() {
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }
        try {
            await api.post('/feed/interact', {
                eventId: event.id,
                interactionType: 'LIKE'
            });
            isLiked = !isLiked;
            likeCount += isLiked ? 1 : -1;
        } catch (err) {
            console.error('Failed to like event', err);
        }
    }

    async function handleBookmark() {
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }
        try {
            const response = await api.post<{ bookmarked: boolean }>(`/users/bookmarks/${event.id}`);
            isBookmarked = response.bookmarked;
        } catch (err) {
            console.error('Failed to bookmark event', err);
        }
    }

    function toggleComments() {
        showComments = !showComments;
    }
</script>

<article class="bg-black border border-neutral-800 rounded-md overflow-hidden max-w-full mb-6">
    <!-- Header -->
    <div class="flex items-center justify-between p-3.5">
        <div class="flex items-center space-x-3">
            <!-- Source Avatar -->
            <div class="h-8 w-8 rounded-full bg-linear-to-tr from-pink-500 via-red-500 to-yellow-500 p-[1.5px]">
                <div class="h-full w-full rounded-full bg-black flex items-center justify-center text-xs font-bold text-neutral-100 font-serif">
                    W
                </div>
            </div>
            <div>
                <div class="flex items-center space-x-1.5">
                    <span class="text-xs font-semibold text-neutral-100 hover:underline cursor-pointer">wikipedia_history</span>
                    <span class="inline-flex items-center">
                        <svg class="h-3.5 w-3.5 text-sky-500 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.5 14L6 11.5l1.5-1.5 3 3 6.5-6.5L18.5 8l-8 8z" />
                        </svg>
                    </span>
                </div>
                <span class="text-[10px] text-neutral-400 block leading-none mt-0.5">
                    {event.location || 'Wikipedia'} · {event.eventDate || event.eventYear || 'Random'}
                </span>
            </div>
        </div>
        <button class="text-neutral-400 hover:text-neutral-100 transition-colors p-1">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                <circle cx="19" cy="12" r="1.5" fill="currentColor" />
                <circle cx="5" cy="12" r="1.5" fill="currentColor" />
            </svg>
        </button>
    </div>

    <!-- Media (Image or Fallback Dark Gradient Card) -->
    {#if event.imageUrl || event.thumbnailUrl}
        <div class="aspect-square w-full bg-neutral-900 overflow-hidden relative">
            <img 
                src={event.imageUrl || event.thumbnailUrl} 
                alt={event.title} 
                class="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.01]"
                loading="lazy"
            />
        </div>
    {:else}
        <!-- Stylized Fallback Quote Card -->
        <div class="aspect-square w-full bg-linear-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex flex-col items-center justify-center p-8 relative overflow-hidden select-none">
            <div class="absolute -top-12 -left-12 opacity-5 pointer-events-none">
                <svg class="h-48 w-48 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
                </svg>
            </div>
            <span class="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-bold mb-4">Historical Fact</span>
            <h3 class="font-serif text-lg md:text-xl text-neutral-100 text-center leading-relaxed max-w-xs drop-shadow-sm font-medium italic">
                "{event.title}"
            </h3>
            {#if event.eventDate || event.eventYear}
                <span class="mt-5 text-[11px] text-neutral-500 font-mono tracking-widest uppercase">
                    {event.eventDate || event.eventYear} {event.era ? event.era : ''}
                </span>
            {/if}
        </div>
    {/if}

    <!-- Interactions -->
    <div class="flex items-center justify-between px-3 py-2.5">
        <div class="flex space-x-4">
            <!-- Like -->
            <button onclick={handleLike} class="cursor-pointer hover:scale-105 active:scale-95 transition-all text-neutral-100 hover:text-red-500">
                <svg class="h-6 w-6 {isLiked ? 'text-red-500 fill-current' : ''}" fill={isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </button>
            <!-- Comment -->
            <button onclick={toggleComments} class="cursor-pointer hover:scale-105 active:scale-95 transition-all text-neutral-100 hover:text-blue-500">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </button>
            <!-- Share -->
            <button class="cursor-pointer hover:scale-105 active:scale-95 transition-all text-neutral-100 hover:text-green-500">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
            </button>
        </div>
        <!-- Bookmark -->
        <button onclick={handleBookmark} class="cursor-pointer hover:scale-105 active:scale-95 transition-all text-neutral-100 hover:text-yellow-600">
            <svg class="h-6 w-6 {isBookmarked ? 'text-white fill-current' : ''}" fill={isBookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
        </button>
    </div>

    <!-- Likes Count -->
    <div class="px-3 pb-1">
        <span class="text-xs font-bold text-neutral-100">{likeCount.toLocaleString()} likes</span>
    </div>

    <!-- Caption -->
    <div class="px-3 pb-2 text-xs leading-relaxed">
        <span class="font-bold text-neutral-100 mr-1.5 hover:underline cursor-pointer">wikipedia_history</span>
        {#if isExpanded}
            <span class="text-neutral-200">{event.summary}</span>
            {#if event.wikipediaUrl}
                <a href={event.wikipediaUrl} target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:underline block mt-1 font-medium">
                    wikipedia.org/wiki/...
                </a>
            {/if}
        {:else}
            <span class="text-neutral-200">{truncatedSummary}</span>
            {#if isTruncated}
                <button onclick={() => isExpanded = true} class="cursor-pointer text-neutral-400 hover:text-neutral-300 ml-1 font-medium focus:outline-none">
                    ...more
                </button>
            {/if}
        {/if}
    </div>

    <!-- Comments Link / Drawer -->
    <div class="px-3 pb-2">
        <button onclick={toggleComments} class="cursor-pointer text-[11px] text-neutral-400 hover:text-neutral-300 transition-colors focus:outline-none">
            {#if event.commentCount > 0}
                View all {event.commentCount} comments
            {:else}
                Add a comment
            {/if}
        </button>
    </div>

    <!-- Timestamp/Era -->
    <div class="px-3 pb-3 border-b border-neutral-900">
        <span class="text-[9px] text-neutral-500 uppercase tracking-widest font-mono">
            {event.eventDate || event.eventYear ? (event.eventDate || event.eventYear) + ' ' + (event.era || '') : 'UNKNOWN ERA'}
        </span>
    </div>

    <!-- Integrated Comment Drawer -->
    {#if showComments}
        <div class="bg-black p-3 border-t border-neutral-900">
            <CommentSection eventId={event.id || event.wikipediaPageId} />
        </div>
    {/if}
</article>
