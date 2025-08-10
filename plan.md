Below is a detailed plan outlining every dependent file, change, and best practice to build the turnkey “TonyCash Tool” for Instagram device automation. This plan assumes a modern Next.js project (using the app folder) with shadcn/ui and Tailwind CSS, and it integrates device automation (via touch on connected iPhones/Androids) plus AI and scheduling features.

---

## 1. Global Architecture and Project Setup

- **Rename Tool:** Use “TonyCash Tool” throughout (no “automation” in the name).  
- **New Dependencies:**  
  - Add a device automation library (for example, Appium) to package.json if available.  
  - Ensure that runtime dependencies for CSV/YAML parsing (or use built-in solutions) are installed.  
  - The provided OpenAI key will be used via our AI integration module.

- **Directory Restructure:**  
  - Create new pages under `src/app` for Dashboard, Settings, and Automation features.  
  - Introduce a new folder `src/components/automation/` for UI components specific to device automation.  
  - Create new library modules under `src/lib/` for AI methods, device control, scheduling, logging, and import/export.

---

## 2. Global Layout and Routing

- **File:** `src/app/layout.tsx`  
  - Set up a global layout that includes a minimal header (with the tool name “TonyCash Tool”) and a sidebar menu.  
  - Use clean typography, spacing, and color classes from globals.css.  
  - Wrap the main content area in an error boundary (see “Error Handling” below).

- **File:** Update `src/app/globals.css`  
  - If necessary, add layout classes and responsive design rules.  
  - Ensure spacing and font-size globals are modern and consistent across the app.

---

## 3. Dashboard Page

- **File:** `src/app/dashboard/page.tsx`  
  - Display the following:  
    - A list of connected devices (with status indicators and error messages if not connected).  
    - A snapshot of recent logs and scheduled tasks.  
    - Shortcut cards/buttons (using text, typography, and color blocks only; no external icons) for quick actions such as “Start DM Campaign” or “Auto Like Post”.  
  - Use placeholders if you later add images (via `<img>` tags with urls like `https://placehold.co/800x600?text=Elegant+dashboard+overview+for+TonyCash+Tool` with detailed alt text).

---

## 4. Settings and API Keys

- **File:** `src/app/settings/page.tsx`  
  - Create a form that allows users to:  
    - Input their OpenAI (or Claude) API key (pre-fill with the provided key).  
    - Set mobile proxy URLs and toggle mobile data/airplane mode options.  
    - Save settings to local storage (or secure backend, if desired).  
  - Validate inputs and display error messages on invalid entries.
  
- **New Component:** `src/components/settings/SettingsForm.tsx`  
  - Build a reusable, modern form component with labeled inputs, spacing, and error feedback.
  
---

## 5. Automation Features and Controls

- **File:** `src/app/automation/page.tsx`  
  - Provide a dashboard-like interface where users can select and configure various automation features:  
    - **Smart Engagement Engine:**  
      - Auto Comment, Auto Like, Auto Follow/Unfollow, Follow Back  
      - Repost content and send mass DMs (use spintax templates)  
      - Story viewer and comment replier  
      - Option to block low-quality followers  
    - **Advanced AI Tools:**  
      - AI Bio Updater, Caption Generator, Hashtag Optimizer, Smart Reply Assistant  
    - **DM Suite:**  
      - DM Target Lists (CSV/YAML import), multi-message campaigns, auto follow-up DMs with delays, and media attachments  
  - Each section will include clearly labeled buttons and toggle groups (using custom components without external icon libraries).

- **New UI Components (in `src/components/automation/`):**  
  - **DeviceController.tsx:**  
    - Display connection status of attached devices.
    - Provide manual “touch” simulation commands (start, stop, refresh).  
  - **DMEditor.tsx:**  
    - UI for composing DM campaigns (textarea, input fields for spintax, CSV uploader button for target lists).  
    - Preview area for the message template.
  - **EngagementController.tsx:**  
    - UI for auto-like, auto-comment, follow/unfollow controls with form inputs and toggles.

---

## 6. API Endpoints

