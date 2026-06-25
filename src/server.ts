import app from './app.js';
import { envVars } from './app/config/env.js';

const port = envVars.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log("Auth URL is:", process.env.BETTER_AUTH_URL);
  console.log("Frontend Url is:", process.env.FRONTEND_URL)
});

export default app;
