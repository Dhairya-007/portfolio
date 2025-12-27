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
  private f1CarGroup!: THREE.Group;
  private controls: any; // OrbitControls
  private mouseX = 0;
  private mouseY = 0;
  private animationId: number = 0;
  
  // Dashboard stats
  carSpeed = 0;
  rpm = 0;
  gear = 1;
  lapTime = '1:23.456';

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
      this.initOrbitControls();
      this.animate();
      window.addEventListener('mousemove', this.handleMouseMove.bind(this));
      window.addEventListener('resize', this.handleResize.bind(this));
      this.startDashboardAnimation();
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

    // F1 Racing Particles - Speed Lines Effect
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 5000;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    
    // Red Bull Racing Colors: Red (#FF1800), Yellow (#FFD700), Navy (#0A0E27)
    const redBullRed = new THREE.Color(0xff1800);
    const redBullYellow = new THREE.Color(0xffd700);
    const redBullNavy = new THREE.Color(0x0a0e27);
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
      // Create speed lines effect - particles moving horizontally
      posArray[i] = (Math.random() - 0.5) * 30; // x - wider spread
      posArray[i + 1] = (Math.random() - 0.5) * 20; // y
      posArray[i + 2] = (Math.random() - 0.5) * 30; // z
      
      // Color variation - mix of red and yellow
      const colorChoice = Math.random();
      let color: THREE.Color;
      if (colorChoice < 0.4) {
        color = redBullRed;
      } else if (colorChoice < 0.7) {
        color = redBullYellow;
      } else {
        color = redBullNavy;
      }
      
      colorArray[i] = color.r;
      colorArray[i + 1] = color.g;
      colorArray[i + 2] = color.b;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    this.particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(this.particlesMesh);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffd700, 0.8);
    directionalLight1.position.set(5, 10, 5);
    this.scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xff1800, 0.4);
    directionalLight2.position.set(-5, 5, -5);
    this.scene.add(directionalLight2);

    // Create F1 Car
    this.createF1Car();
  }

  async initOrbitControls(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    
    try {
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
      this.controls = new OrbitControls(this.camera, this.canvasRef.nativeElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.enableZoom = true;
      this.controls.enablePan = false;
      this.controls.minDistance = 4;
      this.controls.maxDistance = 12;
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 1;
      this.camera.position.set(0, 2, 8);
      this.controls.target.set(0, 0, 0);
    } catch (error) {
      console.warn('OrbitControls could not be loaded:', error);
    }
  }

  createF1Car(): void {
    const redBullRed = 0xff1800;
    const redBullYellow = 0xffd700;
    const redBullNavy = 0x0a0e27;
    const darkGray = 0x1a1a1a;

    this.f1CarGroup = new THREE.Group();

    // Main body
    const bodyGeometry = new THREE.BoxGeometry(1.2, 0.4, 2.5);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: redBullNavy, shininess: 100 });
    const mainBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.f1CarGroup.add(mainBody);

    // Red stripe
    const stripeGeometry = new THREE.BoxGeometry(1.25, 0.05, 2.6);
    const stripeMaterial = new THREE.MeshPhongMaterial({ color: redBullRed });
    const redStripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
    redStripe.position.set(0, 0.25, 0);
    this.f1CarGroup.add(redStripe);

    // Yellow stripe
    const yellowStripeGeometry = new THREE.BoxGeometry(1.3, 0.03, 2.7);
    const yellowStripeMaterial = new THREE.MeshPhongMaterial({ color: redBullYellow });
    const yellowStripe = new THREE.Mesh(yellowStripeGeometry, yellowStripeMaterial);
    yellowStripe.position.set(0, 0.28, 0);
    this.f1CarGroup.add(yellowStripe);

    // Nose
    const noseGeometry = new THREE.ConeGeometry(0.3, 0.8, 8);
    const noseMaterial = new THREE.MeshPhongMaterial({ color: redBullNavy });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.rotation.z = Math.PI / 2;
    nose.position.set(0, 0, 1.5);
    this.f1CarGroup.add(nose);

    // Front wing
    const frontWingGeometry = new THREE.BoxGeometry(1.5, 0.05, 0.3);
    const frontWingMaterial = new THREE.MeshPhongMaterial({ color: redBullRed });
    const frontWing = new THREE.Mesh(frontWingGeometry, frontWingMaterial);
    frontWing.position.set(0, -0.2, 1.6);
    this.f1CarGroup.add(frontWing);

    // Rear wing
    const rearWingGeometry = new THREE.BoxGeometry(1.2, 0.08, 0.4);
    const rearWingMaterial = new THREE.MeshPhongMaterial({ color: redBullRed });
    const rearWing = new THREE.Mesh(rearWingGeometry, rearWingMaterial);
    rearWing.position.set(0, 0.6, -1.2);
    rearWing.rotation.x = -0.2;
    this.f1CarGroup.add(rearWing);

    // Wheels
    const wheelPositions = [
      { x: -0.8, z: 0.8 },
      { x: 0.8, z: 0.8 },
      { x: -0.8, z: -0.8 },
      { x: 0.8, z: -0.8 },
    ];

    wheelPositions.forEach((pos) => {
      const tireGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 32);
      const tireMaterial = new THREE.MeshPhongMaterial({ color: darkGray });
      const tire = new THREE.Mesh(tireGeometry, tireMaterial);
      tire.rotation.z = Math.PI / 2;
      tire.position.set(pos.x, -0.4, pos.z);
      this.f1CarGroup.add(tire);

      const rimGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.32, 16);
      const rimMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
      const rim = new THREE.Mesh(rimGeometry, rimMaterial);
      rim.rotation.z = Math.PI / 2;
      rim.position.set(pos.x, -0.4, pos.z);
      this.f1CarGroup.add(rim);
    });

    this.f1CarGroup.position.set(0, 0, 0);
    this.scene.add(this.f1CarGroup);
  }

  startDashboardAnimation(): void {
    setInterval(() => {
      // Animate dashboard stats
      this.carSpeed = Math.floor(Math.random() * 50) + 180; // 180-230 km/h
      this.rpm = Math.floor(Math.random() * 2000) + 8000; // 8000-10000 RPM
      this.gear = Math.floor(Math.random() * 3) + 5; // 5-7 gear
    }, 2000);
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
    
    // Speed particles animation
    this.particlesMesh.rotation.y += 0.002;
    this.particlesMesh.rotation.x += 0.001;
    
    // Move particles for speed effect
    const positions = this.particlesMesh.geometry.attributes['position'].array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] -= 0.08;
      if (positions[i] < -25) {
        positions[i] = 25;
      }
    }
    this.particlesMesh.geometry.attributes['position'].needsUpdate = true;
    
    // Car rotation
    if (this.f1CarGroup) {
      this.f1CarGroup.rotation.y += 0.005;
    }
    
    // Update OrbitControls
    if (this.controls) {
      this.controls.update();
    }
    
    this.renderer.render(this.scene, this.camera);
  }
}
