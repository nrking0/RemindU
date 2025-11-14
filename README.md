# RemindU

A mobile application built with Expo.

## Getting Started

### Prerequisites

- Node.js installed on your machine
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository
2. Install dependencies:
    ```bash
    npm install
    ```

### Running the App

Start the development server:

```bash
npx expo start
```

> **Note:** Your mobile device must be on the same Wi-Fi network as your development machine. If you encounter connection issues or need to test on a different network, you can use the tunnel option:
> ```bash
> npx expo start --tunnel
> ```


This will open the Expo Developer Tools in your browser. From there, you can:

- Scan the QR code with the Expo Go app (iOS/Android)
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` to run in web browser


### Using Expo Go

To run the app on your physical device:

1. Download the Expo Go app:
    - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
    - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Open Expo Go on your device
3. Scan the QR code displayed in your terminal or browser after running `npx expo start`


## Built With

- [Expo](https://expo.dev/) - React Native framework