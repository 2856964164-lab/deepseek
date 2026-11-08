/**
 * DT-OS — a Detroit-inspired android boot skin for DeepSeek Harness Web.
 *
 * Two halves, both registration-only in the factory:
 *   1. A token layer stacked over the active built-in theme, so light and dark
 *      both stay usable and the host's own contrast choices are preserved
 *      wherever a token is not ours to decide.
 *   2. A split-ring brand mark for the blank-session headline.
 */

/** Cold industrial blues. Values are picked for AA body-text contrast on the
 *  surfaces they sit on, not for hue purity: a palette that looks right as a
 *  swatch can leave secondary text unreadable once it lands on layer-1. */
const PALETTE = {
  light: {
    base: '#F2F4F7',
    layer1: '#FFFFFF',
    layer2: '#E8ECF2',
    overlay: '#FFFFFF',
    border1: '#D3DAE4',
    border2: '#B4BECB',
    brand: '#1E5C93',
    labelPrimary: '#101820',
    labelSecondary: '#4A5766',
    error: '#B3261E',
    idle: '#7A8796',
    success: '#1D6B4F',
    warn: '#8A5600',
    sidebar: '#E9EDF3',
  },
  dark: {
    base: '#05080D',
    layer1: '#0B1119',
    layer2: '#131B26',
    overlay: '#101823',
    border1: '#1E2A38',
    border2: '#2C3B4D',
    brand: '#5C9EE8',
    labelPrimary: '#E4EAF2',
    labelSecondary: '#8D9AAB',
    error: '#F0766A',
    idle: '#5A6675',
    success: '#4FC58F',
    warn: '#E0A94A',
    sidebar: '#070B11',
  },
}

/** Token map: our palette key -> the host CSS variable it overrides. */
const TOKEN_MAP = {
  base: '--dsw-alias-bg-base',
  layer1: '--dsw-alias-bg-layer-1',
  layer2: '--dsw-alias-bg-layer-2',
  overlay: '--dsw-alias-bg-overlay',
  border1: '--dsw-alias-border-l1',
  border2: '--dsw-alias-border-l2',
  brand: '--dsw-alias-brand-primary',
  labelPrimary: '--dsw-alias-label-primary',
  labelSecondary: '--dsw-alias-label-secondary',
  error: '--dsw-alias-state-error-primary',
  idle: '--dsw-alias-state-idle-primary',
  success: '--dsw-alias-state-success-primary',
  warn: '--dsw-alias-state-warn-primary',
  sidebar: '--dsw-specific-sidebar-fill',
}

function buildTokens() {
  const tokens = {}
  for (const [key, variable] of Object.entries(TOKEN_MAP)) {
    tokens[variable] = {
      light: PALETTE.light[key],
      dark: PALETTE.dark[key],
    }
  }
  return tokens
}

const SKIN_ID = 'dsh-skin-android-boot'

window.__ModuleLoader__.load({
  id: SKIN_ID,
  factory(require) {
    const React = require('react')
    const h = React.createElement

    /** The blank-session brand mark: a split ring with a gap at the upper
     *  right, the way an android status ring reads — a deliberate break so the
     *  mark never looks like a spinner the host is drawing for us. */
    function BrandMark(props) {
      const size = typeof props?.size === 'number' && props.size > 0 ? props.size : 48
      const radius = 21.5
      const circumference = 2 * Math.PI * radius
      // 72% of the ring: wide enough that the break still reads at 32px, which
      // is roughly the smallest size the hero ever renders the mark at.
      const arc = circumference * 0.72

      return h(
        'svg',
        {
          viewBox: '0 0 64 64',
          width: size,
          height: size,
          role: 'img',
          'aria-label': 'DT-OS',
          className: props?.className,
          style: {
            display: 'block',
            pointerEvents: 'none',
            overflow: 'visible',
          },
        },
        h(
          'defs',
          null,
          h(
            'linearGradient',
            { id: `${SKIN_ID}-ring`, x1: '0', y1: '0', x2: '1', y2: '1' },
            h('stop', { offset: '0%', stopColor: 'var(--dsw-alias-brand-primary)' }),
            h('stop', { offset: '100%', stopColor: 'var(--dsw-alias-brand-primary)', stopOpacity: '0.35' }),
          ),
        ),
        // Outer hairline: a single very low-contrast circle that gives the mark a
        // footprint without needing a plate behind it on either scheme.
        h('circle', {
          cx: 32, cy: 32, r: 27.5,
          fill: 'none',
          stroke: 'var(--dsw-alias-border-l1)',
          strokeWidth: 0.7,
          opacity: 0.6,
        }),
        // The main broken ring.
        h('circle', {
          cx: 32, cy: 32, r: radius,
          fill: 'none',
          stroke: `url(#${SKIN_ID}-ring)`,
          strokeWidth: 2.4,
          strokeLinecap: 'round',
          strokeDasharray: `${arc} ${circumference - arc}`,
          // Rotated so the break sits just right of 12 o'clock: the arc then
          // sweeps down and around, which reads as "loaded" rather than as a
          // spinner caught mid-turn.
          transform: 'rotate(-81 32 32)',
        }),
        // Tick marks just inside the ring, at the four compass points. They sit clear
// of the broken arc so the gap never looks like a tick that got cut off.
        h('path', {
          d: 'M32 17.2 V20.4  M32 43.6 V46.8  M17.2 32 H20.4  M43.6 32 H46.8',
          stroke: 'var(--dsw-alias-label-secondary)',
          strokeWidth: 1.1,
          strokeLinecap: 'round',
          opacity: 0.5,
        }),
        // Center: a filled square rotated 45°, the smallest readable kernel.
        h('rect', {
          x: 26.2, y: 26.2, width: 11.6, height: 11.6, rx: 1.6,
          fill: 'var(--dsw-alias-brand-primary)',
          transform: 'rotate(45 32 32)',
        }),
        h('circle', {
          cx: 32, cy: 32, r: 1.8,
          fill: 'var(--dsw-alias-label-primary)',
        }),
      )
    }

    return {
      inject: ['slots', 'theme'],
      apply(ctx) {
        // Token layer. `overrideTokens` composes on top of whatever theme the
        // user picked, so switching between the built-in light and dark keeps
        // DT-OS applied instead of resetting to the stock palette.
        ctx.effect(() => ctx.theme.overrideTokens(SKIN_ID, buildTokens()))
        // Brand mark in the blank-session headline. The slot is `single`, so
        // registering replaces the stock mark and the disposer brings it back.
        ctx.slots.inject('conversation.hero.brand.mark', () =>
          ctx.slots.register(
            {
              name: 'conversation.hero.brand.mark',
              id: SKIN_ID,
              order: 0,
            },
            BrandMark,
          ),
        )
      },
    }
  },
})