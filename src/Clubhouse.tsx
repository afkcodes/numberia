import { ArrowRight, Check, Gem, Heart, Home, Paintbrush, Sparkles } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { playSound, speak } from './audio';
import { roomItems, type RoomSlot } from './clubhouse';
import { Character } from './components';
import type { Save } from './game';
import { captureProp } from './propFlight';

export function Decoration({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 160 140" aria-hidden="true" className={`room-decoration art-${id}`}>
      {id.includes('rug') ? (
        <>
          <ellipse
            cx="80"
            cy="83"
            rx="70"
            ry="39"
            fill={`var(--color-${id === 'star-rug' ? 'lilac' : id === 'rainbow-rug' ? 'peach' : 'mint'})`}
            stroke={`var(--color-${id === 'star-rug' ? 'toy-lilac-shadow' : id === 'rainbow-rug' ? 'toy-peach-shadow' : 'toy-green-shadow'})`}
            strokeWidth="5"
          />
          <ellipse
            cx="80"
            cy="83"
            rx="58"
            ry="28"
            fill="none"
            stroke="var(--color-cream)"
            strokeWidth="3"
            strokeDasharray="5 5"
          />
          {id === 'star-rug' ? (
            <path
              d="M80 57L88 75L110 77L94 90L99 108L80 99L61 108L66 90L50 77L72 75Z"
              fill="var(--color-toy-yellow)"
            />
          ) : id === 'rainbow-rug' ? (
            <g fill="none" strokeWidth="7">
              <path d="M46 91A34 26 0 0 1 114 91" stroke="var(--color-coral)" />
              <path d="M55 91A25 19 0 0 1 105 91" stroke="var(--color-toy-yellow)" />
              <path d="M64 91A16 12 0 0 1 96 91" stroke="var(--color-dragon)" />
            </g>
          ) : (
            <>
              <path d="M48 95Q55 48 113 68Q111 111 48 95" fill="var(--color-dragon)" />
              <path d="M47 99L102 73" stroke="var(--color-accent)" strokeWidth="3" />
            </>
          )}
        </>
      ) : id === 'mushroom-seat' ? (
        <>
          <ellipse cx="80" cy="121" rx="42" ry="8" fill="var(--color-shadow-strong)" />
          <path
            d="M62 69L54 119Q80 134 106 119L99 69"
            fill="var(--color-cream)"
            stroke="var(--color-toy-peach-shadow)"
            strokeWidth="3"
          />
          <path d="M16 77Q22 12 80 13Q136 17 146 77Q80 105 16 77" fill="var(--color-coral)" />
          <g fill="var(--color-cream)">
            <ellipse cx="52" cy="45" rx="11" ry="8" />
            <ellipse cx="104" cy="41" rx="12" ry="9" />
            <ellipse cx="82" cy="73" rx="13" ry="8" />
            <circle cx="29" cy="70" r="7" />
            <circle cx="128" cy="69" r="7" />
          </g>
        </>
      ) : id === 'reading-chair' ? (
        <>
          <path
            d="M42 105V131M118 105V131"
            stroke="var(--color-orange-ink)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <rect
            x="34"
            y="15"
            width="93"
            height="99"
            rx="30"
            fill="var(--color-dragon)"
            stroke="var(--color-dragon-dark)"
            strokeWidth="4"
          />
          <rect x="26" y="78" width="110" height="35" rx="15" fill="var(--color-mint)" />
          <path
            d="M32 86V62M128 86V62"
            stroke="var(--color-dragon-dark)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <rect
            x="61"
            y="47"
            width="40"
            height="34"
            rx="9"
            fill="var(--color-toy-yellow)"
            transform="rotate(-12 80 64)"
          />
          <path d="M78 53L79 73M69 64L89 62" stroke="var(--color-gold)" strokeWidth="3" />
        </>
      ) : ['daisies', 'sunflowers', 'moonflowers'].includes(id) ? (
        <>
          {[
            { x: 39, y: 63 },
            { x: 80, y: 37 },
            { x: 122, y: 58 },
          ].map((f, i) => (
            <g key={i}>
              <path
                d={`M${f.x} ${f.y}Q${f.x - 7} 103 ${f.x + 1} 121`}
                stroke="var(--color-accent)"
                strokeWidth="5"
                fill="none"
              />
              <path
                d={`M${f.x} 99Q${f.x - 26} 76 ${f.x - 24} 98Q${f.x - 13} 113 ${f.x} 106M${f.x} 91Q${f.x + 25} 69 ${f.x + 25} 91Q${f.x + 13} 104 ${f.x} 98`}
                fill="var(--color-dragon)"
              />
              <g transform={`translate(${f.x} ${f.y})`}>
                <g className="club-bloom">
                  {Array.from({ length: 8 }, (_, n) => (
                    <ellipse
                      key={n}
                      cx="0"
                      cy="-17"
                      rx="8"
                      ry="14"
                      transform={`rotate(${n * 45})`}
                      fill={`var(--color-${id === 'daisies' ? 'cream' : id === 'sunflowers' ? 'toy-yellow' : 'berry'})`}
                    />
                  ))}
                  <circle
                    r="12"
                    fill={`var(--color-${id === 'sunflowers' ? 'orange-ink' : 'gold'})`}
                  />
                  <circle cx="-4" cy="-2" r="1.5" fill="var(--color-ink)" />
                  <circle cx="4" cy="-2" r="1.5" fill="var(--color-ink)" />
                  <path d="M-4 4Q0 8 4 4" stroke="var(--color-ink)" fill="none" strokeWidth="1.5" />
                </g>
              </g>
            </g>
          ))}
          <path
            d="M18 122Q80 108 143 122"
            stroke="var(--color-toy-green-shadow)"
            strokeWidth="12"
            strokeLinecap="round"
          />
        </>
      ) : id === 'swing' ? (
        <>
          <path
            d="M31 129L49 17H119L140 129M42 19H127"
            stroke="var(--color-orange-ink)"
            strokeWidth="9"
            fill="none"
            strokeLinecap="round"
          />
          <g className="club-swing">
            <path d="M64 22V94M107 22V94" stroke="var(--color-gold-ink)" strokeWidth="3" />
            <rect x="52" y="91" width="67" height="12" rx="6" fill="var(--color-toy-yellow)" />
          </g>
        </>
      ) : id === 'birdhouse' ? (
        <>
          <path d="M81 81V133" stroke="var(--color-orange-ink)" strokeWidth="7" />
          <path d="M41 46L80 15L120 46V101H41Z" fill="var(--color-toy-yellow)" />
          <path
            d="M28 48L80 9L132 48"
            stroke="var(--color-coral)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="81" cy="59" r="14" fill="var(--color-orange-ink)" />
          <path
            d="M63 86H97"
            stroke="var(--color-fox-dark)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <g className="club-bird">
            <ellipse cx="111" cy="93" rx="15" ry="10" fill="var(--color-blue-ink)" />
            <circle cx="119" cy="86" r="8" fill="var(--color-dragon)" />
            <circle cx="121" cy="84" r="1.5" fill="var(--color-ink)" />
            <path d="M126 85L134 90L126 91" fill="var(--color-gold)" />
          </g>
        </>
      ) : id === 'pinwheel' ? (
        <>
          <path d="M80 62V131" stroke="var(--color-orange-ink)" strokeWidth="5" />
          <g className="club-pinwheel" style={{ transformOrigin: '80px 61px' }}>
            {['coral', 'toy-yellow', 'dragon', 'berry'].map((c, i) => (
              <path
                key={c}
                d="M80 61L38 59L56 17L80 61"
                transform={`rotate(${i * 90} 80 61)`}
                fill={`var(--color-${c})`}
              />
            ))}
            <circle cx="80" cy="61" r="6" fill="var(--color-cream)" />
          </g>
        </>
      ) : (
        <Character outfit={id} />
      )}
    </svg>
  );
}

