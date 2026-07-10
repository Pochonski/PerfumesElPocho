let lockCount = 0;
let lockedScrollY = 0;

export function lockBodyScroll(lock: boolean): void {
  if (lock) {
    if (lockCount === 0) {
      lockedScrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${lockedScrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    }
    lockCount++;
  } else {
    if (lockCount <= 0) return;
    lockCount--;
    if (lockCount > 0) return;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
    window.scrollTo({ top: lockedScrollY, behavior: "instant" as ScrollBehavior });
  }
}
