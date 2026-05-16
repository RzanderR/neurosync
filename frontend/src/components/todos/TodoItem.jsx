export default function TodoItem({ todo, onToggle, onOpenSource }) {
  return (
    <li className="group flex items-start gap-3 px-4 py-3 rounded-xl bg-canvas border border-border-soft">
      <input
        id={`todo-${todo.id}`}
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="mt-1 h-5 w-5 accent-accent"
      />
      <div className="flex-1 min-w-0">
        <label
          htmlFor={`todo-${todo.id}`}
          className={
            "block text-base cursor-pointer " +
            (todo.completed ? "text-ink-muted line-through" : "text-ink")
          }
        >
          {todo.text}
        </label>
        {todo.dueLabel && (
          <p className="m-0 mt-1 text-sm text-ink-secondary">{todo.dueLabel}</p>
        )}
      </div>
      {todo.messageId && (
        <button
          type="button"
          onClick={() => onOpenSource(todo.messageId)}
          className="self-start shrink-0 text-sm text-accent hover:text-accent-hover px-2 py-1 rounded-full"
        >
          Open message
        </button>
      )}
    </li>
  );
}
