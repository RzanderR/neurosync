export const INITIAL_MESSAGES = [
  {
    id: "msg-seed-001",
    from: "Eastside Wellness Group",
    subject: "RE: Referral 8821-NRO",
    body:
      "Hello Patient —\n\n" +
      "Following up re: ref# 8821-NRO. Your in-network referral for outpatient OT eval was processed under your secondary coverage (BCBS PPO). Pls note PCP signoff required prior to scheduling per HMO policy 4A. Pre-auth pending — typical TAT 3-5 biz days.\n\n" +
      "If you have not heard from our scheduling dept by EOW pls call 425-555-0182 ext. 3 to confirm copay obligations. Note: We do not accept new patients on Mondays. Cancellations <24hr incur $75 fee.\n\n" +
      "Best,\n" +
      "Patient Coordination Team\n" +
      "Eastside Wellness Group",
    receivedAt: "2026-05-16T09:42:00Z",
    unread: true,
    rewritten:
      "Action needed: Call 425-555-0182 ext. 3 before Friday to confirm your copay.\n\n" +
      "A referral has been started for your physical therapy evaluation. It is not yet scheduled.\n\n" +
      "Next steps:\n" +
      "1. Your primary care doctor must sign off first.\n" +
      "2. Insurance approval is pending (3–5 business days).\n" +
      "3. Call the clinic by end of this week to confirm your copay.\n\n" +
      "Good to know:\n" +
      "- The clinic does not book new patients on Mondays.\n" +
      "- Canceling less than 24 hours before an appointment costs $75.",
  },
];

export function buildConfirmationMessage(appointment, idHint) {
  const isPathA = appointment.path === "A";
  const subject = isPathA
    ? `Appointment confirmed: ${appointment.appointmentTime}`
    : `We received your request — ${appointment.clinic.name}`;
  const body = isPathA
    ? `Hello —\n\n` +
      `This confirms your appointment with ${appointment.clinic.name} (${appointment.clinic.specialty}) ` +
      `on ${appointment.appointmentTime}.\n\n` +
      `Confirmation number: ${appointment.confirmationCode}.\n` +
      `Location: ${appointment.location ?? appointment.clinic.address}.\n\n` +
      `Please bring a list of any current medications. If you need to reschedule, ` +
      `reply to this message at least 24 hours in advance.\n\n` +
      `— ${appointment.clinic.name} office`
    : `Hello —\n\n` +
      `We received the request you sent through NeuroSync. We will email you within ` +
      `2 business days with available times.\n\n` +
      `If your symptoms change before we reach you, please reply to this message.\n\n` +
      `— ${appointment.clinic.name} office`;

  return {
    id: idHint ?? `msg-${Date.now()}`,
    from: appointment.clinic.name + " office",
    subject,
    body,
    receivedAt: new Date().toISOString(),
    unread: true,
    rewritten: isPathA
      ? `Your appointment is confirmed.\n\n` +
        `When: ${appointment.appointmentTime}\n` +
        `Where: ${appointment.location ?? appointment.clinic.address}\n` +
        `Confirmation: ${appointment.confirmationCode}\n\n` +
        `Bring: a list of current medications.\n` +
        `To reschedule: reply to this message at least 24 hours ahead.`
      : `The clinic received your request.\n\n` +
        `They'll email you within 2 business days with available times.\n\n` +
        `If anything changes before then, reply to this message.`,
    relatedAppointmentId: appointment.id,
  };
}
