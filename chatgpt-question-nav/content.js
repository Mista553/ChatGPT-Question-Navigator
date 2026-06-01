(() => {
  const NAV_ID = "cgpt-question-nav";
  const ACTIVE_CLASS = "cgpt-question-nav__dot--active";
  const MAX_TITLE_LENGTH = 96;

  let questions = [];
  let nav;
  let list;
  let refreshTimer;
  let activeIndex = -1;

  function init() {
    ensureNav();
    refreshQuestions();
    observePageChanges();
    window.addEventListener("scroll", updateActiveQuestion, { passive: true });
    window.addEventListener("resize", updateActiveQuestion, { passive: true });
  }

  function ensureNav() {
    nav = document.getElementById(NAV_ID);
    if (nav) {
      list = nav.querySelector(".cgpt-question-nav__list");
      return;
    }

    nav = document.createElement("aside");
    nav.id = NAV_ID;
    nav.setAttribute("aria-label", "ChatGPT question navigator");
    nav.innerHTML = `<div class="cgpt-question-nav__list"></div>`;

    list = nav.querySelector(".cgpt-question-nav__list");
    document.documentElement.appendChild(nav);
  }

  function observePageChanges() {
    const observer = new MutationObserver(scheduleRefresh);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function scheduleRefresh() {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(refreshQuestions, 200);
  }

  function refreshQuestions() {
    const nextQuestions = collectUserQuestions();

    if (sameQuestionSet(questions, nextQuestions)) {
      return;
    }

    questions = nextQuestions;
    renderQuestions();
    updateActiveQuestion();
  }

  function collectUserQuestions() {
    const userMessages = Array.from(
      document.querySelectorAll('[data-message-author-role="user"]')
    );

    return userMessages
      .map((message, index) => {
        const text = normalizeText(message.innerText || message.textContent || "");
        if (!text) {
          return null;
        }

        if (!message.id) {
          message.id = `cgpt-user-question-${index + 1}`;
        }

        return {
          id: message.id,
          index,
          text,
          title: shorten(text)
        };
      })
      .filter(Boolean);
  }

  function renderQuestions() {
    nav.hidden = questions.length === 0;

    if (!questions.length) {
      list.replaceChildren();
      return;
    }

    const fragment = document.createDocumentFragment();
    questions.forEach((question) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cgpt-question-nav__dot";
      button.dataset.questionId = question.id;
      button.title = question.text;
      button.setAttribute("aria-label", `Question ${question.index + 1}: ${question.title}`);

      const tooltip = document.createElement("span");
      tooltip.className = "cgpt-question-nav__tooltip";
      tooltip.textContent = question.title;

      button.appendChild(tooltip);
      button.addEventListener("click", () => scrollToQuestion(question.id));
      fragment.appendChild(button);
    });

    list.replaceChildren(fragment);
  }

  function scrollToQuestion(id) {
    const target = document.getElementById(id);
    if (!target) {
      refreshQuestions();
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  function updateActiveQuestion() {
    if (!questions.length || !list) {
      return;
    }

    const viewportAnchor = window.innerHeight * 0.35;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    questions.forEach((question, index) => {
      const element = document.getElementById(question.id);
      if (!element) {
        return;
      }

      const distance = Math.abs(element.getBoundingClientRect().top - viewportAnchor);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex === activeIndex) {
      return;
    }

    activeIndex = closestIndex;
    list.querySelectorAll(".cgpt-question-nav__dot").forEach((item, index) => {
      item.classList.toggle(ACTIVE_CLASS, index === activeIndex);
    });
  }

  function sameQuestionSet(previous, next) {
    if (previous.length !== next.length) {
      return false;
    }

    return previous.every((item, index) => item.id === next[index].id && item.text === next[index].text);
  }

  function normalizeText(text) {
    return text.replace(/\s+/g, " ").trim();
  }

  function shorten(text) {
    if (text.length <= MAX_TITLE_LENGTH) {
      return text;
    }

    return `${text.slice(0, MAX_TITLE_LENGTH - 3).trim()}...`;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
