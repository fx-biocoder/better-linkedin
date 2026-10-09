# Better LinkedIn

A web extension that automatically hides promoted posts, filters out unwanted content, and enhances your LinkedIn™ experience with advanced tools like private notes and AI image detection.

Official website: [Better LinkedIn](https://betterlinkedin.vercel.app)

## Features

- **Advanced Feed Filters:** Automatically remove promoted posts, suggested posts, AI-generated spam, and posts containing specific keywords, companies, emojis, or "Broetry" (engagement bait with excessive line breaks).
- **Job Search Enhancements:** Hide jobs older than 30 days and automatically detect red flags in job descriptions (e.g., "ninja", "work under pressure").
- **Profile Tools:** Add Private Notes and Tags to profiles (stored locally), and detect suspicious or AI-generated profile pictures.
- **Full Internationalization (i18n):** Available in English, Spanish, Portuguese, and Italian.
- **Privacy First:** All processing is done locally. No user data is collected or shared.

## Installation

### Method 1: Use the browser extension/add-on store (recommended)

- **Chrome:** [Download from Chrome Web Store](https://chromewebstore.google.com/detail/better-linkedin-enhance-y/oddknibdgonokobpaakcodpicfppgefg)
- **Firefox:** [Download from Firefox add-ons](https://addons.mozilla.org/es-AR/firefox/addon/betterlinkedin/)

### Method 2: Download and Install

1. **Download the extension:**
   - Go to the [Releases](https://github.com/fx-biocoder/better-linkedin/releases) page
   - Download the latest `.zip` file
   - Extract the downloaded file

2. **Install in your browser:**

#### Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the extracted folder
5. The extension should now appear in your extensions list

#### Firefox
1. Open Firefox and go to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file from the extracted folder
5. The extension will be temporarily installed (reloads after browser restart)

### Method 3: Clone and Build (For Developers)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/fx-biocoder/better-linkedin.git
   cd better-linkedin
   ```

2. **Install in your browser** (follow the same steps as Method 1)

## Usage & Configuration

Once installed, Better LinkedIn runs automatically in the background.

1. **Basic Toggles:** Click the Better LinkedIn icon in your browser toolbar to quickly enable/disable common filters or add Muted Words and Companies.
2. **Advanced Dashboard:** Click the "Advanced Settings" gear icon in the popup to open the full dashboard. Here you can configure:
   - **Feed Filters:** Toggle Broetry filters, interaction filters, etc.
   - **Job Filters:** Enable Red Flag warnings and age filters for job hunts.
   - **Profile Filters:** Enable Private Notes and AI profile picture detection.
3. **Private Notes:** When visiting a LinkedIn profile, a new panel will appear allowing you to save local notes and tags for that candidate or connection.

All settings are saved automatically and applied in real-time.

## Troubleshooting

**Extension not working?**
- Make sure the extension is enabled in your browser
- Check that you're on the LinkedIn feed page (`linkedin.com/feed`)
- Try refreshing the LinkedIn page
- Check browser console for any errors (F12 → Console tab)

**Some posts still showing?**
- LinkedIn may change their HTML structure occasionally
- Make sure the filtering options are enabled in the dashboard
- Check that company names match exactly (case-sensitive)
- Report issues using the "Report Bug" button in the extension popup

## Contributing

Contributions are welcome! Feel free to:
- Report bugs using the "Report Bug" button in the extension
- Suggest new features
- Submit pull requests
- Help improve documentation

## License

This project is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html).

## Support

If you find this extension helpful and would like to support its development, consider making a donation:

### 💖 Support the Project

- **Buy me a coffee:** [Ko-fi](https://ko-fi.com/biocoder)
- **GitHub Sponsors:** [Sponsor me on GitHub](https://github.com/sponsors/fx-biocoder)
- **PayPal:** [PayPal Donation](https://paypal.me/facumartinez680)

### 🚀 Other Ways to Support

- ⭐ **Star this repository** if you find it useful
- 🐛 **Report bugs** using the "Report Bug" button in the extension
- 💡 **Suggest new features** via GitHub Issues
- 📢 **Share with others** who might benefit from this extension
- 🔧 **Contribute code** by submitting pull requests

Your support helps maintain and improve this extension, ensuring it stays up-to-date with LinkedIn's changes and adding new features based on user feedback.

## Disclaimer

This is an unofficial browser extension and is not affiliated with, endorsed by, or connected to LinkedIn or Microsoft. Use at your own risk.
