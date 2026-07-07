import type { PlayerStats, WeaponArchetype, WeaponElement, WeaponRarity } from '../types/GameTypes';

export interface ImageAsset {
  key: string;
  path: string;
}

export interface WeaponImageAsset extends ImageAsset {
  match?: {
    elements?: WeaponElement[];
    archetypes?: WeaponArchetype[];
    rarities?: WeaponRarity[];
  };
}

export interface BossImageAsset extends ImageAsset {
  width: number;
  height: number;
  minLoop?: number;
}

export interface BossTheme {
  key: string;
  primary: number;
  secondary: number;
  accent: number;
  darkness: number;
}

export const WEAPON_IMAGE_ASSETS: WeaponImageAsset[] = [
  { key: 'weaponAnime', path: 'assets/optimized/weapon-anime.png' },
  { key: 'weaponRunnerEvolved', path: 'assets/optimized/weapon-runner-evolved.png', match: { archetypes: ['blaster'] } },
  { key: 'weaponPhoenix', path: 'assets/optimized/weapon-phoenix.png', match: { elements: ['fire'], rarities: ['mythic'] } },
  { key: 'weaponPhoenixEvolved', path: 'assets/optimized/weapon-phoenix-evolved.png', match: { elements: ['fire'], archetypes: ['phoenix', 'meteor', 'saber'] } },
  { key: 'weaponCrystal', path: 'assets/optimized/weapon-crystal.png', match: { elements: ['ice', 'crystal'], rarities: ['legend'] } },
  { key: 'weaponFrostEvolved', path: 'assets/optimized/weapon-frost-evolved.png', match: { elements: ['ice'], archetypes: ['lance', 'aurora', 'geode'] } },
  { key: 'weaponShadow', path: 'assets/optimized/weapon-shadow.png', match: { elements: ['shadow'] } },
  { key: 'weaponWind', path: 'assets/optimized/weapon-wind.png', match: { elements: ['wind'] } },
  { key: 'weaponSeraph', path: 'assets/optimized/weapon-seraph.png', match: { elements: ['light'], archetypes: ['seraph'] } },
  { key: 'weaponSamurai', path: 'assets/optimized/weapon-samurai.png', match: { archetypes: ['samurai', 'saber', 'blade'] } },
  { key: 'weaponThunder', path: 'assets/optimized/weapon-thunder.png', match: { elements: ['thunder'], archetypes: ['levin', 'rail'] } },
  { key: 'weaponThunderEvolved', path: 'assets/optimized/weapon-thunder-evolved.png', match: { elements: ['thunder'], archetypes: ['rail', 'tempest', 'magnum'] } },
  { key: 'weaponVoid', path: 'assets/optimized/weapon-void.png', match: { elements: ['shadow'], archetypes: ['onyx', 'phantom'] } },
  { key: 'weaponDragon', path: 'assets/optimized/weapon-dragon.png', match: { archetypes: ['dragon', 'hydra', 'gigas'] } },
  { key: 'weaponFrost', path: 'assets/optimized/weapon-frost.png', match: { elements: ['ice'], archetypes: ['aurora', 'geode'] } },
  { key: 'weaponNova', path: 'assets/optimized/weapon-nova.png', match: { archetypes: ['nova', 'meteor', 'chrono', 'nebula'] } },
  { key: 'weaponRune', path: 'assets/optimized/weapon-rune.png', match: { elements: ['light', 'crystal'], archetypes: ['rune', 'oracle'] } },
  { key: 'weaponBasilisk', path: 'assets/optimized/weapon-basilisk.png', match: { elements: ['shadow'], archetypes: ['basilisk', 'chimera'] } },
  { key: 'weaponBasiliskEvolved', path: 'assets/optimized/weapon-basilisk-evolved.png', match: { elements: ['shadow'], archetypes: ['basilisk', 'chimera', 'phantom'] } },
  { key: 'weaponAnchor', path: 'assets/optimized/weapon-anchor.png', match: { archetypes: ['anchor', 'kraken'] } },
  { key: 'weaponAnchorEvolved', path: 'assets/optimized/weapon-anchor-evolved.png', match: { archetypes: ['anchor', 'kraken', 'atlas', 'hammer'] } },
  { key: 'weaponMoonGuillotine', path: 'assets/optimized/weapon-moon-guillotine.png', match: { elements: ['shadow'], archetypes: ['saber', 'blade', 'samurai'] } },
  { key: 'weaponSolarDragonRail', path: 'assets/optimized/weapon-solar-dragon-rail.png', match: { elements: ['fire', 'thunder'], archetypes: ['rail', 'dragon'] } },
  { key: 'weaponQuantumBloomStaff', path: 'assets/optimized/weapon-quantum-bloom-staff.png', match: { elements: ['light', 'crystal'], archetypes: ['rune', 'lotus', 'oracle'] } },
  { key: 'weaponAbyssNeedleLauncher', path: 'assets/optimized/weapon-abyss-needle-launcher.png', match: { elements: ['shadow'], archetypes: ['needle', 'basilisk'] } },
  { key: 'weaponTitanOrbitHammer', path: 'assets/optimized/weapon-titan-orbit-hammer.png', match: { archetypes: ['hammer', 'atlas', 'anchor'] } },
  { key: 'weaponPrismCometBow', path: 'assets/optimized/weapon-prism-comet-bow.png', match: { elements: ['crystal'], archetypes: ['comet', 'nova', 'mirror'] } },
  { key: 'weaponCrimsonMeteorKatana', path: 'assets/optimized/weapon-crimson-meteor-katana.png', match: { elements: ['fire'], archetypes: ['samurai', 'saber', 'meteor'] } },
  { key: 'weaponAzureTempestChakram', path: 'assets/optimized/weapon-azure-tempest-chakram.png', match: { elements: ['thunder', 'wind'], archetypes: ['tempest', 'vortex'] } },
  { key: 'weaponVerdantSeraphCrossbow', path: 'assets/optimized/weapon-verdant-seraph-crossbow.png', match: { elements: ['light', 'wind'], archetypes: ['seraph', 'centaur'] } },
  { key: 'weaponObsidianGravityCannon', path: 'assets/optimized/weapon-obsidian-gravity-cannon.png', match: { elements: ['shadow'], archetypes: ['gigas', 'atlas', 'nova'] } },
  { key: 'weaponSakuraMirrorFans', path: 'assets/optimized/weapon-sakura-mirror-fans.png', match: { elements: ['crystal', 'light'], archetypes: ['mirror', 'sakura'] } },
  { key: 'weaponChronoNeedleSpear', path: 'assets/optimized/weapon-chrono-needle-spear.png', match: { elements: ['thunder', 'light'], archetypes: ['chrono', 'needle', 'lance'] } },
  { key: 'weaponNebulaHarpLauncher', path: 'assets/optimized/weapon-nebula-harp-launcher.png', match: { elements: ['light', 'crystal'], archetypes: ['nebula', 'rune'] } },
  { key: 'weaponMagmaDrillTrident', path: 'assets/optimized/weapon-magma-drill-trident.png', match: { elements: ['fire'], archetypes: ['drill', 'lance', 'meteor'] } },
  { key: 'weaponCrystalLotusShieldgun', path: 'assets/optimized/weapon-crystal-lotus-shieldgun.png', match: { elements: ['crystal', 'light'], archetypes: ['lotus', 'anchor', 'rune'] } },
  { key: 'weaponCelestialBalanceBow', path: 'assets/optimized/weapon-celestial-balance-bow.png', match: { elements: ['neutral', 'light'], archetypes: ['centaur', 'comet'] } },
  { key: 'weaponScarletSpeedSaber', path: 'assets/optimized/weapon-scarlet-speed-saber.png', match: { elements: ['fire'], archetypes: ['saber', 'samurai', 'levin'] } },
  { key: 'weaponVoidGuardianCannon', path: 'assets/optimized/weapon-void-guardian-cannon.png', match: { elements: ['shadow'], archetypes: ['atlas', 'gigas'] } },
  { key: 'weaponLotusAegisBloom', path: 'assets/optimized/weapon-lotus-aegis-bloom.png', match: { elements: ['crystal'], archetypes: ['lotus', 'rune'] } },
  { key: 'weaponEmeraldOrbitHarp', path: 'assets/optimized/weapon-emerald-orbit-harp.png', match: { elements: ['wind', 'light'], archetypes: ['nebula', 'orbit', 'rune'] } },
  { key: 'weaponGarnetBreakerAxe', path: 'assets/optimized/weapon-garnet-breaker-axe.png', match: { elements: ['fire', 'shadow'], archetypes: ['hammer', 'atlas', 'gigas'] } },
  { key: 'weaponJadeStormFan', path: 'assets/optimized/weapon-jade-storm-fan.png', match: { elements: ['wind', 'thunder'], archetypes: ['tempest', 'vortex', 'sakura'] } },
  { key: 'weaponSolarVenomNeedle', path: 'assets/optimized/weapon-solar-venom-needle.png', match: { elements: ['fire', 'shadow'], archetypes: ['needle', 'basilisk', 'levin'] } },
  { key: 'weaponIchigoBalanceBow', path: 'assets/optimized/weapon-ichigo-balance-bow.png', match: { elements: ['neutral', 'light'], archetypes: ['centaur', 'comet'] } },
  { key: 'weaponIchigoSpeedSaber', path: 'assets/optimized/weapon-ichigo-speed-saber.png', match: { archetypes: ['saber', 'samurai', 'levin'] } },
  { key: 'weaponIchigoRocketCannon', path: 'assets/optimized/weapon-ichigo-rocket-cannon.png', match: { elements: ['fire'], archetypes: ['rail', 'dragon', 'magnum'] } },
  { key: 'weaponIchigoAegisShield', path: 'assets/optimized/weapon-ichigo-aegis-shield.png', match: { elements: ['crystal'], archetypes: ['lotus', 'atlas', 'anchor'] } },
  { key: 'weaponIchigoCurseNeedle', path: 'assets/optimized/weapon-ichigo-curse-needle.png', match: { elements: ['shadow'], archetypes: ['needle', 'basilisk'] } },
  { key: 'weaponIchigoPierceLance', path: 'assets/optimized/weapon-ichigo-pierce-lance.png', match: { archetypes: ['lance', 'drill', 'chrono'] } },
  { key: 'weaponGrapeBalanceBow', path: 'assets/optimized/weapon-grape-balance-bow.png', match: { elements: ['neutral', 'light'], archetypes: ['centaur', 'comet'] } },
  { key: 'weaponGrapeSpeedSaber', path: 'assets/optimized/weapon-grape-speed-saber.png', match: { archetypes: ['saber', 'samurai', 'levin'] } },
  { key: 'weaponGrapeRocketCannon', path: 'assets/optimized/weapon-grape-rocket-cannon.png', match: { elements: ['fire', 'thunder'], archetypes: ['rail', 'magnum', 'dragon'] } },
  { key: 'weaponGrapeAegisShield', path: 'assets/optimized/weapon-grape-aegis-shield.png', match: { elements: ['crystal'], archetypes: ['lotus', 'atlas', 'anchor'] } },
  { key: 'weaponGrapeCurseNeedle', path: 'assets/optimized/weapon-grape-curse-needle.png', match: { elements: ['shadow'], archetypes: ['needle', 'basilisk'] } },
  { key: 'weaponGrapePierceLance', path: 'assets/optimized/weapon-grape-pierce-lance.png', match: { archetypes: ['lance', 'drill', 'chrono'] } },
  { key: 'weaponKijiFeatherBow', path: 'assets/optimized/weapon-kiji-feather-bow.png', match: { elements: ['wind'], archetypes: ['centaur', 'falcon'] } },
  { key: 'weaponRocketLauncherBarrage', path: 'assets/optimized/weapon-rocket-launcher-barrage.png', match: { elements: ['fire'], archetypes: ['rail', 'magnum', 'blaster'] } },
  { key: 'weaponRuriAzureLance', path: 'assets/optimized/weapon-ruri-azure-lance.png', match: { elements: ['crystal', 'ice'], archetypes: ['lance', 'rail'] } },
  { key: 'weaponJoTanSaltBlade', path: 'assets/optimized/weapon-jo-tan-salt-blade.png', match: { elements: ['fire'], archetypes: ['saber', 'samurai'] } },
  { key: 'weaponTonkotsuRamenCannon', path: 'assets/optimized/weapon-tonkotsu-ramen-cannon.png', match: { elements: ['light'], archetypes: ['blaster', 'rune'] } },
  { key: 'weaponPoseidonTridentCannon', path: 'assets/optimized/weapon-poseidon-trident-cannon.png', match: { elements: ['ice'], archetypes: ['lance', 'anchor', 'kraken'] } },
  { key: 'weaponSnsSignalSpear', path: 'assets/optimized/weapon-sns-signal-spear.png', match: { elements: ['thunder', 'light'], archetypes: ['pulse', 'echo', 'nebula'] } },
  { key: 'weaponAphroditeRoseBow', path: 'assets/optimized/weapon-aphrodite-rose-bow.png', match: { elements: ['light'], archetypes: ['seraph', 'centaur', 'lotus'] } },
  { key: 'weaponMoistCalicoCatCannon', path: 'assets/optimized/weapon-moist-calico-cat-cannon.png', match: { elements: ['crystal', 'light'], archetypes: ['lotus', 'rune', 'blaster'] } },
  { key: 'weaponFlameMonkeyStaff', path: 'assets/optimized/weapon-flame-monkey-staff.png', match: { elements: ['fire'], archetypes: ['samurai', 'saber', 'vortex'] } },
  { key: 'weaponOrbitalRocketLance', path: 'assets/optimized/weapon-orbital-rocket-lance.png', match: { elements: ['thunder', 'fire'], archetypes: ['rail', 'magnum', 'lance'] } },
  { key: 'weaponSunflowerSolarBow', path: 'assets/optimized/weapon-sunflower-solar-bow.png', match: { elements: ['light', 'wind'], archetypes: ['centaur', 'seraph', 'lotus'] } },
  { key: 'weaponRoosterCoilGlaive', path: 'assets/optimized/weapon-rooster-coil-glaive.png', match: { elements: ['fire', 'wind'], archetypes: ['saber', 'samurai', 'vortex'] } },
];

