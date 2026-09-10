import type { PlaygroundId } from './themes';

/** Lightweight storybook art also keeps the chapter recognizable without WebGL. */
export default function ChapterIllustration({ id }: { id: PlaygroundId }) {
  return (
    <svg className="chapter-illustration" viewBox="0 0 520 220" fill="none" aria-hidden="true">
      <path d="M0 170Q100 110 220 169T520 140V220H0Z" fill="var(--world-hill)" />
      <path d="M0 198Q130 153 290 190T520 171V220H0Z" fill="var(--world-hill-front)" />
      {[30, 470].map((x) => (
        <g key={x}>
          <path d={`M${x} 175v-60`} stroke="#9e805f" strokeWidth="11" strokeLinecap="round" />
          <ellipse cx={x} cy="102" rx="35" ry="46" fill="var(--world-tree)" />
        </g>
      ))}
      {id === 'moonberry' && (
        <g>
          <path
            d="M132 181V92Q208 19 284 92V181"
            stroke="#fff0cc"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {[150, 178, 207, 236, 265].map((x, i) => (
            <g key={x}>
              <path
                d={`M${x} ${83 - (2 - Math.abs(2 - i)) * 8}v26`}
                stroke="#ae895c"
                strokeWidth="2"
              />
              <ellipse cx={x} cy={119 - (2 - Math.abs(2 - i)) * 8} rx="13" ry="15" fill="#b197d5" />
              <ellipse
                cx={x + 6}
                cy={104 - (2 - Math.abs(2 - i)) * 8}
                rx="7"
                ry="4"
                fill="#689679"
                transform={`rotate(-25 ${x + 6} 104)`}
              />
              <circle cx={x - 4} cy={114 - (2 - Math.abs(2 - i)) * 8} r="3" fill="#e6d8f8" />
            </g>
          ))}
          <path
            d="M100 181h41M274 181h39"
            stroke="#a7b67a"
            strokeWidth="14"
            strokeLinecap="round"
          />
        </g>
      )}
      {id === 'bridge' && (
        <g>
          <path d="M224 139Q186 161 235 188T227 220H370Q291 173 330 139Z" fill="#84cdd0" />
          <path d="M123 166Q226 118 338 164" stroke="#bf905f" strokeWidth="13" />
          {[140, 172, 204, 236, 268, 300, 330].map((x, i) => (
            <path
              key={x}
              d={`M${x} ${135 - Math.sin((i / 6) * Math.PI) * 21}v37`}
              stroke="#c4a072"
              strokeWidth="6"
              strokeLinecap="round"
            />
          ))}
          <path
            d="M134 132Q230 89 337 135"
            stroke="#e6c799"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M261 186q14-4 28 0M286 207q15-4 28 0"
            stroke="#d6f1e6"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      )}
      {id === 'picnic' && (
        <g>
          <path d="M125 180V101M300 180V101" stroke="#b49165" strokeWidth="7" />
          <path d="M111 103L154 59H274L317 103Z" fill="#ffedce" />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M${154 + i * 30} 59h15l${13 + i * 2} 44h-25Z`} fill="#e5a18a" />
          ))}
          <path
            d="M159 151h111M177 151v31M253 151v31"
            stroke="#b18b5b"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path d="M157 144h116v11H157Z" fill="#f5c679" />
          {[173, 211, 249].map((x) => (
            <g key={x}>
              <path d={`M${x - 8} 139q-3-18 8-18t8 18`} stroke="#be9461" strokeWidth="3" />
              <path d={`M${x - 12} 129h24l-3 14h-18Z`} fill="#cba36e" />
            </g>
          ))}
          <path d="M85 83Q214 142 350 77" stroke="#fff0cb" strokeWidth="2" />
          {[116, 155, 194, 233, 272, 311].map((x, i) => (
            <path
              key={x}
              d={`M${x - 8} ${100 + Math.sin((i / 5) * Math.PI) * 11}h16l-8 15Z`}
              fill={['#b6a0cf', '#90bdae', '#e5bd70'][i % 3]}
            />
          ))}
        </g>
      )}
      {id === 'firefly' && (
        <g>
          <path d="M128 171l17-85 59-9 26 35 59-17 28 76Z" fill="#789297" />
          <path d="M198 84h35l12 103h-60Z" fill="#9ad6dc" />
          <path
            d="M210 98l-4 75M225 109l5 63"
            stroke="#d0f2e7"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <ellipse cx="217" cy="186" rx="65" ry="14" fill="#82bbcc" />
          <path d="M111 32a25 25 0 1 0 26 36 26 26 0 0 1-26-36" fill="#ffe6a0" />
          {[
            [122, 127],
            [299, 72],
            [330, 140],
            [269, 159],
            [165, 53],
            [346, 37],
            [86, 168],
          ].map(([x, y]) => (
            <g key={x}>
              <circle cx={x} cy={y} r="8" fill="#ffdc85" opacity=".15" />
              <circle cx={x} cy={y} r="3" fill="#ffe5a1" />
            </g>
          ))}
        </g>
      )}
      {id === 'wishing' && (
        <g>
          <path
            d="M192 183q23-33 14-79h25q-10 54 21 79M215 120l-41-28M222 111l36-27"
            fill="#ae8b65"
            stroke="#ae8b65"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M117 83c-20-44 37-64 57-46 13-42 78-39 91-5 55-13 79 46 45 69-3 35-66 30-79 15-31 25-95 8-96-16-11 0-18-9-18-17"
            fill="#9fbea1"
          />
          <path d="M204 181v-25a13 13 0 0 1 26 0v25" fill="#edca87" />
          <circle cx="223" cy="166" r="2" fill="#956f49" />
          {[
            [154, 84],
            [185, 63],
            [220, 48],
            [253, 66],
            [282, 89],
          ].map(([x, y]) => (
            <path key={x} d={`M${x} ${y - 10}q17 7 0 24q-16-12 0-24`} fill="#f8d888" />
          ))}
        </g>
      )}
      {[
        [70, 187],
        [355, 187],
        [391, 169],
      ].map(([x, y]) => (
        <g key={x}>
          <path d={`M${x} ${y}v-9`} stroke="#719176" strokeWidth="2" />
          <circle cx={x} cy={y - 13} r="4" fill="#f4c7a7" />
          <circle cx={x} cy={y - 13} r="1.5" fill="#f1d679" />
        </g>
      ))}
    </svg>
  );
}
