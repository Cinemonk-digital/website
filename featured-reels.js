(function () {
  /*
    FEATURED REELS JS EDIT GUIDE
    - Change DEFAULT_REELS_SOURCE when you replace reels.json with an API endpoint.
    - Change DEFAULT_INSTAGRAM_URL if the fallback account URL changes.
    - Edit icons if you want different SVG icons.
    - Edit cardTemplate() if you want to change the reel card HTML structure.
    - Edit observeVideos() if you want different autoplay/pause behavior.
    - Edit bindActions() if you want like/comment/share/save buttons to do more than toggle color.
    - Edit trackProgress() if you want a different progress bar behavior.
  */

  // Change this path when you replace reels.json with an API endpoint.
  const DEFAULT_REELS_SOURCE = "reels.json";
  // If a reel has no instagramUrl, clicking the video opens this account instead.
  const DEFAULT_INSTAGRAM_URL = "https://www.instagram.com/cinemonk_digitals/";
  // Built-in fallback reels: used when reels.json cannot load, especially if index.html is opened directly as a file.
  const FALLBACK_REELS = [
    {
      id: 1,
      title: "Yendaako Music Video",
      caption: "'Yendaako' on loop. Watch the full music video on Warangal Diaries.",
      video: "assets/reel1.mp4",
      thumbnail: "assets/Social_Media_Management.png",
      instagramUrl: "https://www.instagram.com/reel/DZSc8cKM9DB/?stkn=MWdtdzJza3oyeG4zNA%3D%3D",
      likes: "9.8K",
      comments: "96",
      shares: "73",
      saves: "182",
      profile: "assets/Logo_Cinemonk_Digital.png",
      username: "iamnabeelafridi",
      audio: "Original Audio"
    },
    {
      id: 2,
      title: "Kunafa Chocolate Bar",
      caption: "Gourmet Baklava's Dubai viral bar with rich chocolate, crisp kunafa and pistachio goodness.",
      video: "assets/reel2.mp4",
      thumbnail: "assets/Content_Creation.png",
      instagramUrl: "https://www.instagram.com/reel/DdY4ZjHzfHi/?stkn=aHZ5bG1iZ2V3MWNv",
      likes: "6.3K",
      comments: "98",
      shares: "45",
      saves: "112",
      profile: "assets/Logo_Cinemonk_Digital.png",
      username: "gourmetbaklava",
      audio: "Original Audio"
    },
    {
      id: 3,
      title: "Mediterranean Grilled Chicken",
      caption: "Seasons XPRS Mediterranean Grilled Chicken, boxed for Banjara Hills, Hitech City and Aero Plaza.",
      video: "assets/reel3.mp4",
      thumbnail: "assets/Influencer_Collaboration.png",
      instagramUrl: "https://www.instagram.com/reel/DdWn1TZT6w8/?stkn=ZDZ5cTRzZzFwbDM4",
      likes: "15.2K",
      comments: "312",
      shares: "128",
      saves: "1.5K",
      profile: "assets/Logo_Cinemonk_Digital.png",
      username: "seasons_xprs",
      audio: "Original Audio"
    },
    {
      id: 4,
      title: "Aazebo Malakpet Launch",
      caption: "Aazebo Malakpet brings biryani, mandi, kebabs and a full multi-cuisine spread to Hyderabad.",
      video: "assets/reel4.mp4",
      thumbnail: "assets/logo_branding.png",
      instagramUrl: "https://www.instagram.com/reel/DbI0ALcBrQr/?stkn=MXhxNDd2bm55eXZ4MA%3D%3D",
      likes: "11.1K",
      comments: "184",
      shares: "92",
      saves: "740",
      profile: "assets/Logo_Cinemonk_Digital.png",
      username: "maseerasfoodblog",
      audio: "Original Audio"
    }
  ];

  // Keeps browser reloads from returning to the section where the visitor last stopped.
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  // On refresh, start at the top unless the URL intentionally contains a section hash.
  window.addEventListener("pageshow", () => {
    if (!window.location.hash) window.scrollTo(0, 0);
  });

  const icons = {
    // Three-dot menu icon in the top-right corner of each reel.
    more: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>',
    // Like icon in the right action stack.
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 12.6 12 20l-7.5-7.4a5 5 0 0 1 7.1-7.1l.4.4.4-.4a5 5 0 0 1 7.1 7.1Z"></path></svg>',
    // Comment icon in the right action stack.
    comment: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"></path></svg>',
    // Share icon in the right action stack.
    share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>',
    // Save icon in the right action stack.
    save: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 21 12 17 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"></path></svg>',
    // Small music icon shown near the audio text.
    music: '<svg viewBox="0 0 24 24" aria-hidden="true" width="12" height="12"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>',
    // Instagram outline icon in the bottom-right open button.
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5"></rect><circle cx="12" cy="12" r="3.5"></circle><circle cx="17" cy="7" r="1"></circle></svg>'
  };

  // Prevents JSON values from breaking HTML when reels are rendered dynamically.
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

  function getInstagramUrl(value) {
    try {
      const url = new URL(value || DEFAULT_INSTAGRAM_URL);
      return url.protocol === "https:" && url.hostname.includes("instagram.com") ? url.href : DEFAULT_INSTAGRAM_URL;
    } catch (error) {
      return DEFAULT_INSTAGRAM_URL;
    }
  }

  class FeaturedReelCards {
    constructor(root) {
      // The section element, usually <section class="featured-reels">.
      this.root = root;
      // Data source comes from data-reels-src in HTML, with DEFAULT_REELS_SOURCE as fallback.
      this.source = root.dataset.reelsSrc || DEFAULT_REELS_SOURCE;
      // Container where reel cards will be inserted.
      this.list = root.querySelector("[data-reels-list]");
      // Stores animation frame ids so progress bar updates can be stopped cleanly.
      this.progressFrames = new Map();
    }

    async init() {
      try {
        // Fetches reels from JSON/API with no-store so edits show up quickly during testing.
        const response = await fetch(this.source, { cache: "no-store" });
        // Shows a friendly error if the JSON/API path is wrong or unavailable.
        if (!response.ok) throw new Error(`Unable to load ${this.source}`);
        // Converts the response into an array of reel objects.
        const reels = await response.json();
        // Builds the card HTML.
        this.render(reels);
        // Starts autoplay/pause observation for each video.
        this.observeVideos();
        // Enables interactive action buttons.
        this.bindActions();
      } catch (error) {
        // If JSON/API loading fails, still render local reel videos so the section never appears empty.
        this.render(FALLBACK_REELS);
        // Start autoplay/pause observation for fallback videos too.
        this.observeVideos();
        // Enable interactive action buttons for fallback videos too.
        this.bindActions();
        // Developer console error for debugging.
        console.error(error);
      }
    }

    render(reels) {
      // Replaces the empty reels container with one card per reel object.
      this.list.innerHTML = reels.map((reel) => this.cardTemplate(reel)).join("");
    }

    cardTemplate(reel) {
      // Edit instagramUrl in reels.json per reel; empty values use DEFAULT_INSTAGRAM_URL.
      const instagramUrl = getInstagramUrl(reel.instagramUrl);
      return `
        <article class="fr-reel-card">
          <!-- The video itself is wrapped in a link so clicking anywhere on the reel opens Instagram. -->
          <a class="fr-card-link" href="${escapeHtml(instagramUrl)}" target="_blank" rel="noopener" aria-label="Open ${escapeHtml(reel.title)} on Instagram">
            <!-- Change reel.video in reels.json to swap videos without changing this layout. -->
            <video src="${escapeHtml(reel.video)}" poster="${escapeHtml(reel.thumbnail)}" autoplay muted loop playsinline preload="metadata"></video>
          </a>
          <div class="fr-top">
            <div class="fr-profile">
              <img src="${escapeHtml(reel.profile)}" alt="">
              <div>
                <div class="fr-username"><span>${escapeHtml(reel.username)}</span><span class="fr-verified">&#10003;</span></div>
                <div class="fr-audio">${escapeHtml(reel.audio || "Original Audio")}</div>
              </div>
            </div>
            <button class="fr-menu" type="button" aria-label="More options">${icons.more}</button>
          </div>
          <div class="fr-actions">
            ${this.action("heart", reel.likes, "Like")}
            ${this.action("comment", reel.comments, "Comment")}
            ${this.action("share", reel.shares, "Share")}
            ${this.action("save", reel.saves, "Save")}
          </div>
          <div class="fr-bottom">
            <p class="fr-handle">@${escapeHtml(reel.username)} <span>&#10003;</span></p>
            <h3 class="fr-title">${escapeHtml(reel.title)}</h3>
            <p class="fr-caption">${escapeHtml(reel.caption)}</p>
            <p class="fr-music">${icons.music}${escapeHtml(reel.audio || "Original Audio")} &middot; ${escapeHtml(reel.username)}</p>
          </div>
          <a class="fr-open" href="${escapeHtml(instagramUrl)}" target="_blank" rel="noopener" aria-label="View on Instagram">${icons.instagram}</a>
          <div class="fr-progress"><span></span></div>
        </article>
      `;
    }

    action(icon, count, label) {
      // Creates one action button; icon chooses the SVG and count shows the number below it.
      return `<button class="fr-action" type="button" aria-label="${label}">${icons[icon]}<span>${escapeHtml(count)}</span></button>`;
    }

    observeVideos() {
      // Pauses videos offscreen and plays videos when they are visible enough.
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          // The observed element is the <video>.
          const video = entry.target;
          if (entry.isIntersecting) {
            // Autoplay can fail in some browsers; catch avoids console noise.
            video.play().catch(() => {});
            // Start updating the progress bar for visible videos.
            this.trackProgress(video);
          } else {
            // Stop offscreen videos to save CPU and match social-feed behavior.
            video.pause();
            // Stop progress animation when the video is not visible.
            this.stopProgress(video);
          }
        });
      }, { threshold: .42 });

      // Connect every rendered video to the observer.
      this.list.querySelectorAll("video").forEach((video) => observer.observe(video));
    }

    bindActions() {
      // Uses event delegation so buttons work for all dynamically rendered reel cards.
      this.list.addEventListener("click", (event) => {
        // Only react when a right-side action button is clicked.
        const button = event.target.closest(".fr-action");
        // Toggle gold active styling for like/comment/share/save.
        if (button) button.classList.toggle("is-active");
      });
    }

    trackProgress(video) {
      // Finds the progress bar inside the same reel card as the video.
      const bar = video.closest(".fr-reel-card").querySelector(".fr-progress span");
      // Updates CSS variable --fr-progress on every animation frame.
      const tick = () => {
        // Avoids divide-by-zero before browser knows the video duration.
        if (Number.isFinite(video.duration) && video.duration > 0) {
          bar.style.setProperty("--fr-progress", `${(video.currentTime / video.duration) * 100}%`);
        }
        // Store the frame id so it can be cancelled later.
        this.progressFrames.set(video, requestAnimationFrame(tick));
      };
      // Prevent duplicate loops for the same video.
      this.stopProgress(video);
      // Start the progress loop.
      tick();
    }

    stopProgress(video) {
      // Read the saved animation frame id for this video.
      const frame = this.progressFrames.get(video);
      // Cancel progress updates if they are running.
      if (frame) cancelAnimationFrame(frame);
      // Remove stale frame id from the map.
      this.progressFrames.delete(video);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Initialize every reels section on the page.
    document.querySelectorAll(".featured-reels").forEach((root) => {
      new FeaturedReelCards(root).init();
    });
  });
})();