export const BOSS_IMAGE_ASSETS: BossImageAsset[] = [
  { key: 'bossDragon', path: 'assets/generated/boss-dragon.png', width: 386, height: 748 },
  { key: 'bossTitan', path: 'assets/generated/boss-titan.png', width: 360, height: 520 },
  { key: 'bossHydra', path: 'assets/generated/boss-hydra.png', width: 390, height: 590 },
  { key: 'bossPhoenix', path: 'assets/generated/boss-phoenix.png', width: 390, height: 560 },
  { key: 'bossDemon', path: 'assets/generated/boss-demon.png', width: 380, height: 560 },
  { key: 'bossLeviathan', path: 'assets/generated/boss-leviathan.png', width: 390, height: 560, minLoop: 1 },
  { key: 'bossVoid', path: 'assets/generated/boss-void.png', width: 390, height: 560, minLoop: 1 },
  { key: 'bossMantis', path: 'assets/generated/boss-mantis.png', width: 390, height: 820, minLoop: 2 },
  { key: 'bossOni', path: 'assets/generated/boss-oni.png', width: 410, height: 620, minLoop: 1 },
  { key: 'bossFrostQueen', path: 'assets/generated/boss-frost-queen.png', width: 390, height: 820, minLoop: 2 },
  { key: 'bossStrawberryEmpress', path: 'assets/generated/boss-strawberry-empress.png', width: 390, height: 620 },
  { key: 'bossClockworkKraken', path: 'assets/generated/boss-clockwork-kraken.png', width: 410, height: 620, minLoop: 1 },
  { key: 'bossLunarKitsune', path: 'assets/generated/boss-lunar-kitsune.png', width: 410, height: 640, minLoop: 2 },
  { key: 'bossNeonOrchardSeraph', path: 'assets/generated/boss-neon-orchard-seraph.png', width: 420, height: 746, minLoop: 3 },
  { key: 'bossAbyssChromeHydra', path: 'assets/generated/boss-abyss-chrome-hydra.png', width: 420, height: 746, minLoop: 3 },
  { key: 'bossCrownedBerryJuggernaut', path: 'assets/generated/boss-crowned-berry-juggernaut.png', width: 420, height: 746, minLoop: 3 },
  { key: 'bossPrismOrchardWyvern', path: 'assets/optimized/boss-prism-orchard-wyvern.png', width: 360, height: 640, minLoop: 2 },
  { key: 'bossIronMochiColossus', path: 'assets/optimized/boss-iron-mochi-colossus.png', width: 360, height: 640, minLoop: 1 },
  { key: 'bossChronoSpiderMatriarch', path: 'assets/optimized/boss-chrono-spider-matriarch.png', width: 380, height: 660, minLoop: 3 },
  { key: 'bossEmeraldClockArachne', path: 'assets/optimized/boss-emerald-clock-arachne.png', width: 380, height: 660, minLoop: 2 },
  { key: 'bossCrimsonPrismTyrant', path: 'assets/optimized/boss-crimson-prism-tyrant.png', width: 360, height: 640, minLoop: 4 },
  { key: 'bossJadeMochiColossus', path: 'assets/optimized/boss-jade-mochi-colossus.png', width: 360, height: 640, minLoop: 1 },
  { key: 'bossVioletOrchardWyvern', path: 'assets/optimized/boss-violet-orchard-wyvern.png', width: 360, height: 640, minLoop: 3 },
  { key: 'bossAquaClockworkSpider', path: 'assets/optimized/boss-aqua-clockwork-spider.png', width: 380, height: 660, minLoop: 2 },
  { key: 'bossStrawberryCerberus', path: 'assets/optimized/boss-strawberry-cerberus.png', width: 380, height: 512, minLoop: 1 },
  { key: 'bossAbyssalBerryCathedral', path: 'assets/optimized/boss-abyssal-berry-cathedral.png', width: 360, height: 640, minLoop: 3 },
  { key: 'bossGrapeThunderLeviathan', path: 'assets/optimized/boss-grape-thunder-leviathan.png', width: 380, height: 640, minLoop: 2 },
  { key: 'bossVineyardDoomQueen', path: 'assets/optimized/boss-vineyard-doom-queen.png', width: 380, height: 640, minLoop: 4 },
];

