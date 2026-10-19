<script>
  import { onMount } from "svelte";
  import { navigate } from "../../../router.js";
  import AddModal from "../modals/AddModal.svelte";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import { usersStore } from "../../users/states/usersStore";
  import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
  import {
    Plus,
    Link,
    Globe,
    Layers,
    Eye,
    Pencil,
    Trash2,
    Search,
    LoaderCircle,
  } from "lucide-svelte";

  let loadingLinkTrees = false;
  let filter = "";
  let searchQuery = "";
  let showAddModal = false;
  let showChangeModal = false;
  let selectedLinkTreeId = null;

  $: profile = $usersStore.profile;
  $: linkTrees = $linkTreesStore.linkTrees;

  onMount(() => {
    loadLinkTrees();
  });

  function loadLinkTrees() {
    loadingLinkTrees = true;
    Promise.resolve(linkTreesStore.asyncSetLinkTrees(filter)).finally(() => {
      loadingLinkTrees = false;
    });
  }

  let prevFilter = filter;
  $: if (filter !== prevFilter) {
    prevFilter = filter;
    loadLinkTrees();
  }

  $: if ($linkTreesStore.isLinkTreeDeleted) {
    linkTreesStore.setIsLinkTreeDeleted(false);
    loadLinkTrees();
  }

  $: if ($linkTreesStore.isLinkTreeDeletedAll) {
    linkTreesStore.setIsLinkTreeDeletedAll(false);
    loadLinkTrees();
  }

  function handleEditLinkTree(id) {
    selectedLinkTreeId = id;
    showChangeModal = true;
  }

  async function handleDeleteLinkTree(id) {
    const result = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus link tree ini?"
    );
    if (result.isConfirmed) {
      linkTreesStore.asyncSetIsLinkTreeDelete(id);
    }
  }

  async function handleDeleteAllLinkTrees() {
    const result = await showConfirmDialog(
      "Apakah Anda yakin ingin menghapus SEMUA data link tree milik Anda?"
    );
    if (result.isConfirmed) {
      linkTreesStore.asyncSetIsLinkTreeDeleteAll();
    }
  }

  $: filteredLinkTrees = linkTrees.filter((lt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = lt.title ? lt.title.toLowerCase() : "";
    const description = lt.description ? lt.description.toLowerCase() : "";
    return title.includes(q) || description.includes(q);
  });

  $: totalCount = linkTrees.length;
  $: totalLinks = linkTrees.reduce((acc, lt) => acc + (lt.total_links || 0), 0);
  $: publicCount = linkTrees.filter((lt) => lt.type === "public").length;
</script>

