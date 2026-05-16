const TODOS_BY_MESSAGE = {
  "msg-seed-001": [
    {
      text: "Call 425-555-0182 ext. 3 to confirm your copay",
      dueLabel: "By Friday",
    },
    {
      text: "Ask your PCP to sign off on the OT referral",
      dueLabel: "Within 3–5 business days",
    },
  ],
};

function todosForConfirmation(message) {
  if (!message.relatedAppointmentId) return null;
  if (message.subject?.startsWith("Appointment confirmed")) {
    return [
      {
        text: "Bring a list of your current medications to the appointment",
        dueLabel: message.subject.replace("Appointment confirmed: ", ""),
      },
    ];
  }
  if (message.subject?.startsWith("We received your request")) {
    return [
      {
        text: "Watch your inbox for the clinic's reply",
        dueLabel: "Within 2 business days",
      },
    ];
  }
  return null;
}

export function extractTodos(message) {
  const direct = TODOS_BY_MESSAGE[message.id];
  if (direct) return direct;
  const fromConfirmation = todosForConfirmation(message);
  if (fromConfirmation) return fromConfirmation;
  return [];
}
