# Privacy Policy for WhatsApp Web Privacy Blur

**Last Updated:** February 12, 2026

## Introduction
"WhatsApp Web Privacy Blur" (the "Extension") is a Chrome extension designed to enhance your privacy while using WhatsApp Web. This Privacy Policy outlines how the Extension handles your data.

## Data Collection and Usage
**We do not collect, store, or transmit any personal data.**

### 1. Local Storage
The Extension uses `chrome.storage.local` exclusively to save your **settings preferences** (e.g., which blur options are enabled, your lock screen password). 
- These settings are stored locally on your device.
- They are **never** sent to any external server.
- They are **not** synced across devices unless you use browser sync (which is managed by Google/Browser Vendor, typically encrypted).

### 2. No External Connections
The Extension does not make any network requests to external servers, APIs, or analytics services. It operates entirely offline within your browser.

### 3. Access to Website Data
The Extension requires permission to access `web.whatsapp.com` solely to apply CSS styles (blur effects) and inject the lock screen overlay. It does **not**:
- Read your messages.
- Access your contacts.
- Store or process any content displayed on the page.

## Data Security
Since no data is collected or transmitted, there is no risk of data breach from our side. Your password for the "Screen Lock" feature is stored in your browser's local storage. While this provides a layer of security against casual access ("shoulder surfing"), it is not intended to protect against sophisticated attacks with physical access to the device.

## Changes to This Policy
We may update this Privacy Policy to reflect changes in the Extension's functionality. Any changes will be posted here.

## Contact
If you have any questions about this Privacy Policy, please open an issue on the GitHub repository.
