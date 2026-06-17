'use strict';

/**
 * Blob anchor presets → inline CSS position values.
 * Blobs are the animated gradient circles in slide backgrounds.
 */
const BLOB_ANCHORS = {
  'top-right':    'top:-80px;right:-60px',
  'top-left':     'top:-80px;left:-60px',
  'bottom-right': 'bottom:-70px;right:-60px',
  'bottom-left':  'bottom:-70px;left:-60px',
  'center-left':  'top:42%;left:18%',
  'center-right': 'top:35%;right:12%',
  'top-center':   'top:-60px;left:45%',
  'bottom-center':'bottom:-60px;left:45%',
};

/**
 * Default blobs if a slide specifies no background.
 */
const DEFAULT_BLOBS = [
  { color: '#60a5fa', size: 380, opacity: 0.08, anchor: 'top-right' },
  { color: '#a78bfa', size: 290, opacity: 0.07, anchor: 'bottom-left' },
];

/**
 * Badge color variant presets.
 * b1=blue, b2=purple, b3=green, b4=orange, b5=red
 */
const BADGE_COLORS = {
  b1: '#60a5fa',
  b2: '#a78bfa',
  b3: '#34d399',
  b4: '#fb923c',
  b5: '#f87171',
};

/**
 * Card accent color presets.
 */
const CARD_ACCENT_COLORS = {
  blue:   '#60a5fa',
  purple: '#a78bfa',
  green:  '#34d399',
  orange: '#fb923c',
  red:    '#f87171',
};

module.exports = { BLOB_ANCHORS, DEFAULT_BLOBS, BADGE_COLORS, CARD_ACCENT_COLORS };
