// Converted from ui/tunex/section.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/tunex/section/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Manage Topics | Tunex",
};

export default function TunexSectionPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"dark"}}
      body={{"class":"bg-gatex-bg text-gray-100 font-sans antialiased","x-data":"sectionApp()"}}
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <script src="/config.js" />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer />
      <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
      <script src="../../assets/js/theme.js" />
      <script src="/_legacy/tunex/section/script-01.js" />
      <link rel="stylesheet" href="/_legacy/tunex/section/style-01.css" />
      {/* ── original <body> ── */}
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 sticky top-0 z-30 glass-header">
        <div className="flex items-center gap-4">
          <button
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            {...{ "x-on:click": "goBack()" }}
          >
            <i className="ri-arrow-left-line text-xl" />
          </button>
          {" "}
          <div className="flex flex-col">
            <h1 className="text-sm text-gray-400 font-medium" x-text="langName" />
            <h2 className="text-lg font-bold" x-text="sectionName || 'Loading...'" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="p-2 text-gray-400 hover:text-white transition"
            {...{ "x-on:click": "Theme.toggle()" }}
          >
            <i className="ri-moon-line dark:hidden" />
            {" "}
            <i className="ri-sun-line hidden dark:block" />
          </button>
        </div>
      </header>
      <main className="p-6 max-w-5xl mx-auto">
        {/* Header & Add Button */}
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold">
            Topics
          </h3>
          {" "}
          <button
            className="bg-gatex-primary hover:bg-gatex-secondary text-white px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-lg shadow-gatex-primary/20"
            {...{ "x-on:click": "showAddModal = true" }}
          >
            <i className="ri-add-line" />
            {" Add Topic "}
          </button>
        </div>
        {/* Topics List */}
        <div className="space-y-3">
          <template
            x-for="(topic, index) in topics"
            dangerouslySetInnerHTML={{ __html: "\n                <div @click=\"goToTopic(topic)\" class=\"bg-gatex-card border border-white/5 rounded-xl p-4 flex items-center justify-between hover:border-white/10 transition group cursor-pointer hover:bg-gatex-cardHover\">\n                    <div class=\"flex items-start gap-4\">\n                        <div class=\"mt-1 w-6 h-6 rounded-full border border-gatex-primary/30 flex items-center justify-center text-xs text-gatex-primary font-bold\" x-text=\"index + 1\"></div>\n                        <div>\n                            <h4 class=\"font-bold text-gray-200\" x-text=\"topic.title\"></h4>\n                            <div class=\"flex items-center gap-4 mt-1 text-xs text-gray-500\">\n                                <span>Index: <span x-text=\"topic.order_index\"></span></span>\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"flex items-center gap-2\">\n                        <button @click.stop=\"renameTopic(topic)\" class=\"p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition\" title=\"Rename\">\n                            <i class=\"ri-pencil-line\"></i>\n                        </button>\n                        <button @click.stop=\"deleteTopic(topic)\" class=\"p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition\" title=\"Delete\">\n                            <i class=\"ri-delete-bin-line\"></i>\n                        </button>\n                        <i class=\"ri-arrow-right-s-line text-gray-500 group-hover:text-white transition\"></i>\n                    </div>\n                </div>\n            " }}
            {...{ ":key": "topic.id" }}
          />
        </div>
        {/* Empty State */}
        <div
          x-show={"topics.length === 0 && !loading"}
          className="text-center py-20 bg-gatex-card/50 rounded-2xl border border-white/5 border-dashed"
        >
          <i className="ri-list-check text-4xl mb-3 block opacity-30" />
          {" "}
          <p className="text-gray-500">
            No topics in this section yet.
          </p>
        </div>
        {/* Add Modal */}
        <div
          x-show="showAddModal"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ display: "none" }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            {...{ "x-on:click": "showAddModal = false" }}
          />
          <div className="bg-gatex-card border border-white/10 rounded-2xl p-6 w-full max-w-sm relative z-10 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">
              Add Topic
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Title
                </label>
                {" "}
                <input
                  type="text"
                  x-model="newTopic.title"
                  className="w-full bg-gatex-bg border border-white/10 rounded-lg px-4 py-2 focus:border-gatex-primary outline-none transition"
                  placeholder="Topic Title"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 rounded-lg hover:bg-white/5 text-sm"
                {...{ "x-on:click": "showAddModal = false" }}
              >
                Cancel
              </button>
              {" "}
              <button
                className="bg-gatex-primary hover:bg-gatex-secondary text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                {...{ "x-on:click": "createTopic()" }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
        {/* Edit Modal */}
        <div
          x-show="showEditModal"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ display: "none" }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            {...{ "x-on:click": "showEditModal = false" }}
          />
          <div className="bg-gatex-card border border-white/10 rounded-2xl p-6 w-full max-w-sm relative z-10 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">
              Edit Topic
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Title
                </label>
                {" "}
                <input
                  type="text"
                  x-model="editingTopic.title"
                  className="w-full bg-gatex-bg border border-white/10 rounded-lg px-4 py-2 focus:border-gatex-primary outline-none transition"
                  placeholder="Topic Title"
                  {...{ "x-on:keydown.enter": "confirmRename()" }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 rounded-lg hover:bg-white/5 text-sm"
                {...{ "x-on:click": "showEditModal = false" }}
              >
                Cancel
              </button>
              {" "}
              <button
                className="bg-gatex-primary hover:bg-gatex-secondary text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                {...{ "x-on:click": "confirmRename()" }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
        {/* Delete Modal */}
        <div
          x-show="showDeleteModal"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ display: "none" }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            {...{ "x-on:click": "showDeleteModal = false" }}
          />
          <div className="bg-gatex-card border border-white/10 rounded-2xl p-6 w-full max-w-sm relative z-10 shadow-2xl">
            <i className="ri-error-warning-line text-4xl text-red-500 mb-2 block" />
            {" "}
            <h3 className="text-xl font-bold mb-2">
              Delete Topic?
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {"Are you sure you want to delete \""}
              <span className="text-white font-medium" x-text="deletingTopic?.title" />
              {"\"? This action cannot be undone."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg hover:bg-white/5 text-sm"
                {...{ "x-on:click": "showDeleteModal = false" }}
              >
                Cancel
              </button>
              {" "}
              <button
                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 px-4 py-2 rounded-lg text-sm font-medium transition"
                {...{ "x-on:click": "confirmDelete()" }}
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      </main>
      <script src="/_legacy/tunex/section/script-02.js" />
    </LegacyPage>
  );
}
