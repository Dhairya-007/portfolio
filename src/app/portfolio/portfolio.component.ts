import { NgClass, NgFor, NgIf, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';

interface Project {
  name: string;
  category: 'ai' | 'fullstack' | 'games' | 'systems';
  categoryLabel: string;
  blurb: string;
  stack: string[];
  metric?: string;
  code?: string;
  live?: string;
  featured?: boolean;
}

export type TeamId = 'redbull' | 'mercedes' | 'ferrari' | 'mclaren';

/** Every colour the 3D car is painted with. */
interface Livery {
  tub: number;
  cover: number;
  flash: number;
  highlight: number;
  wing: number;
  endplate: number;
  hub: number;
  rim: number;
  helmet: number;
  helmetTrim: number;
  sidewall: number;
  carbon: number;
}

/** The shape knobs that make each team's car a different silhouette. */
interface Chassis {
  profile: 'classic' | 'modern';
  halo: boolean;
  noseLength: number;
  noseRadius: number;
  noseY: number;
  frontWingSpan: number;
  sidepodHeight: number;
  sidepodWidth: number;
  sidepodY: number;
  airboxRadius: number;
  rearWingY: number;
  rearWingSpan: number;
  rearWingRake: number;
  spine: boolean;
}

interface TeamLighting {
  hemiSky: number;
  hemiGround: number;
  rimA: number;
  rimB: number;
  fill: number;
}

export interface Team {
  id: TeamId;
  themeColor: string;
  name: string;
  short: string;
  car: string;
  base: string;
  swatch: [string, string];
  livery: Livery;
  chassis: Chassis;
  lighting: TeamLighting;
  particles: [number, number, number];
}

export const TEAMS: Record<TeamId, Team> = {
  // 2013-era RB9: no halo, low slim nose, tall rear wing, navy/purple tub.
  redbull: {
    id: 'redbull',
    themeColor: '#0a0e27',
    name: 'Oracle Red Bull Racing',
    short: 'Red Bull',
    car: 'RB9',
    base: 'Milton Keynes',
    swatch: ['#ff1800', '#ffd700'],
    livery: {
      tub: 0x151034,
      cover: 0x331c6b,
      flash: 0xd81e2c,
      highlight: 0xffc400,
      wing: 0x151034,
      endplate: 0x151034,
      hub: 0xd81e2c,
      rim: 0xb9bfcc,
      helmet: 0xf2f2f5,
      helmetTrim: 0xffc400,
      sidewall: 0xe9e9ef,
      carbon: 0x0c0e1c,
    },
    chassis: {
      profile: 'classic',
      halo: false,
      noseLength: 0.95,
      noseRadius: 0.21,
      noseY: -0.04,
      frontWingSpan: 2.0,
      sidepodHeight: 0.36,
      sidepodWidth: 0.46,
      sidepodY: -0.08,
      airboxRadius: 0.2,
      rearWingY: 0.68,
      rearWingSpan: 1.4,
      rearWingRake: -0.26,
      spine: true,
    },
    lighting: {
      hemiSky: 0x9fb4ff,
      hemiGround: 0x060814,
      rimA: 0xff1800,
      rimB: 0xffd700,
      fill: 0x668cff,
    },
    particles: [0xff1800, 0xffd700, 0x2b3566],
  },

  // W11-era: near-black tub, Petronas teal flashes, long slender nose, halo.
  mercedes: {
    id: 'mercedes',
    themeColor: '#05121a',
    name: 'Mercedes-AMG Petronas',
    short: 'Mercedes',
    car: 'W11',
    base: 'Brackley',
    swatch: ['#00d2be', '#c8ced8'],
    livery: {
      tub: 0x0b0d11,
      cover: 0x15191e,
      flash: 0x00d2be,
      highlight: 0xc3cad4,
      wing: 0x0b0d11,
      endplate: 0x00a399,
      hub: 0x00d2be,
      rim: 0xd4dae2,
      helmet: 0x1b1f24,
      helmetTrim: 0x00d2be,
      sidewall: 0xe9e9ef,
      carbon: 0x0a0c0f,
    },
    chassis: {
      profile: 'modern',
      halo: true,
      noseLength: 1.18,
      noseRadius: 0.15,
      noseY: 0.02,
      frontWingSpan: 2.04,
      sidepodHeight: 0.3,
      sidepodWidth: 0.42,
      sidepodY: -0.1,
      airboxRadius: 0.17,
      rearWingY: 0.6,
      rearWingSpan: 1.3,
      rearWingRake: -0.2,
      spine: false,
    },
    lighting: {
      hemiSky: 0x9fd8e0,
      hemiGround: 0x03090c,
      rimA: 0x00d2be,
      rimB: 0xc8ced8,
      fill: 0x5fa8b8,
    },
    particles: [0x00d2be, 0xc8ced8, 0x1d3f49],
  },

  // F1-75-era: rosso corsa tub, black flashes, wide blunt nose, tall wing, halo.
  ferrari: {
    id: 'ferrari',
    themeColor: '#14050a',
    name: 'Scuderia Ferrari',
    short: 'Ferrari',
    car: 'F1-75',
    base: 'Maranello',
    swatch: ['#ff2800', '#fff200'],
    livery: {
      tub: 0xd40000,
      cover: 0xb00010,
      flash: 0x16161a,
      highlight: 0xfff200,
      wing: 0xd40000,
      endplate: 0x16161a,
      hub: 0xfff200,
      rim: 0xc9ced6,
      helmet: 0xf2f2f5,
      helmetTrim: 0xd40000,
      sidewall: 0xe9e9ef,
      carbon: 0x140809,
    },
    chassis: {
      profile: 'modern',
      halo: true,
      noseLength: 0.86,
      noseRadius: 0.24,
      noseY: 0.0,
      frontWingSpan: 1.96,
      sidepodHeight: 0.42,
      sidepodWidth: 0.5,
      sidepodY: -0.04,
      airboxRadius: 0.21,
      rearWingY: 0.74,
      rearWingSpan: 1.36,
      rearWingRake: -0.3,
      spine: true,
    },
    lighting: {
      hemiSky: 0xffc3b8,
      hemiGround: 0x0d0305,
      rimA: 0xff2800,
      rimB: 0xfff200,
      fill: 0xff8a7a,
    },
    particles: [0xff2800, 0xfff200, 0x5a1620],
  },

  // MCL36-era: papaya tub, anthracite cover, blue flashes, narrow nose, halo.
  mclaren: {
    id: 'mclaren',
    themeColor: '#120c06',
    name: 'McLaren Formula 1 Team',
    short: 'McLaren',
    car: 'MCL36',
    base: 'Woking',
    swatch: ['#ff8000', '#47c7fc'],
    livery: {
      tub: 0xf57300,
      cover: 0x1b1d22,
      flash: 0x0090d0,
      highlight: 0xff9b2f,
      wing: 0x1b1d22,
      endplate: 0xf57300,
      hub: 0x0090d0,
      rim: 0xcbd2da,
      helmet: 0xf2f2f5,
      helmetTrim: 0xf57300,
      sidewall: 0xe9e9ef,
      carbon: 0x14100c,
    },
    chassis: {
      profile: 'modern',
      halo: true,
      noseLength: 1.05,
      noseRadius: 0.17,
      noseY: 0.0,
      frontWingSpan: 2.08,
      sidepodHeight: 0.34,
      sidepodWidth: 0.47,
      sidepodY: -0.09,
      airboxRadius: 0.19,
      rearWingY: 0.65,
      rearWingSpan: 1.34,
      rearWingRake: -0.24,
      spine: false,
    },
    lighting: {
      hemiSky: 0xffd0a0,
      hemiGround: 0x0b0804,
      rimA: 0xff8000,
      rimB: 0x47c7fc,
      fill: 0x8fb8d8,
    },
    particles: [0xff8000, 0x47c7fc, 0x4a3318],
  },
};

export const TEAM_IDS: TeamId[] = ['redbull', 'mercedes', 'ferrari', 'mclaren'];

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css'],
  standalone: true,
  imports: [NgFor, NgIf, NgClass],
})
export class PortfolioComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('bgCanvas', { static: true }) bgCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('carCanvas', { static: true }) carCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('carStage', { static: true }) carStageRef!: ElementRef<HTMLDivElement>;

  constructor(private elRef: ElementRef, @Inject(PLATFORM_ID) private platformId: Object) {}

  readonly currentYear: number = new Date().getFullYear();
  readonly navSections = [
    'home',
    'about',
    'experience',
    'projects',
    'skills',
    'achievements',
    'contact',
  ];
  readonly activeSection = signal('home');
  readonly menuOpen = signal(false);
  readonly webglFailed = signal(false);

  // ------------------------------------------------------------------- teams
  readonly teamIds = TEAM_IDS;
  readonly teams = TEAMS;
  readonly team = signal<TeamId>('redbull');
  readonly teamSpec = computed<Team>(() => TEAMS[this.team()]);
  readonly garageOpen = signal(false);
  private static readonly STORAGE_KEY = 'portfolio.team';

  // ---------------------------------------------------------------- three.js
  private bgScene!: THREE.Scene;
  private bgCamera!: THREE.PerspectiveCamera;
  private bgRenderer?: THREE.WebGLRenderer;
  private particles?: THREE.Points;

  private carScene!: THREE.Scene;
  private carCamera!: THREE.PerspectiveCamera;
  private carRenderer?: THREE.WebGLRenderer;
  private carGroup?: THREE.Group;
  private wheels: THREE.Object3D[] = [];
  private controls: any;
  private carLights: THREE.Light[] = [];
  private groundShadow?: THREE.Mesh;

  private clock = new THREE.Clock();
  private animationId = 0;
  private running = false;
  private heroVisible = true;
  private reducedMotion = false;
  private interactionUntil = 0;

  private sectionObserver?: IntersectionObserver;
  private heroObserver?: IntersectionObserver;
  private stageResizeObserver?: ResizeObserver;
  private dashboardTimer?: ReturnType<typeof setInterval>;

  private onWindowResize = () => this.resizeBackground();
  private onVisibilityChange = () => {
    if (document.hidden) {
      this.stopLoop();
    } else {
      this.startLoop();
    }
  };
  private onCarContextLost = (event: Event) => {
    event.preventDefault();
    this.stopLoop();
  };
  private onCarContextRestored = () => {
    this.startLoop();
  };
  private onCarPointerDown = () => {
    this.interactionUntil = performance.now() + 2600;
  };
  private onDocumentPointerDown = (event: Event) => {
    if (!this.garageOpen()) return;
    const target = event.target as Node | null;
    if (target && this.elRef.nativeElement.querySelector('.garage')?.contains(target)) return;
    this.garageOpen.set(false);
  };
  private onDocumentKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.garageOpen.set(false);
      this.menuOpen.set(false);
    }
  };

  // ------------------------------------------------------------------ content
  readonly stats = [
    { value: '2+', label: 'Years shipping' },
    { value: '3', label: 'Platforms owned' },
    { value: '5', label: 'Apps retired' },
    { value: '25-30', label: 'Person team' },
  ];

  // Live hero telemetry
  readonly carSpeed = signal(212);
  readonly rpm = signal(9400);
  readonly gear = signal(6);
  readonly lapTime = '1:23.456';

  readonly halmaFullTimeTech = [
    'Flutter',
    'Dart',
    'Melos',
    'ObjectBox',
    'NestJS',
    'Angular',
    'Apache Kafka',
    'Redis',
    'BullMQ',
    'PostgreSQL',
    'Docker',
    'Kubernetes',
    '.NET MAUI',
    'React Native',
    'HighCharts',
    'n8n',
    'LLM Agents',
    'Azure DevOps',
  ];

  readonly halmaInternTech = [
    '.NET MAUI',
    'C#',
    'BLE Protocol',
    'SQLite',
    'LiteDB',
    'PostgreSQL',
    'IoT',
    'UI/UX Wireframes',
  ];

  readonly barclaysTech = ['Java', 'Selenium WebDriver', 'Jenkins', 'CI/CD', 'Agile'];

  readonly skills = {
    fullstack: [
      'MERN',
      'MEAN',
      'MongoDB',
      'Express',
      'React',
      'Angular',
      'Node.js',
      'Next.js',
      'NestJS',
      'REST APIs',
      'Microservices',
    ],
    ai: [
      'Claude API',
      'OpenAI API',
      'RAG',
      'Vector Search',
      'Agent Harnesses',
      'Tool Calling',
      'Prompt Engineering',
      'n8n',
      'BMAD / GSD',
    ],
    mobile: [
      'Flutter',
      'Dart',
      'Melos',
      'React Native',
      '.NET MAUI',
      'BLE',
      'Wi-Fi / LAN',
      'Serial',
      'IoT',
      'UWP',
    ],
    languages: ['Python', 'TypeScript', 'JavaScript', 'Dart', 'Java', 'C#', 'C', 'C++', 'SQL'],
    data: [
      'PostgreSQL',
      'MongoDB',
      'MySQL',
      'SQL Server',
      'Redis',
      'Apache Kafka',
      'BullMQ',
      'ObjectBox',
      'SQLite',
      'LiteDB',
    ],
    devops: [
      'Docker',
      'Kubernetes',
      'Azure DevOps',
      'AWS',
      'Azure',
      'Jenkins',
      'CI/CD',
      'Git',
      'Netlify',
      'Postman',
      'Wrike',
    ],
  };

  readonly projectFilters = [
    { key: 'all', label: 'All' },
    { key: 'ai', label: 'AI & Agents' },
    { key: 'fullstack', label: 'Full Stack' },
    { key: 'games', label: 'Games & 3D' },
    { key: 'systems', label: 'Systems' },
  ];

  readonly activeFilter = signal('all');

  readonly projects: Project[] = [
    {
      name: 'agent-harness',
      category: 'ai',
      categoryLabel: 'AI & Agents',
      blurb:
        'A typed agent harness for Claude. The loop is the easy part — this is the rest: tool inputs validated before they run, approval gates over parsed arguments, a context budget that clears old tool output, and a verification pass that can send the model back.',
      stack: ['TypeScript', 'Zod', 'Anthropic SDK'],
      metric: '39 tests · no network',
      code: 'https://github.com/Dhairya-007/agent-harness',
      featured: true,
    },
    {
      name: 'rag-service',
      category: 'ai',
      categoryLabel: 'AI & Agents',
      blurb:
        'Grounded document Q&A. Hybrid BM25 and dense retrieval fused by rank, a NestJS API and a Next.js UI. Retrieval is a tool the model calls repeatedly, not a prompt prefix — and an answer that cites nothing is rejected and sent back.',
      stack: ['NestJS', 'Next.js', 'TypeScript', 'Vector Search'],
      metric: '52 tests',
      code: 'https://github.com/Dhairya-007/rag-service',
      featured: true,
    },
    {
      name: 'Lights Out',
      category: 'games',
      categoryLabel: 'Games & 3D',
      blurb:
        'A Python pipeline that compiles a Formula 1 race into a shareable 3D browser replay — real engine sound, team radio, and the race story found automatically. Cut false overtake detections at the 2025 Monaco GP from 72 down to 12.',
      stack: ['Python', 'NumPy', 'Three.js', 'Web Audio', 'pytest'],
      metric: 'false passes 72 → 12',
      code: 'https://github.com/Dhairya-007/lights-out',
      live: 'https://dhairya-007.github.io/lights-out/',
      featured: true,
    },
    {
      name: 'Billber',
      category: 'fullstack',
      categoryLabel: 'Full Stack',
      blurb:
        'Split shared expenses in three taps. No account, no server, works offline. Integer-only money logic, balances simplified into the shortest list of who pays whom, and sharing through a read-only link with the group packed inside it.',
      stack: ['React', 'TypeScript', 'Vite', 'PWA'],
      metric: 'offline-first',
      code: 'https://github.com/Dhairya-007/billber',
    },
    {
      name: 'Scrawl',
      category: 'fullstack',
      categoryLabel: 'Full Stack',
      blurb:
        'A free, self-hostable multiplayer drawing-and-guessing party game: an authoritative real-time game server with per-player information hiding, a drawing protocol that stays in sync, and three game modes. One Node process and a static bundle.',
      stack: ['TypeScript', 'Node.js', 'WebSockets', 'Canvas'],
      metric: '3 game modes',
      code: 'https://github.com/Dhairya-007/scrawl',
    },
    {
      name: 'Citrine Growth',
      category: 'fullstack',
      categoryLabel: 'Full Stack',
      blurb:
        'A premium digital agency platform — marketing site plus a full admin panel, with dual light/dark theming throughout and a typed Prisma data layer behind a NestJS API.',
      stack: ['Next.js 14', 'NestJS', 'Prisma', 'PostgreSQL'],
      metric: 'full admin panel',
      code: 'https://github.com/Dhairya-007/citrine-growth',
    },
    {
      name: 'Detonate the Bomb',
      category: 'games',
      categoryLabel: 'Games & 3D',
      blurb:
        'A browser puzzle game: 50 hand-built levels, instruction-driven gameplay, a timer system, scoring and level progression — all client-side, no backend.',
      stack: ['Next.js', 'TypeScript', 'CSS3'],
      metric: '50 levels',
      code: 'https://github.com/Dhairya-007/detonator',
      live: 'https://detonatebomb.netlify.app/',
    },
    {
      name: 'Ludo Katta',
      category: 'games',
      categoryLabel: 'Games & 3D',
      blurb:
        'Four colours, sixteen ghoda, one argument. Classic ludo in the browser with computer opponents that actually hunt you — they count the squares behind them before stepping into your range. Pure SVG board, no assets to download.',
      stack: ['React', 'Vite', 'SVG'],
      metric: 'scoring AI',
      code: 'https://github.com/Dhairya-007/ludo-katta',
    },
    {
      name: 'Saap Sidi',
      category: 'games',
      categoryLabel: 'Games & 3D',
      blurb:
        'Snakes and ladders the way it is actually played, with hand-drawn SVG snakes and a 3D dice that rolls instead of flashing a number.',
      stack: ['React', 'Vite', 'SVG', '3D dice'],
      code: 'https://github.com/Dhairya-007/saap-sidi',
    },
    {
      name: 'Amdavad Business',
      category: 'games',
      categoryLabel: 'Games & 3D',
      blurb:
        'A desi Ahmedabad property board game — buy, trade and bankrupt your friends across the city. Frontend only.',
      stack: ['React', 'Vite'],
      code: 'https://github.com/Dhairya-007/amdavad-business',
    },
    {
      name: 'Siddheshwari Investment',
      category: 'fullstack',
      categoryLabel: 'Full Stack',
      blurb:
        'A business site for an investment firm: 10+ content sections, tuned for load performance and cross-browser support.',
      stack: ['Angular', 'TypeScript', 'Netlify'],
      live: 'https://siddheshwariinvestment.netlify.app/',
    },
    {
      name: 'This Portfolio',
      category: 'games',
      categoryLabel: 'Games & 3D',
      blurb:
        'The site you are on. A single-page portfolio built as a Formula 1 pit wall — a hand-built Three.js car you can drag to rotate, live telemetry panels, and server-side rendering so it still loads without WebGL.',
      stack: ['Angular 20', 'Three.js', 'SSR', 'Netlify'],
      metric: 'hand-built 3D car',
      code: 'https://github.com/Dhairya-007/portfolio',
      live: 'https://dhairyaoza007.netlify.app/',
    },
    {
      name: 'DSA',
      category: 'systems',
      categoryLabel: 'Systems',
      blurb:
        'Where the data structures and algorithms practice lives — the fundamentals, kept sharp.',
      stack: ['Java'],
      code: 'https://github.com/Dhairya-007/DSA',
    },
  ];

  readonly visibleProjects = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'all') return this.projects;
    return this.projects.filter((p) => p.category === filter);
  });

  setFilter(key: string): void {
    this.activeFilter.set(key);
  }

  readonly achievements = [
    {
      icon: '🏆',
      title: 'JEE Mains 2020',
      rank: 'All India Rank 8,886',
      percentile: '99.22 percentile among 1.1M candidates',
      color: 'indigo',
    },
    {
      icon: '🎯',
      title: 'JEE Advanced 2020',
      rank: 'All India Rank ~10,000',
      percentile: '95+ percentile among 1.6 lakh candidates',
      color: 'purple',
    },
    {
      icon: '🥇',
      title: 'Academic Excellence',
      rank: 'Ranked 5th out of 135 students',
      percentile: 'B.Tech CSE, SVNIT Surat — 9.19/10 CGPA',
      color: 'pink',
    },
    {
      icon: '🌟',
      title: 'Leadership & Community',
      rank: 'ACM NIT Surat — Executive',
      percentile: 'MLSA NIT Surat — Junior Developer',
      color: 'cyan',
    },
  ];

  // ------------------------------------------------------------- lifecycle
  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.restoreTeam();

    if (!this.initRenderers()) {
      this.webglFailed.set(true);
      return;
    }

    this.buildBackground();
    this.buildCarScene();
    this.initOrbitControls();
    this.startDashboardAnimation();

    window.addEventListener('resize', this.onWindowResize, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    this.startLoop();
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    document.addEventListener('pointerdown', this.onDocumentPointerDown);
    document.addEventListener('keydown', this.onDocumentKeydown);

    const sections: HTMLElement[] = Array.from(
      this.elRef.nativeElement.querySelectorAll('section[id]')
    );

    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (!visible.length) return;
        const mostVisible = visible.reduce((prev, cur) =>
          cur.intersectionRatio > prev.intersectionRatio ? cur : prev
        );
        this.activeSection.set(mostVisible.target.id);
      },
      { root: null, threshold: [0.1, 0.25, 0.5], rootMargin: '-80px 0px -55% 0px' }
    );
    sections.forEach((s) => this.sectionObserver!.observe(s));

    // Only burn GPU on the car while the hero is actually on screen.
    const hero = this.elRef.nativeElement.querySelector('#home');
    if (hero) {
      this.heroObserver = new IntersectionObserver(
        (entries) => {
          this.heroVisible = entries.some((e) => e.isIntersecting);
        },
        { threshold: 0 }
      );
      this.heroObserver.observe(hero);
    }

    // The car canvas follows its stage box, not the window.
    if (typeof ResizeObserver !== 'undefined') {
      this.stageResizeObserver = new ResizeObserver(() => this.resizeCar());
      this.stageResizeObserver.observe(this.carStageRef.nativeElement);
    }
    this.resizeCar();
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.stopLoop();
    window.removeEventListener('resize', this.onWindowResize);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    document.removeEventListener('pointerdown', this.onDocumentPointerDown);
    document.removeEventListener('keydown', this.onDocumentKeydown);

    const carCanvas = this.carCanvasRef?.nativeElement;
    if (carCanvas) {
      carCanvas.removeEventListener('webglcontextlost', this.onCarContextLost);
      carCanvas.removeEventListener('webglcontextrestored', this.onCarContextRestored);
      carCanvas.removeEventListener('pointerdown', this.onCarPointerDown);
    }

    if (this.dashboardTimer) clearInterval(this.dashboardTimer);
    this.sectionObserver?.disconnect();
    this.heroObserver?.disconnect();
    this.stageResizeObserver?.disconnect();
    this.controls?.dispose?.();

    this.disposeScene(this.bgScene);
    this.disposeScene(this.carScene);
    this.bgRenderer?.dispose();
    this.carRenderer?.dispose();
  }

  // ------------------------------------------------------------ navigation
  toggleMenu(): void {
    this.garageOpen.set(false);
    this.menuOpen.update((open) => !open);
  }

  scrollToSection(sectionId: string): void {
    this.menuOpen.set(false);
    if (!isPlatformBrowser(this.platformId)) return;
    const section = this.elRef.nativeElement.querySelector(`#${sectionId}`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.activeSection.set(sectionId);
    }
  }

  // ----------------------------------------------------------- three setup
  private initRenderers(): boolean {
    try {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.bgRenderer = new THREE.WebGLRenderer({
        canvas: this.bgCanvasRef.nativeElement,
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
      });
      this.bgRenderer.setPixelRatio(dpr);

      this.carRenderer = new THREE.WebGLRenderer({
        canvas: this.carCanvasRef.nativeElement,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      this.carRenderer.setPixelRatio(dpr);
      this.carRenderer.outputColorSpace = THREE.SRGBColorSpace;
      this.carRenderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.carRenderer.toneMappingExposure = 1.15;

      const carCanvas = this.carCanvasRef.nativeElement;
      carCanvas.addEventListener('webglcontextlost', this.onCarContextLost, false);
      carCanvas.addEventListener('webglcontextrestored', this.onCarContextRestored, false);
      carCanvas.addEventListener('pointerdown', this.onCarPointerDown, { passive: true });

      return true;
    } catch (error) {
      console.warn('WebGL unavailable, falling back to the static hero:', error);
      return false;
    }
  }

  private buildBackground(): void {
    this.bgScene = new THREE.Scene();
    this.bgCamera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / Math.max(window.innerHeight, 1),
      0.1,
      1000
    );
    this.bgCamera.position.z = 5;

    const count = window.innerWidth < 768 ? 1600 : 4200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 30;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 30;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(geometry, material);
    this.bgScene.add(this.particles);
    this.paintParticles();

    this.resizeBackground();
  }

  /** Repaints the speed-line field in the active team's colours, in place. */
  private paintParticles(): void {
    if (!this.particles) return;
    const [primary, secondary, steelHex] = this.teamSpec().particles;
    const primaryColor = new THREE.Color(primary);
    const secondaryColor = new THREE.Color(secondary);
    const steel = new THREE.Color(steelHex);

    const attr = this.particles.geometry.attributes['color'] as THREE.BufferAttribute;
    const array = attr.array as Float32Array;
    for (let i = 0; i < array.length; i += 3) {
      const pick = Math.random();
      const color = pick < 0.4 ? primaryColor : pick < 0.7 ? secondaryColor : steel;
      array[i] = color.r;
      array[i + 1] = color.g;
      array[i + 2] = color.b;
    }
    attr.needsUpdate = true;
  }

  private buildCarScene(): void {
    this.carScene = new THREE.Scene();

    const stage = this.carStageRef.nativeElement;
    const aspect = Math.max(stage.clientWidth, 1) / Math.max(stage.clientHeight, 1);
    this.carCamera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);
    this.carCamera.position.set(4.6, 2.1, 6.0);
    this.carCamera.lookAt(0, -0.05, 0);

    this.buildCarLights();
    this.buildCarBody();
  }

  /** Rig lit in the team's two colours. Rebuilt whenever the team changes. */
  private buildCarLights(): void {
    for (const light of this.carLights) {
      this.carScene.remove(light);
      light.dispose?.();
    }
    this.carLights = [];

    const { hemiSky, hemiGround, rimA, rimB, fill: fillColor } = this.teamSpec().lighting;

    const hemi = new THREE.HemisphereLight(hemiSky, hemiGround, 1.1);

    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(5, 7, 5);

    const rimOne = new THREE.DirectionalLight(rimA, 1.6);
    rimOne.position.set(-6, 2.5, -3);

    const rimTwo = new THREE.DirectionalLight(rimB, 1.1);
    rimTwo.position.set(3, 1.2, -6);

    const fill = new THREE.DirectionalLight(fillColor, 0.7);
    fill.position.set(-3, -2, 4);

    this.carLights = [hemi, key, rimOne, rimTwo, fill];
    for (const light of this.carLights) this.carScene.add(light);
  }

  /** Builds (or rebuilds) the car itself and the blob it sits on. */
  private buildCarBody(): void {
    if (this.carGroup) {
      this.carScene.remove(this.carGroup);
      this.disposeObject(this.carGroup);
      this.carGroup = undefined;
    }
    if (!this.groundShadow) {
      this.groundShadow = this.createGroundShadow();
      this.carScene.add(this.groundShadow);
    }

    this.carGroup = this.createF1Car();
    this.carScene.add(this.carGroup);
  }

  // ------------------------------------------------------------ team switch
  setTeam(id: TeamId): void {
    if (id === this.team()) {
      this.garageOpen.set(false);
      return;
    }
    this.team.set(id);
    this.garageOpen.set(false);
    this.applyTeamAttribute();
    this.persistTeam();

    if (this.webglFailed()) return;
    this.paintParticles();
    if (this.carScene) {
      this.buildCarLights();
      this.buildCarBody();
    }
  }

  toggleGarage(): void {
    this.menuOpen.set(false);
    this.garageOpen.update((open) => !open);
  }

  private restoreTeam(): void {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(PortfolioComponent.STORAGE_KEY);
    } catch {
      // Private browsing or blocked storage — the default team is fine.
    }
    if (stored && (TEAM_IDS as string[]).includes(stored)) {
      this.team.set(stored as TeamId);
    }
    this.applyTeamAttribute();
  }

  private persistTeam(): void {
    try {
      window.localStorage.setItem(PortfolioComponent.STORAGE_KEY, this.team());
    } catch {
      // Not being able to remember the choice is not worth failing over.
    }
  }

  private applyTeamAttribute(): void {
    document.documentElement.setAttribute('data-team', this.team());
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', this.teamSpec().themeColor);
  }

  private async initOrbitControls(): Promise<void> {
    try {
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
      this.controls = new OrbitControls(this.carCamera, this.carCanvasRef.nativeElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.06;
      // Wheel zoom over a scrolling one-pager steals the page scroll — rotation only.
      this.controls.enableZoom = false;
      this.controls.enablePan = false;
      this.controls.minPolarAngle = 0.35;
      this.controls.maxPolarAngle = Math.PI / 2 - 0.04;
      this.controls.autoRotate = !this.reducedMotion;
      this.controls.autoRotateSpeed = 1.4;
      this.controls.target.set(0, -0.05, 0);
      this.controls.update();
    } catch (error) {
      console.warn('OrbitControls could not be loaded; the car still auto-rotates:', error);
    }
  }

  // ------------------------------------------------------------- the car
  private createF1Car(): THREE.Group {
    const car = new THREE.Group();
    this.wheels = [];

    const { livery, chassis } = this.teamSpec();

    // --- Paint. Every colour here comes from the team's livery, so the same
    //     builder produces an RB9, a W11, an F1-75 or an MCL36.
    const tub = new THREE.MeshStandardMaterial({
      color: livery.tub,
      metalness: 0.62,
      roughness: 0.3,
    });
    const cover = new THREE.MeshStandardMaterial({
      color: livery.cover,
      metalness: 0.55,
      roughness: 0.32,
    });
    const flash = new THREE.MeshStandardMaterial({
      color: livery.flash,
      metalness: 0.42,
      roughness: 0.3,
    });
    const highlight = new THREE.MeshStandardMaterial({
      color: livery.highlight,
      metalness: 0.5,
      roughness: 0.26,
    });
    const wingPaint = new THREE.MeshStandardMaterial({
      color: livery.wing,
      metalness: 0.52,
      roughness: 0.3,
    });
    const endplatePaint = new THREE.MeshStandardMaterial({
      color: livery.endplate,
      metalness: 0.52,
      roughness: 0.3,
    });
    const carbon = new THREE.MeshStandardMaterial({
      color: livery.carbon,
      metalness: 0.45,
      roughness: 0.52,
    });
    const rubber = new THREE.MeshStandardMaterial({
      color: 0x111319,
      metalness: 0.04,
      roughness: 0.94,
    });
    const sidewall = new THREE.MeshStandardMaterial({
      color: livery.sidewall,
      metalness: 0.1,
      roughness: 0.6,
    });
    const chrome = new THREE.MeshStandardMaterial({
      color: livery.rim,
      metalness: 0.95,
      roughness: 0.22,
    });
    const hubPaint = new THREE.MeshStandardMaterial({
      color: livery.hub,
      metalness: 0.6,
      roughness: 0.28,
    });
    const glass = new THREE.MeshStandardMaterial({
      color: 0x080a14,
      metalness: 0.9,
      roughness: 0.08,
    });
    const helmet = new THREE.MeshStandardMaterial({
      color: livery.helmet,
      metalness: 0.3,
      roughness: 0.35,
    });
    const helmetTrim = new THREE.MeshStandardMaterial({
      color: livery.helmetTrim,
      metalness: 0.45,
      roughness: 0.3,
    });

    const add = (
      geometry: THREE.BufferGeometry,
      material: THREE.Material,
      position: [number, number, number],
      rotation?: [number, number, number]
    ) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      if (rotation) mesh.rotation.set(...rotation);
      car.add(mesh);
      return mesh;
    };

    // --- Monocoque, extruded from the team's side profile.
    car.add(new THREE.Mesh(this.createBodyGeometry(chassis.profile), tub));

    // --- Engine cover. The contrasting spine only exists on the liveries
    //     that actually carry one down the middle.
    add(new THREE.BoxGeometry(0.5, 0.05, 1.35), cover, [0, 0.4, -1.3]);
    if (chassis.spine) {
      add(new THREE.BoxGeometry(0.16, 0.05, 1.5), highlight, [0, 0.42, -1.2]);
    }
    add(new THREE.BoxGeometry(0.42, 0.04, 0.9), flash, [0, 0.37, -0.75]);

    // --- Nose. Length and bluntness are the biggest silhouette tell.
    const noseTipZ = 1.63 + chassis.noseLength / 2;
    add(
      new THREE.ConeGeometry(chassis.noseRadius, chassis.noseLength, 20),
      highlight,
      [0, chassis.noseY, noseTipZ],
      [Math.PI / 2, 0, 0]
    );
    add(
      new THREE.ConeGeometry(chassis.noseRadius * 0.48, 0.22, 16),
      highlight,
      [0, chassis.noseY, noseTipZ + chassis.noseLength / 2 + 0.01],
      [Math.PI / 2, 0, 0]
    );
    add(new THREE.BoxGeometry(0.3, 0.05, 0.7), highlight, [0, chassis.noseY + 0.18, 1.55]);

    // --- Front wing, sized to the team's span.
    const halfSpan = chassis.frontWingSpan / 2;
    const wingZ = noseTipZ + chassis.noseLength / 2 - 0.42;
    add(new THREE.BoxGeometry(chassis.frontWingSpan, 0.035, 0.46), carbon, [0, -0.33, wingZ]);
    add(
      new THREE.BoxGeometry(chassis.frontWingSpan - 0.06, 0.03, 0.3),
      carbon,
      [0, -0.25, wingZ - 0.17],
      [-0.22, 0, 0]
    );
    for (const side of [1, -1]) {
      add(new THREE.BoxGeometry(0.42, 0.045, 0.5), flash, [side * (halfSpan - 0.24), -0.32, wingZ]);
      add(new THREE.BoxGeometry(0.05, 0.36, 0.58), endplatePaint, [side * halfSpan, -0.2, wingZ - 0.04]);
      add(new THREE.BoxGeometry(0.055, 0.12, 0.3), flash, [side * halfSpan, -0.32, wingZ]);
      add(new THREE.BoxGeometry(0.05, 0.22, 0.06), carbon, [side * 0.16, -0.24, wingZ + 0.1]);
    }

    // Nose pylons. Without these the long modern noses read as floating
    // above a detached front wing from the side.
    const noseUnderside = chassis.noseY - chassis.noseRadius * 0.8;
    const pylonHeight = Math.max(noseUnderside - -0.31, 0.06);
    for (const side of [1, -1]) {
      add(
        new THREE.BoxGeometry(0.045, pylonHeight, 0.12),
        carbon,
        [side * 0.11, -0.31 + pylonHeight / 2, wingZ + 0.14]
      );
    }

    // --- Floor and the plank under it.
    add(new THREE.BoxGeometry(1.62, 0.05, 3.5), carbon, [0, -0.33, -0.25]);
    add(new THREE.BoxGeometry(0.4, 0.03, 3.2), tub, [0, -0.37, -0.25]);

    // --- Sidepods. Tall and square for Ferrari, slim and low for Mercedes.
    const sp = chassis;
    for (const side of [1, -1]) {
      add(
        new THREE.BoxGeometry(sp.sidepodWidth, sp.sidepodHeight, 1.5),
        tub,
        [side * 0.64, sp.sidepodY, -0.5]
      );
      add(
        new THREE.BoxGeometry(sp.sidepodWidth + 0.01, 0.1, 1.2),
        cover,
        [side * 0.64, sp.sidepodY + sp.sidepodHeight / 2 - 0.04, -0.5]
      );
      add(
        new THREE.BoxGeometry(sp.sidepodWidth + 0.02, 0.07, 1.25),
        flash,
        [side * 0.64, sp.sidepodY - sp.sidepodHeight / 2 + 0.04, -0.5]
      );
      // Radiator inlet.
      add(
        new THREE.CylinderGeometry(sp.sidepodHeight * 0.47, sp.sidepodHeight * 0.3, 0.42, 16, 1, true),
        carbon,
        [side * 0.64, sp.sidepodY + 0.03, 0.3],
        [Math.PI / 2, 0, 0]
      );
      // Bargeboard ahead of the sidepod.
      add(new THREE.BoxGeometry(0.03, 0.26, 0.5), cover, [side * 0.78, -0.18, 0.78], [0, 0.18, 0]);
      // Floor edge winglet.
      add(new THREE.BoxGeometry(0.06, 0.16, 1.1), carbon, [side * 0.82, -0.28, -0.6]);
    }

    // --- Cockpit and driver.
    add(new THREE.BoxGeometry(0.58, 0.16, 0.88), glass, [0, 0.14, 0.12]);
    add(new THREE.BoxGeometry(0.54, 0.06, 0.3), tub, [0, 0.22, 0.46]);
    add(new THREE.SphereGeometry(0.15, 20, 16), helmet, [0, 0.22, -0.18]);
    add(
      new THREE.TorusGeometry(0.14, 0.022, 8, 24),
      helmetTrim,
      [0, 0.24, -0.18],
      [0, Math.PI / 2, 0]
    );
    add(new THREE.SphereGeometry(0.152, 20, 16, 0, Math.PI, 0.9, 0.9), glass, [0, 0.22, -0.18]);

    // --- Halo. The RB9 raced before halos existed; the modern cars all have one.
    if (chassis.halo) {
      add(
        new THREE.TorusGeometry(0.33, 0.034, 8, 30),
        carbon,
        [0, 0.33, 0.04],
        [-Math.PI / 2 + 0.12, 0, 0]
      );
      // Front pylon down onto the nose shelf.
      add(new THREE.BoxGeometry(0.05, 0.18, 0.06), carbon, [0, 0.26, 0.37]);
      // Rear mounts either side, back to the roll hoop.
      for (const side of [1, -1]) {
        add(new THREE.BoxGeometry(0.04, 0.16, 0.05), carbon, [side * 0.3, 0.33, -0.22]);
      }
    }

    // --- Airbox over the roll hoop.
    add(
      new THREE.CylinderGeometry(chassis.airboxRadius * 0.9, chassis.airboxRadius, 0.32, 18),
      highlight,
      [0, 0.46, -0.52]
    );
    add(
      new THREE.CylinderGeometry(0.11, 0.11, 0.26, 16, 1, true),
      carbon,
      [0, 0.54, -0.42],
      [Math.PI / 2.4, 0, 0]
    );
    // Roll-hoop camera pods either side of the airbox.
    for (const side of [1, -1]) {
      add(new THREE.BoxGeometry(0.07, 0.06, 0.2), carbon, [side * 0.26, 0.5, -0.5]);
    }

    // --- Rear wing. Height and rake separate the high-downforce cars from
    //     the skinny low-drag ones.
    const rwY = chassis.rearWingY;
    const rwSpan = chassis.rearWingSpan;
    const rwHalf = rwSpan / 2;
    add(new THREE.BoxGeometry(0.12, 0.5, 0.18), carbon, [0, rwY - 0.26, -2.25]);
    add(new THREE.BoxGeometry(rwSpan, 0.05, 0.46), wingPaint, [0, rwY, -2.3], [chassis.rearWingRake, 0, 0]);
    add(
      new THREE.BoxGeometry(rwSpan - 0.06, 0.04, 0.26),
      wingPaint,
      [0, rwY + 0.16, -2.44],
      [chassis.rearWingRake - 0.24, 0, 0]
    );
    add(
      new THREE.BoxGeometry(rwSpan - 0.04, 0.02, 0.1),
      flash,
      [0, rwY + 0.07, -2.17],
      [chassis.rearWingRake, 0, 0]
    );
    for (const side of [1, -1]) {
      add(new THREE.BoxGeometry(0.05, 0.42, 0.66), endplatePaint, [side * rwHalf, rwY + 0.04, -2.32]);
      add(new THREE.BoxGeometry(0.055, 0.26, 0.66), flash, [side * rwHalf, rwY - 0.28, -2.32]);
    }
    add(new THREE.BoxGeometry(1.02, 0.04, 0.24), carbon, [0, 0.2, -2.36], [-0.2, 0, 0]);

    // --- Diffuser and exhaust.
    add(new THREE.BoxGeometry(1.2, 0.22, 0.4), carbon, [0, -0.26, -2.1], [0.32, 0, 0]);
    add(
      new THREE.CylinderGeometry(0.07, 0.09, 0.3, 12),
      chrome,
      [0, 0.18, -2.02],
      [Math.PI / 2, 0, 0]
    );

    // --- Mirrors.
    for (const side of [1, -1]) {
      add(new THREE.BoxGeometry(0.22, 0.03, 0.03), carbon, [side * 0.42, 0.2, 0.42]);
      add(new THREE.BoxGeometry(0.06, 0.08, 0.04), highlight, [side * 0.54, 0.2, 0.42]);
    }

    // --- Wheels. F1 rears are wider and taller than the fronts.
    const wheelSpecs = [
      { x: 0.92, z: 1.5, r: 0.4, w: 0.32 },
      { x: -0.92, z: 1.5, r: 0.4, w: 0.32 },
      { x: 0.96, z: -1.5, r: 0.45, w: 0.42 },
      { x: -0.96, z: -1.5, r: 0.45, w: 0.42 },
    ];

    for (const spec of wheelSpecs) {
      const wheel = new THREE.Group();

      const tire = new THREE.Mesh(new THREE.CylinderGeometry(spec.r, spec.r, spec.w, 30), rubber);
      tire.rotation.z = Math.PI / 2;
      wheel.add(tire);

      const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(spec.r * 0.62, spec.r * 0.62, spec.w * 1.02, 22),
        chrome
      );
      rim.rotation.z = Math.PI / 2;
      wheel.add(rim);

      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(spec.r * 0.2, spec.r * 0.2, spec.w * 1.08, 14),
        hubPaint
      );
      hub.rotation.z = Math.PI / 2;
      wheel.add(hub);

      // White sidewall band, like the marked compound in the reference.
      for (const face of [1, -1]) {
        const band = new THREE.Mesh(
          new THREE.TorusGeometry(spec.r * 0.88, 0.016, 8, 30),
          sidewall
        );
        band.rotation.y = Math.PI / 2;
        band.position.x = face * (spec.w / 2);
        wheel.add(band);
      }

      wheel.position.set(spec.x, -0.12, spec.z);
      car.add(wheel);
      this.wheels.push(wheel);

      // Suspension wishbones back to the tub.
      const hubPoint = new THREE.Vector3(spec.x * 0.82, -0.12, spec.z);
      const inboard = Math.sign(spec.x) * 0.3;
      car.add(this.strut(new THREE.Vector3(inboard, 0.04, spec.z + 0.3), hubPoint, 0.022, carbon));
      car.add(this.strut(new THREE.Vector3(inboard, -0.2, spec.z - 0.3), hubPoint, 0.022, carbon));
    }

    car.position.y = 0.12;
    return car;
  }

  /**
   * Side-profile silhouette extruded across the car's width.
   * 'classic' is the 2013 low-nose shape; 'modern' raises the nose shelf and
   * the shoulder line the way the halo-era cars do.
   */
  private createBodyGeometry(variant: 'classic' | 'modern' = 'classic'): THREE.ExtrudeGeometry {
    const profiles: Record<'classic' | 'modern', [number, number][]> = {
      classic: [
        [-2.3, -0.2],
        [-2.3, 0.14],
        [-1.75, 0.3],
        [-1.1, 0.4],
        [-0.62, 0.38],
        [-0.5, 0.12],
        [0.35, 0.1],
        [0.56, 0.24],
        [1.25, 0.2],
        [1.72, 0.08],
        [1.9, -0.04],
        [1.7, -0.16],
        [0.6, -0.24],
        [-0.6, -0.28],
        [-2.3, -0.22],
      ],
      modern: [
        [-2.3, -0.2],
        [-2.3, 0.2],
        [-1.8, 0.36],
        [-1.12, 0.46],
        [-0.66, 0.44],
        [-0.52, 0.16],
        [0.3, 0.15],
        [0.54, 0.3],
        [1.3, 0.3],
        [1.8, 0.24],
        [2.02, 0.12],
        [1.86, -0.04],
        [0.7, -0.22],
        [-0.6, -0.28],
        [-2.3, -0.22],
      ],
    };

    const profile = profiles[variant];

    const shape = new THREE.Shape();
    shape.moveTo(profile[0][0], profile[0][1]);
    for (let i = 1; i < profile.length; i++) {
      shape.lineTo(profile[i][0], profile[i][1]);
    }
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.74,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.06,
      bevelSegments: 3,
      curveSegments: 4,
    });

    // The shape lives in XY and extrudes along +Z. Spin it so length runs
    // down the car's Z axis and the extrusion becomes the car's width.
    geometry.rotateY(-Math.PI / 2);
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    geometry.translate(-(box.min.x + box.max.x) / 2, 0, 0);
    return geometry;
  }

  /** A cylinder stretched between two points — used for suspension arms. */
  private strut(
    from: THREE.Vector3,
    to: THREE.Vector3,
    radius: number,
    material: THREE.Material
  ): THREE.Mesh {
    const direction = new THREE.Vector3().subVectors(to, from);
    const length = direction.length();
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, length, 6),
      material
    );
    mesh.position.copy(from).addScaledVector(direction, 0.5);
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize()
    );
    return mesh;
  }

  /** Soft radial blob under the car so it sits on something. */
  private createGroundShadow(): THREE.Mesh {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(0,0,0,0.55)');
    gradient.addColorStop(0.55, 'rgba(0,0,0,0.22)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(6.4, 4.2),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        opacity: 0.9,
      })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -0.46;
    return mesh;
  }

  // ------------------------------------------------------------ render loop
  private startLoop(): void {
    if (this.running || this.webglFailed()) return;
    this.running = true;
    this.clock.getDelta();
    this.tick();
  }

  private stopLoop(): void {
    this.running = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animationId = 0;
  }

  private tick = (): void => {
    if (!this.running) return;
    this.animationId = requestAnimationFrame(this.tick);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.elapsedTime;

    // Background speed lines.
    if (this.particles && this.bgRenderer) {
      if (!this.reducedMotion) {
        this.particles.rotation.y += delta * 0.1;
        const attr = this.particles.geometry.attributes['position'] as THREE.BufferAttribute;
        const array = attr.array as Float32Array;
        for (let i = 0; i < array.length; i += 3) {
          array[i] -= delta * 4.5;
          if (array[i] < -15) array[i] = 15;
        }
        attr.needsUpdate = true;
      }
      this.bgRenderer.render(this.bgScene, this.bgCamera);
    }

    // Car — only while the hero is on screen.
    if (this.heroVisible && this.carRenderer && this.carGroup) {
      if (!this.reducedMotion) {
        this.carGroup.position.y = 0.12 + Math.sin(elapsed * 1.1) * 0.025;
        for (const wheel of this.wheels) {
          wheel.rotation.x -= delta * 6;
        }
      }

      if (this.controls) {
        // Hand control back to the user while they are dragging.
        this.controls.autoRotate = !this.reducedMotion && performance.now() > this.interactionUntil;
        this.controls.update();
      }

      this.carRenderer.render(this.carScene, this.carCamera);
    }
  };

  // --------------------------------------------------------------- resizing
  private resizeBackground(): void {
    if (!this.bgRenderer || !this.bgCamera) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.bgCamera.aspect = width / Math.max(height, 1);
    this.bgCamera.updateProjectionMatrix();
    this.bgRenderer.setSize(width, height, false);
  }

  private resizeCar(): void {
    if (!this.carRenderer || !this.carCamera || !this.carStageRef) return;
    const stage = this.carStageRef.nativeElement;
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (width === 0 || height === 0) return;

    this.carCamera.aspect = width / height;
    // Pull the camera back on narrow stages so the wings never clip out.
    const distance = width < 520 ? 6.8 : 5.5;
    this.carCamera.position.setLength(distance);
    this.carCamera.updateProjectionMatrix();
    this.carRenderer.setSize(width, height, false);
  }

  // -------------------------------------------------------------- telemetry
  private startDashboardAnimation(): void {
    if (this.reducedMotion) return;
    this.dashboardTimer = setInterval(() => {
      this.carSpeed.set(Math.floor(Math.random() * 50) + 180);
      this.rpm.set(Math.floor(Math.random() * 2000) + 8000);
      this.gear.set(Math.floor(Math.random() * 3) + 5);
    }, 2200);
  }

  // ---------------------------------------------------------------- cleanup
  /** Frees the geometry and materials under one object (used on team swaps). */
  private disposeObject(root: THREE.Object3D): void {
    root.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(material)) {
        material.forEach((m) => m.dispose());
      } else if (material) {
        material.dispose();
      }
    });
  }

  private disposeScene(scene?: THREE.Scene): void {
    if (!scene) return;
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(material)) {
        material.forEach((m) => m.dispose());
      } else if (material) {
        material.dispose();
      }
    });
    scene.clear();
  }
}