function Cottage() {
  return (
    <svg className="club-cottage" viewBox="0 0 780 570" aria-hidden="true">
      <path d="M0 200Q170 110 365 205T780 171V570H0" fill="var(--color-mint)" />
      <path d="M0 395Q227 314 485 411T780 367V570H0" fill="var(--color-hero)" />
      <path d="M324 485Q357 510 368 570H539Q475 511 449 481" fill="var(--color-cream)" />
      <g stroke="var(--color-orange-ink)" strokeWidth="5" strokeLinejoin="round">
        <path d="M104 172L377 38L652 172V419L380 490L104 419Z" fill="var(--color-cream)" />
        <path d="M104 172L377 38L652 172H104Z" fill="var(--color-peach)" />
        <path d="M104 172V419L380 490V244Z" fill="var(--color-gold-pale)" />
        <path d="M380 244L652 172V419L380 490Z" fill="var(--color-peach)" />
        <path d="M104 419L380 350L652 419L380 490Z" fill="var(--color-fox-inner)" />
        <path
          d="M89 179L377 27L666 179"
          fill="none"
          stroke="var(--color-fox-dark)"
          strokeWidth="24"
          strokeLinecap="round"
        />
      </g>
      <g stroke="var(--color-fox-dark)" strokeWidth="5">
        <path d="M213 193L309 217V309L213 285Z" fill="var(--color-blue)" />
        <path d="M262 205V298M213 237L309 261" />
        <path d="M446 219L541 194V285L446 310Z" fill="var(--color-blue)" />
        <path d="M493 206V298M446 263L541 238" />
      </g>
      <path d="M126 178Q377 280 634 178" stroke="var(--color-accent)" strokeWidth="2" fill="none" />
      {[155, 218, 281, 344, 407, 470, 533, 596].map((x, i) => (
        <path
          key={x}
          d={`M${x} ${188 + Math.sin(((x - 126) / 508) * Math.PI) * 40}l10 23 12-19`}
          fill={`var(--color-${['coral', 'toy-yellow', 'dragon', 'berry'][i % 4]})`}
        />
      ))}
      <rect
        x="305"
        y="104"
        width="147"
        height="46"
        rx="12"
        fill="var(--color-mint)"
        stroke="var(--color-toy-green-shadow)"
        strokeWidth="3"
      />
      <text
        x="378"
        y="133"
        textAnchor="middle"
        fill="var(--color-accent)"
        fontSize="20"
        fontFamily="var(--font-display)"
        fontWeight="900"
      >
        Milo & friends
      </text>
      <path
        d="M571 291L623 277M570 338L624 324"
        stroke="var(--color-orange-ink)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <g fill="var(--color-berry)">
        <path d="M578 286V262L588 259V284Z" />
        <path d="M600 281V257L610 254V279Z" />
      </g>
      <path d="M582 334V310L614 302V326Z" fill="var(--color-dragon)" />
      <g fill="var(--color-accent)">
        <path d="M107 173Q71 244 105 354Q128 383 97 421Q144 359 127 318Q108 237 132 188" />
        <ellipse cx="104" cy="233" rx="17" ry="9" transform="rotate(-35 104 233)" />
        <ellipse cx="124" cy="278" rx="18" ry="10" transform="rotate(30 124 278)" />
        <ellipse cx="111" cy="373" rx="21" ry="11" transform="rotate(-25 111 373)" />
      </g>
    </svg>
  );
}
function Cat({ happy }: { happy: boolean }) {
  return (
    <svg
      viewBox="0 0 150 130"
      aria-hidden="true"
      className={happy ? 'club-cat is-happy' : 'club-cat'}
    >
      <path
        className="club-cat-tail"
        d="M99 92Q145 104 133 54"
        fill="none"
        stroke="var(--color-muted)"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <ellipse cx="77" cy="97" rx="34" ry="24" fill="var(--color-rule-dark)" />
      <ellipse cx="76" cy="100" rx="18" ry="17" fill="var(--color-cream)" />
      <path
        d="M38 49L36 14L66 35Q80 28 94 34L117 16L117 57Q118 85 79 87Q38 83 38 49"
        fill="var(--color-rule-dark)"
      />
      <path d="M43 24L45 46L59 37M110 27L98 40L111 49" fill="var(--color-cheek)" />
      <path
        d="M70 34L75 45L80 35L84 45L89 34"
        stroke="var(--color-muted)"
        strokeWidth="4"
        fill="none"
      />
      <path
        d="M54 59Q60 51 66 59M91 59Q97 51 103 59"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M74 65L83 65L79 71Z" fill="var(--color-coral)" />
      <path
        d="M79 70Q76 79 70 73M79 70Q82 79 88 73M47 69L28 64M47 75L26 76M110 69L132 64M110 75L135 76"
        stroke="var(--color-ink)"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="56" cy="116" rx="14" ry="7" fill="var(--color-muted)" />
      <ellipse cx="96" cy="116" rx="14" ry="7" fill="var(--color-muted)" />
    </svg>
  );
}

