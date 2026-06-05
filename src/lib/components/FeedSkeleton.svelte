<script lang="ts">
    /** Number of skeleton cards to render while loading */
    let { count = 4 }: { count?: number } = $props();
</script>

{#each Array(count) as _}
    <article class="card">
        <!-- Header -->
        <div class="header">
            <div class="header-left">
                <div class="sk avatar"></div>
                <div class="meta">
                    <div class="sk line w-28 h-3 mb-1"></div>
                    <div class="sk line w-20 h-2"></div>
                </div>
            </div>
            <div class="sk dot-menu"></div>
        </div>

        <!-- Image block — same aspect-ratio as the real card -->
        <div class="sk image-block"></div>

        <!-- Action buttons -->
        <div class="actions">
            <div class="action-left">
                <div class="sk icon"></div>
                <div class="sk icon"></div>
                <div class="sk icon"></div>
            </div>
            <div class="sk icon"></div>
        </div>

        <!-- Like count -->
        <div class="px-section">
            <div class="sk line w-16 h-3"></div>
        </div>

        <!-- Caption lines -->
        <div class="px-section caption-block">
            <div class="sk line w-full h-2.5 mb-1.5"></div>
            <div class="sk line w-4/5  h-2.5 mb-1.5"></div>
            <div class="sk line w-2/3  h-2.5"></div>
        </div>

        <!-- Timestamp -->
        <div class="px-section timestamp">
            <div class="sk line w-24 h-2"></div>
        </div>
    </article>
{/each}

<style>
    /* Card shell */
    .card {
        background: #fff;
        border: 1px solid #efefef;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 24px;
    }

    /* Shimmer keyframe */
    @keyframes shimmer {
        0%   { background-position: -600px 0; }
        100% { background-position:  600px 0; }
    }

    /* Base skeleton element */
    .sk {
        background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e8e8e8 50%,
            #f0f0f0 75%
        );
        background-size: 600px 100%;
        animation: shimmer 1.5s infinite linear;
        border-radius: 4px;
    }

    /* ── Specific shapes ── */
    .avatar {
        width:  36px;
        height: 36px;
        border-radius: 50%;
        flex-shrink: 0;
    }
    .dot-menu {
        width:  20px;
        height: 20px;
        border-radius: 4px;
    }
    .image-block {
        width: 100%;
        aspect-ratio: 1 / 1;
        border-radius: 0;
    }
    .icon {
        width:  24px;
        height: 24px;
        border-radius: 6px;
    }

    /* Utility width/height helpers used inline via class */
    .w-28  { width: 7rem; }
    .w-20  { width: 5rem; }
    .w-16  { width: 4rem; }
    .w-24  { width: 6rem; }
    .w-4\/5 { width: 80%; }
    .w-2\/3 { width: 66%; }
    .w-full { width: 100%; }
    .h-2   { height: 0.5rem; }
    .h-2\.5 { height: 0.625rem; }
    .h-3   { height: 0.75rem; }
    .mb-1  { margin-bottom: 0.25rem; }
    .mb-1\.5 { margin-bottom: 0.375rem; }

    /* Layout */
    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px;
    }
    .header-left {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .meta {
        display: flex;
        flex-direction: column;
    }
    .line {
        display: block;
    }
    .actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
    }
    .action-left {
        display: flex;
        gap: 16px;
    }
    .px-section {
        padding: 0 12px 10px;
    }
    .caption-block {
        padding-top: 2px;
    }
    .timestamp {
        padding-bottom: 14px;
    }
</style>
