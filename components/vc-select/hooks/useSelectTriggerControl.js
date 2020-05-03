import { ref, watchEffect } from '@vue/composition-api';

export default function useSelectTriggerControl(elements, open, triggerOpen) {
  const propsRef = ref(null);
  propsRef.current = {
    elements: elements.filter(e => e),
    open,
    triggerOpen,
  };

  watchEffect(() => {
    function onGlobalMouseDown(event) {
      const target = event.target;
      if (
        propsRef.current.open &&
        propsRef.current.elements.every(element => !element.contains(target) && element !== target)
      ) {
        // Should trigger close
        propsRef.current.triggerOpen(false);
      }
    }

    window.addEventListener('mousedown', onGlobalMouseDown);
    return () => window.removeEventListener('mousedown', onGlobalMouseDown);
  });
}
