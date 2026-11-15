import Phaser from 'phaser';

export type SceneObjectId =
  | 'basin'
  | 'valve'
  | 'pipe'
  | 'flowerpot'
  | 'bench'
  | 'butterfly'
  | 'fountain';

export interface MeydanSceneCallbacks {
  onReady?: () => void;
  onObjectClick: (objectId: SceneObjectId) => void;
}

export interface MeydanSceneVisualState {
  discoveredClueIds: string[];
  fountainFixed: boolean;
  highlightObjectId: SceneObjectId | null;
  isPaused: boolean;
}

interface WaterDrop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  active: boolean;
}

export class MeydanScene extends Phaser.Scene {
  private callbacks: MeydanSceneCallbacks;
  private visualState: MeydanSceneVisualState = {
    discoveredClueIds: [],
    fountainFixed: false,
    highlightObjectId: null,
    isPaused: false,
  };

  private interactiveContainers = new Map<SceneObjectId, Phaser.GameObjects.Container>();
  private clueBadges = new Map<SceneObjectId, Phaser.GameObjects.Container>();

  private noorakGroup!: Phaser.GameObjects.Container;
  private noorakHome = { x: 475, y: 318 };
  private noorakTarget = { x: 475, y: 318 };

  private butterflyGroup!: Phaser.GameObjects.Container;
  private butterflyAngle = 0;

  private valveWheel!: Phaser.GameObjects.Container;
  private basinWaterLow!: Phaser.GameObjects.Ellipse;
  private basinWaterFull!: Phaser.GameObjects.Graphics;
  private pipeFlowDots: Phaser.GameObjects.Arc[] = [];
  private pipeFlowActive = false;

  private fountainArcGraphics!: Phaser.GameObjects.Graphics;
  private waterDrops: WaterDrop[] = [];
  private waterDropGraphics!: Phaser.GameObjects.Graphics;

  private hintRing!: Phaser.GameObjects.Graphics;
  private hintPulseTime = 0;

  private bloomOverlayGroup!: Phaser.GameObjects.Container;
  private sparkleGraphics!: Phaser.GameObjects.Graphics;
  private clouds: Phaser.GameObjects.Container[] = [];

  constructor(callbacks: MeydanSceneCallbacks) {
    super({ key: 'MeydanScene' });
    this.callbacks = callbacks;
  }

  public create(): void {
    this.cameras.main.setBackgroundColor('#7dd3fc');

    this.drawSkyAndClouds();
    this.drawIranianArchitecture();
    this.drawCourtyardGround();
    this.drawTreesAndGarden();
    this.drawPipeAndValve();
    this.drawFountainAndBasin();
    this.drawDecorativeProps();
    this.drawCharacters();
    this.createWaterEffectLayers();
    this.createHintSpotlight();
    this.createSparkleLayer();

    this.syncVisualState(this.visualState);
    this.callbacks.onReady?.();
  }

  private drawSkyAndClouds(): void {
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x38bdf8, 0x38bdf8, 0xbae6fd, 0xfef9c3, 1);
    sky.fillRect(0, 0, 1280, 380);

    // Warm morning sun
    const sunGlow = this.add.circle(1090, 96, 78, 0xfef08a, 0.32);
    const sunCore = this.add.circle(1090, 96, 42, 0xfde047, 0.92);
    this.tweens.add({
      targets: sunGlow,
      scale: 1.12,
      alpha: 0.45,
      duration: 2800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    sunCore.setDepth(1);

    const cloudPositions = [
      { x: 210, y: 88, scale: 1 },
      { x: 640, y: 68, scale: 0.85 },
      { x: 920, y: 112, scale: 0.72 },
    ];
    cloudPositions.forEach((pos) => {
      const cloud = this.add.container(pos.x, pos.y);
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 0.88);
      g.fillEllipse(0, 0, 110, 38);
      g.fillEllipse(-34, 6, 62, 30);
      g.fillEllipse(34, 6, 68, 30);
      cloud.add(g);
      cloud.setScale(pos.scale);
      this.clouds.push(cloud);
    });
  }

