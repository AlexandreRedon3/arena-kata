import { ArenaDamageCalculator } from './arena-damage-calculator';
import { Hero } from './model/hero';
import { HeroElement } from './model/hero-element';
import { Buff } from './model/buff';

describe('ArenaDamageCalculator - couverture minimale exhaustive', () => {
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

  // 1. Water attaque Fire (avantage)
  it('Water attaque Fire (avantage)', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water, pow: 100, def: 50 });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 100, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    // Water > Fire : +20% de dégâts
    // dmg = 100 * (1-0/7500) = 100
    // dmg = 100 + 100 * 20/100 = 120
    // lp = 100 - 120 = -20 → 0
    expect(result[0].lp).toBe(0);
  });

  // 2. Water attaque Water (égalité)
  it('Water attaque Water (égalité)', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water, pow: 100, def: 50 });
    const defenders = [makeHero({ element: HeroElement.Water, lp: 100, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    // Water = Water : pas de bonus
    // dmg = 100 * (1-0/7500) = 100
    // lp = 100 - 100 = 0
    expect(result[0].lp).toBe(0);
  });

  // 3. Water attaque Earth (désavantage)
  it('Water attaque Earth (désavantage)', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water, pow: 100, def: 50 });
    const defenders = [makeHero({ element: HeroElement.Earth, lp: 100, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    // Water < Earth : -20% de dégâts
    // dmg = 100 * (1-0/7500) = 100
    // dmg = 100 - 100 * 20/100 = 80
    // lp = 100 - 80 = 20
    expect(result[0].lp).toBe(20);
  });

  // 4. Fire attaque Earth (avantage)
  it('Fire attaque Earth (avantage)', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Fire, pow: 100, def: 50 });
    const defenders = [makeHero({ element: HeroElement.Earth, lp: 100, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    // Fire > Earth : +20% de dégâts
    // dmg = 100 * (1-0/7500) = 100
    // dmg = 100 + 100 * 20/100 = 120
    // lp = 100 - 120 = -20 → 0
    expect(result[0].lp).toBe(0);
  });

  // 5. Earth attaque Water (avantage)
  it('Earth attaque Water (avantage)', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Earth, pow: 100, def: 50 });
    const defenders = [makeHero({ element: HeroElement.Water, lp: 100, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    // Earth > Water : +20% de dégâts
    // dmg = 100 * (1-0/7500) = 100
    // dmg = 100 + 100 * 20/100 = 120
    // lp = 100 - 120 = -20 → 0
    expect(result[0].lp).toBe(0);
  });

  // 6. Critique (crtr = 100)
  it('Critique (crtr = 100)', () => {
    Math.random = () => 0.0; // Critique garanti
    const attacker = makeHero({ element: HeroElement.Water, pow: 100, crtr: 100, leth: 0 });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 100, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    // Critique : dmg = (100 + (0.5 + 0/5000) * 100) * (1-0/7500) = 150
    // Avantage : dmg = 150 + 150 * 20/100 = 180
    // lp = 100 - 180 = -80 → 0
    expect(result[0].lp).toBe(0);
  });

  // 7. Buff Attack
  it('Buff Attack', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water, pow: 100, buffs: [Buff.Attack] });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 100, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    // Base dmg = 100 * (1-0/7500) = 100
    // Buff Attack = 100 * 0.25 * (1-0/7500) = 25
    // Total = 100 + 25 = 125
    // Avantage : dmg = 125 + 125 * 20/100 = 150
    // lp = 100 - 150 = -50 → 0
    expect(result[0].lp).toBe(0);
  });

  // 8. Buff Defense
  it('Buff Defense', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water, pow: 100 });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 100, def: 0, buffs: [Buff.Defense] })];
    const result = calculator.computeDamage(attacker, defenders);
    // Base dmg = 100 * (1-0/7500) = 100
    // Buff Defense : dmg = 100 / (1-0/7500) * (1-0/7500 - 0.25) = 100 * 0.75 = 75
    // Avantage : dmg = 75 + 75 * 20/100 = 90
    // lp = 100 - 90 = 10
    expect(result[0].lp).toBe(10);
  });

  // 9. Tous les défenseurs sont morts
  it('Tous les défenseurs sont morts', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 0 }), makeHero({ element: HeroElement.Earth, lp: 0 })];
    expect(() => calculator.computeDamage(attacker, defenders)).toThrow();
  });

  // 10. Défenseur avec def = 7500 (dmg = 0)
  it('Défenseur avec def = 7500 (dmg = 0)', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water, pow: 100 });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 100, def: 7500 })];
    const result = calculator.computeDamage(attacker, defenders);
    // dmg = 100 * (1-7500/7500) = 100 * 0 = 0
    expect(result[0].lp).toBe(100);
  });

  // 11. Dégâts > lp (lp tombe à 0)
  it('Dégâts > lp (lp tombe à 0)', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water, pow: 1000 });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 10, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    // dmg = 1000 * (1-0/7500) = 1000
    // Avantage : dmg = 1000 + 1000 * 20/100 = 1200
    // lp = 10 - 1200 = -1190 → 0
    expect(result[0].lp).toBe(0);
  });

  // 12. Un seul défenseur vivant
  it('Un seul défenseur vivant', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water, pow: 100 });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 0 }), makeHero({ element: HeroElement.Earth, lp: 100, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    // Attaque le second (Earth) : désavantage
    // dmg = 100 * (1-0/7500) = 100
    // dmg = 100 - 100 * 20/100 = 80
    // lp = 100 - 80 = 20
    expect(result[1].lp).toBe(20);
  });

  // Earth attaque Earth (égalité, branche eq.push)
  it('Earth attaque Earth (égalité)', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Earth, pow: 100 });
    const defenders = [makeHero({ element: HeroElement.Earth, lp: 100, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    // Earth = Earth : pas de bonus
    // dmg = 100 * (1-0/7500) = 100
    // lp = 100 - 100 = 0
    expect(result[0].lp).toBe(0);
  });

  // Buff Attack + Buff Defense (branche buffs combinés)
  it('Buff Attack + Buff Defense', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Water, pow: 100, buffs: [Buff.Attack] });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 100, def: 0, buffs: [Buff.Defense] })];
    const result = calculator.computeDamage(attacker, defenders);
    // Base dmg = 100 * (1-0/7500) = 100
    // Buff Attack = 100 * 0.25 * (1-0/7500) = 25
    // Total avant Defense = 100 + 25 = 125
    // Buff Defense : dmg = 125 / (1-0/7500) * (1-0/7500 - 0.25) = 125 * 0.75 = 93.75
    // Avantage : dmg = 93.75 + 93.75 * 20/100 = 112.5
    // lp = 100 - 112.5 = -12.5 → 0
    expect(result[0].lp).toBe(0);
  });

  // Earth attaque Fire (désavantage, ligne 31)
  it('Earth attaque Fire (désavantage)', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Earth, pow: 100 });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 100, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    // Earth < Fire : -20% de dégâts
    // dmg = 100 * (1-0/7500) = 100
    // dmg = 100 - 100 * 20/100 = 80
    // lp = 100 - 80 = 20
    expect(result[0].lp).toBe(20);
  });

  // Earth attaque Fire avec buff Defense (ligne 64)
  it('Earth attaque Fire avec buff Defense', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Earth, pow: 100 });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 100, def: 0, buffs: [Buff.Defense] })];
    const result = calculator.computeDamage(attacker, defenders);
    // Base dmg = 100 * (1-0/7500) = 100
    // Buff Defense : dmg = 100 / (1-0/7500) * (1-0/7500 - 0.25) = 100 * 0.75 = 75
    // Désavantage : dmg = 75 - 75 * 20/100 = 60
    // lp = 100 - 60 = 40
    expect(result[0].lp).toBe(40);
  });

  // Earth attaque Fire (branche dis)
  it('Earth attaque Fire (branche dis)', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Earth, pow: 100 });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 100, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result[0].lp).toBe(20);
  });

  it('Earth attaque Water (branche adv)', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Earth, pow: 100 });
    const defenders = [makeHero({ element: HeroElement.Water, lp: 100, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result[0].lp).toBe(0);
  });

  it('Earth attaque Earth (branche eq)', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Earth, pow: 100 });
    const defenders = [makeHero({ element: HeroElement.Earth, lp: 100, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result[0].lp).toBe(0);
  });

  it('Buff Attack sur critique', () => {
    Math.random = () => 0.0;
    const attacker = makeHero({ element: HeroElement.Water, pow: 100, crtr: 100, buffs: [Buff.Attack] });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 100, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result[0].lp).toBe(0);
  });

  it('Buff Attack sans critique', () => {
    Math.random = () => 0.9;
    const attacker = makeHero({ element: HeroElement.Water, pow: 100, crtr: 0, buffs: [Buff.Attack] });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 100, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result[0].lp).toBe(0);
  });

  it('Buff Defense sur critique', () => {
    Math.random = () => 0.0;
    const attacker = makeHero({ element: HeroElement.Water, pow: 100, crtr: 100 });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 100, def: 0, buffs: [Buff.Defense] })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result[0].lp).toBe(0);
  });

  it('Buff Defense sans critique', () => {
    Math.random = () => 0.9;
    const attacker = makeHero({ element: HeroElement.Water, pow: 100, crtr: 0 });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 100, def: 0, buffs: [Buff.Defense] })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result[0].lp).toBe(10);
  });

  it('Buff Attack + Buff Defense sur critique', () => {
    Math.random = () => 0.0;
    const attacker = makeHero({ element: HeroElement.Water, pow: 100, crtr: 100, buffs: [Buff.Attack] });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 100, def: 0, buffs: [Buff.Defense] })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result[0].lp).toBe(0);
  });

  it('Buff Attack + Buff Defense sans critique', () => {
    Math.random = () => 0.9;
    const attacker = makeHero({ element: HeroElement.Water, pow: 100, crtr: 0, buffs: [Buff.Attack] });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 100, def: 0, buffs: [Buff.Defense] })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result[0].lp).toBe(0);
  });

  // Earth attaque avec défenseurs morts (lp=0)
  it('Earth attaque avec défenseurs morts (lp=0)', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Earth, pow: 100 });
    const defenders = [
      makeHero({ element: HeroElement.Fire, lp: 0, def: 0 }),    // mort
      makeHero({ element: HeroElement.Water, lp: 100, def: 0 }), // vivant
      makeHero({ element: HeroElement.Earth, lp: 0, def: 0 })    // mort
    ];
    const result = calculator.computeDamage(attacker, defenders);
    // Seul Water est vivant, il doit être attaqué (avantage)
    expect(result[1].lp).toBe(0);
    expect(result[0].lp).toBe(0);
    expect(result[2].lp).toBe(0);
  });

  // Earth attaque Water (avantage, adv)
  it('Earth attaque Water (avantage, adv)', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Earth, pow: 100 });
    const defenders = [makeHero({ element: HeroElement.Water, lp: 100, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result[0].lp).toBe(0); // Water attaqué (avantage)
  });

  // Earth attaque Earth (égalité, eq)
  it('Earth attaque Earth (égalité, eq)', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Earth, pow: 100 });
    const defenders = [makeHero({ element: HeroElement.Earth, lp: 100, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result[0].lp).toBe(0); // Earth attaqué (égalité)
  });

  // Earth attaque Fire (désavantage, dis)
  it('Earth attaque Fire (désavantage, dis)', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Earth, pow: 100 });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 100, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    expect(result[0].lp).toBe(20); // Fire attaqué (désavantage)
  });

  // Fire attaque Fire (égalité, eq)
  it('Fire attaque Fire (égalité, eq)', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Fire, pow: 100 });
    const defenders = [makeHero({ element: HeroElement.Fire, lp: 100, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    // Fire = Fire : pas de bonus
    // dmg = 100 * (1-0/7500) = 100
    // lp = 100 - 100 = 0
    expect(result[0].lp).toBe(0);
  });

  // Fire attaque Water (désavantage, dis)
  it('Fire attaque Water (désavantage, dis)', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Fire, pow: 100 });
    const defenders = [makeHero({ element: HeroElement.Water, lp: 100, def: 0 })];
    const result = calculator.computeDamage(attacker, defenders);
    // Fire < Water : -20% de dégâts
    // dmg = 100 * (1-0/7500) = 100
    // dmg = 100 - 100 * 20/100 = 80
    // lp = 100 - 80 = 20
    expect(result[0].lp).toBe(20);
  });

  // Fire attaque avec défenseurs morts (lp=0)
  it('Fire attaque avec défenseurs morts (lp=0)', () => {
    Math.random = () => 0.1;
    const attacker = makeHero({ element: HeroElement.Fire, pow: 100 });
    const defenders = [
      makeHero({ element: HeroElement.Water, lp: 0, def: 0 }), // mort
      makeHero({ element: HeroElement.Earth, lp: 100, def: 0 }) // vivant
    ];
    const result = calculator.computeDamage(attacker, defenders);
    // Seul Earth est vivant, il doit être attaqué (avantage)
    expect(result[1].lp).toBe(0);
    expect(result[0].lp).toBe(0);
  });
}); 