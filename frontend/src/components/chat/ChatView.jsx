import { useEffect, useRef, useState } from "react";
import { useAppState, useAppActions } from "../../state/store.jsx";
import { scheduleAppointment } from "../../lib/api.js";
import { STEPS, getPrompt } from "../../lib/chatFlow.js";
import AssistantBubble from "./AssistantBubble.jsx";
import UserBubble from "./UserBubble.jsx";
import ClinicMessageBubble from "./ClinicMessageBubble.jsx";
import ChatComposer from "./ChatComposer.jsx";

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function ChatView() {
  const state = useAppState();
  const actions = useAppActions();
  const { chatBubbles, chatStep, chatContext, providers, patient } = state;
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const scrollerRef = useRef(null);

  const prompt = getPrompt(chatStep, chatContext, providers);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chatBubbles.length, submitting]);

  function pushAssistantFor(step, context) {
    const next = getPrompt(step, context, providers);
    if (!next.text) return;
    actions.addChatBubble({
      id: uid("a"),
      kind: "assistant",
      text: next.text,
    });
  }

  async function submitBooking(context) {
    setSubmitting(true);
    setSubmitError(null);
    actions.setChatStep(STEPS.SUBMITTING);
    actions.addChatBubble({
      id: uid("a"),
      kind: "assistant",
      text: "Working on it…",
    });

    try {
      const response = await scheduleAppointment({
        patient,
        clinicId: context.clinicId,
        appointmentType: context.appointmentType,
        urgency: "routine",
        preferredTimeframe: context.preferredTimeframe ?? "",
        notes: "",
      });

      actions.addAppointment(response.appointment);

      if (response.path === "A") {
        const apt = response.appointment;
        actions.addChatBubble({
          id: uid("a"),
          kind: "assistant",
          text:
            `You're booked. ${apt.appointmentTime} at ${apt.location ?? apt.clinic.address}. ` +
            `Confirmation ${apt.confirmationCode}. I've added it to your Reminders.`,
        });
      } else {
        actions.addChatBubble({
          id: uid("a"),
          kind: "assistant",
          text: `I sent a request to ${response.appointment.clinic.name} on your behalf. Here's what I wrote:`,
        });
        actions.addChatBubble({
          id: uid("a"),
          kind: "assistant",
          text: response.appointment.emailDraft,
        });
        actions.addChatBubble({
          id: uid("a"),
          kind: "assistant",
          text: "I'll let you know when they reply. It's in your Reminders so nothing falls through.",
        });
      }

      actions.resetChatContext();
      actions.setChatStep(STEPS.DONE);
      pushAssistantFor(STEPS.DONE, {});
    } catch (err) {
      console.error("Schedule failed", err);
      setSubmitError(err.message ?? "Something went wrong");
      actions.addChatBubble({
        id: uid("a"),
        kind: "assistant",
        text: "Something didn't work. Want to try again?",
      });
      actions.setChatStep(STEPS.CONFIRM);
    } finally {
      setSubmitting(false);
    }
  }

  function handleAnswer({ label, value }) {
    actions.addChatBubble({ id: uid("u"), kind: "user", text: label });

    switch (chatStep) {
      case STEPS.START:
      case STEPS.IDLE: {
        if (value === "begin") {
          actions.setChatStep(STEPS.PICK_TYPE);
          pushAssistantFor(STEPS.PICK_TYPE, chatContext);
        } else {
          actions.setChatStep(STEPS.IDLE);
          pushAssistantFor(STEPS.IDLE, chatContext);
        }
        return;
      }

      case STEPS.PICK_TYPE: {
        const nextContext = { ...chatContext, appointmentType: value };
        actions.setChatContext({ appointmentType: value });
        actions.setChatStep(STEPS.PICK_CLINIC);
        pushAssistantFor(STEPS.PICK_CLINIC, nextContext);
        return;
      }

      case STEPS.PICK_CLINIC: {
        const nextContext = { ...chatContext, clinicId: value };
        actions.setChatContext({ clinicId: value });
        actions.setChatStep(STEPS.PICK_TIMEFRAME);
        pushAssistantFor(STEPS.PICK_TIMEFRAME, nextContext);
        return;
      }

      case STEPS.PICK_TIMEFRAME: {
        const nextContext = { ...chatContext, preferredTimeframe: value };
        actions.setChatContext({ preferredTimeframe: value });
        actions.setChatStep(STEPS.CONFIRM);
        pushAssistantFor(STEPS.CONFIRM, nextContext);
        return;
      }

      case STEPS.CONFIRM: {
        if (value === "submit") {
          submitBooking(chatContext);
        } else {
          actions.resetChatContext();
          actions.setChatStep(STEPS.PICK_TYPE);
          pushAssistantFor(STEPS.PICK_TYPE, {});
        }
        return;
      }

      case STEPS.DONE: {
        actions.resetChatContext();
        actions.setChatStep(STEPS.PICK_TYPE);
        pushAssistantFor(STEPS.PICK_TYPE, {});
        return;
      }

      default:
        return;
    }
  }

  return (
    <section
      aria-labelledby="chat-heading"
      className="flex flex-col h-[calc(100svh-12rem)] min-h-[28rem] bg-surface border border-border-soft rounded-2xl overflow-hidden"
    >
      <header className="px-6 py-5 border-b border-border-soft">
        <h2 id="chat-heading" className="m-0 text-2xl text-ink">
          Schedule with NeuroSync
        </h2>
        <p className="m-0 mt-1 text-base text-ink-secondary">
          One question at a time. Take your time.
        </p>
      </header>

      <div ref={scrollerRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {chatBubbles.map((bubble) => {
          if (bubble.kind === "assistant") {
            return <AssistantBubble key={bubble.id} text={bubble.text} />;
          }
          if (bubble.kind === "user") {
            return <UserBubble key={bubble.id} text={bubble.text} />;
          }
          if (bubble.kind === "clinic_message") {
            return <ClinicMessageBubble key={bubble.id} messageId={bubble.messageId} />;
          }
          return null;
        })}
        {submitError && (
          <p className="text-base text-error-text">{submitError}</p>
        )}
      </div>

      <ChatComposer
        chips={prompt.chips}
        allowFreeText={prompt.allowFreeText}
        freeTextPlaceholder={prompt.freeTextPlaceholder}
        disabled={submitting || chatStep === STEPS.SUBMITTING}
        onAnswer={handleAnswer}
      />
    </section>
  );
}
