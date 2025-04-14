
import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        className: "rounded-md shadow-md",
        style: {
          background: "white",
          color: "black",
        },
      }}
    />
  );
}
