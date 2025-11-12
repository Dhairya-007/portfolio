import { NgClass, NgFor, isPlatformBrowser } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css'],
  standalone: true,
  imports: [NgFor, NgClass],
})
export class PortfolioComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  constructor(private elRef: ElementRef, @Inject(PLATFORM_ID) private platformId: Object) {}

  currentYear: number = new Date().getFullYear();
  activeSection = 'home';
  sections: HTMLElement[] = [];

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particlesMesh!: THREE.Points;
  private torusKnot!: THREE.Mesh;
  private box!: THREE.Mesh;
  private mouseX = 0;
  private mouseY = 0;
  private animationId: number = 0;

  // Tech stacks
  halmaFullTimeTech = [
    'Flutter',
    'React Native',
    '.NET Maui',
    'Angular',
    'NestJS',
    'NodeJs',
    'C#',
    'JavaScript',
    'TypeScript',
    'Dart',
    'MongoDB',
    'ObjectBoxDB',
    'UWP',
    'OOPS',
    'SQL/MySQL',
  ];

  halmaInternTech = ['.NET MAUI', 'C#', 'Sqlite', 'LiteDb', 'BLE Protocol', 'PostgreSql', 'IoT'];
  barclaysTech = ['Java', 'Selenium', 'Jenkins', 'CI/CD', 'Test Automation', 'Agile'];

  skills = {
    languages: [
      'Java',
      'C/C++/C#',
      '.NET',
      'ASP.NET',
      '.NET MAUI',
      'Flutter',
      'React Native',
      'Angular',
      'HTML',
      'CSS',
      'JavaScript',
      'TypeScript',
    ],
    tools: [
      'Visual Studio',
      'VS Code',
      'Git',
      'Azure DevOps',
      'SQL',
      'MySQL',
      'LiteDB',
      'Jenkins',
      'Selenium',
      'ObjectBoxDB',
    ],
    core: [
      'Computer Networks',
      'Distributed Systems',
      'Operating Systems',
      'Data Structures',
      'Algorithms',
      'OOPs',
    ],
    specializations: [
      'Mobile Application Development (Cross Platform)',
      'Web Developement',
      'BLE / Wifi / Lan / Serial Port Communication',
      'IoT Integration',
      'CI/CD',
      'Test Automation',
      'Full Stack',
    ],
  };

  achievements = [
    {
      icon: '🏆',
      title: 'JEE Mains 2020',
      rank: 'All India Rank: 8,886',
      percentile: '99.22 percentile among 1.1M candidates',
      color: 'indigo',
    },
    {
      icon: '🎯',
      title: 'JEE Advanced 2020',
      rank: 'All India Rank: 10,000',
      percentile: '95+ percentile among 1.6L candidates',
      color: 'purple',
    },
    {
      icon: '🥇',
      title: 'Academic Excellence',
      rank: 'Ranked 5th out of 135 students',
      percentile: 'B.Tech CSE, SVNIT Surat (2024)',
      color: 'pink',
    },
    {
      icon: '🌟',
      title: 'Leadership & Community',
      rank: 'ACM NIT Surat Executive',
      percentile: 'MLSA NIT Surat Junior Developer',
      color: 'cyan',
    },
  ];

  ngOnInit(): void {
    // ✅ Run Three.js only on the browser (not during SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.initThreeJS();
      this.animate();
      window.addEventListener('mousemove', this.handleMouseMove.bind(this));
      window.addEventListener('resize', this.handleResize.bind(this));
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.sections = Array.from(this.elRef.nativeElement.querySelectorAll('section'));

      const observer = new IntersectionObserver(
        (entries) => {
          const visibleEntries = entries.filter((entry) => entry.isIntersecting);
          if (visibleEntries.length > 0) {
            const mostVisible = visibleEntries.reduce((prev, current) =>
              current.intersectionRatio > prev.intersectionRatio ? current : prev
            );
            this.activeSection = mostVisible.target.id;
          }
        },
        {
          root: null,
          threshold: [0.1, 0.2, 0.3, 0.4, 0.5],
          rootMargin: '-80px 0px -60% 0px',
        }
      );

      this.sections.forEach((section) => observer.observe(section));
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('mousemove', this.handleMouseMove.bind(this));
      window.removeEventListener('resize', this.handleResize.bind(this));
      if (this.animationId) cancelAnimationFrame(this.animationId);
    }
  }

  scrollToSection(sectionId: string) {
    if (isPlatformBrowser(this.platformId)) {
      const section = this.elRef.nativeElement.querySelector(`#${sectionId}`);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.activeSection = sectionId;
      }
    }
  }

  // --------- THREE.JS SETUP ----------
  initThreeJS() {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.camera.position.z = 5;

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 3000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.015,
      color: 0x6366f1,
      transparent: true,
      opacity: 0.8,
    });

    this.particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(this.particlesMesh);

    const geometry = new THREE.TorusKnotGeometry(1.5, 0.4, 100, 16);
    const material = new THREE.MeshNormalMaterial({ wireframe: true });
    this.torusKnot = new THREE.Mesh(geometry, material);
    this.torusKnot.position.set(3, 0, -2);
    this.scene.add(this.torusKnot);

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const boxMaterial = new THREE.MeshNormalMaterial({ wireframe: true });
    this.box = new THREE.Mesh(boxGeometry, boxMaterial);
    this.box.position.set(-3, 2, -1);
    this.scene.add(this.box);
  }

  handleMouseMove(event: MouseEvent): void {
    this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  handleResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.particlesMesh.rotation.y += 0.001;
    this.particlesMesh.rotation.x += 0.0005;
    this.torusKnot.rotation.x += 0.01;
    this.torusKnot.rotation.y += 0.01;
    this.box.rotation.x += 0.02;
    this.box.rotation.y += 0.02;
    this.camera.position.x += (this.mouseX * 0.5 - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.mouseY * 0.5 - this.camera.position.y) * 0.05;
    this.renderer.render(this.scene, this.camera);
  }
}
