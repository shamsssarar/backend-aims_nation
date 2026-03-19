import app from './app';
import { envVars } from './app/config/env';

const port = envVars.PORT;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
