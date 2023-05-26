# Screen Share

Screen Share is a powerful application that allows users to engage in collaborative and interactive video conferencing, along with the ability to share their screens. Whether you're looking to host virtual meetings, conduct remote presentations, or collaborate with teammates, Screen Share provides a seamless platform for all your screen sharing needs.

## Features

- **Video Conferencing**: Screen Share enables users to participate in video conferences with multiple participants, allowing face-to-face interactions and effective communication.

- **Screen Sharing**: Users can share their screens during a video conference, making it easy to present slides, demonstrate software, or collaborate on documents in real-time.

- **User-Friendly Interface**: Screen Share offers an intuitive and easy-to-navigate interface, ensuring a smooth and enjoyable user experience.

## Prerequisites

Before running the Screen Share application, make sure you have the following software installed:

- Node.js (version 14 or higher)
- npm (Node Package Manager)

## Installation

To install and set up the Screen Share application, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/screen-share.git
   ```

2. Navigate to the project directory:

   ```bash
   cd screen-share
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the project directory and configure the required environment variables. Example:

   ```plaintext
   PORT=3000
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

   Replace `your-google-client-id` and `your-google-client-secret` with your actual Google OAuth client credentials. These are necessary for authentication using Google accounts.

5. Start the application:

   ```bash
   npm start
   ```

6. Open your web browser and visit `http://localhost:3000` to access the Screen Share application.

## Dependencies

The following npm packages are used in the Screen Share application:

- `dotenv`: A module to load environment variables from a `.env` file.
- `ejs`: A template engine for rendering HTML templates.
- `express`: A fast and minimalist web framework for Node.js.
- `express-session`: A session middleware for Express.js.
- `nodemon`: A utility that automatically restarts the application when file changes are detected during development.
- `passport`: An authentication middleware for Node.js.
- `passport-google-oauth`: A Google OAuth 2.0 authentication strategy for Passport.js.
- `socket.io`: A JavaScript library for real-time web applications using WebSockets.

## License

This project is licensed under the [MIT License](LICENSE).

## Contributing

Contributions to Screen Share are welcome! If you find any bugs, have feature requests, or would like to make improvements, please open an issue or submit a pull request on the GitHub repository.

## Acknowledgments

Screen Share was developed by the talented contributors of the open-source community. We would like to express our gratitude to everyone who has contributed to this project.

## Support

If you have any questions or need assistance, please reach out to our support team at support@screenshare.com.

Happy screen sharing and video conferencing with Screen Share!