{#if profile}
  <div class="space-y-8 animate-in fade-in duration-300">
    <!-- Header Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Daftar Link Tree
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Kelola dan bagikan seluruh halaman kumpulan tautan penting Anda secara mudah.
        </p>
      </div>
      <div class="flex items-center gap-2.5">
        <button
          type="button"
          data-testid="delete-all-linktrees-btn"
          on:click={handleDeleteAllLinkTrees}
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-all"
        >
          <Trash2 size={18} />
          <span>Hapus Semua</span>
        </button>
        <button
          type="button"
          data-testid="add-linktree-btn"
          on:click={() => (showAddModal = true)}
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/25 transition-all"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Tambah Link Tree</span>
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Link Tree
          </p>
          <h3 class="text-3xl font-black text-slate-800 mt-1">{totalCount}</h3>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Link size={26} strokeWidth={2} />
        </div>
      </div>

      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Tautan
          </p>
          <h3 class="text-3xl font-black text-emerald-600 mt-1">
            {totalLinks}
          </h3>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Layers size={26} strokeWidth={2} />
        </div>
      </div>

      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Link Tree Publik
          </p>
          <h3 class="text-3xl font-black text-amber-600 mt-1">{publicCount}</h3>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <Globe size={26} strokeWidth={2} />
        </div>
      </div>
    </div>

    <!-- Table & Controls Section -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <!-- Filter bar -->
      <div class="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <Search
            size={18}
            class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            data-testid="search-linktree-input"
            bind:value={searchQuery}
            placeholder="Cari link tree berdasarkan judul atau deskripsi..."
            class="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        <div class="flex items-center gap-3">
          <select
            data-testid="filter-linktree-select"
            bind:value={filter}
            class="text-sm px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-700"
          >
            <option value="">Semua Link Tree</option>
            <option value="1">Milik Saya</option>
          </select>
        </div>
      </div>

      <!-- Link Tree List Content -->
      {#if loadingLinkTrees && filteredLinkTrees.length === 0}
        <div class="p-16 text-center text-slate-400">
          <LoaderCircle size={36} class="mx-auto text-indigo-600 animate-spin mb-2" />
          <p class="font-medium text-slate-600">Memuat daftar link tree...</p>
        </div>
      {:else if filteredLinkTrees.length === 0}
        <div class="p-16 text-center text-slate-400">
          <div class="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Link size={32} />
          </div>
          <p class="font-semibold text-slate-700 text-base">Tidak ada link tree ditemukan</p>
          <p class="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau tambahkan link tree baru.</p>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/60 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th class="py-3.5 px-6">Link Tree</th>
                <th class="py-3.5 px-6">Tipe</th>
                <th class="py-3.5 px-6">Tautan</th>
                <th class="py-3.5 px-6">Pembuat</th>
                <th class="py-3.5 px-6">Dibuat</th>
                <th class="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
              {#each filteredLinkTrees as lt (lt.id)}
                <tr class="hover:bg-slate-50/50 transition-colors group">
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                      {#if lt.cover}
                        <img
                          src={lt.cover}
                          alt={lt.title}
                          class="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs"
                        />
                      {:else}
                        <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500/10 to-indigo-600/20 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                          <Link size={20} />
                        </div>
                      {/if}
                      <div class="min-w-0 max-w-xs sm:max-w-md">
                        <button
                          type="button"
                          on:click={() => navigate(`/link-trees/${lt.id}`)}
                          class="font-bold text-slate-800 hover:text-indigo-600 transition-colors truncate block text-left"
                        >
                          {lt.title}
                        </button>
                        <p class="text-xs text-slate-400 truncate mt-0.5">
                          {lt.description || "Tidak ada deskripsi"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="py-4 px-6 whitespace-nowrap">
                    <span
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider {lt.type ===
                      'public'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                        : lt.type === 'unlisted'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                        : 'bg-slate-100 text-slate-700 border border-slate-200/50'}"
                    >
                      {lt.type}
                    </span>
                  </td>
                  <td class="py-4 px-6 whitespace-nowrap">
                    <span class="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      <Layers size={14} />
                      {lt.total_links} link
                    </span>
                  </td>
                  <td class="py-4 px-6 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      {#if lt.author?.photo}
                        <img
                          src={lt.author.photo}
                          alt={lt.author?.name || "Author"}
                          class="w-6 h-6 rounded-full object-cover border border-slate-200"
                        />
                      {:else}
                        <div class="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                          {lt.author?.name ? lt.author.name.charAt(0).toUpperCase() : "U"}
                        </div>
                      {/if}
                      <span class="text-xs font-medium text-slate-600">
                        {lt.author?.name || "Anonim"}
                      </span>
                    </div>
                  </td>
                  <td class="py-4 px-6 whitespace-nowrap text-xs text-slate-500">
                    {formatDate(lt.created_at)}
                  </td>
                  <td class="py-4 px-6 whitespace-nowrap text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        data-testid={`detail-linktree-${lt.id}`}
                        on:click={() => navigate(`/link-trees/${lt.id}`)}
                        class="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye size={17} />
                      </button>
                      <button
                        type="button"
                        data-testid={`edit-linktree-${lt.id}`}
                        on:click={() => handleEditLinkTree(lt.id)}
                        class="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Ubah Link Tree"
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        type="button"
                        data-testid={`delete-linktree-${lt.id}`}
                        on:click={() => handleDeleteLinkTree(lt.id)}
                        class="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Hapus Link Tree"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  </div>

  <AddModal
    show={showAddModal}
    onClose={() => (showAddModal = false)}
  />

  <ChangeModal
    show={showChangeModal}
    linkTreeId={selectedLinkTreeId}
    onClose={() => {
      showChangeModal = false;
      selectedLinkTreeId = null;
    }}
  />
{/if}
