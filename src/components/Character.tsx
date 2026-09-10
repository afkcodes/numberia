export function Character({
  name = 'Milo',
  className = '',
  outfit = 'scarf',
}: {
  name?: string;
  className?: string;
  outfit?: string;
}) {
  return (
    <svg
      className={`character ${className}`}
      viewBox="0 0 160 160"
      role="img"
      aria-label={`${name}, your ${name === 'Milo' ? 'fox' : name === 'Pip' ? 'dragon' : 'firefly'} friend`}
    >
      {name === 'Milo' ? (
        <>
          <path className="fox-dark" d="M32 103Q5 68 21 33Q53 38 63 81Z" />
          <path className="fox" d="M96 130Q145 140 148 84Q136 105 113 104Z" />
          <path className="cream" d="M148 84Q153 114 129 129L123 112Q139 103 148 84" />
          <path className="fox" d="M58 99Q98 92 113 128L115 144H44Q43 121 58 99" />
          <path className="cream" d="M68 106Q91 106 91 142H60Z" />
          <path
            className="fox"
            d="M40 69L35 18Q65 29 79 48Q98 29 129 23L124 79Q119 114 81 120Q38 109 40 69"
          />
          <path className="fox-inner" d="M43 34L48 66L67 52Z M116 38L96 53L120 66Z" />
          <path className="cream" d="M41 80Q58 73 80 96Q98 73 126 79Q121 110 81 119Q47 110 41 80" />
          <ellipse className="ink-fill" cx="62" cy="76" rx="4.5" ry="6" />
          <ellipse className="ink-fill" cx="104" cy="76" rx="4.5" ry="6" />
          <circle className="white-fill" cx="63" cy="74" r="1.4" />
          <circle className="white-fill" cx="105" cy="74" r="1.4" />
          <path className="ink-fill" d="M75 92Q82 88 88 92Q88 98 82 100Q77 98 75 92" />
          <path className="smile" d="M82 99V103Q88 109 94 102" />
          <ellipse className="cheek" cx="55" cy="89" rx="7" ry="4" />
          <ellipse className="cheek" cx="111" cy="89" rx="7" ry="4" />
          <path className="scarf" d="M51 111Q81 125 105 110L103 125Q77 135 53 120Z" />
          <path className="scarf" d="M94 120L111 128L96 146L87 126Z" />
        </>
      ) : name === 'Pip' ? (
        <>
          <path
            className="dragon-dark"
            d="M47 105Q13 97 15 73Q40 73 56 93M108 115Q143 136 147 89Q134 102 119 99"
          />
          <ellipse className="dragon" cx="81" cy="113" rx="40" ry="36" />
          <ellipse className="cream" cx="81" cy="120" rx="24" ry="24" />
          <path
            className="dragon"
            d="M49 60Q17 54 28 27Q51 32 59 47Q82 35 105 46Q119 22 142 31Q144 55 121 63Q139 112 83 113Q29 109 49 60"
          />
          <path className="dragon-dark" d="M74 44L78 24L89 39L99 26L103 45Z" />
          <ellipse className="ink-fill" cx="63" cy="76" rx="4" ry="6" />
          <ellipse className="ink-fill" cx="105" cy="76" rx="4" ry="6" />
          <path className="smile" d="M74 92Q84 101 94 91" />
          <ellipse className="cheek" cx="52" cy="90" rx="7" ry="4" />
          <ellipse className="cheek" cx="115" cy="90" rx="7" ry="4" />
        </>
      ) : (
        <>
          <ellipse className="wing" cx="52" cy="75" rx="25" ry="35" transform="rotate(-35 52 75)" />
          <ellipse
            className="wing"
            cx="110"
            cy="75"
            rx="25"
            ry="35"
            transform="rotate(35 110 75)"
          />
          <ellipse className="gold-fill" cx="81" cy="101" rx="30" ry="39" />
          <circle className="cream" cx="81" cy="63" r="30" />
          <path className="smile" d="M66 38L59 22M96 38L106 22" />
          <circle className="gold-fill" cx="58" cy="20" r="5" />
          <circle className="gold-fill" cx="107" cy="20" r="5" />
          <ellipse className="ink-fill" cx="69" cy="63" rx="3.5" ry="5" />
          <ellipse className="ink-fill" cx="94" cy="63" rx="3.5" ry="5" />
          <path className="smile" d="M74 76Q82 82 89 75" />
          <path className="cream" d="M58 100H105V111H57Z" />
        </>
      )}
      {outfit === 'bow' && (
        <g fill="var(--color-berry)" stroke="var(--color-lilac-ink)" strokeWidth="2">
          <path d="M81 121L59 110V135L81 126L103 135V110Z" />
          <circle cx="81" cy="123" r="5" />
        </g>
      )}
      {outfit === 'explorer-hat' && (
        <g fill="var(--color-toy-yellow)" stroke="var(--color-gold-ink)" strokeWidth="2">
          <path d="M55 42Q54 10 81 10Q108 10 109 42Z" />
          <path d="M40 43Q80 26 125 43Q89 61 40 43Z" />
          <path d="M56 34Q81 40 108 34" fill="none" stroke="var(--color-accent)" strokeWidth="6" />
        </g>
      )}
      {outfit === 'crown' && (
        <g fill="var(--color-toy-yellow)" stroke="var(--color-gold-ink)" strokeWidth="2">
          <path d="M56 39L48 13L68 24L82 7L98 24L116 13L107 39Z" />
          <path d="M78 30Q74 17 91 18Q93 31 78 30" fill="var(--color-dragon)" />
        </g>
      )}
    </svg>
  );
}