  private drawIranianArchitecture(): void {
    const arch = this.add.graphics();

    // Distant mudbrick domes & turquoise minarets
    arch.fillStyle(0xe6be8a, 1);
    arch.fillEllipse(260, 210, 170, 130);
    arch.fillEllipse(840, 225, 145, 110);

    // Minarets
    arch.fillStyle(0xd4a373, 1);
    arch.fillRect(145, 90, 28, 160);
    arch.fillRect(1015, 115, 24, 140);
    arch.fillStyle(0x0d9488, 1);
    arch.fillRoundedRect(139, 75, 40, 22, 6);
    arch.fillRoundedRect(1010, 102, 34, 18, 5);
    arch.fillStyle(0xf59e0b, 1);
    arch.fillCircle(159, 66, 6);
    arch.fillCircle(1027, 94, 5);

    // Main courtyard surrounding wall (warm sand-brick)
    arch.fillStyle(0xf3d5b5, 1);
    arch.fillRect(0, 185, 1280, 175);

    // Roof cornice with turquoise tile trim
    arch.fillStyle(0x0f766e, 1);
    arch.fillRect(0, 185, 1280, 16);
    arch.fillStyle(0xfbbf24, 0.9);
    for (let x = 20; x < 1280; x += 48) {
      arch.fillRect(x, 189, 20, 8);
    }

    // Center grand Persian Ivan (turquoise portal arch)
    arch.fillStyle(0x0d9488, 1);
    arch.fillRoundedRect(475, 132, 230, 228, { tl: 16, tr: 16, bl: 0, br: 0 });
    arch.lineStyle(5, 0xfbbf24, 0.85);
    arch.strokeRoundedRect(483, 140, 214, 220, { tl: 12, tr: 12, bl: 0, br: 0 });

    // Pointed arch opening
    arch.fillStyle(0x134e4a, 1);
    arch.fillEllipse(590, 250, 148, 170);
    arch.fillRect(516, 250, 148, 110);

    // Side arches (left & right houses)
    const archCenters = [110, 280, 820, 990, 1155];
    archCenters.forEach((cx, idx) => {
      // Decorative brick frame
      arch.fillStyle(0xd9ae82, 1);
      arch.fillRoundedRect(cx - 58, 218, 116, 142, { tl: 10, tr: 10, bl: 0, br: 0 });
      // Turquoise spandrel
      arch.fillStyle(0x14b8a6, 0.85);
      arch.fillRoundedRect(cx - 50, 226, 100, 134, { tl: 8, tr: 8, bl: 0, br: 0 });
      // Arch doorway / stained glass window
      arch.fillStyle(idx % 2 === 0 ? 0x78350f : 0x0f766e, 1);
      arch.fillEllipse(cx, 285, 68, 86);
      arch.fillRect(cx - 34, 285, 68, 75);

      // Stained glass color dots on windows
      if (idx % 2 === 1) {
        arch.fillStyle(0xfbbf24, 0.85);
        arch.fillCircle(cx, 268, 9);
        arch.fillStyle(0xf43f5e, 0.8);
        arch.fillCircle(cx - 14, 288, 7);
        arch.fillCircle(cx + 14, 288, 7);
      }
    });
  }

  private drawCourtyardGround(): void {
    const ground = this.add.graphics();

    // Warm sandstone courtyard floor
    ground.fillStyle(0xfde68a, 1);
    ground.fillRect(0, 358, 1280, 362);

    ground.fillStyle(0xf5deb3, 1);
    ground.fillRect(0, 358, 1280, 32);

    // Perspective stone tile grid lines
    ground.lineStyle(2, 0xd4a373, 0.42);
    for (let y = 395; y <= 720; y += 52) {
      ground.lineBetween(0, y, 1280, y);
    }
    for (let x = -120; x <= 1400; x += 130) {
      ground.lineBetween(x, 358, x + (x - 640) * 0.35, 720);
    }

    // Subtle decorative central courtyard medallion paving around fountain
    ground.lineStyle(5, 0x0d9488, 0.25);
    ground.strokeEllipse(540, 495, 440, 160);
  }

