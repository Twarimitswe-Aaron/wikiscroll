<script lang="ts">
    import { api } from '$lib/api/client';
    import { onMount } from 'svelte';
    
    interface UserRow {
        id: string;
        username: string;
        email: string;
        status: string;
        role: string;
    }

    let users = $state<UserRow[]>([]);
    let loading = $state(true);
    let error = $state('');
    let successMessage = $state('');

    async function loadUsers() {
        loading = true;
        try {
            // Note: If the backend doesn't have this endpoint yet, this will fail gracefully
            const response = await api.get<{ content: UserRow[] }>('/admin/users');
            users = response.content || [];
        } catch (err: unknown) {
            error = (err as Error).message || 'Failed to load users (Endpoint might be missing)';
            // Fallback mock data for demonstration purposes if backend endpoint is missing
            if (users.length === 0) {
                users = [
                    { id: '1', username: 'testuser1', email: 'test1@example.com', status: 'ACTIVE', role: 'USER' },
                    { id: '2', username: 'testuser2', email: 'test2@example.com', status: 'LOCKED', role: 'USER' }
                ];
                error = 'Showing mock data (Backend GET endpoint missing)';
            }
        } finally {
            loading = false;
        }
    }

    async function updateUserStatus(userId: string, currentStatus: string) {
        const newStatus = currentStatus === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
        error = '';
        successMessage = '';
        
        try {
            const response = await api.put<{ message: string }>(`/admin/users/${userId}/status`, { status: newStatus });
            
            // Update local state
            users = users.map(u => u.id === userId ? { ...u, status: newStatus } : u);
            successMessage = response.message || `User status updated to ${newStatus}`;
            
            setTimeout(() => { successMessage = ''; }, 3000);
        } catch (err: unknown) {
            error = (err as Error).message || 'Failed to update user status';
        }
    }

    onMount(() => {
        loadUsers();
    });
</script>

<div class="bg-white shadow rounded-lg overflow-hidden">
    <div class="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
        <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900">
                User Management
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
                View and manage user accounts across the platform.
            </p>
        </div>
    </div>
    
    {#if successMessage}
        <div class="bg-green-50 p-4 border-b border-green-100">
            <p class="text-sm text-green-700">{successMessage}</p>
        </div>
    {/if}
    
    {#if error && !users.length}
        <div class="p-6 text-center">
            <p class="text-red-600">{error}</p>
        </div>
    {:else}
        {#if error && users.length}
            <div class="bg-yellow-50 p-4 border-b border-yellow-100">
                <p class="text-sm text-yellow-700">{error}</p>
            </div>
        {/if}
        
        {#if loading}
            <div class="flex justify-center py-12">
                <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        {:else}
            <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each users as user (user.id)}
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div class="ml-4">
                                        <div class="text-sm font-medium text-gray-900">{user.username}</div>
                                        <div class="text-sm text-gray-500">{user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}">
                                    {user.role}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                    {user.status}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {#if user.role !== 'ADMIN'}
                                    <button 
                                        onclick={() => updateUserStatus(user.id, user.status)}
                                        class="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                                    >
                                        {user.status === 'ACTIVE' ? 'Lock Account' : 'Activate Account'}
                                    </button>
                                {:else}
                                    <span class="text-gray-400 cursor-not-allowed">Admin</span>
                                {/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        {/if}
    {/if}
</div>
