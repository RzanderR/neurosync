import RemindersView from "../reminders/RemindersView.jsx";
import ChatView from "../chat/ChatView.jsx";
import TodoList from "../todos/TodoList.jsx";

export default function HomeView() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="lg:col-span-2 bg-surface border border-border-soft rounded-2xl p-6">
        <RemindersView compact />
      </section>

      <section className="h-[28rem] lg:h-[36rem]">
        <ChatView compact />
      </section>

      <section className="min-h-[24rem] lg:min-h-[28rem]">
        <TodoList />
      </section>
    </div>
  );
}
