<script lang="ts">
    import { onMount, onDestroy } from 'svelte';

    interface Story {
        id: string;
        title: string;
        extract: string;
        year: number | null;
        imageUrl: string | null;
        thumbnailUrl: string | null;
        wikipediaUrl: string | null;
    }

    let {
        stories,
        startIndex = 0,
        onClose,
        onStoryViewed
    }: {
        stories: Story[];
        startIndex?: number;
        onClose: () => void;
        onStoryViewed?: (storyId: string) => void;
    } = $props();

    let currentIndex = $state(startIndex);
    let progressPct  = $state(0);
    let paused       = $state(false);
    let timer: ReturnType<typeof setInterval> | null = null;

    const STORY_DURATION_MS = 6000;
    const TICK_MS           = 50;

    function startTimer() {
        progressPct = 0;
        clearInterval(timer!);
        timer = setInterval(() => {
            if (paused) return;
            progressPct += (TICK_MS / STORY_DURATION_MS) * 100;
            if (progressPct >= 100) {
                next();
            }
        }, TICK_MS);
    }

    function next() {
        if (currentIndex < stories.length - 1) {
            currentIndex++;
            startTimer();
        } else {
            onClose();
        }
    }

    function prev() {
        if (currentIndex > 0) {
            currentIndex--;
            startTimer();
        }
    }

    function jumpTo(i: number) {
        currentIndex = i;
        startTimer();
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
    }

    onMount(() => {
        startTimer();
        window.addEventListener('keydown', handleKeydown);
    });

    onDestroy(() => {
        clearInterval(timer!);
        window.removeEventListener('keydown', handleKeydown);
    });

    let story = $derived(stories[currentIndex]);

    $effect(() => {
        if (onStoryViewed && story) {
            onStoryViewed(story.id);
        }
    });
</script>

<!-- Backdrop -->
<div
    class="viewer-backdrop"
    onclick={onClose}
    role="button"
    aria-label="Close story viewer"
    tabindex="-1"
></div>

<!-- Story card -->
<div
    class="viewer"
    onpointerdown={() => (paused = true)}
    onpointerup={() => (paused = false)}
    onpointerleave={() => (paused = false)}
