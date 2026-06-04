<script lang="ts">
    import { api } from '$lib/api/client';
    import { onMount } from 'svelte';
    
    interface Category {
        id: string;
        name: string;
        description: string;
        iconUrl?: string;
    }

    let categories = $state<Category[]>([]);
    let loading = $state(true);
    let error = $state('');

    async function loadCategories() {
        loading = true;
        try {
            categories = await api.get<Category[]>('/users/me/categories');
        } catch (err: unknown) {
            error = (err as Error).message || 'Failed to load followed categories';
        } finally {
            loading = false;
        }
    }

    async function toggleFollow(categoryId: string) {
        try {
            const response = await api.post<{ followed: boolean }>(`/users/follow/${categoryId}`);
            if (!response.followed) {
                // If unfollowed, remove from list
                categories = categories.filter(c => c.id !== categoryId);
            }
        } catch (err) {
            console.error('Failed to toggle category follow', err);
        }
    }

    onMount(() => {
        loadCategories();
    });
</script>

<div>
    <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Followed Categories</h2>
        <p class="mt-1 text-sm text-gray-500">Topics you are tracking for personalized content.</p>
    </div>

    {#if loading}
        <div class="flex justify-center py-12">
            <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    {:else if error}
        <div class="bg-red-50 p-4 rounded-md">
            <p class="text-red-700">{error}</p>
        </div>
    {:else if categories.length === 0}
        <div class="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <h3 class="mt-2 text-sm font-medium text-gray-900">No categories followed</h3>
            <p class="mt-1 text-sm text-gray-500">You haven't followed any topics yet.</p>
            <div class="mt-6">
                <a href={"/categories"} class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    Browse Categories
                </a>
            </div>
        </div>
    {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {#each categories as category (category.id)}
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 flex-shrink-0">
                            {#if category.iconUrl}
                                <img src={category.iconUrl} alt={category.name} class="h-5 w-5 object-contain" />
                            {:else}
                                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            {/if}
                        </div>
                        <div class="ml-4">
                            <h4 class="text-sm font-medium text-gray-900">{category.name}</h4>
                            <p class="text-xs text-gray-500 line-clamp-1">{category.description}</p>
                        </div>
                    </div>
                    <button 
                        onclick={() => toggleFollow(category.id)}
                        class="ml-4 flex-shrink-0 text-xs font-medium text-red-600 hover:text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors"
                    >
                        Unfollow
                    </button>
                </div>
            {/each}
        </div>
    {/if}
</div>
