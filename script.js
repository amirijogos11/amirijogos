/* ==========================================================================
   AMIRIJOGOS — Gaming Channel Website
   script.js
   Language system · smooth scroll · reveal animations · YouTube links
   No external/paid APIs. No YouTube API. Safe against missing elements.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     0. Shared constants & helpers
     ------------------------------------------------------------------------ */
  var YOUTUBE_URL = "https://www.youtube.com/@amirijogos";
  var LANG_STORAGE_KEY = "amirijogos_lang";
  var DEFAULT_LANG = "pt";
  var SUPPORTED_LANGS = ["pt", "en", "es", "fr", "de", "it", "ja", "zh", "ko", "ru", "ar", "tr"];
  var RTL_LANGS = ["ar"];

  function $(selector, ctx) {
    try {
      return (ctx || document).querySelector(selector);
    } catch (e) {
      return null;
    }
  }

  function $all(selector, ctx) {
    try {
      return Array.prototype.slice.call((ctx || document).querySelectorAll(selector));
    } catch (e) {
      return [];
    }
  }

  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function safeStorageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      /* localStorage unavailable (private mode, etc.) — fail silently */
    }
  }

  /* ------------------------------------------------------------------------
     1. Translations
     ------------------------------------------------------------------------
     Keys are matched against elements carrying data-i18n="key".
     If a key is missing for a language, the original HTML text is kept.
     Add more keys/languages here as needed — the system reads
     whatever keys exist in the HTML automatically.
     ------------------------------------------------------------------------ */
  var translations = {
    pt: {
      "nav.home": "Início",
      "nav.about": "Sobre",
      "nav.videos": "Vídeos",
      "nav.community": "Comunidade",
      "nav.contact": "Contacto",
      "hero.title": "AMIRIJOGOS",
      "hero.subtitle": "Gaming, desafios e diversão a sério.",
      "hero.cta.youtube": "Subscrever no YouTube",
      "hero.cta.videos": "Ver Vídeos",
      "about.title": "Sobre o Canal",
      "about.eyebrow": "Quem Somos",
      "about.text": "O AMIRIJOGOS é um canal dedicado a gaming, com conteúdo criado para quem gosta de jogos a sério e de boa diversão.",
      "about.stat.subscribers": "Subscritores",
      "about.stat.videos": "Vídeos",
      "about.stat.views": "Visualizações",
      "videos.title": "Últimos Vídeos",
      "videos.subtitle": "Confere o conteúdo mais recente do canal.",
      "videos.watch": "Assistir",
      "videos.more": "Ver Mais no YouTube",
      "community.title": "Junta-te à Comunidade",
      "community.text": "Segue o canal e entra no Discord para não perderes nada.",
      "community.youtube": "Ir para o YouTube",
      "community.discord": "Entrar no Discord",
      "contact.title": "Contacto",
      "contact.subtitle": "Tens alguma pergunta ou proposta? Fala comigo.",
      "contact.form.send": "Enviar Mensagem",
      "footer.rights": "Todos os direitos reservados.",
      "footer.made": "Feito com paixão por gaming."
    },
    en: {
      "nav.home": "Home",
      "nav.about": "About",
      "nav.videos": "Videos",
      "nav.community": "Community",
      "nav.contact": "Contact",
      "hero.title": "AMIRIJOGOS",
      "hero.subtitle": "Gaming, challenges and serious fun.",
      "hero.cta.youtube": "Subscribe on YouTube",
      "hero.cta.videos": "Watch Videos",
      "about.title": "About the Channel",
      "about.eyebrow": "Who We Are",
      "about.text": "AMIRIJOGOS is a gaming channel made for people who love serious gameplay and good fun.",
      "about.stat.subscribers": "Subscribers",
      "about.stat.videos": "Videos",
      "about.stat.views": "Views",
      "videos.title": "Latest Videos",
      "videos.subtitle": "Check out the channel's latest content.",
      "videos.watch": "Watch",
      "videos.more": "See More on YouTube",
      "community.title": "Join the Community",
      "community.text": "Follow the channel and join the Discord so you never miss a thing.",
      "community.youtube": "Go to YouTube",
      "community.discord": "Join Discord",
      "contact.title": "Contact",
      "contact.subtitle": "Got a question or a proposal? Get in touch.",
      "contact.form.send": "Send Message",
      "footer.rights": "All rights reserved.",
      "footer.made": "Made with a passion for gaming."
    },
    es: {
      "nav.home": "Inicio",
      "nav.about": "Sobre Mí",
      "nav.videos": "Vídeos",
      "nav.community": "Comunidad",
      "nav.contact": "Contacto",
      "hero.title": "AMIRIJOGOS",
      "hero.subtitle": "Gaming, retos y diversión de verdad.",
      "hero.cta.youtube": "Suscribirse en YouTube",
      "hero.cta.videos": "Ver Vídeos",
      "about.title": "Sobre el Canal",
      "about.eyebrow": "Quiénes Somos",
      "about.text": "AMIRIJOGOS es un canal de gaming hecho para quienes disfrutan del juego en serio y la buena diversión.",
      "about.stat.subscribers": "Suscriptores",
      "about.stat.videos": "Vídeos",
      "about.stat.views": "Visualizaciones",
      "videos.title": "Últimos Vídeos",
      "videos.subtitle": "Descubre el contenido más reciente del canal.",
      "videos.watch": "Ver",
      "videos.more": "Ver Más en YouTube",
      "community.title": "Únete a la Comunidad",
      "community.text": "Sigue el canal y entra en Discord para no perderte nada.",
      "community.youtube": "Ir a YouTube",
      "community.discord": "Unirse a Discord",
      "contact.title": "Contacto",
      "contact.subtitle": "¿Tienes una pregunta o propuesta? Escríbeme.",
      "contact.form.send": "Enviar Mensaje",
      "footer.rights": "Todos los derechos reservados.",
      "footer.made": "Hecho con pasión por el gaming."
    },
    fr: {
      "nav.home": "Accueil",
      "nav.about": "À Propos",
      "nav.videos": "Vidéos",
      "nav.community": "Communauté",
      "nav.contact": "Contact",
      "hero.title": "AMIRIJOGOS",
      "hero.subtitle": "Gaming, défis et vrai plaisir de jeu.",
      "hero.cta.youtube": "S'abonner sur YouTube",
      "hero.cta.videos": "Voir les Vidéos",
      "about.title": "À Propos de la Chaîne",
      "about.eyebrow": "Qui Sommes-Nous",
      "about.text": "AMIRIJOGOS est une chaîne gaming pensée pour celles et ceux qui aiment jouer sérieusement tout en s'amusant.",
      "about.stat.subscribers": "Abonnés",
      "about.stat.videos": "Vidéos",
      "about.stat.views": "Vues",
      "videos.title": "Dernières Vidéos",
      "videos.subtitle": "Découvrez le contenu le plus récent de la chaîne.",
      "videos.watch": "Regarder",
      "videos.more": "Voir Plus sur YouTube",
      "community.title": "Rejoins la Communauté",
      "community.text": "Suis la chaîne et rejoins le Discord pour ne rien manquer.",
      "community.youtube": "Aller sur YouTube",
      "community.discord": "Rejoindre le Discord",
      "contact.title": "Contact",
      "contact.subtitle": "Une question ou une proposition ? Écris-moi.",
      "contact.form.send": "Envoyer le Message",
      "footer.rights": "Tous droits réservés.",
      "footer.made": "Fait avec passion pour le gaming."
    },
    de: {
      "nav.home": "Start",
      "nav.about": "Über Uns",
      "nav.videos": "Videos",
      "nav.community": "Community",
      "nav.contact": "Kontakt",
      "hero.title": "AMIRIJOGOS",
      "hero.subtitle": "Gaming, Herausforderungen und echter Spaß.",
      "hero.cta.youtube": "Auf YouTube abonnieren",
      "hero.cta.videos": "Videos Ansehen",
      "about.title": "Über den Kanal",
      "about.eyebrow": "Wer Wir Sind",
      "about.text": "AMIRIJOGOS ist ein Gaming-Kanal für alle, die ernsthaftes Zocken und guten Spaß lieben.",
      "about.stat.subscribers": "Abonnenten",
      "about.stat.videos": "Videos",
      "about.stat.views": "Aufrufe",
      "videos.title": "Neueste Videos",
      "videos.subtitle": "Schau dir die neuesten Inhalte des Kanals an.",
      "videos.watch": "Ansehen",
      "videos.more": "Mehr auf YouTube",
      "community.title": "Tritt der Community bei",
      "community.text": "Folge dem Kanal und tritt dem Discord bei, damit dir nichts entgeht.",
      "community.youtube": "Zu YouTube",
      "community.discord": "Discord Beitreten",
      "contact.title": "Kontakt",
      "contact.subtitle": "Frage oder Vorschlag? Melde dich gerne.",
      "contact.form.send": "Nachricht Senden",
      "footer.rights": "Alle Rechte vorbehalten.",
      "footer.made": "Mit Leidenschaft fürs Gaming gemacht."
    },
    it: {
      "nav.home": "Home",
      "nav.about": "Chi Siamo",
      "nav.videos": "Video",
      "nav.community": "Community",
      "nav.contact": "Contatti",
      "hero.title": "AMIRIJOGOS",
      "hero.subtitle": "Gaming, sfide e divertimento vero.",
      "hero.cta.youtube": "Iscriviti su YouTube",
      "hero.cta.videos": "Guarda i Video",
      "about.title": "Sul Canale",
      "about.eyebrow": "Chi Siamo",
      "about.text": "AMIRIJOGOS è un canale gaming pensato per chi ama giocare sul serio e divertirsi.",
      "about.stat.subscribers": "Iscritti",
      "about.stat.videos": "Video",
      "about.stat.views": "Visualizzazioni",
      "videos.title": "Ultimi Video",
      "videos.subtitle": "Scopri i contenuti più recenti del canale.",
      "videos.watch": "Guarda",
      "videos.more": "Altro su YouTube",
      "community.title": "Unisciti alla Community",
      "community.text": "Segui il canale ed entra nel Discord per non perderti nulla.",
      "community.youtube": "Vai su YouTube",
      "community.discord": "Entra nel Discord",
      "contact.title": "Contatti",
      "contact.subtitle": "Hai una domanda o una proposta? Scrivimi.",
      "contact.form.send": "Invia Messaggio",
      "footer.rights": "Tutti i diritti riservati.",
      "footer.made": "Fatto con passione per il gaming."
    },
    ja: {
      "nav.home": "ホーム",
      "nav.about": "概要",
      "nav.videos": "動画",
      "nav.community": "コミュニティ",
      "nav.contact": "お問い合わせ",
      "hero.title": "AMIRIJOGOS",
      "hero.subtitle": "本気のゲーミングと本物の楽しさを。",
      "hero.cta.youtube": "YouTubeでチャンネル登録",
      "hero.cta.videos": "動画を見る",
      "about.title": "チャンネルについて",
      "about.eyebrow": "私たちについて",
      "about.text": "AMIRIJOGOSは、本気でゲームを楽しみたい人のためのゲーミングチャンネルです。",
      "about.stat.subscribers": "登録者数",
      "about.stat.videos": "動画数",
      "about.stat.views": "再生回数",
      "videos.title": "最新動画",
      "videos.subtitle": "チャンネルの最新コンテンツをチェック。",
      "videos.watch": "視聴する",
      "videos.more": "YouTubeでもっと見る",
      "community.title": "コミュニティに参加",
      "community.text": "チャンネルをフォローしてDiscordにも参加しよう。",
      "community.youtube": "YouTubeへ",
      "community.discord": "Discordに参加",
      "contact.title": "お問い合わせ",
      "contact.subtitle": "質問やご提案があればお気軽にどうぞ。",
      "contact.form.send": "メッセージを送信",
      "footer.rights": "全著作権所有。",
      "footer.made": "ゲーム愛を込めて制作。"
    },
    zh: {
      "nav.home": "首页",
      "nav.about": "关于",
      "nav.videos": "视频",
      "nav.community": "社区",
      "nav.contact": "联系",
      "hero.title": "AMIRIJOGOS",
      "hero.subtitle": "认真的游戏，真正的乐趣。",
      "hero.cta.youtube": "在YouTube上订阅",
      "hero.cta.videos": "观看视频",
      "about.title": "关于频道",
      "about.eyebrow": "我们是谁",
      "about.text": "AMIRIJOGOS 是一个专为热爱认真游戏与真正乐趣的玩家打造的游戏频道。",
      "about.stat.subscribers": "订阅者",
      "about.stat.videos": "视频数",
      "about.stat.views": "观看次数",
      "videos.title": "最新视频",
      "videos.subtitle": "查看频道最新内容。",
      "videos.watch": "观看",
      "videos.more": "在YouTube上查看更多",
      "community.title": "加入社区",
      "community.text": "关注频道并加入Discord，不错过任何更新。",
      "community.youtube": "前往YouTube",
      "community.discord": "加入Discord",
      "contact.title": "联系",
      "contact.subtitle": "有问题或建议？欢迎联系我。",
      "contact.form.send": "发送消息",
      "footer.rights": "版权所有。",
      "footer.made": "怀着对游戏的热情制作。"
    },
    ko: {
      "nav.home": "홈",
      "nav.about": "소개",
      "nav.videos": "영상",
      "nav.community": "커뮤니티",
      "nav.contact": "문의",
      "hero.title": "AMIRIJOGOS",
      "hero.subtitle": "진지한 게임, 진짜 재미.",
      "hero.cta.youtube": "YouTube 구독하기",
      "hero.cta.videos": "영상 보기",
      "about.title": "채널 소개",
      "about.eyebrow": "우리는 누구인가",
      "about.text": "AMIRIJOGOS는 진지하게 게임을 즐기고 진짜 재미를 원하는 사람들을 위한 게이밍 채널입니다.",
      "about.stat.subscribers": "구독자",
      "about.stat.videos": "영상 수",
      "about.stat.views": "조회수",
      "videos.title": "최신 영상",
      "videos.subtitle": "채널의 최신 콘텐츠를 확인하세요.",
      "videos.watch": "시청하기",
      "videos.more": "YouTube에서 더 보기",
      "community.title": "커뮤니티에 참여하세요",
      "community.text": "채널을 팔로우하고 Discord에 참여해 아무것도 놓치지 마세요.",
      "community.youtube": "YouTube로 이동",
      "community.discord": "Discord 참여하기",
      "contact.title": "문의",
      "contact.subtitle": "질문이나 제안이 있으신가요? 연락주세요.",
      "contact.form.send": "메시지 보내기",
      "footer.rights": "모든 권리 보유.",
      "footer.made": "게임에 대한 열정으로 제작."
    },
    ru: {
      "nav.home": "Главная",
      "nav.about": "О канале",
      "nav.videos": "Видео",
      "nav.community": "Сообщество",
      "nav.contact": "Контакты",
      "hero.title": "AMIRIJOGOS",
      "hero.subtitle": "Серьёзный гейминг и настоящее удовольствие.",
      "hero.cta.youtube": "Подписаться на YouTube",
      "hero.cta.videos": "Смотреть видео",
      "about.title": "О канале",
      "about.eyebrow": "Кто мы",
      "about.text": "AMIRIJOGOS — игровой канал для тех, кто любит серьёзный геймплей и настоящий кайф.",
      "about.stat.subscribers": "Подписчики",
      "about.stat.videos": "Видео",
      "about.stat.views": "Просмотры",
      "videos.title": "Последние видео",
      "videos.subtitle": "Смотрите последние ролики канала.",
      "videos.watch": "Смотреть",
      "videos.more": "Больше на YouTube",
      "community.title": "Присоединяйтесь к сообществу",
      "community.text": "Подписывайтесь на канал и вступайте в Discord, чтобы ничего не пропустить.",
      "community.youtube": "Перейти на YouTube",
      "community.discord": "Вступить в Discord",
      "contact.title": "Контакты",
      "contact.subtitle": "Есть вопрос или предложение? Напишите мне.",
      "contact.form.send": "Отправить сообщение",
      "footer.rights": "Все права защищены.",
      "footer.made": "Сделано с любовью к гейминг."
    },
    ar: {
      "nav.home": "الرئيسية",
      "nav.about": "من نحن",
      "nav.videos": "الفيديوهات",
      "nav.community": "المجتمع",
      "nav.contact": "تواصل",
      "hero.title": "AMIRIJOGOS",
      "hero.subtitle": "ألعاب جادة ومتعة حقيقية.",
      "hero.cta.youtube": "اشترك في يوتيوب",
      "hero.cta.videos": "مشاهدة الفيديوهات",
      "about.title": "عن القناة",
      "about.eyebrow": "من نحن",
      "about.text": "AMIRIJOGOS قناة ألعاب لمن يحب اللعب الجاد والمتعة الحقيقية.",
      "about.stat.subscribers": "مشتركون",
      "about.stat.videos": "فيديوهات",
      "about.stat.views": "مشاهدات",
      "videos.title": "أحدث الفيديوهات",
      "videos.subtitle": "تابع أحدث محتوى القناة.",
      "videos.watch": "مشاهدة",
      "videos.more": "المزيد على يوتيوب",
      "community.title": "انضم إلى المجتمع",
      "community.text": "تابع القناة وانضم إلى Discord حتى لا يفوتك شيء.",
      "community.youtube": "الذهاب إلى يوتيوب",
      "community.discord": "الانضمام إلى Discord",
      "contact.title": "تواصل",
      "contact.subtitle": "لديك سؤال أو اقتراح؟ تواصل معي.",
      "contact.form.send": "إرسال الرسالة",
      "footer.rights": "جميع الحقوق محفوظة.",
      "footer.made": "صُنع بشغف لعالم الألعاب."
    },
    tr: {
      "nav.home": "Ana Sayfa",
      "nav.about": "Hakkında",
      "nav.videos": "Videolar",
      "nav.community": "Topluluk",
      "nav.contact": "İletişim",
      "hero.title": "AMIRIJOGOS",
      "hero.subtitle": "Ciddi oyun, gerçek eğlence.",
      "hero.cta.youtube": "YouTube'da Abone Ol",
      "hero.cta.videos": "Videoları İzle",
      "about.title": "Kanal Hakkında",
      "about.eyebrow": "Biz Kimiz",
      "about.text": "AMIRIJOGOS, ciddi oyun ve gerçek eğlenceyi sevenler için bir gaming kanalıdır.",
      "about.stat.subscribers": "Aboneler",
      "about.stat.videos": "Videolar",
      "about.stat.views": "Görüntülenme",
      "videos.title": "Son Videolar",
      "videos.subtitle": "Kanalın en son içeriklerine göz atın.",
      "videos.watch": "İzle",
      "videos.more": "YouTube'da Daha Fazla",
      "community.title": "Topluluğa Katıl",
      "community.text": "Kanalı takip et ve hiçbir şeyi kaçırmamak için Discord'a katıl.",
      "community.youtube": "YouTube'a Git",
      "community.discord": "Discord'a Katıl",
      "contact.title": "İletişim",
      "contact.subtitle": "Bir sorunuz ya da öneriniz mi var? Benimle iletişime geçin.",
      "contact.form.send": "Mesaj Gönder",
      "footer.rights": "Tüm hakları saklıdır.",
      "footer.made": "Oyun tutkusuyla yapıldı."
    }
  };

  /* ------------------------------------------------------------------------
     2. Language system
     ------------------------------------------------------------------------ */
  function getInitialLang() {
    var saved = safeStorageGet(LANG_STORAGE_KEY);
    if (saved && SUPPORTED_LANGS.indexOf(saved) !== -1) {
      return saved;
    }
    return DEFAULT_LANG;
  }

  function applyTranslations(lang) {
    var dict = translations[lang] || translations[DEFAULT_LANG];

    $all("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key || !dict || typeof dict[key] === "undefined") return;

      var value = dict[key];

      // Allow elements to opt into translating an attribute instead of
      // textContent, e.g. data-i18n-target="placeholder" or "aria-label".
      var target = el.getAttribute("data-i18n-target");
      if (target) {
        try {
          el.setAttribute(target, value);
        } catch (e) {
          /* ignore invalid attribute target */
        }
      } else {
        el.textContent = value;
      }
    });

    // Optional: elements that want a translated placeholder specifically
    $all("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      if (!key || !dict || typeof dict[key] === "undefined") return;
      try {
        el.setAttribute("placeholder", dict[key]);
      } catch (e) {}
    });
  }

  function setDocumentLangAttributes(lang) {
    try {
      document.documentElement.lang = lang;
      document.documentElement.dir =
        RTL_LANGS.indexOf(lang) !== -1 ? "rtl" : "ltr";
    } catch (e) {}
  }

  function syncLanguageSelector(lang) {
    // Support a <select> based selector
    $all(
      "#language-selector, .language-selector select, .lang-selector select, [data-lang-select]"
    ).forEach(function (el) {
      if (el && "value" in el) {
        el.value = lang;
      }
    });

    // Support button-group based selectors: elements with data-lang="xx"
    $all("[data-lang]").forEach(function (el) {
      var elLang = el.getAttribute("data-lang");
      if (elLang === lang) {
        el.classList.add("active");
        el.setAttribute("aria-current", "true");
      } else {
        el.classList.remove("active");
        el.removeAttribute("aria-current");
      }
    });
  }

  function setLanguage(lang) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1) {
      lang = DEFAULT_LANG;
    }
    applyTranslations(lang);
    setDocumentLangAttributes(lang);
    syncLanguageSelector(lang);
    safeStorageSet(LANG_STORAGE_KEY, lang);
  }

  function initLanguageSystem() {
    var initialLang = getInitialLang();
    setLanguage(initialLang);

    // <select> style selector(s)
    $all(
      "#language-selector, .language-selector select, .lang-selector select, [data-lang-select]"
    ).forEach(function (el) {
      el.addEventListener("change", function (e) {
        var val = e.target && e.target.value;
        if (val) setLanguage(val);
      });
    });

    // Button/link style selector(s): any element with data-lang="xx"
    $all("[data-lang]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        var lang = el.getAttribute("data-lang");
        if (!lang) return;
        e.preventDefault();
        setLanguage(lang);
      });
    });
  }

  /* ------------------------------------------------------------------------
     3. Smooth scroll for in-page navigation
     ------------------------------------------------------------------------ */
  function initSmoothScroll() {
    var header = $("header, .header, #header, .navbar, .nav");
    var headerOffset = header ? header.offsetHeight : 0;

    $all('a[href^="#"]').forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href || href === "#" || href.length < 2) return;

      link.addEventListener("click", function (e) {
        var targetId = href.slice(1);
        var target = document.getElementById(targetId);
        if (!target) return; // let default behavior happen if no match

        e.preventDefault();

        var top =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          headerOffset -
          10;

        window.scrollTo({
          top: top < 0 ? 0 : top,
          behavior: prefersReducedMotion() ? "auto" : "smooth"
        });

        // Close mobile menu after navigating, if present/open
        var navLinks = $(".nav-links.active, .nav-menu.active, .menu.active, .nav-links.open, .nav-menu.open, .menu.open");
        var toggle = $(".menu-toggle, .nav-toggle, .hamburger");
        if (navLinks) {
          navLinks.classList.remove("active", "open");
        }
        if (toggle) {
          toggle.classList.remove("active");
          toggle.setAttribute("aria-expanded", "false");
        }

        // Move focus to target for accessibility (without re-triggering scroll)
        if (typeof target.focus === "function") {
          var hadTabIndex = target.hasAttribute("tabindex");
          if (!hadTabIndex) target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
          if (!hadTabIndex) {
            target.addEventListener(
              "blur",
              function cleanup() {
                target.removeAttribute("tabindex");
                target.removeEventListener("blur", cleanup);
              },
              { once: true }
            );
          }
        }

        // Reflect state in the URL without an extra jump
        if (history && history.pushState) {
          history.pushState(null, "", "#" + targetId);
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     4. Mobile navigation toggle
     ------------------------------------------------------------------------ */
  function initMobileNav() {
    var toggle = $(".menu-toggle, .nav-toggle, .hamburger, #menu-toggle");
    var nav = $(".nav-links, .nav-menu, .menu");
    if (!toggle || !nav) return;

    toggle.setAttribute("aria-expanded", "false");

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("active");
      nav.classList.toggle("open", isOpen);
      toggle.classList.toggle("active", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close menu when clicking outside of it
    document.addEventListener("click", function (e) {
      var isToggle = toggle.contains(e.target);
      var isNav = nav.contains(e.target);
      if (!isToggle && !isNav && nav.classList.contains("active")) {
        nav.classList.remove("active", "open");
        toggle.classList.remove("active");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    // Close on Escape for keyboard users
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("active")) {
        nav.classList.remove("active", "open");
        toggle.classList.remove("active");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ------------------------------------------------------------------------
     5. Sticky header background on scroll
     ------------------------------------------------------------------------ */
  function initHeaderScrollState() {
    var header = $("header, .header, #header, .navbar, .nav");
    if (!header) return;

    var ticking = false;

    function update() {
      if (window.scrollY > 20) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );

    update();
  }

  /* ------------------------------------------------------------------------
     6. Reveal-on-scroll animations (IntersectionObserver)
     ------------------------------------------------------------------------ */
  function initRevealAnimations() {
    var reduceMotion = prefersReducedMotion();

    var targets = $all(
      ".reveal-on-scroll, .fade-in, .animate-fade-in, .fade-in-up, .animate-fade-in-up, " +
        "section, .video-card, .video-item, .stat, .stat-item, .stat-card"
    );

    if (!targets.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      // Show everything immediately, no motion
      targets.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------------
     7. YouTube buttons/links
     ------------------------------------------------------------------------ */
  function initYouTubeLinks() {
    var selectors = [
      ".btn-youtube",
      ".youtube-btn",
      "#youtube-btn",
      "[data-youtube]",
      'a[href*="youtube.com/@amirijogos"]',
      'a[href*="youtube.com"][class*="youtube"]'
    ].join(", ");

    $all(selectors).forEach(function (link) {
      // Only force the URL on elements that are clearly meant to be
      // "official channel" buttons (data-youtube or class-based), so we
      // don't overwrite unrelated youtube.com links (e.g. embedded videos).
      var shouldForceUrl =
        link.hasAttribute("data-youtube") ||
        link.classList.contains("btn-youtube") ||
        link.classList.contains("youtube-btn") ||
        link.id === "youtube-btn";

      if (shouldForceUrl && link.tagName === "A") {
        link.setAttribute("href", YOUTUBE_URL);
      }

      if (link.tagName === "A") {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      } else {
        // Non-anchor elements (e.g. <button>) acting as YouTube buttons
        link.addEventListener("click", function () {
          window.open(YOUTUBE_URL, "_blank", "noopener,noreferrer");
        });
      }
    });
  }

  /* ------------------------------------------------------------------------
     8. Generic external links safety (open in new tab, no opener leak)
     ------------------------------------------------------------------------ */
  function initExternalLinks() {
    $all('a[href^="http"]').forEach(function (link) {
      try {
        var url = new URL(link.href, window.location.href);
        if (url.host !== window.location.host) {
          if (!link.hasAttribute("target")) {
            link.setAttribute("target", "_blank");
          }
          var rel = link.getAttribute("rel") || "";
          if (rel.indexOf("noopener") === -1) {
            link.setAttribute("rel", (rel + " noopener noreferrer").trim());
          }
        }
      } catch (e) {
        /* ignore malformed URLs */
      }
    });
  }

  /* ------------------------------------------------------------------------
     9. Init
     ------------------------------------------------------------------------ */
  function init() {
    initLanguageSystem();
    initSmoothScroll();
    initMobileNav();
    initHeaderScrollState();
    initRevealAnimations();
    initYouTubeLinks();
    initExternalLinks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
