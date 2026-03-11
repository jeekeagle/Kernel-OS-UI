/**
 * Jeek's Digital Garden - SPA Router & Interactions
 */

// === PARSE FRONTMATTER ===
function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const frontmatter = {};
  match[1].split('\n').forEach(line => {
    const [key, ...values] = line.split(':');
    if (key && values.length) {
      frontmatter[key.trim()] = values.join(':').trim();
    }
  });
  return frontmatter;
}

// === ARTICLE STORE ===
let articlesCache = null;

async function loadArticles() {
  if (articlesCache) return articlesCache;

  try {
    // Load posts index
    const indexRes = await fetch('posts/posts.json');
    const slugs = await indexRes.json();

    // Load each post's frontmatter
    const articles = await Promise.all(
      slugs.map(async slug => {
        const res = await fetch(`posts/${slug}.md`);
        const markdown = await res.text();
        const meta = parseFrontmatter(markdown);

        return {
          slug,
          title: meta.title || slug,
          date: meta.date || '',
          tag: meta.tag || '',
          description: meta.description || '',
          year: meta.date ? parseInt(meta.date.split('-')[0]) : new Date().getFullYear()
        };
      })
    );

    // Sort by date descending
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    articlesCache = articles;
    return articles;
  } catch (error) {
    console.error('Failed to load articles:', error);
    return [];
  }
}

// === RENDER TIMELINE ===
async function renderTimeline() {
  const articles = await loadArticles();
  const timeline = document.querySelector('.timeline');

  if (!timeline || articles.length === 0) return;

  let html = '';
  let currentYear = null;

  articles.forEach(article => {
    if (article.year !== currentYear) {
      currentYear = article.year;
      html += `<div class="timeline-year">${currentYear}</div>`;
    }

    html += `
      <article class="timeline-item" data-slug="${article.slug}">
        <div class="timeline-item-header">
          <span class="timeline-item-date">${article.date.slice(5)}</span>
          ${article.tag ? `<span class="timeline-item-tag">${article.tag}</span>` : ''}
        </div>
        <h3>${article.title}</h3>
        ${article.description ? `<p>${article.description}</p>` : ''}
      </article>
    `;
  });

  timeline.innerHTML = html;

  // Re-bind click events
  document.querySelectorAll('.timeline-item').forEach(item => {
    item.addEventListener('click', () => {
      const slug = item.dataset.slug;
      if (slug) {
        window.location.hash = `/posts/${slug}`;
      }
    });
  });
}

// === ROUTER ===
const router = {
  currentPage: 'home',

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('popstate', () => this.handleRoute());

    this.handleRoute();
    this.setupNav();
    this.setupMobileMenu();
    this.setupSlideCards();
    this.setupSlideOverlay();

    // Load timeline
    renderTimeline();
  },

  handleRoute() {
    const hash = window.location.hash || '#/';
    const path = hash.slice(1);

    if (path === '/' || path === '') {
      this.showPage('home');
    } else if (path === '/slides') {
      this.showPage('slides');
    } else if (path === '/about') {
      this.showPage('about');
    } else if (path.startsWith('/posts/')) {
      const slug = path.replace('/posts/', '');
      this.loadArticle(slug);
    } else {
      this.showPage('home');
    }
  },

  showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
      page.classList.add('exiting');
    });

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.page === pageName) {
        item.classList.add('active');
      }
    });

    setTimeout(() => {
      document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('exiting');
      });

      const targetPage = document.getElementById(`page-${pageName}`);
      if (targetPage) {
        targetPage.classList.add('active');
      }
    }, 100);

    this.currentPage = pageName;
    document.getElementById('sidebar')?.classList.remove('open');
  },

  async loadArticle(slug) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });

    // Show article page
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    document.getElementById('page-article')?.classList.add('active');

    try {
      const response = await fetch(`posts/${slug}.md`);
      if (!response.ok) throw new Error('Failed to load article');

      const markdown = await response.text();
      const meta = parseFrontmatter(markdown);

      // Remove frontmatter from content
      const content = markdown.replace(/^---\n[\s\S]*?\n---\n/, '');

      document.getElementById('articleTitle').textContent = meta.title || slug;
      document.getElementById('articleDate').textContent = meta.date || '';
      document.getElementById('articleTag').textContent = meta.tag || '';
      document.getElementById('articleContent').innerHTML = marked.parse(content);
    } catch (error) {
      document.getElementById('articleContent').innerHTML = `
        <p style="color: var(--accent);">Failed to load article: ${error.message}</p>
        <p><a href="#/">← Back to home</a></p>
      `;
    }

    this.setupReadingProgress();
  },

  setupNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const page = item.dataset.page;
        if (page === 'home') {
          window.location.hash = '/';
        } else if (page) {
          window.location.hash = `/${page}`;
        }
      });
    });
  },

  setupMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    toggle?.addEventListener('click', () => {
      sidebar?.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!sidebar?.contains(e.target) && !toggle?.contains(e.target)) {
        sidebar?.classList.remove('open');
      }
    });
  },

  setupSlideCards() {
    document.querySelectorAll('.slide-card').forEach(card => {
      card.addEventListener('click', () => {
        const slideName = card.dataset.slide;
        if (slideName) {
          this.openSlideOverlay(slideName);
        }
      });
    });
  },

  setupSlideOverlay() {
    const overlay = document.getElementById('slideOverlay');
    const frame = document.getElementById('slideFrame');
    const closeBtn = document.getElementById('closeSlides');

    closeBtn?.addEventListener('click', () => {
      overlay.style.display = 'none';
      frame.src = '';
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.style.display !== 'none') {
        overlay.style.display = 'none';
        frame.src = '';
      }
    });
  },

  openSlideOverlay(slideName) {
    const overlay = document.getElementById('slideOverlay');
    const frame = document.getElementById('slideFrame');

    frame.src = `slides/${slideName}.html`;
    overlay.style.display = 'block';
  },

  setupReadingProgress() {
    const progressBar = document.getElementById('readingProgress');
    if (!progressBar) return;

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      progressBar.style.width = `${Math.min(100, progress)}%`;
    };

    window.addEventListener('scroll', updateProgress);
    updateProgress();
  }
};

// === INITIALIZE ===
document.addEventListener('DOMContentLoaded', () => {
  router.init();
});
