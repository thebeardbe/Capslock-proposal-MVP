# SPEC: Autonomous Micro-Agency – Weekly Brief MVP

## A. Product Overview
The **Autonomous Micro-Agency – Weekly Brief MVP** is an internal web application designed for account managers and performance marketers at CapsLock. It streamlines the manual process of analyzing raw campaign data by transforming CSV performance exports into concise, actionable weekly summaries. 

The tool accepts a performance CSV from platforms like Meta or Google Ads, calculates week-over-week (WoW) performance deltas, and generates a structured "Weekly Brief." It is designed to act as a "junior performance marketer," performing a high-quality first pass on the data to highlight critical shifts and suggest immediate tactical checks.

## B. Goals and Non-goals

### Goals
*   **Accelerate Weekly Reviews**: Reduce the time spent by account managers manually scanning rows of campaign numbers.
*   **Insight Clarity**: Prioritize "what changed" and "why it matters" over exhaustive data visualization.
*   **Actionable Output**: Provide specific suggestions for tests and account checks based on detected performance anomalies.
*   **Low Friction**: Allow users to get insights quickly with simple manual uploads.

### Non-goals (MVP)
*   **No Live Connections**: The MVP will not connect directly via API to Meta, Google Ads, or other platforms.
*   **No Automation**: No scheduled reports, email triggers, or automatic ad account adjustments.
*   **No Multi-Client Tracking**: No historical database or dashboard for tracking client performance over months/years.
*   **No Complex Analytics**: No advanced data modeling, predictive forecasting, or heatmaps.

## C. Users and Primary Use Cases

### Primary User
*   **CapsLock Account Manager / Performance Marketer**: Professional responsible for B2C client results who needs to prepare for client meetings or internal reviews.

### Primary Use Cases
*   **Weekly Prep**: An account manager uploads a fresh Friday-to-Friday export to quickly identify which campaigns spiked in CPA or dropped in conversion volume before a client call.
*   **Account Onboarding/Handover**: A team member taking over a client uses the tool to get a summary of the most recent significant shifts in spend and performance to understand the current account state.

## D. Functional Behavior

### Input Requirements
*   **Single CSV Upload**: Must support standard exports from major platforms for one client at a time.
*   **Mandatory Fields**: Date, Campaign Name, Impressions, Clicks, Cost, Conversions.
*   **Optional Fields**: Client Name (manual text field), Pre-computed CTR, CPC, CPA.

### Core System Logic
*   **Data Validation**: Detect and handle missing columns, invalid date formats, or empty files.
*   **Metric Aggregation**: Aggregate daily rows into two distinct buckets: "This Week" and "Last Week" (defaulting to the most recent 14 days of data split 7/7).
*   **Delta Calculation**: Compute percentage and absolute changes for spend, conversions, CPA, and CTR.
*   **Change Prioritization**: Apply simple heuristic rules to identify "Significant Changes" (e.g., Campaign X spend > $500 AND CPA increase > 20%).

### Output Generation
*   **Metrics Snapshot**: A table or list showing core account-level metrics for the two-week comparison.
*   **Textual Summary**: 2-3 paragraphs describing the primary drivers of performance changes.
*   **Tactical Recommendations**: A bulleted list of 3-5 specific checks (e.g., "Check frequency on Top-of-Funnel Video Campaign" or "Verify tracking for Checkout-Success page").

## E. High-level Architecture

### Components
1.  **Web UI (Frontend)**: A modern, single-page interface centered around a file upload dropzone and a results display area.
2.  **Upload & Validation Service**: Handles the reception of the file, verifies schema integrity, and handles basic error reporting.
3.  **Metrics & Aggregation Engine**: Processes raw rows into structured weekly summaries. It is responsible for the math and WoW logic.
4.  **Brief Generator**: An analysis layer that takes aggregated data, identifies outliers, and maps them to a brief template or LLM prompt.

### Boundaries
*   **Web UI**: Responsible for UI state and file upload interactions. It does not perform analysis.
*   **Aggregation Engine**: Platform-agnostic worker that consumes normalized data and returns WoW deltas.

## F. SOLID Principles and Design Constraints

### 1) SOLID Implementation Strategy
*   **Single Responsibility**: Separate the logic for *parsing* a CSV from the logic for *generating* textual insights.
*   **Open/Closed**: New metrics (e.g., ROAS) should be addable without modifying the core aggregation loop.
*   **Liskov Substitution**: Different data providers (CSV vs Future API) must fulfill a shared data contract.
*   **Interface Segregation**: The UI should only see the derived "Brief" model, not the raw row data.
*   **Dependency Inversion**: High-level brief logic should depend on a `MetricProvider` abstraction.

### 2) Single Source of Truth and Ownership
*   **Parsed Data**: Owned by the Validation Service.
*   **Metric Logic**: Centrally defined in a dedicated domain module to ensure consistency across the app.
*   **Read-Only UI**: The frontend displays derived results as read-only.

### 3) Logging, Observability, and Accountability
*   **Event Logging**: Track success/failure of uploads, parsing, and analysis.
*   **Metadata**: Logs should contain row counts and execution duration for performance auditing.
*   **Privacy**: Zero tolerance for PII in system logs.

### 4) Failure Modes and Impact
*   **Invalid CSV**: Surface clear errors (e.g., "Missing 'Spend' Column").
*   **Silent Failures**: The system must never produce a brief based on obviously incorrect data; it should fail loud.
*   **Edge Cases**: Handle 0 conversions or missing campaign names gracefully without crashing.

## G. UX and Interaction Flow
1.  **Welcome**: Clean layout with a clear call to action.
2.  **Input**: Simple drag-and-drop file upload.
3.  **Generation**: Immediate feedback with clear progress states.
4.  **Results**: Multi-section view prioritizing the textual brief, followed by data validation and checks.
5.  **Output**: Quick-copy functionality for the textual summary.

## H. Guidelines for the Future Implementation Agent
*   **Respect the Spec**: This document is the source of truth for MVP scope.
*   **Backend First**: Focus on robust parsing and aggregation before building complex UI components.
*   **Logging from Start**: Bake in observability from the first component to ensure easy debugging.
*   **SOLID Focus**: Maintain decoupling between input sources and the analysis engine.
