<script lang="ts">
    import { onMount } from 'svelte';
    import { api } from '$lib/api/client';

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
    let seenIds     = $state<Set<string>>(new Set());
    let loading     = $state(true);
    let refreshing  = $state(false);

    /** Stories not yet seen today */
    let unread = $derived(allStories.filter(s => !seenIds.has(s.id)));
    let allRead = $derived(!loading && allStories.length > 0 && unread.length === 0);

    // ── Persistence helpers ──────────────────────────────────────────

    function loadSeen(): Set<string> {
        try {
            const today   = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            const savedDate = localStorage.getItem(TODAY_KEY);
            if (savedDate !== today) {
                // New day — reset seen list
                localStorage.setItem(TODAY_KEY, today);
                localStorage.removeItem(SEEN_KEY);
                return new Set();
            }
            const raw = localStorage.getItem(SEEN_KEY);
            return raw ? new Set(JSON.parse(raw)) : new Set();
        } catch { return new Set(); }
    }

    function saveSeen(ids: Set<string>) {
        try {
            localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]));
        } catch {}
    }

    // ── Public: called by parent when user closes story viewer ───────

    export function markRead(storyId: string) {
        seenIds = new Set([...seenIds, storyId]);
        saveSeen(seenIds);
    }

    export function markAllReadUpTo(index: number) {
        // Mark every story from 0 → index as seen
        const newSeen = new Set(seenIds);
        for (let i = 0; i <= index; i++) {
            if (allStories[i]) newSeen.add(allStories[i].id);
        }
        seenIds = newSeen;
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
                seenIds = new Set();
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
</script>

<div class="stories-bar">
    {#if loading}
        <!-- Skeleton shimmer -->
        {#each Array(5) as _}
            <div class="story-item">
                <div class="story-ring skeleton"></div>
                <div class="sk-label"></div>
            </div>
        {/each}

    {:else if allRead}
        <!-- All read — show refresh prompt -->
        <div class="all-read-row">
            <span class="all-read-text">You're all caught up!</span>
            <button class="refresh-btn" onclick={() => fetch(true)} disabled={refreshing}>
                {#if refreshing}
                    <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                {:else}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    Load new
                {/if}
            </button>
        </div>

    {:else if unread.length === 0 && allStories.length === 0}
        <!-- API returned nothing -->

    {:else}
        <!-- Today label anchor -->
        <div class="story-item">
            <div class="story-ring today-anchor">
                <div class="today-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                </div>
            </div>
            <span class="story-label">Today</span>
        </div>

        <!-- Unread stories only -->
        {#each unread as story (story.id)}
            <button class="story-item" onclick={() => open(story)}>
                <div class="story-ring">
                    {#if story.thumbnailUrl}
                        <img src={story.thumbnailUrl} alt={story.title} class="story-thumb" loading="lazy" />
                    {:else}
                        <div class="story-thumb fallback">
                            <span>{story.title.charAt(0)}</span>
                        </div>
                    {/if}
                </div>
                <span class="story-label">{story.title.split(' ').slice(0, 2).join(' ')}</span>
            </button>
        {/each}
    {/if}
</div>

<style>
    .stories-bar {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px 8px 10px;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
        border-bottom: 1px solid #efefef;
        min-height: 96px;
    }
    .stories-bar::-webkit-scrollbar { display: none; }

    /* ── Story bubble ── */
    .story-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        flex-shrink: 0;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        user-select: none;
    }

    .story-ring {
        width: 62px;
        height: 62px;
        border-radius: 50%;
        padding: 2.5px;
        background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
        box-shadow: 0 2px 8px rgba(220,39,67,.22);
        transition: transform .15s ease, box-shadow .15s ease;
    }
    .story-item:hover .story-ring,
    .story-item:focus .story-ring {
        transform: scale(1.07);
        box-shadow: 0 4px 14px rgba(220,39,67,.35);
    }

    .story-thumb {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        border: 2.5px solid #fff;
        background: #e8e8e8;
        display: block;
    }
    .story-thumb.fallback {
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea, #764ba2);
        border: 2.5px solid #fff;
        color: #fff;
        font-size: 1.3rem;
        font-weight: 700;
        font-family: serif;
    }

    .story-label {
        font-size: 11px;
        color: #262626;
        max-width: 64px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        text-align: center;
        font-family: system-ui, sans-serif;
    }

    /* ── Today anchor ── */
    .today-anchor {
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
    }
    .today-icon {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2.5px solid #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
    }
    .today-icon svg { width: 26px; height: 26px; }

    /* ── All-read state ── */
    .all-read-row {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 6px 12px;
    }
    .all-read-text {
        font-size: 12px;
        color: #8e8e8e;
        font-family: system-ui, sans-serif;
    }
    .refresh-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
        color: #fff;
        border: none;
        border-radius: 20px;
        padding: 6px 16px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        font-family: system-ui, sans-serif;
        transition: opacity .15s;
    }
    .refresh-btn:disabled { opacity: .6; cursor: default; }
    .refresh-btn svg { width: 14px; height: 14px; }
    .spin {
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    /* ── Skeleton ── */
    .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.4s infinite;
    }
    .sk-label {
        width: 44px;
        height: 10px;
        border-radius: 4px;
        background: #e8e8e8;
        animation: shimmer 1.4s infinite;
    }
    @keyframes shimmer {
        0%   { background-position: -200% 0; }
        100% { background-position:  200% 0; }
    }
</style>
