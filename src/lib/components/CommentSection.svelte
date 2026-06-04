<script lang="ts">
    import { api } from '$lib/api/client';
    import { authStore } from '$lib/stores/auth';
    import { onMount } from 'svelte';
    
    let { eventId } = $props();
    
    let comments = $state<any[]>([]);
    let loading = $state(true);
    let submitting = $state(false);
    let newComment = $state('');
    let error = $state('');

    let isAuthenticated = $derived($authStore.isAuthenticated);

    async function loadComments() {
        loading = true;
        try {
            const response = await api.get<{ content: any[] }>(`/comments/event/${eventId}?page=0&size=50`, { requireAuth: false });
            comments = response.content || [];
        } catch (err) {
            console.error('Failed to load comments', err);
        } finally {
            loading = false;
        }
    }

    async function submitComment() {
        if (!newComment.trim() || !isAuthenticated) return;
        
        submitting = true;
        error = '';
        
        try {
            const response = await api.post<any>('/comments', {
                eventId,
                content: newComment
            });
            
            comments = [response, ...comments];
            newComment = '';
        } catch (err: unknown) {
            error = (err as Error).message || 'Failed to post comment';
        } finally {
            submitting = false;
        }
    }

    onMount(() => {
        loadComments();
    });
</script>

<div class="mt-1">
    {#if error}
        <p class="text-[11px] text-red-600 mb-2">{error}</p>
    {/if}

    {#if loading}
        <div class="flex justify-center py-3">
            <div class="animate-pulse flex space-x-1.5">
                <div class="h-1.5 w-1.5 bg-gray-300 rounded-full"></div>
                <div class="h-1.5 w-1.5 bg-gray-300 rounded-full"></div>
                <div class="h-1.5 w-1.5 bg-gray-300 rounded-full"></div>
            </div>
        </div>
    {:else if comments.length === 0}
        <p class="text-[11px] text-gray-400 italic text-center py-2">No comments yet.</p>
    {:else}
        <div class="space-y-3 max-h-60 overflow-y-auto pr-1">
            {#each comments as comment}
                <div class="flex items-start space-x-2.5 text-xs leading-normal">
                    <div class="h-6 w-6 flex-shrink-0 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 border border-gray-100 flex items-center justify-center text-gray-700 font-bold text-[9px] font-sans">
                        {comment.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div class="flex-grow">
                        <div class="text-[11px]">
                            <span class="font-bold text-gray-900 mr-1.5 hover:underline cursor-pointer">{comment.username}</span>
                            <span class="text-gray-800">{comment.content}</span>
                        </div>
                        <div class="flex items-center space-x-3.5 mt-0.5 text-[9px] text-gray-400 font-medium">
                            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                            <button class="hover:text-gray-600">Reply</button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    {#if isAuthenticated}
        <form onsubmit={(e) => { e.preventDefault(); submitComment(); }} class="flex items-center border-t border-gray-100 pt-2.5 mt-3">
            <input 
                type="text" 
                bind:value={newComment}
                placeholder="Add a comment..." 
                class="flex-grow border-0 focus:ring-0 text-[11px] px-1 py-1 text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            />
            <button 
                type="submit" 
                disabled={submitting || !newComment.trim()}
                class="text-[11px] font-bold text-sky-500 hover:text-sky-600 disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1 transition-colors"
            >
                Post
            </button>
        </form>
    {:else}
        <div class="border-t border-gray-100 pt-2.5 mt-3 text-center text-[10px] text-gray-500">
            <a href="/login" class="font-bold text-indigo-600 hover:underline">Log in</a> to leave a comment.
        </div>
    {/if}
</div>