const tabs: { name: string; slots: RoomSlot[] }[] = [
  { name: 'Cozy corners', slots: ['rug', 'seat'] },
  { name: 'My garden', slots: ['flowers'] },
  { name: 'Dress-up', slots: ['outfit'] },
  { name: 'Playtime', slots: ['play'] },
];
export default function Clubhouse({
  save,
  onChoose,
  onName,
  onAdventure,
}: {
  save: Save;
  onChoose: (id: string) => void;
  onName: (name: string) => void;
  onAdventure: () => void;
}) {
  const [tab, setTab] = useState(0),
    [message, setMessage] = useState('Your cozy corner of Numberia. Make yourself at home!');
  const [petName, setPetName] = useState(save.clubhouse.petName),
    [petHappy, setPetHappy] = useState(false);
  const equipped = save.clubhouse.equipped;
  const host = useRef<HTMLElement>(null),
    room = useRef<HTMLDivElement>(null);
  const delivery = useRef<{
      id: string;
      slot: RoomSlot;
      flight: ReturnType<typeof captureProp>;
    } | null>(null),
    cancelFlight = useRef<(() => void) | null>(null);
  const [delivering, setDelivering] = useState(''),
    [arrival, setArrival] = useState('');
  useEffect(() => () => cancelFlight.current?.(), []);
  useLayoutEffect(() => {
    const next = delivery.current;
    if (!next) return;
    delivery.current = null;
    if (equipped[next.slot] !== next.id) {
      setDelivering('');
      return;
    }
    const destination = room.current?.querySelector(`[data-room-slot="${next.slot}"]`) || null;
    const land = () => {
      setArrival(next.id);
      setDelivering('');
      setPetHappy(true);
      const item = roomItems.find((i) => i.id === next.id)!;
      setMessage(`${item.name}! ${item.detail}`);
      if (save.sound) playSound('berry');
    };
    if (next.flight) cancelFlight.current = next.flight(destination, land);
    else land();
  }, [equipped, delivering, save.sound]);
  return (
    <section ref={host} className="clubhouse-page content-page">
      <div className="section-heading large-heading">
        <div>
          <span className="club-welcome">
            <Home size={16} />A place to call your own
          </span>
          <h1>Welcome to your clubhouse.</h1>
          <p>Little treasures. Big imagination. All yours.</p>
        </div>
        <span className="club-wallet">
          <Gem size={25} />
          <strong>{save.gems}</strong> gems to decorate
        </span>
      </div>
      <div className="club-layout">
        <div className="club-home">
          <div
            ref={room}
            className="club-scene"
            aria-label={`Your clubhouse with ${Object.values(equipped)
              .map((id) => roomItems.find((i) => i.id === id)?.name)
              .join(', ')}`}
          >
            <Cottage />
            {(['rug', 'seat', 'flowers', 'play'] as const).map(
              (slot) =>
                equipped[slot] && (
                  <div
                    data-room-slot={slot}
                    className={`club-placed placed-${slot} ${arrival === equipped[slot] ? 'decoration-landed' : ''}`}
                    key={equipped[slot]}
                  >
                    <Decoration id={equipped[slot]!} />
                  </div>
                ),
            )}
            <div
              data-room-slot="outfit"
              className={`club-resident ${arrival ? 'resident-cheers' : ''}`}
              key={arrival}
            >
              <Character name={save.companion} outfit={equipped.outfit} />
            </div>
            <button
              className="club-pet"
              aria-label={`Pet ${save.clubhouse.petName}`}
              onClick={() => {
                setPetHappy((v) => !v);
                setMessage(`${save.clubhouse.petName} loves being here with you. Purr, purr!`);
                if (save.sound) {
                  playSound('berry');
                  speak(`Hello, ${save.clubhouse.petName}. What a lovely little friend!`);
                }
              }}
            >
              <Cat happy={petHappy} />
              {petHappy && <Heart className="pet-heart" fill="currentColor" />}
              <span>
                {save.clubhouse.petName}
                <Heart size={12} />
              </span>
            </button>
            <span className="club-door-sign">{save.name}’s happy place</span>
          </div>
          <div className="club-note" role="status">
            <Character outfit={equipped.outfit} />
            <p>{message}</p>
          </div>
          <form
            className="pet-name-form"
            onSubmit={(e) => {
              e.preventDefault();
              const name = petName.trim().slice(0, 18) || 'Pebble';
              onName(name);
              setPetName(name);
              setMessage(`${name}! A lovely name for your little friend.`);
            }}
          >
            <label htmlFor="pet-name">What shall we call your cat?</label>
            <div>
              <input
                id="pet-name"
                value={petName}
                maxLength={18}
                onChange={(e) => setPetName(e.target.value)}
              />
              <button className="button secondary" type="submit">
                <Check size={17} />
                Save name
              </button>
            </div>
          </form>
        </div>
        <aside className="club-shop" aria-label="Decorate your clubhouse">
          <div className="club-shop-title">
            <Paintbrush size={23} />
            <div>
              <h2>A little more you.</h2>
              <p>Use the gems you earn by learning.</p>
            </div>
          </div>
          <div className="club-tabs" aria-label="Decoration categories">
            {tabs.map((t, i) => (
              <button key={t.name} aria-pressed={tab === i} onClick={() => setTab(i)}>
                {t.name}
              </button>
            ))}
          </div>
          <div className="club-items">
            {roomItems
              .filter((item) => (tabs[tab].slots as readonly string[]).includes(item.slot))
              .map((item) => {
                const owned = save.clubhouse.owned.includes(item.id),
                  active = equipped[item.slot] === item.id,
                  afford = save.gems >= item.price;
                return (
                  <button
                    key={item.id}
                    className={`club-item ${active ? 'equipped' : ''} ${delivering === item.id ? 'is-delivering' : ''}`}
                    disabled={!!delivering || (!owned && !afford)}
                    onClick={(e) => {
                      if (active) {
                        setMessage(`${item.name} is right at home!`);
                        return;
                      }
                      if (!host.current || !room.current) return;
                      cancelFlight.current?.();
                      const picture = e.currentTarget.querySelector('.club-item-picture'),
                        bounds = room.current.getBoundingClientRect();
                      const outside = bounds.bottom < 0 || bounds.top > innerHeight * 0.65;
                      if (outside)
                        room.current.scrollIntoView({ block: 'center', behavior: 'instant' });
                      const scene = room.current.getBoundingClientRect();
                      delivery.current = {
                        id: item.id,
                        slot: item.slot,
                        flight: captureProp(
                          picture,
                          host.current,
                          outside
                            ? {
                                x: scene.x + scene.width / 2,
                                y: Math.min(innerHeight - 50, scene.bottom - 15),
                              }
                            : undefined,
                        ),
                      };
                      setArrival('');
                      setDelivering(item.id);
                      setMessage(`Let’s find a home for ${item.name.toLowerCase()}…`);
                      onChoose(item.id);
                    }}
                    aria-label={`${active ? 'Using' : owned ? 'Use' : 'Get'} ${item.name}${owned ? '' : ` for ${item.price} gems`}`}
                  >
                    <span className="club-item-picture">
                      <Decoration id={item.id} />
                      {active && (
                        <span className="club-equipped">
                          <Check size={13} />
                        </span>
                      )}
                    </span>
                    <strong>{item.name}</strong>
                    <span className="club-item-action">
                      {active ? (
                        <>
                          <Check size={13} />
                          At home
                        </>
                      ) : owned ? (
                        'Let’s use it'
                      ) : (
                        <>
                          <Gem size={13} />
                          {item.price} gems
                        </>
                      )}
                    </span>
                    {!owned && !afford && <small>{item.price - save.gems} more gems to go</small>}
                  </button>
                );
              })}
          </div>
          <div className="club-earn">
            <Sparkles size={23} />
            <p>
              Every five discoveries earns <strong>15 gems.</strong> Help and hints count, too!
            </p>
            <button className="button primary full" onClick={onAdventure}>
              Let’s make some magic
              <ArrowRight size={18} />
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
