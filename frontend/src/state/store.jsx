import { createContext, useContext, useReducer, useMemo } from "react";
import { PATIENT } from "../data/mockPatient.js";
import { INITIAL_APPOINTMENTS } from "../data/mockAppointments.js";
import { INITIAL_MESSAGES } from "../data/mockMessages.js";

const AppStateContext = createContext(null);
const AppDispatchContext = createContext(null);

const initialChatBubbles = [
  {
    id: "bubble-welcome",
    kind: "assistant",
    text: "Hi Alex. There's a new message from a clinic below — I can put it in plain language whenever you're ready. Or we can book a new appointment.",
  },
  {
    id: "bubble-msg-001",
    kind: "clinic_message",
    messageId: "msg-seed-001",
  },
];

const initialState = {
  patient: PATIENT,
  appointments: INITIAL_APPOINTMENTS,
  messages: INITIAL_MESSAGES,
  providers: [],
  providersLoading: true,
  providersError: null,
  chatBubbles: initialChatBubbles,
  chatStep: "START",
  chatContext: {},
  activeTab: "reminders",
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_TAB":
      return { ...state, activeTab: action.tab };

    case "SET_PROVIDERS":
      return {
        ...state,
        providers: action.providers,
        providersLoading: false,
        providersError: null,
      };

    case "SET_PROVIDERS_ERROR":
      return {
        ...state,
        providersLoading: false,
        providersError: action.error,
      };

    case "ADD_APPOINTMENT":
      return { ...state, appointments: [...state.appointments, action.appointment] };

    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id ? { ...m, ...action.patch } : m
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

  const actions = useMemo(
    () => ({
      setTab: (tab) => dispatch({ type: "SET_TAB", tab }),
      setProviders: (providers) => dispatch({ type: "SET_PROVIDERS", providers }),
      setProvidersError: (error) => dispatch({ type: "SET_PROVIDERS_ERROR", error }),
      addAppointment: (appointment) => dispatch({ type: "ADD_APPOINTMENT", appointment }),
      updateMessage: (id, patch) => dispatch({ type: "UPDATE_MESSAGE", id, patch }),
      addChatBubble: (bubble) => dispatch({ type: "ADD_CHAT_BUBBLE", bubble }),
      addChatBubbles: (bubbles) => dispatch({ type: "ADD_CHAT_BUBBLES", bubbles }),
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
