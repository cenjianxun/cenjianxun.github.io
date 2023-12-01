(() => {
  // ns-hugo:/Users/xun/work/Site/assets/js/init/backTop.js
  var toTopQuery = "#func-top";
  function backTop_default() {
    let toTop = document.querySelector(toTopQuery);
    let style = window.getComputedStyle(toTop)["display"];
    if (!toTop || style == "none") {
      return;
    }
    window.addEventListener(
      "scroll",
      function(e) {
        if (window.scrollY > 200) {
          toTop.style.opacity = "1";
        } else {
          toTop.style.opacity = "0";
        }
      },
      {
        passive: true
      }
    );
  }

  // ns-hugo:/Users/xun/work/Site/assets/js/init/initToc.js
  var asideContainer = "#sidebar-info";
  var tocContainer = "#sidebar-toc";
  var contentHeaders = ".post-content h1[id], .post-content h2[id], .post-content h3[id], .post-content h4[id], .post-content h5[id], .post-content h6[id]";
  var tocQuery = "#TableOfContents";
  var navigationQuery = "#TableOfContents li";
  var activeClass = "toc-active";
  function toggleToc() {
    let sidebarToc = document.querySelector(tocContainer);
    let toc = document.getElementById("sidebar-toc");
    console.log(sidebarToc);
    console.log(toc);
    let sidebarInfo = document.querySelector(asideContainer);
    let style = window.getComputedStyle(sidebarToc)["display"];
    if (!sidebarToc || style == "none") {
      return;
    }
    window.info = true;
    window.addEventListener(
      "scroll",
      function(e) {
        let scroll_height = window.scrollY;
        if (scroll_height > 100 && window.info) {
          window.info = false;
          sidebarInfo.removeAttribute("style");
          sidebarInfo.style.bottom = "100%";
          sidebarToc.style.top = "1rem";
          sidebarInfo.style.opacity = "0";
        } else if (scroll_height <= 100 && !window.info) {
          window.info = true;
          sidebarToc.removeAttribute("style");
          sidebarInfo.removeAttribute("bottom");
          sidebarInfo.style.transition = "opacity 0.1s 0.2s";
          sidebarInfo.style.opacity = "1";
        }
      }
    );
  }
  function debounced(func) {
    let timeout;
    return () => {
      if (timeout) {
        window.cancelAnimationFrame(timeout);
      }
      timeout = window.requestAnimationFrame(() => func());
    };
  }
  function scrollToTocElement(tocElement, scrollableNavigation) {
    let textHeight = tocElement.querySelector("a").offsetHeight;
    let scrollTop = tocElement.offsetTop - scrollableNavigation.offsetHeight / 2 + textHeight / 2 - scrollableNavigation.offsetTop;
    if (scrollTop < 0) {
      scrollTop = 0;
    }
    scrollableNavigation.scrollTo({ top: scrollTop, behavior: "smooth" });
  }
  function buildIdToNavigationElementMap(navigation) {
    const sectionLinkRef = {};
    navigation.forEach((navigationElement) => {
      const link = navigationElement.querySelector("a");
      const href = link.getAttribute("href");
      if (href.startsWith("#")) {
        sectionLinkRef[href.slice(1)] = navigationElement;
      }
    });
    return sectionLinkRef;
  }
  function computeOffsets(headers) {
    let sectionsOffsets = [];
    headers.forEach((header) => {
      sectionsOffsets.push({ id: header.id, offset: header.offsetTop });
    });
    sectionsOffsets.sort((a, b) => a.offset - b.offset);
    return sectionsOffsets;
  }
  function setupScrollspy() {
    let headers = document.querySelectorAll(contentHeaders);
    if (!headers) {
      console.warn("No header matched query", headers);
      return;
    }
    let scrollableNavigation = document.querySelector(tocQuery);
    if (!scrollableNavigation) {
      console.warn("No toc matched query", tocQuery);
      return;
    }
    let navigation = document.querySelectorAll(navigationQuery);
    if (!navigation) {
      console.warn("No navigation matched query", navigationQuery);
      return;
    }
    let sectionsOffsets = computeOffsets(headers);
    let tocHovered = false;
    scrollableNavigation.addEventListener("mouseenter", debounced(() => tocHovered = true));
    scrollableNavigation.addEventListener("mouseleave", debounced(() => tocHovered = false));
    let activeSectionLink;
    let idToNavigationElement = buildIdToNavigationElementMap(navigation);
    console.log(idToNavigationElement);
    function scrollHandler() {
      let scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
      let newActiveSection;
      sectionsOffsets.forEach((section) => {
        if (scrollPosition >= section.offset - 20) {
          newActiveSection = document.getElementById(section.id);
        }
      });
      let newActiveSectionLink;
      if (newActiveSection) {
        newActiveSectionLink = idToNavigationElement[newActiveSection.id];
      }
      if (newActiveSection && !newActiveSectionLink) {
        console.debug("No link found for section", newActiveSection);
      } else if (newActiveSectionLink !== activeSectionLink) {
        if (activeSectionLink)
          activeSectionLink.classList.remove(activeClass);
        if (newActiveSectionLink) {
          newActiveSectionLink.classList.add(activeClass);
          if (!tocHovered) {
            scrollToTocElement(newActiveSectionLink, scrollableNavigation);
          }
        }
        activeSectionLink = newActiveSectionLink;
      }
    }
    window.addEventListener("scroll", debounced(scrollHandler));
    function resizeHandler() {
      sectionsOffsets = computeOffsets(headers);
      scrollHandler();
    }
    window.addEventListener("resize", debounced(resizeHandler));
  }
  function initToc(toggle) {
    if (document.addEventListener) {
      document.addEventListener("DOMContentLoaded", function() {
        toggle();
      }, false);
    } else if (document.attachEvent) {
      document.attachEvent("onreadystatechange", function() {
        if (document.readyState == "complete") {
          toggle();
        }
      });
    }
    window.addEventListener("scroll", setupScrollspy());
  }

  // <stdin>
  backTop_default();
  window.addEventListener("load", initToc(toggleToc));
})();
