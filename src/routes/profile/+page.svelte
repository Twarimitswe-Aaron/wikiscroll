<script lang="ts">
    import { api } from '$lib/api/client';
    import { authStore } from '$lib/stores/auth';
    import { onMount } from 'svelte';

    let profile = $state<any>(null);
    let loading = $state(true);
    let saving = $state(false);
    let error = $state('');
    let success = $state('');

    let formData = $state({
        firstName: '',
        lastName: '',
        bio: '',
        location: '',
        websiteUrl: ''
    });

    async function loadProfile() {
        try {
            profile = await api.get('/users/me');
            formData = {
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                bio: profile.bio || '',
                location: profile.location || '',
                websiteUrl: profile.websiteUrl || ''
            };
        } catch (err: unknown) {
            error = (err as Error).message || 'Failed to load profile';
        } finally {
            loading = false;
        }
    }

    async function saveProfile() {
        saving = true;
        error = '';
        success = '';
        
        try {
            const updatedProfile = await api.put<any>('/users/profile', formData);
            profile = updatedProfile;
            authStore.updateUser(updatedProfile);
            success = 'Profile updated successfully';
        } catch (err: unknown) {
            error = (err as Error).message || 'Failed to update profile';
        } finally {
            saving = false;
        }
    }

    onMount(() => {
        loadProfile();
    });
</script>

<div class="bg-white shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
            Personal Information
        </h3>
        <div class="mt-2 max-w-xl text-sm text-gray-500">
            <p>Update your personal details and public profile.</p>
        </div>
        
        {#if loading}
            <div class="flex justify-center py-8">
                <svg class="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        {:else if error && !profile}
            <div class="bg-red-50 p-4 rounded-md mt-4">
                <p class="text-red-700">{error}</p>
            </div>
        {:else}
            <form class="mt-5 space-y-6" onsubmit={(e) => { e.preventDefault(); saveProfile(); }}>
                {#if success}
                    <div class="bg-green-50 p-4 rounded-md">
                        <p class="text-green-700">{success}</p>
                    </div>
                {/if}
                
                {#if error && profile}
                    <div class="bg-red-50 p-4 rounded-md">
                        <p class="text-red-700">{error}</p>
                    </div>
                {/if}

                <div class="grid grid-cols-6 gap-6">
                    <div class="col-span-6 sm:col-span-3">
                        <label for="first-name" class="block text-sm font-medium text-gray-700">First name</label>
                        <input type="text" name="first-name" id="first-name" bind:value={formData.firstName} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>

                    <div class="col-span-6 sm:col-span-3">
                        <label for="last-name" class="block text-sm font-medium text-gray-700">Last name</label>
                        <input type="text" name="last-name" id="last-name" bind:value={formData.lastName} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>

                    <div class="col-span-6 sm:col-span-6">
                        <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
                        <input type="text" name="email" id="email" value={profile?.email} disabled class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm cursor-not-allowed">
                        <p class="mt-1 text-xs text-gray-500">Email address cannot be changed</p>
                    </div>

                    <div class="col-span-6 sm:col-span-6">
                        <label for="bio" class="block text-sm font-medium text-gray-700">Bio</label>
                        <textarea id="bio" name="bio" rows="3" bind:value={formData.bio} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                    </div>

                    <div class="col-span-6 sm:col-span-3">
                        <label for="location" class="block text-sm font-medium text-gray-700">Location</label>
                        <input type="text" name="location" id="location" bind:value={formData.location} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>

                    <div class="col-span-6 sm:col-span-3">
                        <label for="website" class="block text-sm font-medium text-gray-700">Website</label>
                        <input type="url" name="website" id="website" bind:value={formData.websiteUrl} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                </div>

                <div class="flex justify-end">
                    <button type="submit" disabled={saving} class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        {/if}
    </div>
</div>