  private drawTreesAndGarden(): void {
    const garden = this.add.graphics();

    // Left leafy tree behind bench
    garden.fillStyle(0x78350f, 1);
    garden.fillRect(72, 235, 28, 165);
    garden.fillStyle(0x16a34a, 1);
    garden.fillCircle(86, 200, 74);
    garden.fillCircle(44, 224, 52);
    garden.fillCircle(128, 224, 52);
    garden.fillStyle(0x22c55e, 1);
    garden.fillCircle(86, 178, 52);

    // Right garden bed (باغچه) with brick border
    garden.fillStyle(0xb45309, 1);
    garden.fillRoundedRect(905, 360, 345, 220, 28);
    garden.fillStyle(0x65a30d, 1);
    garden.fillRoundedRect(918, 372, 319, 196, 22);

    // Pomegranate tree in garden bed
    garden.fillStyle(0x78350f, 1);
    garden.fillRect(1135, 210, 30, 190);
    garden.fillStyle(0x15803d, 1);
    garden.fillCircle(1150, 190, 76);
    garden.fillCircle(1100, 215, 52);
    garden.fillCircle(1196, 215, 50);
    // Pomegranates
    const pomegranates = [
      { x: 1118, y: 185 },
      { x: 1168, y: 170 },
      { x: 1185, y: 215 },
      { x: 1135, y: 222 },
    ];
    pomegranates.forEach((p) => {
      garden.fillStyle(0xe11d48, 1);
      garden.fillCircle(p.x, p.y, 10);
      garden.fillStyle(0xfbbf24, 1);
      garden.fillCircle(p.x - 2, p.y - 3, 2.5);
    });

    // Garden bushes & rose flowers
    garden.fillStyle(0x16a34a, 1);
    garden.fillCircle(970, 415, 36);
    garden.fillCircle(1035, 405, 42);
    garden.fillCircle(1095, 422, 35);
    garden.fillCircle(1030, 520, 40);
    garden.fillCircle(1110, 530, 38);

    const flowerSpots = [
      { x: 960, y: 405, c: 0xf43f5e },
      { x: 985, y: 424, c: 0xfbbf24 },
      { x: 1030, y: 392, c: 0xec4899 },
      { x: 1055, y: 412, c: 0xf43f5e },
      { x: 1090, y: 415, c: 0xfbbf24 },
      { x: 1020, y: 515, c: 0xec4899 },
      { x: 1050, y: 530, c: 0xf43f5e },
    ];
    flowerSpots.forEach((fl) => {
      garden.fillStyle(fl.c, 1);
      garden.fillCircle(fl.x, fl.y, 8);
      garden.fillStyle(0xfef08a, 1);
      garden.fillCircle(fl.x, fl.y, 3);
    });

    // Extra blooming flowers shown prominently once fountain is fixed
    this.bloomOverlayGroup = this.add.container(0, 0);
    const extraBlooms = [
      { x: 942, y: 465, c: 0xf43f5e },
      { x: 1140, y: 470, c: 0xec4899 },
      { x: 1185, y: 510, c: 0xfbbf24 },
      { x: 750, y: 372, c: 0xf43f5e },
      { x: 315, y: 495, c: 0xec4899 },
    ];
    extraBlooms.forEach((b) => {
      const fl = this.add.circle(b.x, b.y, 10, b.c);
      const center = this.add.circle(b.x, b.y, 4, 0xfef08a);
      this.bloomOverlayGroup.add([fl, center]);
    });
    this.bloomOverlayGroup.setAlpha(0);
  }

  private drawPipeAndValve(): void {
    // 1. Intact Copper Water Pipe connecting garden valve to fountain basin
    const pipeContainer = this.add.container(825, 492);
    const pipeG = this.add.graphics();
    // Shadow
    pipeG.fillStyle(0x000000, 0.14);
    pipeG.fillRoundedRect(-145, 8, 290, 18, 6);
    // Main intact copper pipe
    pipeG.fillStyle(0xd97706, 1);
    pipeG.fillRoundedRect(-145, -10, 290, 22, 6);
    pipeG.lineStyle(3, 0x78350f, 1);
    pipeG.strokeRoundedRect(-145, -10, 290, 22, 6);
    // Top specular sheen
    pipeG.fillStyle(0xfcd34d, 0.65);
    pipeG.fillRoundedRect(-138, -6, 276, 5, 3);
    // Flanges / joints (clean, unbroken)
    [-85, 0, 85].forEach((fx) => {
      pipeG.fillStyle(0xb45309, 1);
      pipeG.fillRoundedRect(fx - 7, -14, 14, 30, 3);
      pipeG.lineStyle(2.5, 0x78350f, 1);
      pipeG.strokeRoundedRect(fx - 7, -14, 14, 30, 3);
    });
    pipeContainer.add(pipeG);

    // Animated blue flow dots inside/along pipe when water runs
    for (let i = 0; i < 6; i += 1) {
      const dot = this.add.circle(130 - i * 48, 0, 5, 0x38bdf8, 0);
      this.pipeFlowDots.push(dot);
      pipeContainer.add(dot);
    }

    this.registerInteractive('pipe', pipeContainer, 280, 68);
    this.createDiscoveredBadge('pipe', pipeContainer, 0, -34);

    // 2. Water Valve beside garden bed (شیر آب کنار باغچه)
    const valveContainer = this.add.container(985, 466);
    const valveBase = this.add.graphics();
    // Shadow
    valveBase.fillStyle(0x000000, 0.16);
    valveBase.fillEllipse(0, 36, 58, 18);
    // Metal riser pipe
    valveBase.fillStyle(0x64748b, 1);
    valveBase.fillRoundedRect(-12, -16, 24, 52, 4);
    valveBase.lineStyle(3, 0x334155, 1);
    valveBase.strokeRoundedRect(-12, -16, 24, 52, 4);
    // T-junction
    valveBase.fillStyle(0x94a3b8, 1);
    valveBase.fillRoundedRect(-24, 12, 48, 20, 5);
    valveBase.strokeRoundedRect(-24, 12, 48, 20, 5);
    valveContainer.add(valveBase);

    // Rotating Red Valve Wheel
    this.valveWheel = this.add.container(0, -24);
    const wheelG = this.add.graphics();
    wheelG.lineStyle(7, 0xdc2626, 1);
    wheelG.strokeCircle(0, 0, 24);
    wheelG.lineStyle(5, 0xdc2626, 1);
    wheelG.lineBetween(-22, 0, 22, 0);
    wheelG.lineBetween(0, -22, 0, 22);
    wheelG.fillStyle(0x991b1b, 1);
    wheelG.fillCircle(0, 0, 7);
    this.valveWheel.add(wheelG);
    valveContainer.add(this.valveWheel);

    this.registerInteractive('valve', valveContainer, 100, 120);
    this.createDiscoveredBadge('valve', valveContainer, 0, -64);
  }

