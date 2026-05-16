import { createContext, useContext, useReducer, useMemo, useEffect } from "react";
import { INITIAL_APPOINTMENTS } from "../data/mockAppointments.js";
import { INITIAL_MESSAGES } from "../data/mockMessages.js";
import { extractTodos } from "../lib/todoExtractor.js";

const AppStateContext = createContext(null);
const AppDispatchContext = createContext(null);

const PATIENT_STORAGE_KEY = "neurosync.patient.v1";

function loadPatient() {
  try {
    const raw = localStorage.getItem(PATIENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function seedTodos(messages) {
  const todos = [];
  messages.forEach((msg) => {
    extractTodos(msg).forEach((t, idx) => {
      todos.push({
        id: `todo-${msg.id}-${idx}`,
        messageId: msg.id,
        text: t.text,
        dueLabel: t.dueLabel,
        completed: false,
      });
    });
  });
  return todos;
}

const initialChatBubbles = [
  {
    id: "bubble-welcome",
    kind: "assistant",
    text: "Hi. Tell me what kind of care you need — a sentence or two is plenty, and I'll suggest a provider.",
  },
];

const initialMessages = INITIAL_MESSAGES;

const initialState = {
  patient: null,
  appointments: INITIAL_APPOINTMENTS,
  messages: initialMessages,
  todos: seedTodos(initialMessages),
  chatBubbles: initialChatBubbles,
  chatStep: "START",
  chatContext: {},
  view: "home",
  showAccountModal: false,
  accountModalStartStep: 1,
};

function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE_PATIENT":
      return action.patient
        ? { ...state, patient: action.patient, showAccountModal: false }
        : { ...state, showAccountModal: true };

    case "SET_PATIENT":
      return {
        ...state,
        patient: action.patient,
        showAccountModal: false,
        accountModalStartStep: 1,
      };

    case "OPEN_ACCOUNT_MODAL":
      return {
        ...state,
        showAccountModal: true,
        accountModalStartStep: action.startStep ?? 1,
      };

    case "CLOSE_ACCOUNT_MODAL":
      return { ...state, showAccountModal: false };

    case "SIGN_OUT":
      return {
        ...state,
        patient: null,
        showAccountModal: true,
        accountModalStartStep: 1,
      };

    case "SET_VIEW":
      return { ...state, view: action.view };

    case "ADD_APPOINTMENT":
      return { ...state, appointments: [...state.appointments, action.appointment] };

    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id ? { ...m, ...action.patch } : m
        ),
      };

    case "ADD_MESSAGE": {
      const todos = extractTodos(action.message).map((t, idx) => ({
        id: `todo-${action.message.id}-${idx}`,
        messageId: action.message.id,
        text: t.text,
        dueLabel: t.dueLabel,
        completed: false,
      }));
      return {
        ...state,
        messages: [action.message, ...state.messages],
        todos: [...todos, ...state.todos],
      };
    }

    case "TOGGLE_TODO":
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id ? { ...t, completed: !t.completed } : t
        ),
      };

    case "ADD_CHAT_BUBBLE":
      return { ...state, chatBubbles: [...state.chatBubbles, action.bubble] };

    case "ADD_CHAT_BUBBLES":
      return { ...state, chatBubbles: [...state.chatBubbles, ...action.bubbles] };

    case "SET_CHAT_STEP":
      return { ...state, chatStep: action.step };

    case "SET_CHAT_CONTEXT":
      return { ...state, chatContext: { ...state.chatContext, ...action.patch } };

    case "RESET_CHAT_CONTEXT":
      return { ...state, chatContext: {} };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const stored = loadPatient();
    dispatch({ type: "HYDRATE_PATIENT", patient: stored });
  }, []);

  useEffect(() => {
    if (state.patient) {
      try {
        localStorage.setItem(PATIENT_STORAGE_KEY, JSON.stringify(state.patient));
      } catch {
        // localStorage may be unavailable in private mode — ignore
      }
    } else {
      try {
        localStorage.removeItem(PATIENT_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, [state.patient]);

  const actions = useMemo(
    () => ({
      setPatient: (patient) => dispatch({ type: "SET_PATIENT", patient }),
      openAccountModal: (startStep) =>
        dispatch({ type: "OPEN_ACCOUNT_MODAL", startStep }),
      closeAccountModal: () => dispatch({ type: "CLOSE_ACCOUNT_MODAL" }),
      signOut: () => dispatch({ type: "SIGN_OUT" }),
      setView: (view) => dispatch({ type: "SET_VIEW", view }),
      addAppointment: (appointment) =>
        dispatch({ type: "ADD_APPOINTMENT", appointment }),
      addMessage: (message) => dispatch({ type: "ADD_MESSAGE", message }),
      updateMessage: (id, patch) => dispatch({ type: "UPDATE_MESSAGE", id, patch }),
      toggleTodo: (id) => dispatch({ type: "TOGGLE_TODO", id }),
      addChatBubble: (bubble) => dispatch({ type: "ADD_CHAT_BUBBLE", bubble }),
      addChatBubbles: (bubbles) =>
        dispatch({ type: "ADD_CHAT_BUBBLES", bubbles }),
      setChatStep: (step) => dispatch({ type: "SET_CHAT_STEP", step }),
      setChatContext: (patch) => dispatch({ type: "SET_CHAT_CONTEXT", patch }),
      resetChatContext: () => dispatch({ type: "RESET_CHAT_CONTEXT" }),
    }),
    []
  );

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={actions}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppProvider");
  return ctx;
}

export function useAppActions() {
  const ctx = useContext(AppDispatchContext);
  if (!ctx) throw new Error("useAppActions must be used inside AppProvider");
  return ctx;
}
