import { ArenaDamageCalculator } from './arena-damage-calculator';
import { Hero } from './model/hero';
import { HeroElement } from './model/hero-element';
import { Buff } from './model/buff';

describe('ArenaDamageCalculator (approval)', () => {
  let calculator: ArenaDamageCalculator;
  let originalMathRandom: () => number;

  beforeAll(() => {
    originalMathRandom = Math.random;
  });

  afterAll(() => {
    Math.random = originalMathRandom;
  });

  beforeEach(() => {
    calculator = new ArenaDamageCalculator();
  });

  it('should compute damage for a simple case (approval)', () => {
    // On force Math.random pour rendre le test déterministe
    Math.random = () => 0.1; // Pas de critique, cible le premier adv
    const attacker = new Hero(HeroElement.Water, 100, 50, 0, 0, 100);
    const defenders = [
      new Hero(HeroElement.Fire, 80, 30, 0, 0, 120),
      new Hero(HeroElement.Earth, 90, 40, 0, 0, 110),
    ];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });
});

describe('ArenaDamageCalculator exhaustive approval', () => {
  let calculator: ArenaDamageCalculator;
  let originalMathRandom: () => number;

  beforeAll(() => {
    originalMathRandom = Math.random;
  });

  afterAll(() => {
    Math.random = originalMathRandom;
  });

  beforeEach(() => {
    calculator = new ArenaDamageCalculator();
  });

  function makeHero({
    element = HeroElement.Water,
    pow = 100,
    def = 50,
    leth = 0,
    crtr = 0,
    lp = 100,
    buffs = [],
  }: Partial<{
    element: HeroElement;
    pow: number;
    def: number;
    leth: number;
    crtr: number;
    lp: number;
    buffs: Buff[];
  }> = {}) {
    const h = new Hero(element, pow, def, leth, crtr, lp);
    h.buffs = buffs;
    return h;
  }

  // Cas de base pour chaque élément
  it('Water attaque Fire (pas critique, pas de buff)', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 120 }), makeHero({ element: HeroElement.Earth, lp: 110 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  it('Fire attaque Earth (pas critique, pas de buff)', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Fire });
    const defenders = [makeHero({ element: HeroElement.Earth, lp: 120 }), makeHero({ element: HeroElement.Water, lp: 110 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  it('Earth attaque Water (pas critique, pas de buff)', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Earth });
    const defenders = [makeHero({ element: HeroElement.Water, lp: 120 }), makeHero({ element: HeroElement.Fire, lp: 110 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas critique
  it('Water attaque Fire (critique)', () => {
    Math.random = () => 0.0; // Critique
    const attacker = makeHero({ element: HeroElement.Water, crtr: 100 });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 120 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Buffs attaque
  it('Water attaque Fire avec buff Attack', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water, buffs: [Buff.Attack] });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 120 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Buffs défense
  it('Water attaque Fire, défenseur a buff Defense', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 120, buffs: [Buff.Defense] })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Buffs combinés
  it('Water attaque Fire, attaquant Attack, défenseur Defense', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water, buffs: [Buff.Attack] });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 120, buffs: [Buff.Defense] })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Défenseur déjà mort
  it('Water attaque Fire déjà mort', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 0 }), makeHero({ element: HeroElement.Earth, lp: 110 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas limite : défenseur avec défense très haute
  it('Water attaque Fire avec défense très haute', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 120, def: 10000 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas limite : dégâts à 0
  it('Water attaque Fire, dégâts à 0', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water, pow: 0 });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 120 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Plusieurs défenseurs, choix de la cible (mock random)
  it('Water attaque, plusieurs Fire, cible le second', () => {
    Math.random = () => 0.9; // Pour cibler le second Fire
    const attacker = makeHero({ element: HeroElement.Water });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 120 }), makeHero({ element: HeroElement.Fire, lp: 130 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Tous les défenseurs sont d'un même élément
  it('Water attaque, tous les défenseurs sont Earth', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water });
    const defenders = [makeHero({ element: HeroElement.Earth, lp: 120 }), makeHero({ element: HeroElement.Earth, lp: 130 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Tous les défenseurs sont morts
  it('Water attaque, tous les défenseurs sont morts', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 0 }), makeHero({ element: HeroElement.Earth, lp: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });


  // L'attaque réduit les PV à 0 ou moins
  it('Water attaque Fire, PV tombe à 0', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water, pow: 1000 });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 100 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas critique + buffs
  it('Fire attaque Earth, critique, buff Attack', () => {
    Math.random = () => 0.0;
    const attacker = makeHero({ element: HeroElement.Fire, crtr: 100, buffs: [Buff.Attack] });
    const defenders = [makeHero({ element: HeroElement.Earth, lp: 120 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas critique + buff défense
  it('Earth attaque Water, critique, défenseur buff Defense', () => {
    Math.random = () => 0.0;
    const attacker = makeHero({ element: HeroElement.Earth, crtr: 100 });
    const defenders = [makeHero({ element: HeroElement.Water, lp: 120, buffs: [Buff.Defense] })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas critique + buffs combinés
  it('Earth attaque Water, critique, attaquant Attack, défenseur Defense', () => {
    Math.random = () => 0.0;
    const attacker = makeHero({ element: HeroElement.Earth, crtr: 100, buffs: [Buff.Attack] });
    const defenders = [makeHero({ element: HeroElement.Water, lp: 120, buffs: [Buff.Defense] })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas où l'attaque ne fait rien (défenseur déjà à 0)
  it('Earth attaque Water, défenseur déjà à 0', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Earth });
    const defenders = [makeHero({ element: HeroElement.Water, lp: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas où tous les défenseurs sont du même élément que l'attaquant
  it('Fire attaque, tous les défenseurs sont Fire', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Fire });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 120 }), makeHero({ element: HeroElement.Fire, lp: 130 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas où tous les défenseurs sont d'un élément désavantagé
  it('Fire attaque, tous les défenseurs sont Water', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Fire });
    const defenders = [makeHero({ element: HeroElement.Water, lp: 120 }), makeHero({ element: HeroElement.Water, lp: 130 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas où tous les défenseurs sont d'un élément avantagé
  it('Fire attaque, tous les défenseurs sont Earth', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Fire });
    const defenders = [makeHero({ element: HeroElement.Earth, lp: 120 }), makeHero({ element: HeroElement.Earth, lp: 130 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas avec lethality
  it('Water attaque Fire avec lethality', () => {
    Math.random = () => 0.0; // Critique
    const attacker = makeHero({ element: HeroElement.Water, leth: 1000 });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 120 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas critique + lethality + buff Attack
  it('Fire attaque Earth, critique, lethality, buff Attack', () => {
    Math.random = () => 0.0;
    const attacker = makeHero({ element: HeroElement.Fire, crtr: 100, leth: 2000, buffs: [Buff.Attack] });
    const defenders = [makeHero({ element: HeroElement.Earth, lp: 120 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas avec défense très basse
  it('Earth attaque Water avec défense très basse', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Earth });
    const defenders = [makeHero({ element: HeroElement.Water, lp: 120, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas avec puissance très haute
  it('Water attaque Fire avec puissance très haute', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water, pow: 10000 });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 120 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas avec critique très bas
  it('Fire attaque Earth avec critique très bas', () => {
    Math.random = () => 0.99; // Pas de critique
    const attacker = makeHero({ element: HeroElement.Fire, crtr: 1 });
    const defenders = [makeHero({ element: HeroElement.Earth, lp: 120 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas avec critique très haut
  it('Earth attaque Water avec critique très haut', () => {
    Math.random = () => 0.0; // Critique
    const attacker = makeHero({ element: HeroElement.Earth, crtr: 100 });
    const defenders = [makeHero({ element: HeroElement.Water, lp: 120 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas avec buff Defense et défense très haute
  it('Water attaque Fire, défenseur Defense + défense très haute', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 120, def: 8000, buffs: [Buff.Defense] })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas avec buff Attack et puissance très haute
  it('Fire attaque Earth, attaquant Attack + puissance très haute', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Fire, pow: 5000, buffs: [Buff.Attack] });
    const defenders = [makeHero({ element: HeroElement.Earth, lp: 120 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas avec tous les buffs combinés
  it('Earth attaque Water, attaquant Attack, défenseur Defense, critique', () => {
    Math.random = () => 0.0;
    const attacker = makeHero({ element: HeroElement.Earth, crtr: 100, leth: 1500, buffs: [Buff.Attack] });
    const defenders = [makeHero({ element: HeroElement.Water, lp: 120, def: 3000, buffs: [Buff.Defense] })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas avec plusieurs défenseurs morts et vivants
  it('Water attaque, mélange de défenseurs morts et vivants', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water });
    const defenders = [
      makeHero({ element: HeroElement.Fire, lp: 0 }),
      makeHero({ element: HeroElement.Earth, lp: 110 }),
      makeHero({ element: HeroElement.Fire, lp: 0 }),
      makeHero({ element: HeroElement.Water, lp: 100 })
    ];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas avec choix de cible aléatoire (mock random pour cibler le troisième)
  it('Fire attaque, plusieurs cibles, cible le troisième', () => {
    Math.random = () => 0.5; // Pour cibler une cible spécifique
    const attacker = makeHero({ element: HeroElement.Fire });
    const defenders = [
      makeHero({ element: HeroElement.Earth, lp: 120 }),
      makeHero({ element: HeroElement.Water, lp: 110 }),
      makeHero({ element: HeroElement.Earth, lp: 130 })
    ];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas avec dégâts qui réduisent exactement à 0
  it('Water attaque Fire, dégâts exacts pour réduire à 0', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water, pow: 150 });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 100, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas avec dégâts qui dépassent les PV (doit être limité à 0)
  it('Water attaque Fire, dégâts dépassent les PV', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water, pow: 2000 });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 50 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas avec défense qui annule complètement les dégâts
  it('Fire attaque Earth, défense annule les dégâts', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Fire, pow: 100 });
    const defenders = [makeHero({ element: HeroElement.Earth, lp: 120, def: 7500 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas avec buff Defense qui réduit les dégâts à 0
  it('Earth attaque Water, buff Defense réduit dégâts à 0', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Earth, pow: 100 });
    const defenders = [makeHero({ element: HeroElement.Water, lp: 120, def: 6000, buffs: [Buff.Defense] })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas avec lethality très haute
  it('Water attaque Fire, lethality très haute', () => {
    Math.random = () => 0.0; // Critique
    const attacker = makeHero({ element: HeroElement.Water, leth: 10000 });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 120 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas avec tous les éléments en défense
  it('Fire attaque, tous les éléments en défense', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Fire });
    const defenders = [
      makeHero({ element: HeroElement.Fire, lp: 120 }),   // Égalité
      makeHero({ element: HeroElement.Water, lp: 110 }),  // Désavantage
      makeHero({ element: HeroElement.Earth, lp: 130 })   // Avantage
    ];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas avec un seul défenseur vivant
  it('Earth attaque, un seul défenseur vivant', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Earth });
    const defenders = [
      makeHero({ element: HeroElement.Water, lp: 0 }),
      makeHero({ element: HeroElement.Fire, lp: 120 })
    ];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas avec valeurs minimales
  it('Water attaque Fire avec valeurs minimales', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water, pow: 1, def: 0, leth: 0, crtr: 0 });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 1, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });

  // Cas avec valeurs maximales
  it('Fire attaque Earth avec valeurs maximales', () => {
    Math.random = () => 0.0; // Critique
    const attacker = makeHero({ element: HeroElement.Fire, pow: 9999, def: 9999, leth: 9999, crtr: 100 });
    const defenders = [makeHero({ element: HeroElement.Earth, lp: 9999, def: 9999 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result).toMatchSnapshot();
  });
}); 