  private drawFountainAndBasin(): void {
    // 1. Octagonal Turquoise Basin (حوض کاشی‌کاری‌شده)
    const basinContainer = this.add.container(540, 495);
    const basinG = this.add.graphics();

    // Ground shadow
    basinG.fillStyle(0x000000, 0.16);
    basinG.fillEllipse(0, 24, 340, 120);

    // Outer turquoise rim wall
    basinG.fillStyle(0x0d9488, 1);
    basinG.fillEllipse(0, 12, 326, 114);
    basinG.lineStyle(4, 0x134e4a, 1);
    basinG.strokeEllipse(0, 12, 326, 114);

    // Top rim surface with tile pattern
    basinG.fillStyle(0x2dd4bf, 1);
    basinG.fillEllipse(0, -4, 316, 104);
    basinG.lineStyle(3, 0x0f766e, 1);
    basinG.strokeEllipse(0, -4, 316, 104);

    // Inner deep dry cavity (makes low water visually obvious!)
    basinG.fillStyle(0x99f6e4, 1);
    basinG.fillEllipse(0, -2, 266, 78);
    basinG.lineStyle(3, 0x0f766e, 0.8);
    basinG.strokeEllipse(0, -2, 266, 78);

    // Inner wall shading showing basin is nearly empty
    basinG.fillStyle(0x5eead4, 1);
    basinG.fillEllipse(0, 6, 250, 60);

    basinContainer.add(basinG);

    // Low water puddle at the very bottom
    this.basinWaterLow = this.add.ellipse(0, 14, 165, 32, 0x38bdf8, 0.78);
    basinContainer.add(this.basinWaterLow);

    // Full water layer (alpha 0 initially, animates to 1 when fixed)
    this.basinWaterFull = this.add.graphics();
    this.basinWaterFull.fillStyle(0x0ea5e9, 0.84);
    this.basinWaterFull.fillEllipse(0, -2, 260, 74);
    this.basinWaterFull.lineStyle(2.5, 0xe0f2fe, 0.8);
    this.basinWaterFull.strokeEllipse(0, -2, 215, 56);
    this.basinWaterFull.strokeEllipse(0, -2, 130, 32);
    this.basinWaterFull.setAlpha(0);
    basinContainer.add(this.basinWaterFull);

    this.registerInteractive('basin', basinContainer, 310, 120);
    this.createDiscoveredBadge('basin', basinContainer, -125, -48);

    // 2. Central Fountain Pedestal (فواره)
    const fountainContainer = this.add.container(540, 435);
    const fg = this.add.graphics();
    // Base pedestal
    fg.fillStyle(0x0f766e, 1);
    fg.fillRoundedRect(-22, 10, 44, 48, 8);
    fg.lineStyle(3, 0x134e4a, 1);
    fg.strokeRoundedRect(-22, 10, 44, 48, 8);
    // Upper bowl
    fg.fillStyle(0x14b8a6, 1);
    fg.fillEllipse(0, 6, 92, 28);
    fg.lineStyle(3, 0x134e4a, 1);
    fg.strokeEllipse(0, 6, 92, 28);
    // Top nozzle spire
    fg.fillStyle(0x2dd4bf, 1);
    fg.fillRoundedRect(-12, -32, 24, 38, 6);
    fg.strokeRoundedRect(-12, -32, 24, 38, 6);
    fg.fillStyle(0xfbbf24, 1);
    fg.fillCircle(0, -34, 8);
    fountainContainer.add(fg);

    this.registerInteractive('fountain', fountainContainer, 105, 110);
  }

