<script lang="ts">
    import { api } from '$lib/api/client';
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/auth';

    interface Category {
        id: string;
        name: string;
        description: string;
        iconUrl?: string;
    }

    interface ReelVideo {
        title: string;
        url: string;
        description: string;
        commonsUrl: string;
        likesCount: number;
        bookmarksCount: number;
        sharesCount: number;
        commentsCount: number;
        liked?: boolean;
        bookmarked?: boolean;
    }

    interface CommonsPage {
        pageid: number;
        title: string;
        imageinfo?: Array<{
            url: string;
            mime: string;
            mediatype: string;
            descriptionurl?: string;
            size?: number;
        }>;
    }

    // ── Universally Compatible MP4 Historical Video Dataset ──
    const fallbackVideos: ReelVideo[] = [
        {
            title: 'New York City in 1911',
            url: 'https://archive.org/download/NewYork1911/NewYork1911_512kb.mp4',
            description: 'Silent travelogue capturing the bustling streets of New York in 1911.',
            commonsUrl: 'https://archive.org/details/NewYork1911',
            likesCount: 1420,
            bookmarksCount: 680,
            sharesCount: 310,
            commentsCount: 89
        },
        {
            title: 'San Francisco Before the Fire (1906)',
            url: 'https://archive.org/download/TripDownMarketStreetrBeforeTheFire/TripDownMarketStreetrBeforeTheFire_512kb.mp4',
            description: 'Market Street just days before the devastating earthquake and fire of 1906.',
            commonsUrl: 'https://archive.details/TripDownMarketStreetrBeforeTheFire',
            likesCount: 2850,
            bookmarksCount: 1140,
            sharesCount: 560,
            commentsCount: 194
        },
        {
            title: 'Duck and Cover (1951)',
            url: 'https://archive.org/download/DuckandC1951/DuckandC1951_512kb.mp4',
            description: 'Archival civil defense social guidance film from the Cold War era.',
            commonsUrl: 'https://archive.org/details/DuckandC1951',
            likesCount: 940,
            bookmarksCount: 320,
            sharesCount: 142,
            commentsCount: 45
        },
        {
            title: 'Charlie Chaplin - The Kid (1921)',
            url: 'https://archive.org/download/TheKid1921/TheKid1921_512kb.mp4',
            description: 'Excerpt from Chaplin\'s landmark silent comedy-drama masterpiece.',
            commonsUrl: 'https://archive.org/details/TheKid1921',
            likesCount: 3120,
            bookmarksCount: 1540,
            sharesCount: 890,
            commentsCount: 278
        }
    ];

    // State Variables
    let categories = $state<Category[]>([]);
    let videos = $state<ReelVideo[]>([...fallbackVideos]);
    let activeTab = $state<'reels' | 'categories'>('reels');
    let loadingCategories = $state(true);
    let loadingVideos = $state(false);
    let categoriesError = $state('');
    let searchQuery = $state('');
    let globalMuted = $state(true);
    let copySuccessId = $state<string | null>(null);
    let activeIndex = $state(0);
    let showPlayStateIndicator = $state<'play' | 'pause' | null>(null);
    let videoBuffering = $state<Record<string, boolean>>({});
    let fetchOffset = $state(0);
    let hasMoreVideos = $state(true);
    let isAppending = $state(false);

    let isAuthenticated = $derived($authStore.isAuthenticated);
    let activeVideo = $derived(videos[activeIndex] || null);

    // Categories Loading
    async function loadCategories() {
        loadingCategories = true;
        categoriesError = '';
        try {
            const data = await api.get<Category[]>('/categories', { requireAuth: false });
            categories = data;
        } catch (err: unknown) {
            categoriesError = (err as Error).message || 'Failed to load categories';
        } finally {
            loadingCategories = false;
        }
    }

    async function toggleFollow(categoryId: string) {
        if (!isAuthenticated) return;
        try {
            await api.post<{ followed: boolean }>(`/users/follow/${categoryId}`);
        } catch (err) {
            console.error('Failed to toggle category follow', err);
        }
    }

    // ── Local Storage Helpers for Reels Interactions ──
    const LIKED_REELS_KEY = 'wik_liked_reels';
    const BOOKMARKED_REELS_KEY = 'wik_bookmarked_reels';

    function getPersistedSet(key: string): Set<string> {
        if (typeof window === 'undefined') return new Set();
        try {
            const raw = localStorage.getItem(key);
            return raw ? new Set(JSON.parse(raw)) : new Set();
        } catch { return new Set(); }
    }

    function savePersistedSet(key: string, set: Set<string>) {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(key, JSON.stringify([...set]));
        } catch (err) {
            console.warn('Could not save reels state:', err);
        }
    }

    function initializeReelStates(videoList: ReelVideo[]) {
        const likedSet = getPersistedSet(LIKED_REELS_KEY);
        const bookmarkedSet = getPersistedSet(BOOKMARKED_REELS_KEY);
        return videoList.map(v => {
            // Adjust count if it was previously liked/bookmarked but not reflected in the mock count
            let likes = v.likesCount;
            let bookmarks = v.bookmarksCount;
            const liked = likedSet.has(v.url);
            const bookmarked = bookmarkedSet.has(v.url);
            if (liked && !v.liked) likes++;
            if (bookmarked && !v.bookmarked) bookmarks++;
            return {
                ...v,
                liked,
                bookmarked,
                likesCount: likes,
                bookmarksCount: bookmarks
            };
        });
    }

    // Dynamic Video Search from Wikimedia Commons
    async function handleVideoSearch(keyword: string = '', append: boolean = false) {
        const query = keyword.trim() || searchQuery.trim();
        if (!query) {
            videos = initializeReelStates([...fallbackVideos]);
            activeIndex = 0;
            return;
        }
        
        if (append) {
            if (!hasMoreVideos || isAppending) return;
            isAppending = true;
        } else {
            fetchOffset = 0;
            hasMoreVideos = true;
            loadingVideos = true;
        }

        try {
            const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}+filetype:video&gsrnamespace=6&prop=imageinfo&iiprop=url|mime|mediatype|size&format=json&origin=*&gsrlimit=30&gsroffset=${fetchOffset}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Search failed');
            const data = await res.json();
            
            if (data.query && data.query.pages) {
                const pages = Object.values(data.query.pages) as CommonsPage[];
                const fetched = pages
                    .filter(p => {
                        const info = p.imageinfo?.[0];
                        if (!info || !info.url) return false;
                        const mime = info.mime?.toLowerCase() || '';
                        if (mime.includes('ogg')) return false;
                        if (info.size && info.size > 40 * 1024 * 1024) return false;
                        return true;
                    })
                    .map(p => {
                        const info = p.imageinfo![0];
                        const rawTitle = p.title.replace('File:', '').replace(/\.[^/.]+$/, '');
                        const displayTitle = rawTitle.replace(/_/g, ' ');
                        return {
                            title: displayTitle,
                            url: info.url,
                            description: `Archival footage from Wikimedia Commons database. Format: ${info.mime.split('/')[1]}`,
                            commonsUrl: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
                            likesCount: Math.floor(Math.random() * 900) + 120,
                            bookmarksCount: Math.floor(Math.random() * 400) + 30,
                            sharesCount: Math.floor(Math.random() * 200) + 10,
                            commentsCount: Math.floor(Math.random() * 80) + 5
                        };
                    });

                if (fetched.length > 0) {
                    const uniqueFetched = fetched.filter(fv => !fallbackVideos.some(fb => fb.url === fv.url) && (!append || !videos.some(v => v.url === fv.url)));
                    if (append) {
                        videos = [...videos, ...initializeReelStates(uniqueFetched)];
                    } else {
                        videos = initializeReelStates([...fallbackVideos, ...uniqueFetched]);
                    }
                } else if (!append) {
                    videos = initializeReelStates([...fallbackVideos]);
                }

                if (data.continue && data.continue.gsroffset) {
                    fetchOffset = data.continue.gsroffset;
                } else {
                    hasMoreVideos = false;
                }
            } else {
                if (!append) videos = initializeReelStates([...fallbackVideos]);
                hasMoreVideos = false;
            }
        } catch (err) {
            console.error('Failed Wikimedia search:', err);
            if (!append) videos = initializeReelStates([...fallbackVideos]);
        } finally {
            if (append) {
                isAppending = false;
            } else {
                loadingVideos = false;
                activeIndex = 0;
            }
        }
    }

    // Video Playback control
    function togglePlay(videoEl: HTMLVideoElement) {
        if (videoEl.paused) {
            videoEl.play().catch(() => {});
            showPlayStateIndicator = 'play';
        } else {
            videoEl.pause();
            showPlayStateIndicator = 'pause';
        }
        setTimeout(() => {
            showPlayStateIndicator = null;
        }, 600);
    }

    function toggleMute() {
        globalMuted = !globalMuted;
    }

    function handleLike() {
        if (!activeVideo) return;
        const likedSet = getPersistedSet(LIKED_REELS_KEY);
        
        if (activeVideo.liked) {
            activeVideo.liked = false;
            activeVideo.likesCount--;
            likedSet.delete(activeVideo.url);
        } else {
            activeVideo.liked = true;
            activeVideo.likesCount++;
            likedSet.add(activeVideo.url);
        }
        savePersistedSet(LIKED_REELS_KEY, likedSet);
    }

    function handleBookmark() {
        if (!activeVideo) return;
        const bookmarkedSet = getPersistedSet(BOOKMARKED_REELS_KEY);
        
        if (activeVideo.bookmarked) {
            activeVideo.bookmarked = false;
            activeVideo.bookmarksCount--;
            bookmarkedSet.delete(activeVideo.url);
        } else {
            activeVideo.bookmarked = true;
            activeVideo.bookmarksCount++;
            bookmarkedSet.add(activeVideo.url);
        }
        savePersistedSet(BOOKMARKED_REELS_KEY, bookmarkedSet);
    }

    async function copyShareLink() {
        if (!activeVideo) return;
        try {
            await navigator.clipboard.writeText(activeVideo.url);
            copySuccessId = activeVideo.title;
            setTimeout(() => {
                if (copySuccessId === activeVideo.title) copySuccessId = null;
            }, 2000);
        } catch {
            // silent catch
        }
    }

    // Scroll snaps management
    function scrollToVideo(index: number) {
        if (index < 0 || index >= videos.length) return;
        activeIndex = index;
        const container = document.querySelector('.reels-viewport');
        if (container) {
            const cardHeight = container.clientHeight;
            container.scrollTo({
                top: index * cardHeight,
                behavior: 'smooth'
            });
        }
    }

    // Intersection Observer to Auto-Play/Pause active slide
    let observer: IntersectionObserver;
    onMount(() => {
        videos = initializeReelStates(videos);
        loadCategories();
        
        // Auto-fetch initial videos on load
        handleVideoSearch('history');

        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target.querySelector('video') as HTMLVideoElement;
                if (entry.isIntersecting) {
                    if (video) video.play().catch(() => {});
                    
                    const indexAttr = entry.target.getAttribute('data-index');
                    if (indexAttr) {
                        const newIndex = parseInt(indexAttr, 10);
                        if (newIndex >= 0 && newIndex < videos.length && newIndex !== activeIndex) {
                            activeIndex = newIndex;
                            
                            // Trigger infinite scroll prefetch when 3 videos away from the end
                            if (activeIndex >= videos.length - 3 && hasMoreVideos && !loadingVideos && !isAppending) {
                                handleVideoSearch('', true);
                            }
                        }
                    }
                } else {
                    if (video) {
                        video.pause();
                        video.currentTime = 0; // reset
                    }
                }
            });
        }, {
            threshold: 0.6
        });
    });

    $effect(() => {
        if (activeTab === 'reels' && videos.length > 0) {
            setTimeout(() => {
                const cards = document.querySelectorAll('.reel-card');
                cards.forEach(card => observer.observe(card));
            }, 100);
            return () => {
                const cards = document.querySelectorAll('.reel-card');
                cards.forEach(card => observer.unobserve(card));
            };
        }
    });

    // Also observe any new cards appended
    $effect(() => {
        if (activeTab === 'reels' && videos.length > 0 && !isAppending) {
            setTimeout(() => {
                const cards = document.querySelectorAll('.reel-card:not([data-observed])');
                cards.forEach(card => {
                    observer.observe(card);
                    card.setAttribute('data-observed', 'true');
                });
            }, 150);
        }
    });
