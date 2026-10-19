<script>
  import { createEventDispatcher } from "svelte";
  import { ImagePlus, X, LoaderCircle, Upload } from "lucide-svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import { showErrorDialog } from "../../../helpers/toolsHelper";

  export let show = false;
  export let linkTree = null;
  export let onClose = undefined;

  const dispatch = createEventDispatcher();

  let loading = false;
  let file = null;
  let previewUrl = null;

  function handleClose() {
    previewUrl = null;
    file = null;
    dispatch("close");
    if (onClose) onClose();
  }

  $: {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }

  $: if ($linkTreesStore.isLinkTreeChangeCover) {
    loading = false;
    linkTreesStore.setIsLinkTreeChangeCover(false);
    if ($linkTreesStore.isLinkTreeChangedCover) {
      linkTreesStore.setIsLinkTreeChangedCover(false);
      linkTreesStore.asyncSetLinkTree(linkTree.id);
      handleClose();
    }
  }

  function handleFileChange(e) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      showErrorDialog("Pilih file gambar (JPG/PNG)!");
      return;
    }

    if (selectedFile.size > 1024 * 1024) {
      showErrorDialog("Ukuran gambar maksimal 1MB!");
      return;
    }

    file = selectedFile;
    previewUrl = URL.createObjectURL(selectedFile);
  }

  function handleSave() {
    if (!file) {
      showErrorDialog("Silakan pilih cover baru!");
      return;
    }

    loading = true;
    linkTreesStore.asyncSetIsLinkTreeChangeCover(linkTree.id, file);
  }
</script>

{#if show && linkTree}
  <div
    data-testid="change-cover-modal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
  >
    <div
      class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all"
    >
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
            <ImagePlus size={18} strokeWidth={2.5} />
          </div>
          <h3 class="text-base font-bold text-slate-800">Ubah Cover Link Tree</h3>
        </div>
        <button
          type="button"
          data-testid="close-cover-modal-btn"
          on:click={handleClose}
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <form on:submit|preventDefault={handleSave} class="p-6 space-y-4">
        <div>
          <span class="block text-sm font-semibold text-slate-700 mb-2">
            Pilih Gambar Cover
          </span>

          <label
            for="linktree-cover-file-input"
            class="relative flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-sky-50/30 transition-all overflow-hidden group"
          >
            {#if previewUrl}
              <img
                src={previewUrl}
                alt="Preview"
                class="w-full h-full object-cover"
              />
              <div
                class="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <p class="text-xs font-semibold text-white">Ganti Gambar</p>
              </div>
            {:else if linkTree.cover}
              <img
                src={linkTree.cover}
                alt="Current Cover"
                class="w-full h-full object-cover opacity-60"
              />
              <div
                class="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/30 text-white"
              >
                <Upload size={24} class="mb-1" />
                <p class="text-xs font-semibold">Klik untuk memilih cover baru</p>
              </div>
            {:else}
              <div class="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
                <Upload size={28} class="mb-2 text-slate-400 group-hover:text-sky-600 transition-colors" />
                <p class="text-xs font-medium">Klik untuk unggah berkas</p>
                <p class="text-[10px] text-slate-400 mt-1">PNG atau JPG (Maks. 1MB)</p>
              </div>
            {/if}

            <input
              id="linktree-cover-file-input"
              type="file"
              data-testid="linktree-cover-file-input"
              accept="image/*"
              on:change={handleFileChange}
              class="hidden"
            />
          </label>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            data-testid="cancel-cover-modal-btn"
            on:click={handleClose}
            disabled={loading}
            class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-cover-modal-btn"
            disabled={loading}
            class="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-xl shadow-md shadow-sky-600/25 transition-all disabled:opacity-60"
          >
            {#if loading}
              <LoaderCircle size={16} class="animate-spin" />
              <span>Mengunggah...</span>
            {:else}
              <ImagePlus size={16} strokeWidth={2.5} />
              <span>Simpan Cover</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
