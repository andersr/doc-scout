import { useEffect, useState } from "react";
import { KEYS } from "~/shared/keys";
import { ActionButton } from "../ui/buttons/ActionButton";

// Google Picker API types
interface GooglePickerDocument {
  description?: string;
  iconUrl?: string;
  id: string;
  lastEditedUtc?: number;
  mimeType: string;
  name: string;
  serviceId?: string;
  type?: string;
  url: string;
}

interface GooglePickerData {
  action: string;
  docs?: GooglePickerDocument[];
  viewToken?: string;
}

interface GooglePickerView {
  setIncludeFolders: (include: boolean) => GooglePickerView;
  setMimeTypes: (types: string) => GooglePickerView;
}

interface GooglePickerBuilder {
  addView: (view: GooglePickerView) => GooglePickerBuilder;
  build: () => GooglePicker;
  enableFeature: (feature: GooglePickerFeature) => GooglePickerBuilder;
  setCallback: (
    callback: (data: GooglePickerData) => void,
  ) => GooglePickerBuilder;
  setOAuthToken: (token: string) => GooglePickerBuilder;
}

interface GooglePicker {
  setVisible: (visible: boolean) => void;
}

type GooglePickerFeature = string | number;
type GooglePickerViewId = string | number;

declare global {
  interface Window {
    gapi: {
      load: (
        api: string,
        options: { callback: () => void; onerror: (error: Error) => void },
      ) => void;
    };
    google: {
      picker: {
        Action: {
          CANCEL: string;
          PICKED: string;
        };
        DocsView: new (viewId: GooglePickerViewId) => GooglePickerView;
        Feature: {
          MULTISELECT_ENABLED: GooglePickerFeature;
          NAV_HIDDEN: GooglePickerFeature;
        };
        PickerBuilder: new () => GooglePickerBuilder;
        ViewId: {
          DOCS: GooglePickerViewId;
        };
      };
    };
  }
}

interface SelectedFile {
  id: string;
  mimeType: string;
  name: string;
  url?: string;
}

export function GoogleDriveForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);

  useEffect(() => {
    const loadGoogleApis = async () => {
      try {
        // Load Google APIs script if not already loaded
        if (!window.gapi) {
          await loadScript("https://apis.google.com/js/api.js");
        }

        // Initialize gapi and load the picker library
        await new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error("Timeout loading Google Picker API"));
          }, 10000);

          window.gapi.load("picker", {
            callback: () => {
              clearTimeout(timeoutId);
              setIsApiLoaded(true);
              resolve();
            },
            onerror: (error: Error) => {
              clearTimeout(timeoutId);
              reject(error);
            },
          });
        });
      } catch (error) {
        console.error("Failed to load Google APIs:", error);
        setError(
          "Failed to load Google Drive picker. Please refresh the page and try again.",
        );
      }
    };

    loadGoogleApis();
  }, []);

  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        // If script exists and gapi is available, resolve immediately
        if (window.gapi) {
          resolve();
          return;
        }
        // If script exists but gapi is not ready, wait a bit
        setTimeout(() => {
          if (window.gapi) {
            resolve();
          } else {
            reject(
              new Error("Google API script loaded but gapi not available"),
            );
          }
        }, 1000);
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;

      const timeoutId = setTimeout(() => {
        reject(new Error(`Timeout loading script: ${src}`));
      }, 10000);

      script.onload = () => {
        clearTimeout(timeoutId);
        // Wait a bit for gapi to be available
        setTimeout(() => {
          if (window.gapi) {
            resolve();
          } else {
            reject(
              new Error("Google API script loaded but gapi not available"),
            );
          }
        }, 100);
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.head.appendChild(script);
    });
  };

  const handleBrowseFiles = async () => {
    if (!isApiLoaded) {
      setError(
        "Google Drive picker is still loading. Please wait a moment and try again.",
      );
      return;
    }

    // Double-check that Google API is really available
    if (!window.google?.picker) {
      setError(
        "Google Drive picker is not available. Please refresh the page and try again.",
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get the access token from our API
      const response = await fetch("/api/google-access-token");
      const data = await response.json();

      if (!data.success) {
        if (response.status === 401) {
          throw new Error(
            "Please log in with Google to access your Google Drive files.",
          );
        }
        throw new Error(data.error || "Failed to get access token");
      }

      const accessToken = data.accessToken;

      // Create and show the picker
      const picker = new window.google.picker.PickerBuilder()
        .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
        .setOAuthToken(accessToken)
        .addView(
          new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
            .setIncludeFolders(true)
            .setMimeTypes("application/pdf,text/plain,text/markdown"),
        )
        .setCallback(handlePickerCallback)
        .build();

      picker.setVisible(true);
    } catch (error) {
      console.error("Error opening Google Drive picker:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to open Google Drive picker. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickerCallback = (data: GooglePickerData) => {
    if (data.action === window.google.picker.Action.PICKED && data.docs) {
      const doc = data.docs[0]; // Take the first selected file
      setSelectedFile({
        id: doc.id,
        mimeType: doc.mimeType,
        name: doc.name,
        url: doc.url,
      });
      setError(null);
    } else if (data.action === window.google.picker.Action.CANCEL) {
      // User cancelled, do nothing
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Please select a file from Google Drive");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append(KEYS.intent, KEYS.googleDrive);
      formData.append("fileId", selectedFile.id);
      formData.append("fileName", selectedFile.name);
      formData.append("mimeType", selectedFile.mimeType);

      const response = await fetch(window.location.pathname, {
        body: formData,
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to add file from Google Drive");
      }

      // The server action will handle the redirect
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add file");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <ActionButton
          onClick={handleBrowseFiles}
          disabled={isLoading || !isApiLoaded}
        >
          {isLoading
            ? "Opening picker..."
            : !isApiLoaded
              ? "Loading Google Drive..."
              : "Browse files in my Google Drive"}
        </ActionButton>
      </div>

      {error && (
        <div
          className="border-danger bg-danger/5 rounded-md border p-4"
          role="alert"
        >
          <p className="text-danger">{error}</p>
          {error.includes("Failed to load Google Drive picker") && (
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-600 underline hover:text-red-800"
            >
              Refresh Page
            </button>
          )}
        </div>
      )}

      {selectedFile && (
        <div className="rounded-md border border-green-200 bg-green-50 p-4">
          <h3 className="mb-2 font-semibold text-green-800">Selected file:</h3>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-green-700">
              {selectedFile.name}
            </p>
            <p className="text-xs text-green-600">
              Type: {selectedFile.mimeType}
            </p>
            <p className="text-xs text-green-600">ID: {selectedFile.id}</p>
          </div>

          <div className="mt-4 flex gap-2">
            <ActionButton onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Processing..." : "Add Doc"}
            </ActionButton>
            <button
              onClick={() => setSelectedFile(null)}
              disabled={isLoading}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {!selectedFile && (
        <div className="rounded-md border p-4 text-center text-gray-500">
          <p>
            No file selected. Click &quot;Browse files in my Google Drive&quot;
            to select a file.
          </p>
          <p className="mt-1 text-sm">
            Supported formats: PDF, Text, and Markdown files
          </p>
        </div>
      )}
    </div>
  );
}