</script>

<div class="max-w-4xl mx-auto text-neutral-100 min-h-screen pb-16">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between border-b border-neutral-800 pb-5 mb-6 gap-4">
        <div>
            <h1 class="text-2xl font-bold font-serif tracking-tight text-white">Explore Portal</h1>
            <p class="text-xs text-neutral-400 mt-1">Discover public-domain historical videos and personalize your knowledge categories.</p>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex bg-neutral-900 p-1 rounded-lg border border-neutral-800 w-fit">
            <button
                onclick={() => activeTab = 'reels'}
                class="px-4 py-1.5 text-xs font-semibold rounded-md transition-all {activeTab === 'reels' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white bg-transparent'}"
            >
                Reels
            </button>
            <button
                onclick={() => activeTab = 'categories'}
                class="px-4 py-1.5 text-xs font-semibold rounded-md transition-all {activeTab === 'categories' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white bg-transparent'}"
            >
                Categories
            </button>
        </div>
    </div>

    <!-- ── REELS TAB ── -->
    {#if activeTab === 'reels'}
        <!-- Search bar for videos -->
        <div class="max-w-[450px] mx-auto mb-6 relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg class="h-4.5 w-4.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
            </div>
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Search historical topics (e.g. Space, City, War)..."
                class="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl pl-10 pr-20 py-2.5 text-xs font-sans focus:outline-none focus:border-neutral-700"
                onkeydown={(e) => e.key === 'Enter' && handleVideoSearch()}
            />
            <button
                onclick={() => handleVideoSearch()}
                class="absolute right-1.5 top-1.5 bottom-1.5 bg-[#0095f6] hover:bg-[#1877f2] text-white text-[11px] font-bold px-3.5 rounded-lg transition-colors"
            >
                Search
            </button>
        </div>

        {#if loadingVideos}
            <div class="flex items-center justify-center gap-4 md:gap-6 max-w-[540px] mx-auto relative select-none">
                <!-- Center Video Frame Skeleton -->
                <div class="relative w-[310px] md:w-[350px] h-[72vh] max-h-[580px] rounded-2xl overflow-hidden border border-neutral-800 bg-black shadow-2xl animate-pulse">
                    <div class="w-full h-full bg-neutral-950"></div>
                    <!-- Bottom Info Card Skeleton -->
                    <div class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 to-transparent p-4 flex flex-col justify-end">
                        <div class="flex items-center gap-2 mb-2">
                            <div class="h-6 w-6 rounded-full bg-neutral-800"></div>
                            <div class="h-3 w-24 bg-neutral-800 rounded-md"></div>
                        </div>
                        <div class="h-4 w-3/4 bg-neutral-800 rounded-md mb-2 mt-1"></div>
                        <div class="h-3 w-full bg-neutral-800 rounded-md mb-1.5 mt-2"></div>
                        <div class="h-3 w-5/6 bg-neutral-800 rounded-md mb-3"></div>
                        <div class="h-5 w-20 bg-neutral-800 rounded-full mt-1.5"></div>
                    </div>
                </div>
                
                <!-- Actions Column Skeleton -->
                <div class="flex flex-col items-center gap-4 z-20">
                    {#each [1, 2, 3, 4] as i (i)}
                        <div class="flex flex-col items-center animate-pulse">
                            <div class="w-[42px] h-[42px] bg-neutral-900 rounded-full"></div>
                            <div class="h-2 w-6 bg-neutral-900 rounded-sm mt-1.5"></div>
                        </div>
                    {/each}
                </div>

                <!-- Navigation Chevrons Column Skeleton -->
                <div class="flex flex-col gap-3 z-20">
                    <div class="w-[42px] h-[42px] bg-neutral-900 rounded-full animate-pulse shadow-lg border border-neutral-800"></div>
                    <div class="w-[42px] h-[42px] bg-neutral-900 rounded-full animate-pulse shadow-lg border border-neutral-800"></div>
                </div>
            </div>
        {:else if videos.length === 0}
            <div class="border border-neutral-800 bg-neutral-950 rounded-2xl p-12 text-center max-w-[450px] mx-auto">
                <svg class="mx-auto h-10 w-10 text-neutral-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <h3 class="text-sm font-semibold text-neutral-300">No archival videos found</h3>
                <p class="text-xs text-neutral-500 mt-1">Try another search term or click Search with an empty box to reset.</p>
            </div>
        {:else}
            <!-- Main Reels Component Layout (Matches Instagram Reels Exactly) -->
            <div class="flex items-center justify-center gap-4 md:gap-6 max-w-[540px] mx-auto relative select-none">
                
                <!-- Center Video Frame -->
                <div class="relative w-[310px] md:w-[350px] h-[72vh] max-h-[580px] rounded-2xl overflow-hidden border border-neutral-800 bg-black shadow-2xl flex flex-col justify-between">
                    
                    <!-- Snap scroll viewport -->
                    <div
                        class="reels-viewport snap-y snap-mandatory overflow-y-scroll w-full h-full"
                        style="scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch;"
                    >
                        {#each videos as video, idx (video.url)}
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_static_element_interactions -->
                            <div 
                                class="reel-card snap-start w-full h-full relative bg-neutral-950 flex items-center justify-center cursor-pointer"
                                data-index={idx}
                                onclick={(e) => togglePlay(e.currentTarget.querySelector('video') as HTMLVideoElement)}
                            >
                                <video
                                    src={video.url}
                                    class="w-full h-full object-cover"
                                    loop
                                    playsinline
                                    muted={globalMuted}
                                    onwaiting={() => videoBuffering[video.url] = true}
                                    onplaying={() => videoBuffering[video.url] = false}
                                    oncanplay={() => videoBuffering[video.url] = false}
                                    onerror={() => videoBuffering[video.url] = false}
                                ></video>

                                <!-- Buffering Indicator Overlay -->
                                {#if videoBuffering[video.url]}
                                    <div class="absolute inset-0 z-0 bg-neutral-950 animate-pulse pointer-events-none rounded-2xl overflow-hidden">
                                    </div>
                                {/if}

                                <!-- Play/Pause State Indicator Icons (Overlay) -->
                                {#if showPlayStateIndicator && activeIndex === idx}
                                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                                        <div class="bg-black/50 p-4 rounded-full animate-ping [animation-duration:0.5s]">
                                            {#if showPlayStateIndicator === 'play'}
                                                <svg class="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z"/>
                                                </svg>
                                            {:else}
                                                <svg class="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                                                </svg>
                                            {/if}
                                        </div>
                                    </div>
                                {/if}

                                <!-- Bottom Info Card (Inside Video) -->
                                <div class="absolute inset-x-0 bottom-0 z-15 bg-linear-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col justify-end pointer-events-none">
                                    <div class="flex items-center gap-2 mb-1.5">
                                        <div class="h-6 w-6 rounded-full bg-linear-to-tr from-pink-500 to-yellow-500 p-[1.2px]">
                                            <div class="h-full w-full rounded-full bg-black flex items-center justify-center text-[9px] font-bold text-white font-serif">
                                                W
                                            </div>
                                        </div>
                                        <span class="text-xs font-bold text-neutral-100">wikimedia_commons</span>
                                        <span class="text-[8px] bg-white/20 text-white font-bold py-0.5 px-1.5 rounded-full uppercase tracking-wider">Public Domain</span>
                                    </div>

                                    <h3 class="text-xs font-bold text-white truncate max-w-[240px]">
                                        {video.title}
                                    </h3>

                                    <p class="text-[11px] text-neutral-300 mt-1 line-clamp-2 max-w-[240px]">
                                        {video.description}
                                    </p>

                                    <div class="flex items-center justify-between mt-2.5">
                                        <div class="flex items-center gap-1.5 text-[10px] text-neutral-300 bg-white/10 px-2 py-0.5 rounded-full">
                                            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M9 18V5l12-2v13M9 9l12-2"/>
                                                <circle cx="6" cy="18" r="3"/>
                                                <circle cx="18" cy="16" r="3"/>
                                            </svg>
                                            <span class="uppercase tracking-wider font-semibold text-[9px]">Archival Reel</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Volume speaker indicator overlay inside video frame (bottom-right) -->
                                <button
                                    onclick={(e) => { e.stopPropagation(); toggleMute(); }}
                                    class="absolute bottom-4 right-4 z-20 bg-black/50 hover:bg-black/75 p-2 rounded-full border border-white/10 text-white active:scale-90 transition-transform pointer-events-auto"
                                    aria-label="Toggle Sound"
                                >
                                    {#if globalMuted}
                                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                            <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/>
                                        </svg>
                                    {:else}
                                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                            <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                                            <path d="M15.54 8.46a5 5 0 010 7.07"/>
                                        </svg>
                                    {/if}
                                </button>
                            </div>
                        {/each}
                    </div>
                </div>

                <!-- Actions Column (Outside of video card, on the right side) -->
                <div class="flex flex-col items-center gap-4 z-20">
                    <!-- Like -->
                    <button
                        onclick={handleLike}
                        class="flex flex-col items-center group bg-transparent border-0 p-0 cursor-pointer"
                        aria-label="Like Video"
                    >
                        <div class="bg-neutral-900 hover:bg-neutral-800 p-2.5 rounded-full border border-neutral-800 text-white transition-all duration-200 group-hover:scale-110 active:scale-95 flex items-center justify-center shadow-lg">
                            <svg
                                class="w-5 h-5 transition-colors duration-150 {activeVideo?.liked ? 'fill-red-500 stroke-red-500 text-red-500' : 'text-neutral-300'}"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.2"
                            >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                        </div>
                        <span class="text-[10px] text-neutral-300 font-semibold mt-1 font-sans">{activeVideo?.likesCount || 0}</span>
                    </button>

                    <!-- Comments / Messages -->
                    <button
                        class="flex flex-col items-center group bg-transparent border-0 p-0 cursor-pointer"
                        aria-label="View Comments"
                    >
                        <div class="bg-neutral-900 hover:bg-neutral-800 p-2.5 rounded-full border border-neutral-800 text-white transition-all duration-200 group-hover:scale-110 active:scale-95 flex items-center justify-center shadow-lg">
                            <svg class="w-5 h-5 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                        </div>
                        <span class="text-[10px] text-neutral-300 font-semibold mt-1 font-sans">{activeVideo?.commentsCount || 0}</span>
                    </button>

                    <!-- Share -->
                    <button
                        onclick={copyShareLink}
                        class="flex flex-col items-center group bg-transparent border-0 p-0 cursor-pointer relative"
                        aria-label="Share Link"
                    >
                        <div class="bg-neutral-900 hover:bg-neutral-800 p-2.5 rounded-full border border-neutral-800 text-white transition-all duration-200 group-hover:scale-110 active:scale-95 flex items-center justify-center shadow-lg">
                            <svg class="w-5 h-5 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                                <circle cx="18" cy="5" r="3"/>
                                <circle cx="6" cy="12" r="3"/>
                                <circle cx="18" cy="19" r="3"/>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                            </svg>
                        </div>
                        <span class="text-[10px] text-neutral-300 font-semibold mt-1 font-sans">
                            {activeVideo && copySuccessId === activeVideo.title ? 'Copied' : activeVideo?.sharesCount || 0}
                        </span>
                    </button>

                    <!-- Bookmark -->
                    <button
                        onclick={handleBookmark}
                        class="flex flex-col items-center group bg-transparent border-0 p-0 cursor-pointer"
                        aria-label="Save Video"
                    >
                        <div class="bg-neutral-900 hover:bg-neutral-800 p-2.5 rounded-full border border-neutral-800 text-white transition-all duration-200 group-hover:scale-110 active:scale-95 flex items-center justify-center shadow-lg">
                            <svg
                                class="w-5 h-5 transition-colors duration-150 {activeVideo?.bookmarked ? 'fill-yellow-500 stroke-yellow-500 text-yellow-500' : 'text-neutral-300'}"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.2"
                            >
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                            </svg>
                        </div>
                        <span class="text-[10px] text-neutral-300 font-semibold mt-1 font-sans">{activeVideo?.bookmarksCount || 0}</span>
                    </button>

                    <!-- External Source link -->
                    {#if activeVideo}
                        <button
                            onclick={() => window.open(activeVideo?.commonsUrl, '_blank', 'noopener,noreferrer')}
                            class="flex flex-col items-center group bg-transparent border-0 p-0 cursor-pointer"
                            aria-label="Wikimedia Source Page"
                        >
                            <div class="bg-neutral-900 hover:bg-neutral-800 p-2.5 rounded-full border border-neutral-800 text-white transition-all duration-200 group-hover:scale-110 flex items-center justify-center shadow-lg">
                                <svg class="w-5 h-5 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                                </svg>
                            </div>
                            <span class="text-[8px] text-neutral-400 font-bold mt-1 uppercase tracking-wider">Source</span>
                        </button>
                    {/if}
                </div>

                <!-- Navigation Chevrons Column (Far Right, exact match to screenshot) -->
                <div class="flex flex-col gap-3 z-20">
                    <!-- Scroll Up -->
                    <button
                        onclick={() => scrollToVideo(activeIndex - 1)}
                        disabled={activeIndex === 0}
                        class="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 p-3 rounded-full border border-neutral-800 text-white transition-all active:scale-90 cursor-pointer shadow-lg flex items-center justify-center"
                        aria-label="Scroll Up"
                    >
                        <svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="18 15 12 9 6 15" />
                        </svg>
                    </button>

                    <!-- Scroll Down -->
                    <button
                        onclick={() => scrollToVideo(activeIndex + 1)}
                        disabled={activeIndex === videos.length - 1}
                        class="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 p-3 rounded-full border border-neutral-800 text-white transition-all active:scale-90 cursor-pointer shadow-lg flex items-center justify-center"
                        aria-label="Scroll Down"
                    >
                        <svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>
                </div>

            </div>

            <!-- Scroll instructions -->
            <p class="text-[9px] text-neutral-500 text-center mt-4 tracking-widest uppercase">Scroll or use arrows to explore clips</p>
        {/if}
    {/if}

    <!-- ── CATEGORIES TAB ── -->
    {#if activeTab === 'categories'}
        {#if loadingCategories}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each [1, 2, 3, 4, 5, 6] as i (i)}
                    <div class="bg-neutral-950 rounded-xl border border-neutral-800 p-5 flex flex-col items-center text-center animate-pulse">
                        <div class="h-12 w-12 bg-neutral-900 rounded-full mb-3"></div>
                        <div class="h-4 w-24 bg-neutral-900 rounded-md mb-2.5"></div>
                        <div class="h-3 w-full bg-neutral-900 rounded-md mt-2 mb-1.5"></div>
                        <div class="h-3 w-4/5 bg-neutral-900 rounded-md mb-6"></div>
                        {#if isAuthenticated}
                            <div class="w-full h-8 bg-neutral-900 rounded-lg mt-auto"></div>
                        {/if}
                    </div>
                {/each}
            </div>
        {:else if categoriesError}
            <div class="border border-red-900 bg-red-950/30 rounded-xl p-6 text-center max-w-md mx-auto">
                <p class="text-red-400 mb-4 text-xs">{categoriesError}</p>
                <button onclick={loadCategories} class="px-4 py-1.5 bg-red-900/40 text-red-300 border border-red-800 rounded-lg text-xs font-semibold hover:bg-red-900/60 transition-colors">
                    Try Again
                </button>
            </div>
        {:else if categories.length === 0}
            <div class="border border-neutral-800 bg-neutral-950 rounded-2xl p-12 text-center max-w-md mx-auto">
                <h3 class="text-sm font-semibold text-neutral-400">No categories found</h3>
            </div>
        {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each categories as category (category.id)}
                    <div class="bg-neutral-950 rounded-xl border border-neutral-800 p-5 hover:border-neutral-700 transition-all flex flex-col items-center text-center">
                        <div class="h-12 w-12 bg-neutral-900 rounded-full border border-neutral-800 flex items-center justify-center mb-3 text-neutral-400">
                            {#if category.iconUrl}
                                <img src={category.iconUrl} alt={category.name} class="h-6 w-6 object-contain" />
                            {:else}
                                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            {/if}
                        </div>
                        
                        <h3 class="text-sm font-semibold text-white mb-1.5">{category.name}</h3>
                        <p class="text-xs text-neutral-400 line-clamp-2 mb-4 grow leading-relaxed">
                            {category.description || 'Explore historical events related to this topic.'}
                        </p>
                        
                        {#if isAuthenticated}
                            <button 
                                onclick={() => toggleFollow(category.id)}
                                class="w-full py-1.5 px-3 border border-neutral-800 text-neutral-300 bg-neutral-900 rounded-lg text-xs font-semibold hover:bg-neutral-800 hover:text-white transition-colors"
                            >
                                Follow
                            </button>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
    {/if}
</div>
