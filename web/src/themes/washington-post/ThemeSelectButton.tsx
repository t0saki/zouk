import { useRef, useCallback } from 'react';

const STYLE_ID = 'wp-theme-btn-style';

const css = `
.wp-theme-btn {
  all: initial;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  min-height: 88px;
  width: 100%;
  padding: 14px 16px;
  cursor: pointer;
  overflow: hidden;
  border: 1px solid #867668;
  background: linear-gradient(180deg, #fffdf8 0%, #f5ede2 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.75), 0 1px 3px rgba(31, 24, 21, 0.12);
  color: #171717;
  transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
}
.wp-theme-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(124,36,48,0.08), transparent 22%),
    repeating-linear-gradient(0deg, rgba(113, 97, 81, 0.06), rgba(113, 97, 81, 0.06) 1px, transparent 1px, transparent 24px);
  pointer-events: none;
}
.wp-theme-btn::after {
  content: '';
  position: absolute;
  top: 12px;
  bottom: 12px;
  right: 10px;
  width: 1px;
  background: linear-gradient(180deg, rgba(124,36,48,0), rgba(124,36,48,0.55), rgba(124,36,48,0));
  pointer-events: none;
}
.wp-theme-btn:hover {
  transform: translateY(-1px);
  border-color: #7c2430;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.88), 0 8px 18px rgba(31, 24, 21, 0.12);
}
.wp-theme-btn[data-selected='true'] {
  border-color: #7c2430;
  box-shadow: inset 0 0 0 1px rgba(124,36,48,0.24), 0 10px 20px rgba(124,36,48,0.12);
}
.wp-theme-btn__kicker {
  position: relative;
  z-index: 1;
  font-family: 'Libre Franklin', system-ui, sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #7c2430;
}
.wp-theme-btn__title {
  position: relative;
  z-index: 1;
  font-family: 'Newsreader', Georgia, serif;
  font-size: 22px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: -0.03em;
}
.wp-theme-btn__note {
  position: relative;
  z-index: 1;
  font-family: 'Caveat', cursive;
  font-size: 17px;
  color: #5a544d;
}
`;

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = css;
  document.head.appendChild(el);
}

interface Props {
  selected: boolean;
  onClick: () => void;
}

export default function WashingtonPostThemeSelectButton({ selected, onClick }: Props) {
  const injected = useRef(false);
  if (!injected.current) {
    ensureStyles();
    injected.current = true;
  }

  const handleClick = useCallback(() => onClick(), [onClick]);

  return (
    <button
      className="wp-theme-btn"
      data-selected={selected ? 'true' : 'false'}
      onClick={handleClick}
      aria-pressed={selected}
    >
      <span className="wp-theme-btn__kicker">Editorial Theme</span>
      <span className="wp-theme-btn__title">Post Script</span>
      <span className="wp-theme-btn__note">hand-marked notes</span>
    </button>
  );
}