export const TITLE_BACKGROUND_ASSET: ImageAsset = { key: 'titleIchigo', path: 'assets/generated/title-ichigo.png' };

export const STAGE_BACKGROUND_IMAGE_ASSETS: ImageAsset[] = [
  { key: 'bgRealOcean', path: 'assets/generated/bg-real-ocean.png' },
  { key: 'bgRealMountain', path: 'assets/generated/bg-real-mountain.png' },
  { key: 'bgRealNeonCity', path: 'assets/generated/bg-real-neon-city.png' },
  { key: 'bgRealVolcano', path: 'assets/generated/bg-real-volcano.png' },
];

export const ITEM_IMAGE_ASSETS: ImageAsset[] = [
  { key: 'itemBukiCapsule', path: 'assets/optimized/item-buki-capsule.png' },
  { key: 'itemRareChest', path: 'assets/optimized/item-rare-chest.png' },
  { key: 'itemLegendChest', path: 'assets/optimized/item-legend-chest.png' },
  { key: 'itemCursedBox', path: 'assets/optimized/item-cursed-box.png' },
  { key: 'itemCritCrown', path: 'assets/optimized/item-crit-crown.png' },
  { key: 'itemPierceDrill', path: 'assets/optimized/item-pierce-drill.png' },
  { key: 'itemSpecialBattery', path: 'assets/optimized/item-special-battery.png' },
  { key: 'itemWeaponCache', path: 'assets/optimized/item-weapon-cache.png' },
  { key: 'itemOverdriveOrb', path: 'assets/optimized/item-overdrive-orb.png' },
  { key: 'itemMythicRelicChest', path: 'assets/optimized/item-mythic-relic-chest.png' },
  { key: 'itemRushCore', path: 'assets/optimized/item-rush-core.png' },
  { key: 'itemVoidDrill', path: 'assets/optimized/item-void-drill.png' },
  { key: 'itemPrismCrown', path: 'assets/optimized/item-prism-crown.png' },
  { key: 'itemSolarLegendChest', path: 'assets/optimized/item-solar-legend-chest.png' },
];

