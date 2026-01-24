/**
 * ============================================================================
 * TOAST NOTIFICATION HOOK
 * ============================================================================
 * 
 * @file src/hooks/use-toast.ts
 * 
 * PURPOSE:
 * Toast notification system for user feedback.
 * Inspired by react-hot-toast library.
 * 
 * FEATURES:
 * - Toast state management with reducer
 * - Automatic dismissal with timeout
 * - Toast limit enforcement
 * - Update and dismiss actions
 * 
 * RELATED FILES:
 * - src/components/ui/toast.tsx (Toast component)
 * - src/components/ui/toaster.tsx (Toaster component)
 * 
 * ============================================================================
 */

"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

// ============================================================================
// SECTION: CONSTANTS
// ============================================================================

/** Maximum number of toasts displayed simultaneously */
const TOAST_LIMIT = 1

/** Delay before removing toast (milliseconds) */
const TOAST_REMOVE_DELAY = 1000000

// ============================================================================
// SECTION: TYPE DEFINITIONS
// ============================================================================

/**
 * Extended toast type with ID and optional fields.
 */
type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

/**
 * Action types for toast reducer.
 */
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

// ============================================================================
// SECTION: ID GENERATION
// ============================================================================

let count = 0

/**
 * Generate unique toast ID.
 * 
 * @returns Unique toast identifier
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

// ============================================================================
// SECTION: ACTION TYPES
// ============================================================================

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

/**
 * Toast state interface.
 */
interface State {
  toasts: ToasterToast[]
}

// ============================================================================
// SECTION: TIMEOUT MANAGEMENT
// ============================================================================

/**
 * Map of toast IDs to timeout handlers.
 */
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * Schedule toast removal after delay.
 * 
 * @param toastId - Toast identifier
 */
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

// ============================================================================
// SECTION: REDUCER
// ============================================================================

/**
 * Toast state reducer.
 * 
 * Handles all toast state mutations.
 * 
 * @param state - Current toast state
 * @param action - Action to perform
 * @returns New toast state
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      // Add toast, limit to TOAST_LIMIT
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      // Update existing toast by ID
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // Side effect: schedule removal
      // Note: Could be extracted into separate action, kept here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        // Dismiss all toasts
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      // Remove toast from state
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

// ============================================================================
// SECTION: STATE MANAGEMENT
// ============================================================================

/**
 * Listeners for state changes.
 */
const listeners: Array<(state: State) => void> = []

/**
 * In-memory toast state.
 */
let memoryState: State = { toasts: [] }

/**
 * Dispatch action and notify listeners.
 * 
 * @param action - Action to dispatch
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// ============================================================================
// SECTION: TOAST FUNCTION
// ============================================================================

type Toast = Omit<ToasterToast, "id">

/**
 * Create and display a toast notification.
 * 
 * @param props - Toast properties
 * @returns Toast control object with id, dismiss, and update methods
 * 
 * @example
 * ```typescript
 * const toast = toast({ title: 'Success', description: 'Operation completed' });
 * // Later: toast.dismiss();
 * ```
 */
function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

// ============================================================================
// SECTION: USE TOAST HOOK
// ============================================================================

/**
 * React hook for toast notifications.
 * 
 * Provides toast state and control functions.
 * 
 * @returns Toast state and control functions
 * 
 * @example
 * ```typescript
 * const { toast, dismiss } = useToast();
 * toast({ title: 'Error', variant: 'destructive' });
 * ```
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    // Subscribe to state changes
    listeners.push(setState)
    return () => {
      // Unsubscribe on unmount
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
