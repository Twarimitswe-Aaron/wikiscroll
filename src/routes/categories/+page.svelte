<script lang="ts">
    import { api } from '$lib/api/client';
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/auth';
    
    let categories = $state<any[]>([]);
    let loading = $state(true);
    let error = $state('');

    let isAuthenticated = $derived($authStore.isAuthenticated);

    async function loadCategories() {
        loading = true;
        error = '';
        
        try {
            categories = await api.get<any[]>('/categories', { requireAuth: false });
        } catch (err: unknown) {
            error = (err as Error).message || 'Failed to load categories';
        } finally {
            loading = false;
        }
    }

    async function toggleFollow(categoryId: string, index: number) {
        if (!isAuthenticated) return;
        
        try {
            const response = await api.post<{ followed: boolean }>(`/users/follow/${categoryId}`);
            // Optimistically or reactively update UI if we were tracking followed status locally
            // Note: The API response 'followed' indicates the new state
        } catch (err) {
            console.error('Failed to toggle category follow', err);
        }
    }

    onMount(() => {
        loadCategories();
    });
</script>

<div class="max-w-4xl mx-auto">
    <div class="mb-8 border-b border-gray-200 pb-4">
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Explore Categories</h1>
        <p class="mt-2 text-gray-500">Find topics that interest you and follow them to personalize your feed.</p>
    </div>

    {#if loading}
        <div class="flex justify-center py-12">
            <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    {:else if error}
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p class="text-red-600 mb-4">{error}</p>
            <button onclick={loadCategories} class="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                Try Again
            </button>
        </div>
    {:else if categories.length === 0}
        <div class="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center">
            <h3 class="text-lg font-medium text-gray-900">No categories found</h3>
        </div>
    {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each categories as category, i (category.id)}
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col items-center text-center">
                    <div class="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                        {#if category.iconUrl}
                            <img src={category.iconUrl} alt={category.name} class="h-8 w-8 object-contain" />
                        {:else}
                            <svg class="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        {/if}
                    </div>
                    
                    <h3 class="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                    <p class="text-sm text-gray-500 line-clamp-3 mb-6 flex-grow">
                        {category.description || 'Explore historical events related to this topic.'}
                    </p>
                    
                    {#if isAuthenticated}
                        <button 
                            onclick={() => toggleFollow(category.id, i)}
                            class="w-full py-2 px-4 border border-indigo-600 text-indigo-600 rounded-md font-medium hover:bg-indigo-50 transition-colors"
                        >
                            Follow
                        </button>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</div>