>
    <!-- Progress bars -->
    <div class="progress-bars">
        {#each stories as _, i}
            <div class="progress-track">
                <div
                    class="progress-fill"
                    style:width={
                        i < currentIndex ? '100%' :
                        i === currentIndex ? `${progressPct}%` : '0%'
                    }
                ></div>
            </div>
        {/each}
    </div>

    <!-- Header: year badge + close -->
    <div class="story-header">
        <div class="year-badge">
            <svg class="cal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>Today in History{story?.year ? ` · ${story.year}` : ''}</span>
        </div>
        <button class="close-btn" onclick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
        </button>
    </div>

    <!-- Image -->
    <div class="story-image-wrap">
        {#if story?.imageUrl}
            <img src={story.imageUrl} alt={story.title} class="story-image" />
        {:else}
            <div class="story-image fallback-img">
                <span class="fallback-initial">{story?.title?.charAt(0) ?? '?'}</span>
            </div>
        {/if}
        <!-- Gradient overlay -->
        <div class="image-gradient"></div>
    </div>

    <!-- Text content -->
    <div class="story-content">
        <h2 class="story-title">{story?.title ?? ''}</h2>
        <p class="story-extract">{story?.extract ?? ''}</p>
        {#if story?.wikipediaUrl}
            <a
                href={story.wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="wiki-link"
                onclick={(e) => e.stopPropagation()}
            >
                Read on Wikipedia →
            </a>
        {/if}
    </div>

    <!-- Tap zones: left = prev, right = next -->
    <button class="tap-zone left" onclick={prev} aria-label="Previous story"></button>
    <button class="tap-zone right" onclick={next} aria-label="Next story"></button>

    <!-- Dot nav -->
    <div class="dot-nav">
        {#each stories as _, i}
            <button
                class="dot"
                class:active={i === currentIndex}
                onclick={() => jumpTo(i)}
                aria-label={`Story ${i + 1}`}
            ></button>
        {/each}
    </div>
</div>

<style>
    .viewer-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.75);
        z-index: 900;
    }

    .viewer {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: min(420px, 100vw);
        height: min(740px, 96vh);
        border-radius: 16px;
        overflow: hidden;
        z-index: 901;
        display: flex;
        flex-direction: column;
        background: #0f0f0f;
        box-shadow: 0 24px 80px rgba(0,0,0,0.7);
        user-select: none;
    }

    /* Progress bars */
    .progress-bars {
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        display: flex;
        gap: 3px;
        z-index: 10;
    }
    .progress-track {
        flex: 1;
        height: 2.5px;
        background: rgba(255,255,255,0.35);
        border-radius: 2px;
        overflow: hidden;
    }
    .progress-fill {
        height: 100%;
        background: #fff;
        border-radius: 2px;
        transition: width 0.05s linear;
    }

    /* Header */
    .story-header {
        position: absolute;
        top: 22px;
        left: 12px;
        right: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 10;
    }
    .year-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(0,0,0,0.45);
        backdrop-filter: blur(6px);
        border-radius: 20px;
        padding: 5px 12px;
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        font-family: system-ui, sans-serif;
    }
    .cal-icon { width: 14px; height: 14px; }
    .close-btn {
        background: rgba(0,0,0,0.4);
        border: none;
        border-radius: 50%;
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #fff;
        padding: 0;
        transition: background 0.15s;
    }
    .close-btn:hover { background: rgba(0,0,0,0.65); }
    .close-btn svg { width: 18px; height: 18px; }

    /* Image */
    .story-image-wrap {
        position: absolute;
        inset: 0;
    }
    .story-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
    .story-image.fallback-img {
        background: linear-gradient(135deg, #1e1b4b, #4f46e5);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .fallback-initial {
        font-size: 6rem;
        font-weight: 900;
        color: rgba(255,255,255,0.15);
        font-family: Georgia, serif;
    }
    .image-gradient {
        position: absolute;
        inset: 0;
        background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.15) 0%,
            transparent 30%,
            transparent 50%,
            rgba(0,0,0,0.65) 80%,
            rgba(0,0,0,0.88) 100%
        );
    }

    /* Text */
    .story-content {
        position: absolute;
        bottom: 52px;
        left: 0;
        right: 0;
        padding: 0 18px 16px;
        z-index: 10;
    }
    .story-title {
        color: #fff;
        font-size: 1.2rem;
        font-weight: 700;
        line-height: 1.3;
        margin: 0 0 8px;
        font-family: Georgia, 'Times New Roman', serif;
        text-shadow: 0 1px 6px rgba(0,0,0,0.5);
    }
    .story-extract {
        color: rgba(255,255,255,0.85);
        font-size: 0.82rem;
        line-height: 1.55;
        margin: 0 0 12px;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
        font-family: system-ui, sans-serif;
    }
    .wiki-link {
        display: inline-block;
        color: #93c5fd;
        font-size: 0.78rem;
        font-weight: 600;
        text-decoration: none;
        letter-spacing: 0.01em;
        transition: color 0.15s;
    }
    .wiki-link:hover { color: #bfdbfe; }

    /* Tap zones */
    .tap-zone {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 40%;
        background: none;
        border: none;
        cursor: pointer;
        z-index: 9;
    }
    .tap-zone.left  { left: 0; }
    .tap-zone.right { right: 0; }

    /* Dot nav */
    .dot-nav {
        position: absolute;
        bottom: 14px;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        gap: 5px;
        z-index: 10;
    }
    .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgba(255,255,255,0.35);
        border: none;
        padding: 0;
        cursor: pointer;
        transition: background 0.2s, transform 0.2s;
    }
    .dot.active {
        background: #fff;
        transform: scale(1.3);
    }
</style>
