# Numberia

A story-driven K–5 math game built with React, TypeScript, Vite, and Three.js. Help Milo and his friends bring magic back to Whispering Woods and Crystal Cove.

## Run

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. `npm run build` creates the production site in `dist/`; `npm run preview` serves that build. Use Node 22.12+ for the development tools and TypeScript tests. Add `NARI_API_KEY` to the root `.env` to enable streaming Phoebe narration. For production, run `npm run build` followed by `npm start`; see [voice setup](docs/voice.md).

## Play

- Choose kindergarten or a grade from 1–5 using the colorful grade cards. Each grade and world keeps its own chapter progress. Both worlds are available from the world picker; a third card previews more worlds to come. The world picker, map, chapter panel, and warm cream header share the same playful theme.
- Chapters open in **Explore & answer**, the original full-screen playground: in Whispering Woods, tap a numbered crystal to guide Milo toward it, click the ground to explore, or focus the meadow and use arrow keys/WASD. Crystal Cove uses chapter-specific answer toys instead: musical keys, sailing rafts, hinged shells, flying lanterns, and turning mirrors. Large answer buttons and number keys 1–4 offer the same answers. Switch to **Build & discover** for optional hands-on activities: gather berries, add missing bridge planks, fill equal picnic baskets, share snacks fairly, or combine fraction pieces and tenths. Your arrangement becomes the answer.
- Berries and planks travel from their tray to their actual destination; totals and spoken counts update when they land. Addition keeps both source groups visible beside Milo’s picnic basket. Bridge lessons explain the goal, distinguish existing brown planks from new golden ones, and explain the result—for example, **5 needed − 1 already here = 4 missing**. Children choose **Let Pip cross!** when the gaps are filled; extra planks can stay in the tray. Each discovery ends with a compact character celebration that keeps the playground in place.
- The bridge activity fits the available screen with its controls always visible. Its small plank tray refills as children build, and the result replaces the existing explanation instead of adding another panel. Phone layouts condense duplicate headings and labels while retaining the spoken coaching, quantity model, and actions.
- Touch the berries to hear and see each count, followed by the complete answer. Milo can also count through a demonstration. Berries wrap inside their trays, with a separate tray for quantities taken away. Bring groups together, take berries away, fill or share baskets, combine fraction pieces, or explore place-value crates.
- Explore the full park with children on a swing and seesaw, a slide with a clear return path and ladder climb, a picnic, butterflies, and a roaming tabby cat.
- On the landing page, your buddy marks the current chapter. A background squirrel gathers nuts, collects a nut, carries it home at a brisk running pace, climbs the tree, and waits hidden for **five seconds before repeating**. The white map trail connects the actual centers of the chapter markers.
- The home page fits one screen, with a roomy, full-width welcome banner, a bounded map, and a wider chapter card that keeps the Play button visible. On phones the chapter card sits beneath the map. Captions remain readable, including the map footer. The sun has its own space above the banner’s right corner, with birds gliding and flapping through the background; reduced motion leaves them still.
- Milo gives three short, problem-specific coaching steps. His final step demonstrates the math. Questions and guidance use streamed Phoebe audio through a private Nari endpoint when configured. Quick counting keeps the original device voice. Repeated lines are cached, and slow or unavailable narration falls back to device speech. No model download or voice-loading screen is needed; see [voice setup and free limits](docs/voice.md).
- Demonstrations wait for each spoken count; mute, reset, and closing an activity cancel active and queued narration.
- Finish all five discoveries to receive **3 stars, 100 XP, and 15 gems**. Hints and retries never reduce rewards. The game remembers discoveries separately for each grade and skill. Challenge grows after two independent discoveries and eases after support. Supported facts return after other practice, and visits start with a gentle warm-up. Practice camp suggests a skill to revisit.
- Visit **My clubhouse** or tap the gem counter to decorate a cozy cottage with earned gems. Choose rugs, furniture, flowers, outfits, and garden toys; name and pet your cat. A selected decoration flies into its place and settles with a little cheer. Owned decorations can be selected again for free. Your room, outfit, and cat’s name stay saved with your progress.
- Collect chapter keepsakes, unlock Pip and Lumi, try practice camp, and watch the progress garden grow. **Little quests**, beside **All worlds**, opens daily challenges and their optional gem rewards.