export const ENEMY_IMAGE_ASSETS: ImageAsset[] = [
  { key: 'enemyStrawberryImp', path: 'assets/generated/enemy-strawberry-imp.png' },
  { key: 'enemyFrostLens', path: 'assets/generated/enemy-frost-lens.png' },
  { key: 'enemyBrassBeetle', path: 'assets/generated/enemy-brass-beetle.png' },
  { key: 'enemyVioletMoth', path: 'assets/generated/enemy-violet-moth.png' },
  { key: 'enemyToxicVial', path: 'assets/generated/enemy-toxic-vial.png' },
  { key: 'enemyShockCoil', path: 'assets/generated/enemy-shock-coil.png' },
  { key: 'enemyHexMirror', path: 'assets/generated/enemy-hex-mirror.png' },
  { key: 'enemyFrostChain', path: 'assets/generated/enemy-frost-chain.png' },
  { key: 'enemyRustBomb', path: 'assets/generated/enemy-rust-bomb.png' },
  { key: 'enemyNeonRazor', path: 'assets/generated/enemy-neon-razor.png' },
  { key: 'enemyPrismJaw', path: 'assets/generated/enemy-prism-jaw.png' },
  { key: 'enemyJetNeedle', path: 'assets/generated/enemy-jet-needle.png' },
  { key: 'enemyAmberGear', path: 'assets/generated/enemy-amber-gear.png' },
  { key: 'enemyCrimsonShell', path: 'assets/generated/enemy-crimson-shell.png' },
  { key: 'enemyBerryDronePhoto', path: 'assets/generated/enemy-berry-drone.png' },
  { key: 'enemyIceLensPhoto', path: 'assets/generated/enemy-ice-lens.png' },
  { key: 'enemyBrassScarabPhoto', path: 'assets/generated/enemy-brass-scarab-photo.png' },
  { key: 'enemyToxicVialPhoto', path: 'assets/generated/enemy-toxic-vial-photo.png' },
  { key: 'enemyNeonRazorPhoto', path: 'assets/generated/enemy-neon-razor-photo.png' },
  { key: 'enemyHexMirrorPhoto', path: 'assets/generated/enemy-hex-mirror-photo.png' },
  { key: 'enemyBerryBrutePhoto', path: 'assets/generated/enemy-berry-brute-photo.png' },
  { key: 'enemyCrystalLensPhoto', path: 'assets/generated/enemy-crystal-lens-photo.png' },
  { key: 'enemyGoldScarabPhoto', path: 'assets/generated/enemy-gold-scarab-photo.png' },
  { key: 'enemyVioletStingerPhoto', path: 'assets/generated/enemy-violet-stinger-photo.png' },
  { key: 'enemyChromeBerryMantisPhoto', path: 'assets/generated/enemy-chrome-berry-mantis-photo.png' },
  { key: 'enemyCandyCoreDronePhoto', path: 'assets/generated/enemy-candy-core-drone-photo.png' },
  { key: 'enemyRubyForkDronePhoto', path: 'assets/generated/enemy-ruby-fork-drone-photo.png' },
  { key: 'enemyIceSpoonHarrierPhoto', path: 'assets/generated/enemy-ice-spoon-harrier-photo.png' },
  { key: 'enemyPepperGearIdolPhoto', path: 'assets/generated/enemy-pepper-gear-idol-photo.png' },
  { key: 'enemyStrawberryBladeDronePhoto', path: 'assets/optimized/enemy-strawberry-blade-drone.png' },
  { key: 'enemyLemonShockTurretPhoto', path: 'assets/optimized/enemy-lemon-shock-turret.png' },
  { key: 'enemyGrapeCurseIdolPhoto', path: 'assets/optimized/enemy-grape-curse-idol.png' },
  { key: 'enemyKiwiFrostWheelPhoto', path: 'assets/optimized/enemy-kiwi-frost-wheel.png' },
  { key: 'enemyMelonBladeSentinelPhoto', path: 'assets/optimized/enemy-melon-blade-sentinel.png' },
  { key: 'enemyRoseShockTurretPhoto', path: 'assets/optimized/enemy-rose-shock-turret.png' },
  { key: 'enemyCobaltCurseIdolPhoto', path: 'assets/optimized/enemy-cobalt-curse-idol.png' },
  { key: 'enemySolarFrostWheelPhoto', path: 'assets/optimized/enemy-solar-frost-wheel.png' },
  { key: 'enemyPlumBladeDronePhoto', path: 'assets/optimized/enemy-plum-blade-drone.png' },
  { key: 'enemyMintShockTurretPhoto', path: 'assets/optimized/enemy-mint-shock-turret.png' },
  { key: 'enemyLimeCurseIdolPhoto', path: 'assets/optimized/enemy-lime-curse-idol.png' },
  { key: 'enemyRubyFrostWheelPhoto', path: 'assets/optimized/enemy-ruby-frost-wheel.png' },
  { key: 'enemyAmethystBladeSentinelPhoto', path: 'assets/optimized/enemy-amethyst-blade-sentinel.png' },
  { key: 'enemyEmeraldCurseIdolPhoto', path: 'assets/optimized/enemy-emerald-curse-idol.png' },
];

