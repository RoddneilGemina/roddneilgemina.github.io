/**
 * RODDNEIL B. GEMINA — DEDICATED PROJECT DETAIL PAGE LOGIC
 * Dynamic renderer for project.html
 */
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    if (!window.PortfolioProjects) {
      console.error('PortfolioProjects data module not loaded');
      return;
    }

    const { getProject, projects, projectOrder } = window.PortfolioProjects;

    // 1. Parse Project ID from query parameters (?id=p1 or ?id=fusion-rush or path hash)
    const urlParams = new URLSearchParams(window.location.search);
    let projectId = urlParams.get('id') || urlParams.get('p');
    
    // Fallback: check location hash or path
    if (!projectId && window.location.hash) {
      projectId = window.location.hash.replace('#', '');
    }

    // Default to flagship p1 if none specified or not found
    const project = getProject(projectId);

    // 2. Update Page Meta / SEO
    document.title = `${project.title} | Roddneil B. Gemina Case Study`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', `${project.title} case study: ${project.oneLiner}`);
    }

    // 3. Populate Header Breadcrumb & Kickers
    const breadcrumbCategory = document.getElementById('project-breadcrumb-category');
    if (breadcrumbCategory) breadcrumbCategory.textContent = project.category;
    
    const breadcrumbTitle = document.getElementById('project-breadcrumb-title');
    if (breadcrumbTitle) breadcrumbTitle.textContent = project.title;

    const kickerBadge = document.getElementById('project-kicker-badge');
    if (kickerBadge) kickerBadge.textContent = project.badge || project.category;

    const timelineChip = document.getElementById('project-timeline-chip');
    if (timelineChip) timelineChip.textContent = project.year;

    const statusPill = document.getElementById('project-status-pill');
    if (statusPill) statusPill.textContent = project.status || 'Archived Spec';

    // 4. Hero Title & Summary
    const heroTitle = document.getElementById('project-hero-title');
    if (heroTitle) heroTitle.textContent = project.title;

    const heroSubtitle = document.getElementById('project-hero-subtitle');
    if (heroSubtitle) heroSubtitle.textContent = project.subtitle || project.oneLiner;

    const heroSummary = document.getElementById('project-hero-summary');
    if (heroSummary) heroSummary.textContent = project.oneLiner;

    // 5. Quick Metadata Pills
    const metaRole = document.getElementById('project-meta-role');
    if (metaRole) metaRole.textContent = project.role;

    const metaVenue = document.getElementById('project-meta-venue');
    if (metaVenue) metaVenue.textContent = project.venue;

    // 6. Metrics Strip
    const metricsGrid = document.getElementById('project-metrics-grid');
    if (metricsGrid && project.metrics && project.metrics.length > 0) {
      metricsGrid.innerHTML = project.metrics.map(m => `
        <div class="project-metric-card">
          <div class="metric-num">${m.value}</div>
          <div class="metric-lbl">${m.label}</div>
          <div class="metric-detail">${m.detail}</div>
        </div>
      `).join('');
    }

    // 7. Visual Media Showcase (Image & Optional Video Walkthrough)
    const mediaViewport = document.getElementById('project-media-viewport');
    const mediaControls = document.getElementById('project-media-controls');
    
    function renderImageMode() {
      if (!mediaViewport) return;
      mediaViewport.innerHTML = `
        <div class="project-screen-frame ${project.orientation || 'landscape'}-frame">
          <div class="frame-browser-header">
            <span class="browser-dot red"></span>
            <span class="browser-dot yellow"></span>
            <span class="browser-dot green"></span>
            <span class="browser-address-bar">${project.slug}.roddneilgemina.dev</span>
          </div>
          <div class="frame-image-wrapper">
            <img src="${project.image}" alt="${project.title} Architectural Screenshot" class="project-showcase-img">
          </div>
        </div>
      `;
    }

    function renderVideoMode() {
      if (!mediaViewport || !project.video) return;
      mediaViewport.innerHTML = `
        <div class="project-screen-frame landscape-frame">
          <div class="frame-browser-header">
            <span class="browser-dot red"></span>
            <span class="browser-dot yellow"></span>
            <span class="browser-dot green"></span>
            <span class="browser-address-bar">${project.slug}.demo.internal</span>
          </div>
          <div class="frame-image-wrapper">
            <video src="${project.video}" controls autoplay muted playsinline class="project-showcase-video">
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      `;
    }

    // Setup media toggle if video is available
    if (project.video && mediaControls) {
      mediaControls.innerHTML = `
        <div class="media-segmented-pill">
          <button type="button" id="btn-show-image" class="media-toggle-btn active">
            <svg viewBox="0 0 24 24" width="14" height="14" style="width: 14px; height: 14px; flex-shrink: 0;" class="toggle-svg"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <span>Screenshot Spec</span>
          </button>
          <button type="button" id="btn-show-video" class="media-toggle-btn">
            <svg viewBox="0 0 24 24" width="14" height="14" style="width: 14px; height: 14px; flex-shrink: 0;" class="toggle-svg"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <span>Video Walkthrough</span>
          </button>
        </div>
      `;

      const btnImage = document.getElementById('btn-show-image');
      const btnVideo = document.getElementById('btn-show-video');

      btnImage.addEventListener('click', () => {
        btnImage.classList.add('active');
        btnVideo.classList.remove('active');
        renderImageMode();
      });

      btnVideo.addEventListener('click', () => {
        btnVideo.classList.add('active');
        btnImage.classList.remove('active');
        renderVideoMode();
      });

      // Default to image view
      renderImageMode();
    } else {
      if (mediaControls) mediaControls.style.display = 'none';
      renderImageMode();
    }

    // 8. Problem Space & Engineering Solution Prose
    const problemText = document.getElementById('project-problem-text');
    if (problemText) problemText.textContent = project.problem;

    const solutionText = document.getElementById('project-solution-text');
    if (solutionText) solutionText.textContent = project.solution;

    // 9. Key Technical Highlights List
    const highlightsContainer = document.getElementById('project-highlights-list');
    if (highlightsContainer && project.keyHighlights) {
      highlightsContainer.innerHTML = project.keyHighlights.map((h, i) => `
        <div class="highlight-item-card">
          <div class="highlight-number">0${i + 1}</div>
          <div class="highlight-content">
            <h4 class="highlight-title">${h.title}</h4>
            <p class="highlight-desc">${h.desc}</p>
          </div>
        </div>
      `).join('');
    }

    // 10. Sidebar Specs & Categorized Tech Stack
    const sidebarRole = document.getElementById('sidebar-project-role');
    if (sidebarRole) sidebarRole.textContent = project.role;

    const sidebarVenue = document.getElementById('sidebar-project-venue');
    if (sidebarVenue) sidebarVenue.textContent = project.venue;

    const sidebarAuthorsWrapper = document.getElementById('sidebar-authors-wrapper');
    const sidebarAuthors = document.getElementById('sidebar-project-authors');
    if (sidebarAuthorsWrapper && sidebarAuthors) {
      if (project.authors) {
        sidebarAuthors.textContent = project.authors;
        sidebarAuthorsWrapper.style.display = 'block';
      } else {
        sidebarAuthorsWrapper.style.display = 'none';
      }
    }

    const sidebarTimeline = document.getElementById('sidebar-project-timeline');
    if (sidebarTimeline) sidebarTimeline.textContent = project.year;

    const sidebarStatus = document.getElementById('sidebar-project-status');
    if (sidebarStatus) sidebarStatus.textContent = project.status;

    const techPillsContainer = document.getElementById('sidebar-tech-stack');
    if (techPillsContainer && project.techStack) {
      techPillsContainer.innerHTML = project.techStack.map(t => `
        <span class="tech-badge tech-badge-interactive">${t}</span>
      `).join('');
    }

    // Categorized breakdown in sidebar if present
    const categorizedContainer = document.getElementById('sidebar-tech-categories');
    if (categorizedContainer && project.techCategorized) {
      const keys = Object.keys(project.techCategorized);
      categorizedContainer.innerHTML = keys.map(k => {
        const title = k.charAt(0).toUpperCase() + k.slice(1);
        const items = project.techCategorized[k];
        return `
          <div class="spec-tier-row">
            <span class="spec-tier-kicker">${title}</span>
            <div class="spec-tier-tags">
              ${items.map(it => `<span class="tech-badge-subtle">${it}</span>`).join('')}
            </div>
          </div>
        `;
      }).join('');
    }

    // External Links
    const artifactLinks = document.getElementById('sidebar-artifact-links');
    if (artifactLinks) {
      if (project.links && project.links.length > 0) {
        artifactLinks.innerHTML = project.links.map(l => `
          <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="btn-hero-primary project-external-btn">
            <span>${l.label} ↗</span>
          </a>
        `).join('');
      } else {
        artifactLinks.innerHTML = `
          <div class="proprietary-chip">
            <span class="proprietary-dot"></span>
            <span>Internal Engineering Artifact / IP</span>
          </div>
        `;
      }
    }

    // 11. Persistent Pager Bar (Previous / Next Project)
    const prevProject = projects[project.prevId];
    const nextProject = projects[project.nextId];

    const prevCard = document.getElementById('pager-prev-card');
    if (prevCard && prevProject) {
      prevCard.href = `project.html?id=${prevProject.id}`;
      const prevTitle = prevCard.querySelector('.pager-title');
      const prevSub = prevCard.querySelector('.pager-kicker');
      if (prevTitle) prevTitle.textContent = prevProject.title;
      if (prevSub) prevSub.textContent = `← Previous: ${prevProject.category}`;
    }

    const nextCard = document.getElementById('pager-next-card');
    if (nextCard && nextProject) {
      nextCard.href = `project.html?id=${nextProject.id}`;
      const nextTitle = nextCard.querySelector('.pager-title');
      const nextSub = nextCard.querySelector('.pager-kicker');
      if (nextTitle) nextTitle.textContent = nextProject.title;
      if (nextSub) nextSub.textContent = `Next: ${nextProject.category} →`;
    }

    // Keyboard shortcuts: Left Arrow for previous, Right Arrow for next, Escape for all projects
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft' && prevProject) {
        window.location.href = `project.html?id=${prevProject.id}`;
      } else if (e.key === 'ArrowRight' && nextProject) {
        window.location.href = `project.html?id=${nextProject.id}`;
      } else if (e.key === 'Escape') {
        window.location.href = 'projects.html';
      }
    });

  });
})();
