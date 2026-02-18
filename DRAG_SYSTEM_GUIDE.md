## Using the New Drag System

### Quick Start for New Draggable Components

#### Option 1: Using the Draggable Component (Recommended for Simple Cases)

```tsx
import { Draggable } from '@/components/Draggable'

<Draggable
  initialPosition={{ x: 50, y: 50 }}
  onDragEnd={(position) => console.log(position)}
  className="px-4 py-2 rounded-lg bg-blue-500"
>
  My draggable content
</Draggable>
```

#### Option 2: Using the useDraggable Hook (For Complex Components)

```tsx
import { useDraggable } from '@/hooks/useDraggable'

export function MyDraggable() {
  const { position, dragState, containerRef, startDrag, getWobbleAnimation } = useDraggable(
    { x: 50, y: 50 },
    {
      onDragEnd: (pos) => console.log('Dropped at', pos),
      onDragStart: () => console.log('Started dragging'),
      onPositionChange: (pos) => console.log('Moving...', pos),
    }
  )

  return (
    <div
      ref={containerRef}
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      className="absolute"
    >
      <div
        onMouseDown={startDrag}
        className={`cursor-grab ${getWobbleAnimation()}`}
      >
        Content here
      </div>
    </div>
  )
}
```

### Available Animations

All animations are Tailwind utilities defined in `tailwind.config.ts`:

- `animate-wobble` - Full 360° wobble effect
- `animate-wobbleLeft` - Left tilt wobble
- `animate-wobbleRight` - Right tilt wobble
- `animate-wobbleUp` - Upward movement wobble
- `animate-wobbleDown` - Downward movement wobble
- `animate-lightWobble` - Subtle wobble on drop

### Key Features

**Position Tracking**
- Normalized to 0-100% coordinates
- Automatically calculated from mouse events
- Available in `position` state

**Drag State**
- `isDragging` - Currently dragging
- `moveDirection` - Direction of movement (left/right/up/down)
- `tiltAngle` - Current tilt angle based on velocity
- `isWobbling` - In wobble animation state

**Velocity-Based Animation**
- Automatically calculates movement velocity
- Adjusts tilt angle based on speed
- Creates natural-feeling drag feedback

**Event Callbacks**
- `onDragStart()` - When drag begins
- `onDragEnd(position)` - When drag ends
- `onPositionChange(position)` - On every move (useful for live updates)

### Styling Draggable Elements

The Draggable component uses CSS transforms for positioning:
- Always use `%` units for position coordinates
- Container positioned with `left` and `top` percentages
- Inner div centered with `translate(-50%, -50%)`

```tsx
// Container
style={{ left: `${x}%`, top: `${y}%` }}

// Inner div (automatic with Draggable component)
className="transform -translate-x-1/2 -translate-y-1/2"
```

### Accessibility

- Uses semantic HTML structure
- Maintains proper cursor feedback (grab/grabbing)
- Compatible with keyboard navigation
- Works with assistive technologies

### Performance Tips

1. **Memoize callbacks** - Use `useCallback` for onDragEnd etc
2. **Throttle updates** - Heavy operations in onPositionChange can lag
3. **Lazy position saves** - Save position on onDragEnd, not onPositionChange
4. **Use React.memo** - Memoize draggable components if they re-render often

### Migrating Old Code

Old pattern (❌ Don't do this):
```tsx
const handleMouseMove = (e) => {
  const rect = ref.current.parentElement.getBoundingClientRect()
  const newX = ((e.clientX - rect.left) / rect.width) * 100
  // ... 50 more lines of logic
}
```

New pattern (✅ Do this):
```tsx
const { position, startDrag } = useDraggable({ x: 50, y: 50 })
// All logic is handled inside the hook!
```

### Debugging

Enable debug logging in components:
```tsx
const { position } = useDraggable(init, {
  onPositionChange: (pos) => console.log('[Draggable]', pos),
})
```

### Browser Support

- Modern browsers with ES2020+ support
- Chrome/Edge 88+
- Firefox 87+
- Safari 14+
- Mobile browsers (touch not yet supported - future enhancement)