  private drawDecorativeProps(): void {
    // 1. Terracotta Flowerpot (گلدان سفالی)
    const potContainer = this.add.container(290, 505);
    const potG = this.add.graphics();
    potG.fillStyle(0x000000, 0.14);
    potG.fillEllipse(0, 38, 66, 18);
    // Clay pot
    const potPoints = [
      new Phaser.Math.Vector2(-24, 0),
      new Phaser.Math.Vector2(24, 0),
      new Phaser.Math.Vector2(18, 38),
      new Phaser.Math.Vector2(-18, 38),
    ];
    potG.fillStyle(0xea580c, 1);
    potG.fillPoints(potPoints, true);
    potG.lineStyle(3, 0x9a3412, 1);
    potG.strokePoints(potPoints, true);
    potG.fillStyle(0xf97316, 1);
    potG.fillRoundedRect(-28, -8, 56, 12, 4);
    potG.strokeRoundedRect(-28, -8, 56, 12, 4);
    // Geranium leaves & red blossoms
    potG.fillStyle(0x16a34a, 1);
    potG.fillCircle(-14, -22, 15);
    potG.fillCircle(14, -20, 15);
    potG.fillCircle(0, -28, 17);
    potG.fillStyle(0xf43f5e, 1);
    potG.fillCircle(-12, -30, 8);
    potG.fillCircle(12, -26, 8);
    potG.fillCircle(0, -39, 9);
    potG.fillStyle(0xfef08a, 1);
    potG.fillCircle(0, -39, 3);
    potContainer.add(potG);
    this.registerInteractive('flowerpot', potContainer, 90, 110);

    // 2. Wooden Bench (نیمکت چوبی)
    const benchContainer = this.add.container(155, 442);
    const benchG = this.add.graphics();
    benchG.fillStyle(0x000000, 0.14);
    benchG.fillEllipse(0, 42, 130, 22);
    // Legs
    benchG.fillStyle(0x334155, 1);
    benchG.fillRect(-46, 12, 10, 30);
    benchG.fillRect(36, 12, 10, 30);
    // Backrest slats
    benchG.fillStyle(0xb45309, 1);
    benchG.fillRoundedRect(-56, -24, 112, 13, 4);
    benchG.fillRoundedRect(-56, -8, 112, 13, 4);
    // Seat plank
    benchG.fillStyle(0xd97706, 1);
    benchG.fillRoundedRect(-60, 8, 120, 14, 4);
    benchG.lineStyle(2.5, 0x78350f, 1);
    benchG.strokeRoundedRect(-60, 8, 120, 14, 4);
    benchContainer.add(benchG);
    this.registerInteractive('bench', benchContainer, 135, 90);

    // 3. Animated Butterfly (پروانه تزئینی)
    this.butterflyGroup = this.add.container(960, 310);
    const bLeft = this.add.ellipse(-11, -4, 18, 14, 0xfb923c);
    bLeft.setStrokeStyle(2, 0xc2410c);
    const bRight = this.add.ellipse(11, -4, 18, 14, 0xfb923c);
    bRight.setStrokeStyle(2, 0xc2410c);
    const bLowL = this.add.ellipse(-8, 8, 13, 10, 0xfbbf24);
    const bLowR = this.add.ellipse(8, 8, 13, 10, 0xfbbf24);
    const bBody = this.add.rectangle(0, 2, 5, 22, 0x451a03);
    this.butterflyGroup.add([bLeft, bRight, bLowL, bLowR, bBody]);

    this.tweens.add({
      targets: [bLeft, bLowL],
      scaleX: 0.45,
      duration: 210,
      yoyo: true,
      repeat: -1,
    });
    this.tweens.add({
      targets: [bRight, bLowR],
      scaleX: 0.45,
      duration: 210,
      yoyo: true,
      repeat: -1,
    });

    this.registerInteractive('butterfly', this.butterflyGroup, 84, 84);
  }

