function Bird({ variant }: { variant: number }) {
  return <div className={`storybook-bird bird-flight-${variant}`}><svg viewBox="0 0 80 52">
    <g className="bird-wing bird-wing-far"><path d="M38 27Q26 0 15 7Q18 24 33 32Z" fill="var(--color-blue-ink)" opacity=".65" /></g>
    <path d="M25 29L6 23L11 37L30 36Z" fill="var(--bird-feather)" />
    <ellipse cx="40" cy="30" rx="22" ry="13" fill="var(--bird-feather)" />
    <path d="M25 35Q42 48 58 34Q46 30 25 35Z" fill="var(--color-cream)" />
    <g className="bird-wing"><path d="M37 28Q17 3 10 12Q16 30 33 34Z" fill="var(--bird-wing)" /><path d="M15 15L31 30M19 13L35 28" stroke="var(--bird-feather)" strokeWidth="2" fill="none" strokeLinecap="round" /></g>
    <circle cx="57" cy="23" r="11" fill="var(--bird-feather)" />
    <path d="M65 25L77 28L65 31Z" fill="var(--color-gold)" />
    <circle cx="60" cy="21" r="2.3" fill="var(--color-ink)" /><circle cx="60.7" cy="20.3" r=".7" fill="var(--color-white)" />
    <path d="M39 42L42 45M45 41L48 44" stroke="var(--color-gold-ink)" strokeWidth="2" strokeLinecap="round" />
  </svg></div>;
}

/** A quiet, illustrated world behind the adventure, drawn with native SVG. */
export default function StorybookBackdrop() {
  return <div className="storybook-backdrop" aria-hidden="true">
    <svg className="storybook-sky" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
      <defs><g id="storybook-cloud"><path d="M0 47C-16 21 7 5 28 16C31-9 75-12 86 13C110-3 139 11 137 34C169 32 173 64 145 66H15C1 66-7 57 0 47Z" /></g><g id="storybook-flower"><path d="M0 0Q-4-28 3-47" className="storybook-stem" /><path d="M0-14Q-21-34-22-15Q-13-5 0-9M1-25Q23-45 21-24Q14-15 1-20" className="storybook-leaf" /><g className="storybook-petals"><ellipse cy="-57" ry="12" rx="8" /><ellipse cx="12" cy="-48" ry="8" rx="12" /><ellipse cx="8" cy="-35" ry="12" rx="8" /><ellipse cx="-8" cy="-35" ry="12" rx="8" /><ellipse cx="-12" cy="-48" ry="8" rx="12" /></g><circle cy="-46" r="8" className="storybook-flower-heart" /></g></defs>

      <g className="storybook-clouds"><use href="#storybook-cloud" x="290" y="100" /><use href="#storybook-cloud" x="1040" y="250" /><use href="#storybook-cloud" x="640" y="490" /><use href="#storybook-cloud" x="1430" y="590" /></g>
      <g className="storybook-kite" transform="translate(1200 400)"><path d="M0 0Q-65 76-20 130T-53 207" className="storybook-string" /><path d="M0-80L35-38L0 0L-35-38Z" className="storybook-kite-body" /><path d="M0-80V0L35-38Z" className="storybook-kite-half" /><path d="M-21 68L-34 54L-36 77ZM-22 69L-7 58L-9 83Z" className="storybook-kite-body" /></g>
      <path d="M0 797Q231 637 506 806T1020 795T1600 765V1000H0Z" className="storybook-hill-far" />
      <path d="M0 906Q366 735 679 902T1274 861T1600 892V1000H0Z" className="storybook-hill-near" />
      <g className="storybook-garden"><use href="#storybook-flower" transform="translate(275 973) rotate(-9) scale(1.1)" /><use href="#storybook-flower" transform="translate(313 992) rotate(11) scale(.8)" /><use href="#storybook-flower" transform="translate(1480 949) rotate(8) scale(1.2)" /><use href="#storybook-flower" transform="translate(1530 976) rotate(-8)" /><path d="M1430 1000Q1407 961 1398 984M1430 1000Q1440 945 1450 964M350 1000Q344 963 332 977" className="storybook-stem" /></g>
      <g className="storybook-butterfly"><path d="M1540 460C1492 412 1500 493 1540 472C1577 420 1595 483 1540 472" className="storybook-kite-body" /><path d="M1540 457V477" className="storybook-stem" /></g>
    </svg>
    {[1, 2, 3, 4].map(variant => <Bird key={variant} variant={variant} />)}
  </div>;
}
