import { useEffect, useRef, useState } from "react";
import { useAppState, useAppActions } from "../../state/store.jsx";
import {
  scheduleAppointment,
  recommendProvider,
} from "../../lib/api.js";
import {
  STEPS,
  getPrompt,
  otherProviderId,
} from "../../lib/chatFlow.js";
import { findClinicById } from "../../data/mockClinics.js";
import { buildConfirmationMessage } from "../../data/mockMessages.js";
import AssistantBubble from "./AssistantBubble.jsx";
import UserBubble from "./UserBubble.jsx";
import ChatComposer from "./ChatComposer.jsx";

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function recommendationText(providerId, reasoning) {
  const provider = findClinicById(providerId);
  if (!provider) return reasoning ?? "I'd like to suggest a provider for you.";
  return (
    `Based on what you said, I'd suggest ${provider.name} — ${provider.specialty}. ` +
    (reasoning ?? "")
  ).trim();
}

export default function ChatView({ compact = false }) {
  const state = useAppState();
  const actions = useAppActions();
  const { chatBubbles, chatStep, chatContext, patient } = state;
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const scrollerRef = useRef(null);

  const prompt = getPrompt(chatStep, chatContext);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chatBubbles.length, submitting]);

  function pushAssistant(text) {
    if (!text) return;
    actions.addChatBubble({ id: uid("a"), kind: "assistant", text });
  }

  async function describeAndRecommend(text) {
    actions.setChatStep(STEPS.DESCRIBING);
    pushAssistant("Thinking…");
    try {
      const { providerId, reasoning } = await recommendProvider({
        patient,
        request: text,
      });
      actions.setChatContext({ clinicId: providerId, requestText: text });
      pushAssistant(recommendationText(providerId, reasoning));
      pushAssistant("Sound good?");
      actions.setChatStep(STEPS.CONFIRM_PROVIDER);
    } catch (err) {
      console.error("Recommend failed", err);
      pushAssistant("I had trouble suggesting a provider. Want to try again?");
      actions.setChatStep(STEPS.START);
    }
  }

  async function submitBooking(context) {
    setSubmitting(true);
    setSubmitError(null);
    actions.setChatStep(STEPS.SUBMITTING);
    pushAssistant("Working on it…");

    const clinic = findClinicById(context.clinicId);
    const appointmentType =
      context.appointmentType ?? clinic?.defaultAppointmentType ?? "Appointment";

    try {
      const response = await scheduleAppointment({
        patient,
        clinicId: context.clinicId,
        appointmentType,
        urgency: "routine",
        preferredTimeframe: context.preferredTimeframe ?? "",
        notes: "",
      });

      const appointment = response.appointment;
      actions.addAppointment(appointment);

      if (response.path === "A") {
        pushAssistant(
          `You're booked. ${appointment.appointmentTime} at ` +
            `${appointment.location ?? appointment.clinic.address}. ` +
            `Confirmation ${appointment.confirmationCode}. I've added it to your Reminders.`
        );
      } else {
        pushAssistant(
          `I sent a request to ${appointment.clinic.name} on your behalf. ` +
            `It's in your Reminders — I'll let you know when they reply.`
        );
      }

      const confirmation = buildConfirmationMessage(appointment);
      setTimeout(() => {
        actions.addMessage(confirmation);
      }, 1200);

      actions.resetChatContext();
      actions.setChatStep(STEPS.DONE);
      pushAssistant("Anything else?");
    } catch (err) {
      console.error("Schedule failed", err);
      setSubmitError(err.message ?? "Something went wrong");
      pushAssistant("Something didn't work. Want to try again?");
      actions.setChatStep(STEPS.CONFIRM);
    } finally {
      setSubmitting(false);
    }
  }

  function handleAnswer({ label, value }) {
    actions.addChatBubble({ id: uid("u"), kind: "user", text: label });

    switch (chatStep) {
      case STEPS.START: {
        describeAndRecommend(value);
        return;
      }

      case STEPS.CONFIRM_PROVIDER: {
        if (value === "confirm") {
          const clinic = findClinicById(chatContext.clinicId);
          if (clinic) {
            actions.setChatContext({
              appointmentType: clinic.defaultAppointmentType,
            });
          }
          actions.setChatStep(STEPS.PICK_TIMEFRAME);
          pushAssistant("When would you like to be seen?");
        } else if (value === "swap") {
          const flippedId = otherProviderId(chatContext.clinicId);
          actions.setChatContext({ clinicId: flippedId });
          const flipped = findClinicById(flippedId);
          if (flipped) {
            pushAssistant(
              `Okay — switching to ${flipped.name} (${flipped.specialty}).`
            );
            pushAssistant("Sound good?");
          }
        } else {
          actions.resetChatContext();
          actions.setChatStep(STEPS.START);
          pushAssistant(
            "No problem. Tell me what's going on in a sentence or two."
          );
        }
        return;
      }

      case STEPS.PICK_TIMEFRAME: {
        actions.setChatContext({ preferredTimeframe: value });
        actions.setChatStep(STEPS.CONFIRM);
        const clinic = findClinicById(chatContext.clinicId);
        pushAssistant(
          `Ready to book a ${(
            chatContext.appointmentType ?? clinic?.defaultAppointmentType ?? "appointment"
          ).toLowerCase()} with ${clinic?.name ?? "your provider"} for ${value}?`
        );
        return;
      }

      case STEPS.CONFIRM: {
        if (value === "submit") {
          submitBooking({
            ...chatContext,
            preferredTimeframe: chatContext.preferredTimeframe,
          });
        } else {
          actions.resetChatContext();
          actions.setChatStep(STEPS.START);
          pushAssistant(
            "Sure. Tell me what's going on in a sentence or two."
          );
        }
        return;
      }

      case STEPS.DONE: {
        actions.resetChatContext();
        actions.setChatStep(STEPS.START);
        pushAssistant(
          "Tell me what's going on in a sentence or two."
        );
        return;
      }

      default:
        return;
    }
  }

  const containerClasses = compact
    ? "flex flex-col h-full bg-surface border border-border-soft rounded-2xl overflow-hidden"
    : "flex flex-col h-[calc(100svh-12rem)] min-h-[28rem] bg-surface border border-border-soft rounded-2xl overflow-hidden";

  return (
    <section
      aria-labelledby={compact ? undefined : "chat-heading"}
      aria-label={compact ? "Scheduling chat" : undefined}
      className={containerClasses}
    >
      {!compact && (
        <header className="px-6 py-5 border-b border-border-soft">
          <h2 id="chat-heading" className="m-0 text-2xl text-ink">
            Schedule with NeuroSync
          </h2>
          <p className="m-0 mt-1 text-base text-ink-secondary">
            One question at a time. Take your time.
          </p>
        </header>
      )}

      {compact && (
        <header className="px-5 py-4 border-b border-border-soft">
          <h2 className="m-0 text-xl text-ink">Schedule</h2>
          <p className="m-0 mt-1 text-sm text-ink-secondary">
            Describe what's going on. I'll suggest someone.
          </p>
        </header>
      )}

      <div
        ref={scrollerRef}
        className={
          "flex-1 overflow-y-auto px-5 py-5 space-y-4 " +
          (compact ? "text-base" : "text-base")
        }
      >
        {chatBubbles.map((bubble) => {
          if (bubble.kind === "assistant") {
            return <AssistantBubble key={bubble.id} text={bubble.text} />;
          }
          if (bubble.kind === "user") {
            return <UserBubble key={bubble.id} text={bubble.text} />;
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
        disabled={submitting || chatStep === STEPS.SUBMITTING || chatStep === STEPS.DESCRIBING}
        onAnswer={handleAnswer}
      />
    </section>
  );
}