  private drawCharacters(): void {
    // 1. Nane Bahar (left side by arch)
    const nane = this.add.container(352, 340);
    const ng = this.add.graphics();
    ng.fillStyle(0x000000, 0.12);
    ng.fillEllipse(0, 56, 56, 16);
    // Floral chador / modest dress
    ng.fillStyle(0xf8fafc, 1);
    ng.fillEllipse(0, 20, 48, 76);
    ng.lineStyle(2.5, 0x64748b, 1);
    ng.strokeEllipse(0, 20, 48, 76);
    // Little floral accents on chador
    ng.fillStyle(0xec4899, 0.8);
    ng.fillCircle(-12, 16, 3);
    ng.fillCircle(14, 24, 3);
    ng.fillStyle(0x10b981, 0.8);
    ng.fillCircle(10, 8, 2.5);
    ng.fillCircle(-10, 34, 2.5);
    // Face
    ng.fillStyle(0xfbd8b8, 1);
    ng.fillCircle(0, -14, 15);
    // Gentle glasses
    ng.lineStyle(1.8, 0x475569, 1);
    ng.strokeCircle(-5, -15, 4.5);
    ng.strokeCircle(5, -15, 4.5);
    ng.fillStyle(0x1e293b, 1);
    ng.fillCircle(-5, -15, 1.8);
    ng.fillCircle(5, -15, 1.8);
    ng.lineStyle(2, 0x7c2d12, 1);
    ng.beginPath();
    ng.arc(0, -10, 4.5, 0.2, Math.PI - 0.2);
    ng.strokePath();
    nane.add(ng);
    this.tweens.add({
      targets: nane,
      y: 337,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // 2. Raha (9-year-old Iranian girl, modest colorful outfit, full headscarf)
    const raha = this.add.container(422, 354);
    const rg = this.add.graphics();
    rg.fillStyle(0x000000, 0.14);
    rg.fillEllipse(0, 54, 48, 14);
    // Red-coral tunic with gold collar trim
    rg.fillStyle(0xe11d48, 1);
    rg.fillRoundedRect(-18, 2, 36, 48, 10);
    rg.lineStyle(2.5, 0x881337, 1);
    rg.strokeRoundedRect(-18, 2, 36, 48, 10);
    rg.lineStyle(2.5, 0xfde047, 1);
    rg.lineBetween(-8, 6, 0, 14);
    rg.lineBetween(0, 14, 8, 6);
    // Full turquoise headscarf
    rg.fillStyle(0x0d9488, 1);
    rg.fillCircle(0, -16, 20);
    rg.fillRoundedRect(-20, -16, 40, 26, 8);
    rg.fillStyle(0x5eead4, 1);
    rg.fillCircle(0, -14, 16);
    // Face
    rg.fillStyle(0xfde2c4, 1);
    rg.fillCircle(0, -14, 12.5);
    rg.fillStyle(0x1e293b, 1);
    rg.fillCircle(-4.5, -15, 2);
    rg.fillCircle(4.5, -15, 2);
    rg.lineStyle(2, 0x7c2d12, 1);
    rg.beginPath();
    rg.arc(0, -10, 4.5, 0.2, Math.PI - 0.2);
    rg.strokePath();
    raha.add(rg);
    this.tweens.add({
      targets: raha,
      y: 350,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // 3. Noorak (floating glowing lantern companion with magnifying glass)
    this.noorakGroup = this.add.container(this.noorakHome.x, this.noorakHome.y);
    const aura = this.add.circle(0, 0, 38, 0xfde047, 0.35);
    const body = this.add.graphics();
    // Wings
    body.fillStyle(0x2dd4bf, 1);
    body.fillEllipse(-22, 2, 14, 10);
    body.fillEllipse(22, 2, 14, 10);
    // Lantern cap
    body.fillStyle(0x0f766e, 1);
    body.fillTriangle(-14, -18, 0, -30, 14, -18);
    body.fillStyle(0xfde047, 1);
    body.fillCircle(0, -31, 4);
    // Glowing body
    body.fillStyle(0xfbbf24, 1);
    body.fillEllipse(0, 0, 38, 44);
    body.lineStyle(2.5, 0x0f766e, 1);
    body.strokeEllipse(0, 0, 38, 44);
    // Eyes & smile
    body.fillStyle(0x134e4a, 1);
    body.fillCircle(-6, -3, 2.8);
    body.fillCircle(6, -3, 2.8);
    body.lineStyle(2, 0x134e4a, 1);
    body.beginPath();
    body.arc(0, 3, 6, 0.2, Math.PI - 0.2);
    body.strokePath();
    // Magnifying glass
    body.lineStyle(3, 0x78350f, 1);
    body.lineBetween(14, 10, 22, 22);
    body.fillStyle(0xbae6fd, 0.75);
    body.fillCircle(13, 6, 8);
    body.lineStyle(2.5, 0x0f766e, 1);
    body.strokeCircle(13, 6, 8);

    this.noorakGroup.add([aura, body]);
    this.noorakGroup.setDepth(20);
  }

  private createWaterEffectLayers(): void {
    this.fountainArcGraphics = this.add.graphics();
    this.fountainArcGraphics.setDepth(15);

    this.waterDropGraphics = this.add.graphics();
    this.waterDropGraphics.setDepth(16);

    // Pre-allocate pooled water drop ring buffer (zero GC!)
    for (let i = 0; i < 40; i += 1) {
      this.waterDrops.push({
        x: 540,
        y: 398,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1,
        active: false,
      });
    }
  }

  private createHintSpotlight(): void {
    this.hintRing = this.add.graphics();
    this.hintRing.setDepth(25);
    this.hintRing.setVisible(false);
  }

  private createSparkleLayer(): void {
    this.sparkleGraphics = this.add.graphics();
    this.sparkleGraphics.setDepth(30);
  }

  private registerInteractive(
    id: SceneObjectId,
    container: Phaser.GameObjects.Container,
    hitWidth: number,
    hitHeight: number,
  ): void {
    container.setSize(hitWidth, hitHeight);
    container.setInteractive({
      useHandCursor: true,
    });

    container.on('pointerover', () => {
      if (this.visualState.isPaused) return;
      this.tweens.add({
        targets: container,
        scale: 1.06,
        duration: 140,
        ease: 'Quad.easeOut',
      });
    });

    container.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scale: 1,
        duration: 140,
        ease: 'Quad.easeOut',
      });
    });

    container.on('pointerdown', () => {
      if (this.visualState.isPaused) return;
      this.noorakTarget = {
        x: Phaser.Math.Clamp(container.x - 36, 120, 1140),
        y: Phaser.Math.Clamp(container.y - 68, 140, 520),
      };
      this.emitSparkleBurst(container.x, container.y);
      this.tweens.add({
        targets: container,
        scaleX: 1.09,
        scaleY: 0.94,
        duration: 90,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
      this.callbacks.onObjectClick(id);
    });

    this.interactiveContainers.set(id, container);
  }

  private createDiscoveredBadge(
    id: SceneObjectId,
    parent: Phaser.GameObjects.Container,
    offsetX: number,
    offsetY: number,
  ): void {
    const badge = this.add.container(offsetX, offsetY);
    const circle = this.add.circle(0, 0, 14, 0x10b981);
    circle.setStrokeStyle(2.5, 0xffffff);
    const check = this.add.graphics();
    check.lineStyle(3, 0xffffff, 1);
    check.lineBetween(-6, 0, -1, 5);
    check.lineBetween(-1, 5, 7, -5);
    badge.add([circle, check]);
    badge.setVisible(false);
    parent.add(badge);
    this.clueBadges.set(id, badge);
  }

  private emitSparkleBurst(cx: number, cy: number): void {
    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8;
      const star = this.add.circle(cx, cy, 4.5, i % 2 === 0 ? 0xfde047 : 0x2dd4bf);
      star.setDepth(32);
      this.tweens.add({
        targets: star,
        x: cx + Math.cos(angle) * 44,
        y: cy + Math.sin(angle) * 44,
        alpha: 0,
        scale: 0.2,
        duration: 420,
        ease: 'Cubic.easeOut',
        onComplete: () => star.destroy(),
      });
    }
  }

  public syncVisualState(nextState: MeydanSceneVisualState): void {
    const wasFixed = this.visualState.fountainFixed;
    this.visualState = nextState;
    this.input.enabled = !nextState.isPaused;
    this.tweens.timeScale = nextState.isPaused ? 0 : 1;

    const clueToObject: Record<string, SceneObjectId> = {
      basin_low: 'basin',
      valve_closed: 'valve',
      pipe_intact: 'pipe',
    };

    this.clueBadges.forEach((badge) => badge.setVisible(false));
    nextState.discoveredClueIds.forEach((clueId) => {
      const objId = clueToObject[clueId];
      if (objId) {
        this.clueBadges.get(objId)?.setVisible(true);
      }
    });

    if (nextState.fountainFixed && !wasFixed) {
      this.playFountainActivationTransition();
    } else if (!nextState.fountainFixed && wasFixed) {
      this.resetFountainVisuals();
    }

    if (nextState.fountainFixed) {
      this.pipeFlowActive = true;
      this.basinWaterFull.setAlpha(1);
      this.basinWaterLow.setAlpha(0);
      this.bloomOverlayGroup.setAlpha(1);
      this.valveWheel.setAngle(180);
    }

    this.hintRing.setVisible(Boolean(nextState.highlightObjectId));
  }

  private playFountainActivationTransition(): void {
    this.pipeFlowActive = true;
    this.tweens.add({
      targets: this.valveWheel,
      angle: 360,
      duration: 650,
      ease: 'Back.easeOut',
    });
    this.tweens.add({
      targets: this.basinWaterFull,
      alpha: 1,
      duration: 1100,
      ease: 'Sine.easeInOut',
    });
    this.tweens.add({
      targets: this.basinWaterLow,
      alpha: 0,
      duration: 800,
    });
    this.tweens.add({
      targets: this.bloomOverlayGroup,
      alpha: 1,
      duration: 1200,
      ease: 'Sine.easeOut',
    });
    this.noorakTarget = { x: 540, y: 295 };
    this.emitSparkleBurst(540, 390);
  }

  private resetFountainVisuals(): void {
    this.pipeFlowActive = false;
    this.basinWaterFull.setAlpha(0);
    this.basinWaterLow.setAlpha(0.78);
    this.bloomOverlayGroup.setAlpha(0);
    this.valveWheel.setAngle(0);
    this.fountainArcGraphics.clear();
    this.waterDropGraphics.clear();
    this.pipeFlowDots.forEach((d) => d.setAlpha(0));
    this.noorakTarget = { ...this.noorakHome };
  }

  public update(time: number, delta: number): void {
    // Hint spotlight ring pulse
    if (this.visualState.highlightObjectId) {
      const target = this.interactiveContainers.get(this.visualState.highlightObjectId);
      if (target) {
        this.hintPulseTime += Math.min(delta / 1000, 0.05) * 4;
        const radius = 58 + Math.sin(this.hintPulseTime) * 10;
        this.hintRing.clear();
        this.hintRing.lineStyle(5, 0xfde047, 0.92);
        this.hintRing.strokeCircle(target.x, target.y, radius);
        this.hintRing.lineStyle(3, 0x14b8a6, 0.8);
        this.hintRing.strokeCircle(target.x, target.y, radius + 8);
      }
    }

    if (this.visualState.isPaused) {
      return;
    }

    const dt = Math.min(delta / 1000, 0.05);

    // Gentle cloud drift
    this.clouds.forEach((cloud, idx) => {
      cloud.x += dt * (8 + idx * 3);
      if (cloud.x > 1360) {
        cloud.x = -90;
      }
    });

    // Smooth butterfly figure-8 flight
    this.butterflyAngle += dt * 1.35;
    if (this.butterflyGroup) {
      this.butterflyGroup.x = 975 + Math.cos(this.butterflyAngle) * 78;
      this.butterflyGroup.y = 325 + Math.sin(this.butterflyAngle * 2) * 32;
    }

    // Smooth Noorak float toward target
    if (this.noorakGroup) {
      this.noorakGroup.x = Phaser.Math.Linear(this.noorakGroup.x, this.noorakTarget.x, dt * 3.2);
      const bobOffset = Math.sin(time * 0.0035) * 7;
      this.noorakGroup.y = Phaser.Math.Linear(
        this.noorakGroup.y,
        this.noorakTarget.y + bobOffset,
        dt * 3.5,
      );
    }

    // Pipe flowing water pulses + Fountain water arcs when fixed
    if (this.pipeFlowActive) {
      this.pipeFlowDots.forEach((dot, idx) => {
        dot.setAlpha(0.9);
        const offset = ((time * 0.09 + idx * 46) % 276) - 138;
        dot.x = -offset;
      });
      this.updateFountainWater(time, dt);
    }
  }

  private updateFountainWater(time: number, dt: number): void {
    const g = this.fountainArcGraphics;
    g.clear();

    const wobble = Math.sin(time * 0.012) * 5;
    // Central vertical jet
    g.lineStyle(6, 0x38bdf8, 0.9);
    g.lineBetween(540, 398, 540 + wobble * 0.3, 305 + Math.cos(time * 0.015) * 6);
    g.lineStyle(3, 0xe0f2fe, 0.95);
    g.lineBetween(540, 398, 540 + wobble * 0.2, 308);

    // Side symmetrical parabolic water arcs falling into basin
    const drawArc = (dir: number, spread: number, height: number) => {
      g.lineStyle(4.5, 0x0ea5e9, 0.85);
      g.beginPath();
      g.moveTo(540, 396);
      for (let t = 0.1; t <= 1.05; t += 0.1) {
        const px = 540 + dir * spread * t;
        const py = 396 - height * Math.sin(t * Math.PI) + t * 88;
        g.lineTo(px, py);
      }
      g.strokePath();
    };

    drawArc(-1, 84 + wobble, 68);
    drawArc(1, 84 - wobble, 68);
    drawArc(-1, 50, 52);
    drawArc(1, 50, 52);

    // Pooled water droplet particles
    const dg = this.waterDropGraphics;
    dg.clear();
    dg.fillStyle(0xe0f2fe, 0.9);

    for (let i = 0; i < this.waterDrops.length; i += 1) {
      const drop = this.waterDrops[i];
      if (!drop.active && Math.random() < 0.35) {
        drop.active = true;
        drop.x = 540 + (Math.random() - 0.5) * 10;
        drop.y = 310 + Math.random() * 14;
        drop.vx = (Math.random() - 0.5) * 140;
        drop.vy = -65 - Math.random() * 75;
        drop.life = 0;
        drop.maxLife = 0.65 + Math.random() * 0.35;
      }

      if (drop.active) {
        drop.life += dt;
        drop.vy += 320 * dt;
        drop.x += drop.vx * dt;
        drop.y += drop.vy * dt;
        if (drop.life >= drop.maxLife || drop.y > 490) {
          drop.active = false;
        } else {
          dg.fillCircle(drop.x, drop.y, 3.2);
        }
      }
    }
  }
}
