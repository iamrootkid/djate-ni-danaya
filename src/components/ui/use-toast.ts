import * as React from "react";
import { useContext, createContext } from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 1000000;

type ToastType = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToastType;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToastType>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: ToastType["id"];
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: ToastType["id"];
    };

interface State {
  toasts: ToastType[];
}

const initialState: State = {
  toasts: [],
};

function toastReducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      // If no toast id was provided, dismiss all
      if (toastId === undefined) {
        return {
          ...state,
          toasts: state.toasts.map((t) => ({
            ...t,
            open: false,
          })),
        };
      }

      // Find the toast to dismiss and update its open state
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId ? { ...t, open: false } : t
        ),
      };
    }

    case "REMOVE_TOAST": {
      const { toastId } = action;

      // If no toast id was provided, remove all
      if (toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }

      // Remove the specific toast
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== toastId),
      };
    }
  }
}

const ToastContext = createContext<{
  toasts: ToastType[];
  toast: (props: ToastProps) => void;
  dismiss: (toastId?: string) => void;
} | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}

export const ToastProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = React.useReducer(toastReducer, initialState);

  const toast = React.useCallback(
    ({ ...props }: ToastProps) => {
      const id = genId();
      const newToast = { id, ...props, open: true, duration: 3000 };

      dispatch({ type: "ADD_TOAST", toast: newToast });

      return {
        id,
        dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
        update: (props: ToastProps) => dispatch({
          type: "UPDATE_TOAST",
          toast: { ...props, id },
        }),
      };
    },
    [dispatch]
  );

  const dismiss = React.useCallback(
    (toastId?: string) => {
      dispatch({ type: "DISMISS_TOAST", toastId });
    },
    [dispatch]
  );

  // Handle removing the toast after it's been dismissed
  React.useEffect(() => {
    const handleRemove = (toastId: string) => {
      dispatch({ type: "REMOVE_TOAST", toastId });
    };

    state.toasts.forEach((toast) => {
      if (!toast.open) {
        const timeout = setTimeout(() => {
          handleRemove(toast.id);
        }, TOAST_REMOVE_DELAY);
        return () => clearTimeout(timeout);
      }
    });
  }, [state.toasts]);

  // Handle auto-dismiss after duration
  React.useEffect(() => {
    state.toasts.forEach((toast) => {
      if (toast.open && toast.duration) {
        const timeout = setTimeout(() => {
          dismiss(toast.id);
        }, toast.duration);
        return () => clearTimeout(timeout);
      }
    });
  }, [state.toasts, dismiss]);

  return React.createElement(
    ToastContext.Provider,
    { value: { toasts: state.toasts, toast, dismiss } },
    children
  );
};

// Export toast function for direct access
export const toast = (props: ToastProps) => {
  return useToast().toast(props);
};

// Types
export type { ToastProps, ToastActionElement };