export const MISC_IMAGE_ASSETS: ImageAsset[] = [
  ...ENEMY_IMAGE_ASSETS,
  { key: 'eliteReaper', path: 'assets/generated/elite-reaper.png' },
];

export function getPreloadImageAssets(): ImageAsset[] {
  const openingBosses = BOSS_IMAGE_ASSETS.filter((asset) => (asset.minLoop ?? 0) <= 1).slice(0, 10);
  const openingEnemies = ENEMY_IMAGE_ASSETS.slice(0, 24);
  return uniqueImageAssets([
    TITLE_BACKGROUND_ASSET,
    ...WEAPON_IMAGE_ASSETS,
    ...openingBosses,
    ...STAGE_BACKGROUND_IMAGE_ASSETS,
    ...ITEM_IMAGE_ASSETS,
    ...openingEnemies,
    { key: 'eliteReaper', path: 'assets/generated/elite-reaper.png' },
  ]);
}

export function getDeferredImageAssets(): ImageAsset[] {
  return uniqueImageAssets([
    ...BOSS_IMAGE_ASSETS,
    ...ENEMY_IMAGE_ASSETS,
    ...MISC_IMAGE_ASSETS,
  ]);
}

export function getTitleImageAssets(): ImageAsset[] {
  return [TITLE_BACKGROUND_ASSET];
}

