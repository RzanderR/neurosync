import { useEffect, useRef, useState } from "react";
import { useAppState, useAppActions } from "../../state/store.jsx";

export default function AccountMenu() {
  const { patient } = useAppState();
  const { openAccountModal, signOut } = useAppActions();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!patient) return null;

  function handleEdit(step) {
    setOpen(false);
    openAccountModal(step);
  }

  function handleSignOut() {
    setOpen(false);
    signOut();
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-border-soft bg-canvas hover:bg-subtle transition-colors duration-200"
      >
        <span className="text-base text-ink">{patient.firstName}</span>
        <span aria-hidden="true" className="text-ink-secondary">▾</span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 mt-2 w-72 bg-surface border border-border-soft rounded-2xl shadow-xl overflow-hidden z-40"
        >
          <div className="px-5 py-4 border-b border-border-soft">
            <p className="m-0 text-base text-ink">
              {patient.firstName} {patient.lastName}
            </p>
            <p className="m-0 mt-1 text-sm text-ink-secondary truncate">{patient.email}</p>
          </div>
          <ul className="py-2">
            <li>
              <button
                type="button"
                role="menuitem"
                onClick={() => handleEdit(1)}
                className="w-full text-left px-5 py-3 text-base text-ink hover:bg-subtle transition-colors duration-200"
              >
                Edit profile
              </button>
            </li>
            <li>
              <button
                type="button"
                role="menuitem"
                onClick={() => handleEdit(2)}
                className="w-full text-left px-5 py-3 text-base text-ink hover:bg-subtle transition-colors duration-200"
              >
                Accessibility preferences
              </button>
            </li>
            <li className="border-t border-border-soft mt-1 pt-1">
              <button
                type="button"
                role="menuitem"
                onClick={handleSignOut}
                className="w-full text-left px-5 py-3 text-base text-ink-secondary hover:bg-subtle transition-colors duration-200"
              >
                Sign out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
