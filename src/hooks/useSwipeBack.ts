import { useEffect, useRef } from 'react'

/**
 * 右スワイプで「戻る」を発火するフック。
 * onBack が呼ばれるタイミング：
 *   - 画面左端 60px 以内からスワイプ開始
 *   - 横移動が 80px 以上、かつ縦移動より横移動が大きい
 */
export function useSwipeBack(onBack: () => void) {
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  useEffect(() => {
    function handleTouchStart(e: TouchEvent) {
      const touch = e.touches[0]
      // 左端 60px 以内からのスワイプのみ対象
      if (touch.clientX <= 60) {
        touchStartX.current = touch.clientX
        touchStartY.current = touch.clientY
      } else {
        touchStartX.current = null
        touchStartY.current = null
      }
    }

    function handleTouchEnd(e: TouchEvent) {
      if (touchStartX.current === null || touchStartY.current === null) return

      const touch = e.changedTouches[0]
      const dx = touch.clientX - touchStartX.current
      const dy = Math.abs(touch.clientY - touchStartY.current)

      if (dx > 80 && dx > dy) {
        onBack()
      }

      touchStartX.current = null
      touchStartY.current = null
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onBack])
}
