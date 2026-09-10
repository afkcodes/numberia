/** Capture before a React update; fly the same prop to its new, measured position. */
export function captureProp(
  source: Element | null,
  host: HTMLElement,
  point?: { x: number; y: number },
) {
  if (!source) return null;
  const from = source.getBoundingClientRect();
  const copy = source.cloneNode(true) as HTMLElement;
  copy.removeAttribute('id');
  copy.removeAttribute('data-token-id');
  copy.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
  copy.setAttribute('aria-hidden', 'true');
  copy.setAttribute('inert', '');
  copy.tabIndex = -1;
  copy.classList.add('flying-prop');
  const x = point ? point.x - from.width / 2 : from.x;
  const y = point ? point.y - from.height / 2 : from.y;
  return (target: Element | null, landed: () => void): (() => void) => {
    if (!target || !from.width || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      landed();
      return () => {};
    }
    const to = target.getBoundingClientRect();
    const element = target as HTMLElement,
      visibility = element.style.visibility;
    element.style.visibility = 'hidden';
    Object.assign(copy.style, {
      position: 'fixed',
      left: '0px',
      top: '0px',
      width: `${from.width}px`,
      height: `${from.height}px`,
      margin: '0',
      visibility: 'visible',
      pointerEvents: 'none',
      zIndex: '100',
      transformOrigin: '0 0',
    });
    host.append(copy);
    const scaleX = to.width / from.width,
      scaleY = to.height / from.height;
    const arc = Math.min(90, Math.max(24, Math.hypot(to.x - x, to.y - y) * 0.18));
    const animation = copy.animate(
      [
        { transform: `translate(${x}px,${y}px) scale(1) rotate(-5deg)`, opacity: 1 },
        {
          transform: `translate(${(x + to.x) / 2}px,${(y + to.y) / 2 - arc}px) scale(${(1 + scaleX) / 2},${(1 + scaleY) / 2}) rotate(7deg)`,
          offset: 0.48,
          opacity: 1,
        },
        {
          transform: `translate(${to.x}px,${to.y}px) scale(${scaleX},${scaleY}) rotate(0deg)`,
          opacity: 1,
        },
      ],
      { duration: 460, easing: 'cubic-bezier(.3,.05,.35,1)', fill: 'both' },
    );
    let done = false;
    const finish = (notify: boolean) => {
      if (done) return;
      done = true;
      animation.cancel();
      copy.remove();
      element.style.visibility = visibility;
      window.removeEventListener('resize', settle);
      window.removeEventListener('scroll', settle, true);
      if (notify) landed();
    };
    const settle = () => finish(true);
    animation.onfinish = settle;
    window.addEventListener('resize', settle, { once: true });
    window.addEventListener('scroll', settle, { capture: true, once: true, passive: true });
    return () => finish(false);
  };
}
