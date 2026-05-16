import { useMemo, useState } from "react";
import { useAppState, useAppActions } from "../../state/store.jsx";
import TodoItem from "./TodoItem.jsx";

export default function TodoList() {
  const { todos } = useAppState();
  const { toggleTodo, setView } = useAppActions();
  const [doneOpen, setDoneOpen] = useState(false);

  const { open, done } = useMemo(() => {
    return {
      open: todos.filter((t) => !t.completed),
      done: todos.filter((t) => t.completed),
    };
  }, [todos]);

  function openSource() {
    setView("inbox");
  }

  return (
    <section
      aria-labelledby="todos-heading"
      className="flex flex-col bg-surface border border-border-soft rounded-2xl h-full overflow-hidden"
    >
      <header className="px-6 py-5 border-b border-border-soft">
        <h2 id="todos-heading" className="m-0 text-2xl text-ink">
          To-do
        </h2>
        <p className="m-0 mt-1 text-base text-ink-secondary">
          Pulled from your inbox so nothing slips.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {open.length === 0 ? (
          <p className="m-0 text-base text-ink-secondary">
            Nothing to do right now. New action items will appear here as messages come in.
          </p>
        ) : (
          <ul className="space-y-3">
            {open.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onOpenSource={openSource}
              />
            ))}
          </ul>
        )}

        {done.length > 0 && (
          <div className="pt-3 border-t border-border-soft">
            <button
              type="button"
              onClick={() => setDoneOpen((v) => !v)}
              aria-expanded={doneOpen}
              className="text-sm text-ink-secondary hover:text-ink"
            >
              {doneOpen ? "Hide" : "Show"} done ({done.length})
            </button>
            {doneOpen && (
              <ul className="mt-3 space-y-3">
                {done.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onOpenSource={openSource}
                  />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
