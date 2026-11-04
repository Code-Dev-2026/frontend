export const MIN_TOUCH_TARGET_PX = 48;

/**
 * RNF-04: los objetivos táctiles deben medir al menos 48 px para poder
 * operarse con una sola mano y en movimiento.
 */
export function assertTouchTarget(sizePx: number): true {
  if (!Number.isFinite(sizePx) || sizePx < MIN_TOUCH_TARGET_PX) {
    throw new Error(
      `RNF-04: el objetivo táctil debe medir al menos ${MIN_TOUCH_TARGET_PX}px.`,
    );
  }

  return true;
}