- **File:** `src/app/api/automation/route.ts`  
  - Create a POST API endpoint that accepts JSON commands. Example payload:
    ```typescript
    {
      "feature": "dmCampaign",
      "action": "start",
      "parameters": { "message": "Hello {name}", "delay": 3000 }
    }
    ```
  - Use try-catch blocks to handle errors and return JSON with status code and error details.

---

## 7. Library Modules

- **Device Automation Module:**  
  - **File:** `src/lib/device.ts`  
    - Write functions to detect connected devices and execute touch-simulation commands using the chosen automation library.  
    - Wrap operations in error handlers, returning clear error messages if the device is not reachable.

- **AI Integration Module:**  
  - **File:** `src/lib/ai.ts`  
    - Implement functions:  
      - `generateCaption(media: string): Promise<string>`  
      - `updateBio(currentBio: string): Promise<string>`  
      - `smartReply(comment: string): Promise<string>`  
    - These functions will use the provided OpenAI API key, call the proper endpoint (using fetch with proper JSON body and error handling), and return results.

- **Scheduler Module:**  
  - **File:** `src/lib/scheduler.ts`  
    - Implement a task scheduler for posting, DM campaigns, and engagement actions.  
    - Use either `setTimeout`/`setInterval` or a cron library, ensuring cancellation and safe error handling.

- **Logger Module:**  
  - **File:** `src/lib/logger.ts`  
    - Create functions to log each action (success and error) to a file or in-memory store.  
    - Provide getter methods for the Dashboard page to display recent logs.

- **Import/Export Module:**  
  - **File:** `src/lib/importExport.ts`  
    - Implement functions for parsing CSV/YAML files (for DM target lists, hashtag lists, and settings export/import).  
    - Validate file structure and gracefully handle parsing errors.

---

## 8. Error Handling and Best Practices

- **ErrorBoundary Component:**  
  - **File:** `src/components/ErrorBoundary.tsx`  
    - Implement a React error boundary to catch UI rendering errors and display a user-friendly fallback screen.
    
- **API and Library Functions:**  
  - Use try-catch blocks in every backend route and library module.  
  - Validate inputs (using TypeScript types and optionally Zod schemas) and return detailed error messages without exposing sensitive information.

- **Edge Cases:**  
  - Handle device disconnections, invalid API key errors, network timeouts, and file parsing errors.  
  - Log errors consistently using the Logger module.

---

## 9. UI/UX Considerations

- **Modern, Clean Interface:**  
  - Use typography, spacing, and layout from the global CSS theme.  
  - Avoid external icon libraries; rely on styled text and colored backgrounds for status indicators and buttons.  
  - Ensure responsive design so that the tool works on various screen sizes.
  
- **User Feedback:**  
  - Provide toast notifications or inline alerts on success or failure of automation commands.  
  - Use placeholder text in forms and detailed error messages if an API/key is missing.

---

## 10. Documentation and Testing

- **README.md:**  
  - Update with installation instructions for macOS/Windows, configuration steps (device setup, API keys entry), and usage guidelines.  
  - Provide sample curl commands to test API endpoints. Example:
    ```bash
    curl -X POST http://localhost:8000/api/automation \
      -H "Content-Type: application/json" \
      -d '{"feature": "dmCampaign", "action": "start", "parameters": {"message": "Hello {name}"}}'
    ```
- **Testing:**  
  - Perform local testing with curl and browser-based testing on each new page.  
  - Verify that device and AI functions return expected results and that error handling covers network/device issues.

---

**Summary**  
- The plan creates a modern Next.js dashboard with pages for Dashboard, Settings, and Automation under `src/app`.  
- New UI components (DeviceController, DMEditor, EngagementController) and an ErrorBoundary ensure robust error handling.  
- Library modules for AI integration, device control, scheduling, logging, and CSV/YAML import/export are added with proper try-catch blocks.  
- An API endpoint in `src/app/api/automation/route.ts` processes actions with detailed error messages.  
- The modern UI relies solely on typography, color, spacing, and layout, fulfilling the design guidelines.  
- Detailed README and curl tests ensure smooth installation and verification on both macOS and Windows.
