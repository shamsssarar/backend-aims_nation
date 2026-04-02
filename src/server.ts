import app from './app.js';
import { envVars } from './app/config/env.js';

const port = envVars.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
