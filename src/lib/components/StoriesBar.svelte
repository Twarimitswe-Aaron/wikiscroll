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

    let stories = $state<Story[]>([]);
    let loading = $state(true);

    onMount(async () => {
        try {
            stories = await api.get<Story[]>('/feed/today', { requireAuth: false });
        } catch (err) {
            console.error('Failed to load today stories', err);
        } finally {
            loading = false;
        }
    });
</script>

<!-- Stories bar — only shown on the home feed -->
<div class="stories-bar">
    {#if loading}
        <!-- Skeleton loaders -->
        {#each Array(6) as _}
            <div class="story-item">
                <div class="story-ring skeleton"></div>
                <div class="story-label skeleton-text"></div>
            </div>
        {/each}
    {:else if stories.length === 0}
        <!-- nothing to show, bar collapses -->
    {:else}
        <!-- "Today in History" anchor -->
        <div class="story-item">
            <div class="story-ring today-anchor">
                <div class="today-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                </div>
            </div>
            <span class="story-label">Today</span>
        </div>

        {#each stories as story, i}
            <button class="story-item" onclick={() => onStoryOpen(stories, i)}>
                <div class="story-ring">
                    {#if story.thumbnailUrl}
                        <img
                            src={story.thumbnailUrl}
                            alt={story.title}
                            class="story-thumb"
                            loading="lazy"
                        />
                    {:else}
                        <div class="story-thumb fallback">
                            <span>{story.title.charAt(0)}</span>
                        </div>
                    {/if}
                </div>
                <span class="story-label">{story.title.split(' ').slice(0,2).join(' ')}</span>
            </button>
        {/each}
    {/if}
</div>

<style>
    .stories-bar {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 12px 4px 8px;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
        border-bottom: 1px solid #efefef;
        margin-bottom: 8px;
    }
    .stories-bar::-webkit-scrollbar { display: none; }

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
        box-shadow: 0 2px 8px rgba(220, 39, 67, 0.25);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .story-item:hover .story-ring,
    .story-item:focus .story-ring {
        transform: scale(1.06);
        box-shadow: 0 4px 14px rgba(220, 39, 67, 0.35);
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

    /* Today anchor */
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

    /* Skeleton */
    .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.4s infinite;
    }
    .skeleton-text {
        width: 48px;
        height: 10px;
        border-radius: 4px;
        background: #e0e0e0;
        animation: shimmer 1.4s infinite;
    }
    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
</style>
