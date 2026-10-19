<script>
  import { onMount } from "svelte";
  import { navigate } from "../../../router.js";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ItemModal from "../modals/ItemModal.svelte";
  import MarkdownViewer from "../components/MarkdownViewer.svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import { usersStore } from "../../users/states/usersStore";
  import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
  import {
    ArrowLeft,
    ImagePlus,
    PenLine,
    Trash2,
    Calendar,
    Plus,
    ExternalLink,
    Link,
    Pencil,
    Globe,
  } from "lucide-svelte";

  export let linkTreeId;

  $: profile = $usersStore.profile;
  $: linkTree = $linkTreesStore.linkTree;

  let showCoverModal = false;
  let showEditModal = false;
  let showItemModal = false;
  let selectedItem = null;

  onMount(() => {
    if (linkTreeId) {
      linkTreesStore.asyncSetLinkTree(linkTreeId);
    }
  });

  let prevId = linkTreeId;
  $: if (linkTreeId !== prevId) {
    prevId = linkTreeId;
    linkTreesStore.asyncSetLinkTree(linkTreeId);
  }

  $: if ($linkTreesStore.isLinkTree) {
    linkTreesStore.setIsLinkTree(false);
    if (!linkTree) {
      navigate("/");
    }
  }

  $: if ($linkTreesStore.isLinkTreeDeleted) {
    linkTreesStore.setIsLinkTreeDeleted(false);
    navigate("/");
  }

  $: if ($linkTreesStore.isItemDeleted) {
    linkTreesStore.setIsItemDeleted(false);
    linkTreesStore.asyncSetLinkTree(linkTreeId);
  }

  async function handleDeleteLinkTree() {
    const result = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus link tree ini beserta seluruh tautannya?"
    );
    if (result.isConfirmed && linkTree) {
      linkTreesStore.asyncSetIsLinkTreeDelete(linkTree.id);
    }
  }

  function handleAddItem() {
    selectedItem = null;
    showItemModal = true;
  }

  function handleEditItem(item) {
    selectedItem = item;
    showItemModal = true;
  }

  async function handleDeleteItem(itemId) {
    const result = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus tautan ini?"
    );
    if (result.isConfirmed && linkTree) {
      linkTreesStore.asyncSetIsItemDelete(linkTree.id, itemId);
    }
  }
</script>

{#if !profile || !linkTree}
  <div class="flex flex-col items-center justify-center py-20">
    <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
{:else}
  <div class="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
    <!-- Back button & Action buttons -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <a
        href="/"
        data-testid="back-to-linktrees-link"
        on:click|preventDefault={() => navigate("/")}
        class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={18} />
        Kembali ke Link Tree
      </a>

      <div class="flex items-center gap-2">
        <button
          type="button"
          data-testid="edit-cover-btn"
          on:click={() => (showCoverModal = true)}
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 transition-colors"
        >
          <ImagePlus size={16} />
          Ubah Cover
        </button>
        <button
          type="button"
          data-testid="edit-detail-linktree-btn"
          on:click={() => (showEditModal = true)}
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-colors"
        >
          <PenLine size={16} />
          Ubah Data
        </button>
        <button
          type="button"
          data-testid="delete-detail-linktree-btn"
          on:click={handleDeleteLinkTree}
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors"
        >
          <Trash2 size={16} />
          Hapus
        </button>
      </div>
    </div>

    <!-- Main Detail Card -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {#if linkTree.cover}
        <div class="relative w-full h-64 sm:h-80 bg-slate-900 overflow-hidden">
          <img
            src={linkTree.cover}
            alt={linkTree.title}
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
        </div>
      {/if}

      <div class="p-6 sm:p-8 space-y-6">
        <!-- Title and Badges -->
        <div class="space-y-3">
          <div class="flex flex-wrap items-center gap-2.5">
            {#if linkTree.type === 'public'}
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <Globe size={14} />
                Akses: public
              </span>
            {:else if linkTree.type === 'unlisted'}
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/60">
                <Globe size={14} />
                Akses: unlisted
              </span>
            {:else}
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                <Globe size={14} />
                Akses: private
              </span>
            {/if}

            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              <Calendar size={14} />
              {formatDate(linkTree.created_at)}
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {linkTree.title}
          </h1>

          {#if linkTree.author}
            <div class="flex items-center gap-2.5 pt-1">
              {#if linkTree.author.photo}
                <img
                  src={linkTree.author.photo}
                  alt={linkTree.author.name}
                  class="w-7 h-7 rounded-full object-cover border border-slate-200"
                />
              {:else}
                <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                  {linkTree.author.name ? linkTree.author.name.charAt(0).toUpperCase() : "U"}
                </div>
              {/if}
              <span class="text-xs font-semibold text-slate-600">
                Oleh {linkTree.author.name}
              </span>
            </div>
          {/if}
        </div>

        <!-- Markdown Description Viewer -->
        <div class="pt-4 border-t border-slate-100">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Deskripsi Halaman
          </h3>
          <div class="prose max-w-none">
            <MarkdownViewer content={linkTree.description || ""} />
          </div>
        </div>
      </div>
    </div>

    <!-- Links / Items Section -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">
            Daftar Tautan
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Tautan yang tersedia di halaman link tree ini
          </p>
        </div>
        <button
          type="button"
          data-testid="add-item-btn"
          on:click={handleAddItem}
          class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Tambah Tautan</span>
        </button>
      </div>

      {#if !linkTree.items || linkTree.items.length === 0}
        <div class="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
          <Link size={36} class="mx-auto text-slate-300 mb-2" />
          <p class="font-semibold text-slate-700 text-sm">Belum ada tautan ditambahkan</p>
          <p class="text-xs text-slate-400 mt-1">Klik tombol di atas untuk menambahkan tautan baru.</p>
        </div>
      {:else}
        <div class="space-y-3">
          {#each linkTree.items as item (item.id)}
            <div
              data-testid={`linktree-item-${item.id}`}
              class="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-indigo-50/40 hover:border-indigo-200 transition-all group"
            >
              <div class="flex items-center gap-3.5 min-w-0 flex-1 pr-4">
                <div class="w-10 h-10 rounded-xl bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <Globe size={18} />
                </div>
                <div class="min-w-0 flex-1">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5 truncate max-w-full"
                  >
                    <span class="truncate">{item.title}</span>
                    <ExternalLink size={14} class="shrink-0 text-slate-400" />
                  </a>
                  <p class="text-xs text-slate-400 truncate mt-0.5">
                    {item.url}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  data-testid={`edit-item-${item.id}`}
                  on:click={() => handleEditItem(item)}
                  class="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  title="Ubah Tautan"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  data-testid={`delete-item-${item.id}`}
                  on:click={() => handleDeleteItem(item.id)}
                  class="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Hapus Tautan"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <ChangeCoverModal
    show={showCoverModal}
    linkTree={linkTree}
    onClose={() => (showCoverModal = false)}
  />

  <ChangeModal
    show={showEditModal}
    linkTreeId={linkTree.id}
    onClose={() => (showEditModal = false)}
  />

  <ItemModal
    show={showItemModal}
    linkTreeId={linkTree.id}
    item={selectedItem}
    onClose={() => {
      showItemModal = false;
      selectedItem = null;
    }}
  />
{/if}
