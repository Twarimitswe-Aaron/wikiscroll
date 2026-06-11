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
    class="fixed inset-0 bg-black/75 z-[900]"
    onclick={onClose}
    role="button"
    aria-label="Close story viewer"
    tabindex="-1"
></div>

<!-- Story card -->
<div
    class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(420px,100vw)] h-[min(740px,96vh)] rounded-2xl overflow-hidden z-[901] flex flex-col bg-[#0f0f0f] shadow-[0_24px_80px_rgba(0,0,0,0.7)] select-none"
    onpointerdown={() => (paused = true)}
    onpointerup={() => (paused = false)}
    onpointerleave={() => (paused = false)}
>
    <!-- Progress bars -->
    <div class="absolute top-2.5 left-2.5 right-2.5 flex gap-[3px] z-10">
        {#each stories as _, i}
            <div class="flex-1 h-[2.5px] bg-white/35 rounded-[2px] overflow-hidden">
                <div
                    class="h-full bg-white rounded-[2px] transition-[width] duration-[0.05s] linear"
                    style:width={
                        i < currentIndex ? '100%' :
                        i === currentIndex ? `${progressPct}%` : '0%'
                    }
                ></div>
            </div>
        {/each}
    </div>

    <!-- Header: year badge + close -->
    <div class="absolute top-[22px] left-3 right-3 flex items-center justify-between z-10">
        <div class="flex items-center gap-1.5 bg-black/45 backdrop-blur-md rounded-[20px] py-1 px-3 text-white text-[13px] font-semibold font-sans">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>Today in History{story?.year ? ` · ${story.year}` : ''}</span>
        </div>
        <button class="bg-black/40 border-0 rounded-full w-[34px] h-[34px] flex items-center justify-center cursor-pointer text-white p-0 transition-colors duration-150 hover:bg-black/65" onclick={onClose} aria-label="Close">
            <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
        </button>
    </div>

    <!-- Image -->
    <div class="absolute inset-0">
        {#if story?.imageUrl}
            <img src={story.imageUrl} alt={story.title} class="w-full h-full object-cover block" decoding="async" />
        {:else}
            <div class="w-full h-full object-cover bg-gradient-to-br from-indigo-950 to-indigo-600 flex items-center justify-center">
                <span class="text-[6rem] font-black text-white/15 font-serif">{story?.title?.charAt(0) ?? '?'}</span>
            </div>
        {/if}
        <!-- Gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent via-[50%] to-black/88"></div>
    </div>

    <!-- Text content -->
    <div class="absolute bottom-[52px] left-0 right-0 px-[18px] pb-4 z-10">
        <h2 class="text-white text-lg font-bold leading-tight mb-2 font-serif [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">{story?.title ?? ''}</h2>
        <p class="text-white/85 text-xs leading-relaxed mb-3 line-clamp-4 font-sans">{story?.extract ?? ''}</p>
        {#if story?.wikipediaUrl}
            <a
                href={story.wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="inline-block text-sky-300 text-[11px] font-semibold no-underline tracking-wide transition-colors duration-150 hover:text-sky-200"
                onclick={(e) => e.stopPropagation()}
            >
                Read on Wikipedia →
            </a>
        {/if}
    </div>

    <!-- Tap zones: left = prev, right = next -->
    <button class="absolute top-0 bottom-0 w-[40%] bg-transparent border-0 cursor-pointer z-[9] left-0" onclick={prev} aria-label="Previous story"></button>
    <button class="absolute top-0 bottom-0 w-[40%] bg-transparent border-0 cursor-pointer z-[9] right-0" onclick={next} aria-label="Next story"></button>

    <!-- Dot nav -->
    <div class="absolute bottom-3.5 left-0 right-0 flex justify-center gap-1.25 z-10">
        {#each stories as _, i}
            <button
                class="w-1.5 h-1.5 rounded-full bg-white/35 border-0 p-0 cursor-pointer transition-all duration-200"
                class:!bg-white={i === currentIndex}
                class:scale-125={i === currentIndex}
                onclick={() => jumpTo(i)}
                aria-label={`Story ${i + 1}`}
            ></button>
        {/each}
    </div>
</div>
