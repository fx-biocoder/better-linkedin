# Better LinkedIn

A web extension that automatically hides promoted posts and allows you to filter out posts containing specific keywords or company names on LinkedIn.

## Features

- Automatically hides all promoted posts (posts with "Promoted" tag)
- Filter posts by custom keywords
- Filter posts by company names
- Toggle each filtering option on/off
- Clean and distraction-free LinkedIn experience
- Easy-to-use popup interface

## Installation

### Method 1: Download and Install (Recommended)

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

### Method 2: Clone and Build (For Developers)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/fx-biocoder/better-linkedin.git
   cd better-linkedin
   ```

2. **Install in your browser** (follow the same steps as Method 1)

## Usage

Once installed:

1. **Navigate to LinkedIn:** Go to [LinkedIn Feed](https://www.linkedin.com/feed/)
2. **Open the extension:** Click the Better LinkedIn icon in your browser toolbar
3. **Configure settings:**
   - ✅ Check "Hide promoted posts" to automatically hide sponsored content
   - ✅ Check "Hide posts by muted words" to filter posts containing specific keywords
   - ✅ Check "Hide posts by muted companies" to filter posts from specific companies
   - Add keywords in the "Muted Words" section
   - Add company names in the "Muted Companies" section
4. **Save and enjoy:** Settings are automatically saved and applied immediately

The extension works in real-time, continuously monitoring for new posts as they load.

## Configuration

### Adding Muted Words
- Type a word in the "Muted Words" input field
- Click "Add" or press Enter
- Posts containing this word will be hidden
- Remove words by clicking the "×" button

### Adding Muted Companies
- Type a company name in the "Muted Companies" input field
- Click "Add" or press Enter
- Posts from this company will be hidden
- Remove companies by clicking the "×" button

### Toggle Options
- Each filtering option can be enabled/disabled independently
- Changes take effect immediately
- Settings are saved automatically

## Troubleshooting

**Extension not working?**
- Make sure the extension is enabled in your browser
- Check that you're on the LinkedIn feed page (`linkedin.com/feed`)
- Try refreshing the LinkedIn page
- Check browser console for any errors (F12 → Console tab)

**Some posts still showing?**
- LinkedIn may change their HTML structure occasionally
- Make sure the filtering options are enabled in the popup
- Check that company names match exactly (case-sensitive)
- Report issues using the "Report Bug" button in the extension popup

**Extension not appearing in browser?**
- For Chrome: Check `chrome://extensions/` and ensure it's enabled
- For Firefox: Check `about:addons` and ensure it's enabled

## Contributing

Contributions are welcome! Feel free to:
- Report bugs using the "Report Bug" button in the extension
- Suggest new features
- Submit pull requests
- Help improve documentation

## Development

### Building the Extension

1. Clone the repository
2. Make your changes
3. Test in your browser using "Load unpacked"
4. Submit a pull request

### File Structure

```
better-linkedin/
├── manifest.json          # Extension manifest
├── content.js             # Content script (runs on LinkedIn)
├── popup.html             # Extension popup HTML
├── popup.js               # Extension popup logic
├── popup.css              # Extension popup styles
└── README.md              # This file
```

## License

This project is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/).

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
