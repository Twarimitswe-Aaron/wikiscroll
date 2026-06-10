<script lang="ts">
    // Reusable layout for authentication pages (Login / Register)
    import type { Snippet } from 'svelte';
    import { resolve } from '$app/paths';

    let { children } = $props<{ children: Snippet }>();

    const images = [
        {
            src: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=640',
            alt: 'Historical Documents',
            caption: 'Uncover the Past',
            classes: 'absolute top-0 right-8 z-10 w-64 h-80 object-cover rounded-xl shadow-2xl rotate-[-4deg] transition-transform duration-700 hover:rotate-0 hover:scale-105 hover:z-40 border-4 border-white'
        },
        {
            src: 'https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?auto=format&fit=crop&q=80&w=640',
            alt: 'Ancient Architecture',
            caption: 'Explore Eras',
            classes: 'absolute top-32 left-4 z-20 w-64 h-80 object-cover rounded-xl shadow-2xl rotate-[3deg] transition-transform duration-700 hover:rotate-0 hover:scale-105 hover:z-40 border-4 border-white'
        },
        {
            src: 'https://images.unsplash.com/photo-1533050487297-09b450131914?auto=format&fit=crop&q=80&w=640',
            alt: 'Vintage Camera',
            caption: 'Relive Moments',
            classes: 'absolute bottom-8 right-0 z-30 w-72 h-64 object-cover rounded-xl shadow-2xl rotate-[-2deg] transition-transform duration-700 hover:rotate-0 hover:scale-105 hover:z-40 border-4 border-white'
        }
    ];
</script>

<div class="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden relative">
    <!-- Back to Feed Button -->
    <a href={resolve('/')} class="absolute top-6 left-6 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors z-50 group">
        <svg class="w-6 h-6 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span class="text-sm font-semibold hidden sm:inline">Back to Feed</span>
    </a>
    
    <!-- Main Container -->
    <div class="flex max-w-[935px] w-full items-center justify-center gap-8 lg:gap-12">
        
        <!-- Left Side: Creative Image Collage (Hidden on small screens) -->
        <div class="hidden md:block relative w-[450px] h-[600px] shrink-0">
            {#each images as img (img.src)}
                <div class="absolute inset-0">
                    <img src={img.src} alt={img.alt} class={img.classes} />
                    <div class="{img.classes.replace('object-cover', '').replace('border-4 border-white', '')} bg-black/40 opacity-0 hover:opacity-100 flex items-end p-4 transition-opacity duration-300">
                        <span class="text-white font-serif font-bold text-lg drop-shadow-md">{img.caption}</span>
                    </div>
                </div>
            {/each}
        </div>

        <!-- Right Side: Form Container -->
        <div class="flex flex-col w-full max-w-[350px] shrink-0 pt-4 md:pt-0">
            {@render children()}
        </div>
    </div>
</div>
