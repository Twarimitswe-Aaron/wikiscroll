<script lang="ts">
    import { onMount } from 'svelte';
    import { api } from '$lib/api/client';
    import { SvelteSet } from 'svelte/reactivity';

    interface Story {
        id: string;
        title: string;
        extract: string;
        year: number | null;
        imageUrl: string | null;
        thumbnailUrl: string | null;
        wikipediaUrl: string | null;
    }

    let { onStoryOpen }: { onStoryOpen: (stories: Story[], index: number) => void } = $props();

    const SEEN_KEY = 'wik_seen_stories';
    const TODAY_KEY = 'wik_stories_date';

    let allStories  = $state<Story[]>([]);
    let seenIds     = new SvelteSet<string>();
    let loading     = $state(true);
    let refreshing  = $state(false);

    /** Stories not yet seen today */
    let unread = $derived(allStories.filter(s => !seenIds.has(s.id)));
    let allRead = $derived(!loading && allStories.length > 0 && unread.length === 0);

    // ── Persistence helpers ──────────────────────────────────────────

    function loadSeen(): SvelteSet<string> {
        try {
            const today   = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            const savedDate = localStorage.getItem(TODAY_KEY);
            if (savedDate !== today) {
                // New day — reset seen list
                localStorage.setItem(TODAY_KEY, today);
                localStorage.removeItem(SEEN_KEY);
                return new SvelteSet<string>();
            }
            const raw = localStorage.getItem(SEEN_KEY);
            return raw ? new SvelteSet<string>(JSON.parse(raw)) : new SvelteSet<string>();
        } catch { return new SvelteSet<string>(); }
    }

    function saveSeen(ids: SvelteSet<string>) {
        try {
            localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]));
        } catch (err) {
            console.warn('Could not save seen stories:', err);
        }
    }

    // ── Public: called by parent when user closes story viewer ───────

    export function markRead(storyId: string) {
        seenIds.add(storyId);
        saveSeen(seenIds);
    }

    export function markAllReadUpTo(index: number) {
        // Mark every story from 0 → index as seen
        for (let i = 0; i <= index; i++) {
            if (allStories[i]) seenIds.add(allStories[i].id);
        }
        saveSeen(seenIds);
    }

    // ── Open a story (always pick from the unread list) ──────────────

    function open(story: Story) {
        const idx = allStories.findIndex(s => s.id === story.id);
        onStoryOpen(allStories, idx >= 0 ? idx : 0);
        // Mark as read immediately on tap (same as Instagram)
        markRead(story.id);
    }

    // ── Fetch ────────────────────────────────────────────────────────

    async function fetch(invalidate = false) {
        if (invalidate) refreshing = true;
        else            loading    = true;

        try {
            const url = invalidate ? '/feed/today?refresh=true' : '/feed/today';
            const data = await api.get<Story[]>(url, { requireAuth: false });
            allStories = data;

            // On refresh, clear seen list so new stories show
            if (invalidate) {
                seenIds.clear();
                saveSeen(seenIds);
            }
        } catch (err) {
            console.error('Failed to load today stories', err);
        } finally {
            loading   = false;
            refreshing = false;
        }
    }

    onMount(() => {
        seenIds = loadSeen();
        fetch();
    });

    $effect(() => {
        if (allRead && !refreshing) {
            const t = setTimeout(() => {
                fetch(true);
            }, 1500);
            return () => clearTimeout(t);
        }
    });
</script>

<div class="flex items-center gap-4 py-2 px-1 overflow-x-auto min-h-[100px] bg-transparent border-b-0 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" style="-webkit-overflow-scrolling: touch;">
    {#if loading}
        <!-- Skeleton shimmer -->
        {#each Array(5) as _, i (i)}
            <div class="flex flex-col items-center gap-1.5 shrink-0 select-none" data-unused={_}>
                <div class="w-[78px] h-[78px] rounded-full border-2 border-black bg-neutral-900 animate-pulse"></div>
                <div class="w-10 h-2 rounded bg-neutral-800 animate-pulse"></div>
            </div>
        {/each}

    {:else if allRead}
        <!-- All read — show refresh prompt -->
        <div class="flex flex-col items-center justify-center gap-1.5 w-full py-1 px-3">
            <span class="text-xs text-neutral-400 font-sans font-semibold">You're all caught up!</span>
            <div class="flex items-center gap-2 mt-0.5">
                <svg class="animate-spin w-3.5 h-3.5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="text-[11px] text-neutral-500 font-medium font-sans">Checking for new stories...</span>
            </div>
        </div>

    {:else if unread.length === 0 && allStories.length === 0}
        <!-- API returned nothing -->

    {:else}
        <!-- Today label anchor -->
        <div class="flex flex-col items-center gap-1.5 shrink-0 select-none">
            <div class="w-[78px] h-[78px] rounded-full p-[2.2px] bg-linear-to-br from-indigo-900 to-indigo-600 transition-transform duration-150 hover:scale-103 focus:scale-103">
                <div class="w-full h-full rounded-full border-2 border-black flex items-center justify-center text-white bg-black">
                    <svg class="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                </div>
            </div>
            <span class="text-[11px] text-neutral-400 max-w-[74px] overflow-hidden whitespace-nowrap text-ellipsis text-center font-sans">Today</span>
        </div>

        <!-- Unread stories only -->
        {#each unread as story (story.id)}
            <button class="flex flex-col items-center gap-1.5 shrink-0 bg-transparent border-0 p-0 cursor-pointer select-none" onclick={() => open(story)}>
                <div class="w-[93px] h-[93px] rounded-full p-[2.2px] bg-linear-to-tr from-yellow-500 via-pink-500 to-red-500 transition-transform duration-150 hover:scale-103 focus:scale-103">
                    {#if story.thumbnailUrl}
                        <img src={story.thumbnailUrl} alt={story.title} class="w-full h-full rounded-full object-cover border-2 border-black bg-neutral-900 block" decoding="async" />
                    {:else}
                        <div class="w-full h-full rounded-full flex items-center justify-center bg-linear-to-br from-neutral-800 to-neutral-900 border-2 border-black text-neutral-100 text-lg font-bold font-serif">
                            <span>{story.title.charAt(0)}</span>
                        </div>
                    {/if}
                </div>
                <span class="text-[11px] text-neutral-400 max-w-[74px] overflow-hidden whitespace-nowrap text-ellipsis text-center font-sans">{story.title.split(' ').slice(0, 2).join(' ')}</span>
            </button>
        {/each}
    {/if}
</div>
