# Troubleshooting

## Leaflet map container errors

Symptoms:
- "Map container is already initialized."
- "Map container is being reused by another instance"

Context:
- Dev/fast-refresh or strict-mode re-mounts can leave Leaflet's internal `_leaflet_id` stamped on the DOM container.
- React-leaflet can re-init against the same node, which Leaflet rejects.

Current fix (see `components/interactive-map.tsx`):
- Initialize Leaflet imperatively (no MapContainer).
- Before init: clear any `_leaflet_id` on the container and reset its contents.
- On cleanup: clear layers, then `map.remove()` with a guard that aligns `_containerId`/`_leaflet_id` if needed; if it still fails, force-clear the container.

If this regresses:
- Re-check cleanup in `components/interactive-map.tsx` and make sure `_leaflet_id` is cleared before init and after unmount.
