# priism-mobile

"Priism" is our react native app
"Priism-Host" is another hosted website that handles email verification route (link that users travel to when hey click on verification email)
In "Priism" directory, install watchman "brew install watchman".
If you encounter watchman error, https://stackoverflow.com/questions/58318341/why-watchman-crawl-failed-error-in-react-native-immediately-after-updating-to
Note that you need to be using the exact node version 16.4.0, or else its incompatible with Firebase Hosting.
If email verfication is not working, then try going into "Priism-Host" directory and run "firebase login"