Synthesized sound effects only play following interaction and can be muted. Motion respects the system’s reduced-motion setting. A device without WebGL can play using the same answer controls and learning activities.

Each map stop opens its own Three.js playground:

- **Moonberry Meadow:** a cottage garden, berry beds, butterflies, and five moonberry lanterns.
- **Pebble Bridge:** a flowing river, waterwheel, jumping fish, and Pip’s bridge, which grows with each discovery. Pip crosses when all five pieces are ready.
- **Picnic Hollow:** the lively playground, a striped canopy, balloons, a picnic bell, and five baskets to pack for the forest friends.
- **Firefly Falls:** a moonlit waterfall, glowing mushrooms, Lumi, drifting fireflies, and five lanterns to light.
- **The Wishing Tree:** a friendly sleeping tree in a blossom garden, with an owl, hanging lights, and a star fountain. Tap the tree or fountain to send a wish into its heart. Discoveries return five golden leaves and light five garden lanterns; the final discovery wakes the tree and opens its little door.

Crystal Cove has five different spaces and ways to answer:

- **Sparkle Springs:** a terraced crystal amphitheater. Press a numbered key to wake a note in the garden's song; the conductor's bell plays a short chime melody.
- **Rainbow Crossing:** an open lagoon with four little sailing rafts. Choose a raft to deliver crystal cargo to Pip's rainbow bridge. Five discoveries complete the crossing.
- **Seashell Shore:** a sandy coast with waves, a lighthouse, a picnic, and a turtle. Answer shells have working hinges and reveal glowing pearls.
- **Glow Grotto:** inside an amethyst cavern, lanterns float above a pool. A correct answer sends a lantern up into the cave and lights a permanent guide for the glowbugs.
- **Heartlight Haven:** a rose-quartz temple with four turning mirrors. Each correct answer sends a colored beam to the heart, with five discoveries completing its glow.

Answer buttons and keyboard choices trigger the same chapter animation. Correct answers move to a randomly chosen different slot between rounds; hints and retries keep the current options in place. Retry feedback offers help without removing discoveries. Idle toys move gently while number labels remain easy to tap; reduced motion preserves the completed action without travel. Very short phone previews use the main answer buttons so duplicate labels cannot cover the scene.

The scenery remembers discoveries throughout the chapter, including when switching between exploring and building. Optional play buttons animate each landmark. Chapter colors, storybook introductions, and a lightweight illustrated WebGL fallback share the same theme. On compact screens, **Count with Milo** gives the existing visual math activity its own focused panel, keeping the playground and answer buttons visible.

## Scope

Whispering Woods and Crystal Cove each have five playable chapters. The third world card says “More worlds coming” and is not a locked or playable chapter. Existing woodland saves keep their progress; each world has its own chapter sequence and finale. This is a working local prototype, with browser-local saving and JSON progress export. An optional Node server keeps the narration API key private and streams speech. There is no account system, cross-device synchronization, or online multiplayer.

K–2 focuses on addition and subtraction; grades 3–4 add multiplication and division; grade 5 includes same-denominator fractions and tenths. These are starting levels, not a complete standards-aligned curriculum or diagnostic assessment. Hints and retries count toward full achievements; first-answer support information is retained internally to adapt difficulty, not to rank children.

## Learning rationale

