# priism-mobile

1. "Priism" is our react native app
2. "Priism-Host" is another hosted website that handles email verification route (link that users travel to when hey click on verification email)
3. In "Priism" directory, install watchman "brew install watchman".
4. If you encoounter watchman error, https://stackoverflow.com/questions/58318341/why-watchman-crawl-failed-error-in-react-native-immediately-after-updating-to
5. Note that you need to be using the exact node version 16.4.0, or else its incompatible with Firebase Hosting.
6. If email verfication is not working, then try going into "Priism-Host" directory and run "firebase login"