function uniqueImageAssets(assets: ImageAsset[]): ImageAsset[] {
  const seen = new Set<string>();
  return assets.filter((asset) => {
    if (seen.has(asset.key)) {
      return false;
    }
    seen.add(asset.key);
    return true;
  });
}

export function getWeaponAssetKeys(): string[] {
  return WEAPON_IMAGE_ASSETS.map((asset) => asset.key);
}

export function selectWeaponAssetKey(stats: PlayerStats): string {
  if (stats.tier >= 3 || stats.rarity === 'epic' || stats.rarity === 'legend' || stats.rarity === 'mythic') {
    if (stats.element === 'fire' || ['phoenix', 'meteor'].includes(stats.archetype)) return 'weaponPhoenixEvolved';
    if (stats.element === 'ice' || ['lance', 'aurora', 'geode'].includes(stats.archetype)) return 'weaponFrostEvolved';
    if (stats.element === 'thunder' || ['rail', 'tempest', 'magnum'].includes(stats.archetype)) return 'weaponThunderEvolved';
    if (stats.element === 'shadow' || ['basilisk', 'chimera', 'phantom'].includes(stats.archetype)) return 'weaponBasiliskEvolved';
    if (['anchor', 'kraken', 'atlas', 'hammer'].includes(stats.archetype)) return 'weaponAnchorEvolved';
    if (stats.archetype === 'blaster') return 'weaponRunnerEvolved';
  }

  if ((stats.element === 'fire' || stats.archetype === 'phoenix') && (stats.tier >= 4 || stats.rarity === 'legend' || stats.rarity === 'mythic')) {
    return 'weaponPhoenix';
  }
  if ((stats.archetype === 'dragon' || stats.archetype === 'hydra') && stats.tier >= 4) {
    return 'weaponDragon';
  }
  if ((stats.element === 'ice' || stats.element === 'crystal') && stats.tier >= 4) {
    return 'weaponCrystal';
  }
  if ((stats.element === 'light' || stats.archetype === 'seraph') && stats.tier >= 4) {
    return 'weaponSeraph';
  }

  const matched = [...WEAPON_IMAGE_ASSETS].reverse().find((asset) => {
    const match = asset.match;
    if (!match) {
      return false;
    }
    return Boolean(
      match.elements?.includes(stats.element)
      || match.archetypes?.includes(stats.archetype)
      || match.rarities?.includes(stats.rarity),
    );
  });

  return matched?.key ?? WEAPON_IMAGE_ASSETS[0].key;
}

