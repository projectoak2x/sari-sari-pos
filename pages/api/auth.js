import axios from "axios";

export default async function handler(req, res) {
  const code = req.query.code;

  try {
    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
      {}
    );

    const { access_token, refresh_token, expires_in } = response.data;

    // Here you should store the tokens securely
    // For this example, we're just sending them back to the client

    res.redirect(
      `/?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`
    );
  } catch (error) {
    res.status(500).json({ message: "Error exchanging code for tokens" });
  }
}
