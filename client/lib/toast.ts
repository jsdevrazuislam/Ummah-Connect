import { toast } from "sonner";

/**
 * @typedef {object} ToastOptions
 * @property {string} [title] - The title of the toast message.
 * @property {string} [description] - The detailed description of the toast message.
 * @property {"top-center" | "top-right" | "top-left" | "bottom-center" | "bottom-right" | "bottom-left"} [position] - The position where the toast will appear on the screen.
 * @property {number} [duration] - How long the toast should be visible in milliseconds.
 * @property {boolean} [dismissible] - Whether the toast can be dismissed by the user.
 */
type ToastOptions = {
  title?: string;
  description?: string;
  position?: "top-center" | "top-right" | "top-left" | "bottom-center" | "bottom-right" | "bottom-left";
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
};

/**
 * Displays a success toast notification.
 *
 * @param {string} title - The main title of the success message.
 * @param {Omit<ToastOptions, "title">} [options] - Optional configuration for the toast, excluding the title.
 * @param {string} [options.description] - A detailed description for the toast.
 * @param {"top-center" | "top-right" | "top-left" | "bottom-center" | "bottom-right" | "bottom-left"} [options.position] - The position of the toast. Defaults to "top-right".
 * @param {number} [options.duration] - The duration the toast is visible in milliseconds. Defaults to 3000ms.
 * @param {boolean} [options.dismissible] - Whether the toast can be dismissed. Defaults to true.
 */
export function showSuccess(
  title: string,
  options?: Omit<ToastOptions, "title">,
) {
  toast.success(title, {
    description: options?.description,
    position: options?.position || "top-right",
    duration: options?.duration || 3000,
    dismissible: options?.dismissible ?? true,
    action: {
      label: "Cancel",
      onClick: () => {}, // This action doesn't do anything specific on click
    },
  });
}

/**
 * Displays an error toast notification.
 * It uses `parseError` to structure the error message.
 *
 * @param {string} error - The raw error message string to be displayed.
 * @param {ToastOptions} [options] - Optional configuration for the toast, which can override the parsed title and description.
 * @param {string} [options.title] - An optional custom title for the error toast. Defaults to "Error" or parsed title.
 * @param {string} [options.description] - An optional custom description for the error toast. Defaults to the parsed error message.
 * @param {"top-center" | "top-right" | "top-left" | "bottom-center" | "bottom-right" | "bottom-left"} [options.position] - The position of the toast. Defaults to "top-right".
 * @param {number} [options.duration] - The duration the toast is visible in milliseconds. Defaults to 4000ms.
 * @param {boolean} [options.dismissible] - Whether the toast can be dismissed. Defaults to true.
 */
export function showError(error: string, options?: ToastOptions) {
  toast.error("Error", {
    description: error,
    position: options?.position || "top-right",
    duration: options?.duration || 4000,
    dismissible: options?.dismissible ?? true,
    action: {
      label: "Cancel",
      onClick: () => {},
    },
  });
}