export function getBossAssetByLoop(loopIndex: number): BossImageAsset {
  return BOSS_IMAGE_ASSETS[loopIndex % BOSS_IMAGE_ASSETS.length];
}

export function getRandomBossAsset(loopIndex: number, recentKeys: string[] = []): BossImageAsset {
  const unlocked = BOSS_IMAGE_ASSETS.filter((asset) => (asset.minLoop ?? 0) <= loopIndex);
  const fresh = unlocked.filter((asset) => !recentKeys.includes(asset.key));
  const pool = fresh.length >= 3 ? fresh : unlocked;
  return pool[Math.floor(Math.random() * pool.length)] ?? BOSS_IMAGE_ASSETS[0];
}

export function getBossAsset(key: string): BossImageAsset {
  return BOSS_IMAGE_ASSETS.find((asset) => asset.key === key) ?? BOSS_IMAGE_ASSETS[0];
}

const BOSS_THEMES: BossTheme[] = [
  { key: 'bossDragon', primary: 0xef4444, secondary: 0xfb923c, accent: 0xfef3c7, darkness: 0x180812 },
  { key: 'bossTitan', primary: 0x94a3b8, secondary: 0xfacc15, accent: 0xf8fafc, darkness: 0x111827 },
  { key: 'bossHydra', primary: 0x22c55e, secondary: 0x38bdf8, accent: 0xccfbf1, darkness: 0x052e16 },
  { key: 'bossPhoenix', primary: 0xfb7185, secondary: 0xfacc15, accent: 0xffedd5, darkness: 0x301014 },
  { key: 'bossDemon', primary: 0xdc2626, secondary: 0xa855f7, accent: 0xfecaca, darkness: 0x1f0712 },
  { key: 'bossLeviathan', primary: 0x06b6d4, secondary: 0x2563eb, accent: 0xbae6fd, darkness: 0x082f49 },
  { key: 'bossVoid', primary: 0x8b5cf6, secondary: 0x020617, accent: 0xf0abfc, darkness: 0x09051a },
  { key: 'bossMantis', primary: 0x14b8a6, secondary: 0xfacc15, accent: 0xccfbf1, darkness: 0x042f2e },
  { key: 'bossOni', primary: 0xf97316, secondary: 0x7f1d1d, accent: 0xfef3c7, darkness: 0x1c0a05 },
  { key: 'bossFrostQueen', primary: 0x7dd3fc, secondary: 0xe0f2fe, accent: 0xffffff, darkness: 0x082f49 },
  { key: 'bossStrawberryEmpress', primary: 0xf43f5e, secondary: 0x22c55e, accent: 0xfef3c7, darkness: 0x2a0d08 },
  { key: 'bossClockworkKraken', primary: 0x0ea5e9, secondary: 0xb45309, accent: 0xfde68a, darkness: 0x082f49 },
  { key: 'bossLunarKitsune', primary: 0xc084fc, secondary: 0xe0e7ff, accent: 0xf0abfc, darkness: 0x12071f },
  { key: 'bossNeonOrchardSeraph', primary: 0xef4444, secondary: 0x22d3ee, accent: 0xfef08a, darkness: 0x21070d },
  { key: 'bossAbyssChromeHydra', primary: 0x1d4ed8, secondary: 0x18181b, accent: 0xc084fc, darkness: 0x020617 },
  { key: 'bossCrownedBerryJuggernaut', primary: 0xf43f5e, secondary: 0xfacc15, accent: 0xfef3c7, darkness: 0x25080c },
  { key: 'bossPrismOrchardWyvern', primary: 0xf43f5e, secondary: 0x22d3ee, accent: 0xf0abfc, darkness: 0x180812 },
  { key: 'bossIronMochiColossus', primary: 0xfef3c7, secondary: 0xef4444, accent: 0xfacc15, darkness: 0x1c1917 },
  { key: 'bossChronoSpiderMatriarch', primary: 0xb45309, secondary: 0x38bdf8, accent: 0xfef3c7, darkness: 0x111827 },
  { key: 'bossEmeraldClockArachne', primary: 0x22c55e, secondary: 0xfacc15, accent: 0xccfbf1, darkness: 0x052e16 },
  { key: 'bossCrimsonPrismTyrant', primary: 0xef4444, secondary: 0x38bdf8, accent: 0xfef08a, darkness: 0x180812 },
  { key: 'bossJadeMochiColossus', primary: 0x22c55e, secondary: 0xfef3c7, accent: 0xfef08a, darkness: 0x052e16 },
  { key: 'bossVioletOrchardWyvern', primary: 0x8b5cf6, secondary: 0xf43f5e, accent: 0xf0abfc, darkness: 0x12071f },
  { key: 'bossAquaClockworkSpider', primary: 0x06b6d4, secondary: 0xfacc15, accent: 0xccfbf1, darkness: 0x082f49 },
  { key: 'bossStrawberryCerberus', primary: 0xef4444, secondary: 0x22c55e, accent: 0x67e8f9, darkness: 0x180812 },
  { key: 'bossAbyssalBerryCathedral', primary: 0x8b5cf6, secondary: 0xef4444, accent: 0xf0abfc, darkness: 0x09051a },
  { key: 'bossGrapeThunderLeviathan', primary: 0x8b5cf6, secondary: 0xfacc15, accent: 0x86efac, darkness: 0x12071f },
  { key: 'bossVineyardDoomQueen', primary: 0x7e22ce, secondary: 0x22c55e, accent: 0xf0abfc, darkness: 0x16051e },
];

export function getBossTheme(key: string): BossTheme {
  return BOSS_THEMES.find((theme) => theme.key === key) ?? BOSS_THEMES[0];
}