The activities connect visible quantities to written equations, provide repeated retrieval opportunities, and revisit skills through practice. These design choices draw on the Institute of Education Sciences’ guidance on [organizing instruction and study](https://ies.ed.gov/ncee/wwc/practiceguide/1), [teaching math to young children](https://ies.ed.gov/ncee/WWC/PracticeGuide/18/Published), and [representations in elementary mathematics](https://ies.ed.gov/ncee/wwc/practiceguide/26).

These sources support instructional approaches; they do not establish that this particular game, palette, or animation system improves learning. The woodland colors are aesthetic choices, with consistent group coding and redundant text/icon feedback. The prototype has not been evaluated in a learning-outcomes study.

## Validation

```sh
npm run check
```

Automated tests cover saved clubhouse migration, duplicate/insufficient gem purchases, per-grade learning memory, spaced fact review, supported answers, physical answer models for every skill, bridge quantities, contextual bridge explanations, speech ordering and cancellation, error recovery, and spoken decimals and fractions. Browser checks verify pointer and keyboard placement, counting after props land, demonstrations, complete bridge geometry, stable playground size during celebrations, room delivery, and widths from 320 to 2048px. Regression tests also check fruit containment at multiple tray widths, the slide return path, and the squirrel’s pauses, facing, and climbing sequence. Engine tests exercise all supported grade/skill combinations over 10,000 generated questions, distinct valid choices, arithmetic correctness, grade-specific progression, duplicate reward protection, local-calendar streaks, and malformed-save recovery. Browser checks also cover 3D answer collection, retry coaching, animated demonstrations, completed missions, rewards, daily claims, companion unlocks, profile changes, and responsive layouts.

Oxfmt handles formatting; Oxlint checks correctness, React hooks, and dependency cycles. See [the development guide](docs/development.md) for commands and module responsibilities.

## Main files

- `src/App.tsx`: page composition and the active quest.
- `src/app/` and `src/app/dialogs/`: navigation, dialog content, and the browser persistence hook.
- `src/features/`: adventure map, welcome banner, daily quests, practice, backpack, and progress pages.
- `src/components/`: shared characters, dialogs, math props, and visual primitives.
- `src/saveReducer.ts` and `src/dailyQuests.ts`: typed progress actions and shared daily reward eligibility.
- `src/Quest.tsx`: story, full-screen arena, answer flow, and completion celebration.
- `src/Clubhouse.tsx` and `src/clubhouse.ts`: illustrated cottage, dress-up, pet interactions, and atomic gem purchases.
- `src/HandsOn.tsx` and `src/handsOnModel.ts`: pointer/tap math missions and physical answer validation.
- `src/MathPlayScenes.tsx`, `src/bridgeLesson.ts`, and `src/propFlight.ts`: picnic and bridge scenes, contextual teaching, and measured prop travel.
- `src/DiscoveryCelebration.tsx` and `src/tactile-play.css`: compact discovery celebrations and responsive hands-on scene styles.
- `src/learning.ts`: persistent per-skill challenge, warm-ups, and supported-fact review.
- `src/Meadow.tsx`: Three.js lifecycle, movement, answer collection, camera, and particles.
- `src/playgrounds/`: chapter themes, scene sculpting, ten chapter environments, Crystal Cove answer toys, restoration, storybook art, and compact math support.
- `src/Park.ts`, `src/ParkCharacters.ts`, and `src/slideJourney.ts`: full park, articulated children and cat, and a clear route around the slide.
- `src/GradePicker.tsx` and `src/WorldPicker.tsx`: themed level and world selection.
- `src/LandingWildlife.tsx`, `src/StorybookBackdrop.tsx`, and `src/squirrelJourney.ts`: ambient scenery and synchronized squirrel story.
- `src/home-layout.css`: home viewport layout, readable captions, responsive chapter cards, and ambient birds.
- `src/MathGarden.tsx`, `src/fruitLayout.ts`, and `src/mathNarration.ts`: concrete arithmetic, spoken counting, tray geometry, and answer explanations.
- `src/HintCoach.tsx`: dynamic Milo coaching and spoken explanations.
- `src/game/`: arithmetic generation, missions, and domain types; `src/game.ts`: public exports, persistence, and progression.
- `src/audio.ts`, `src/speech/`, and `src/speechQueue.ts`: streaming PCM narration, original device counting, fallback, sound effects, and cancellation.
- `server/` and `docs/voice.md`: private Nari gateway, bounded audio cache, development middleware, production server, and voice configuration.
- `src/Celebration.tsx`: particle celebrations.
- `tokens.css`: shared visual tokens; `src/styles.css`, `src/playful.css`, `src/arena.css`, `src/storybook.css`, and `src/adventure-extras.css`: interface, toy-like theme, arena, scenery, and selection styles.
- `docs/artwork.md`: original artwork paths and exact generation prompts.
