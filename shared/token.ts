/**
 * The token used to connect to Discord.
 */
const token =
  process.env.TOKEN ||
  (process.env.NODE_ENV === "production"
    ? process.env.PROD_TOKEN || process.env.DEV_TOKEN
    : process.env.DEV_TOKEN || process.env.PROD_TOKEN);

if (!token) {
  throw new Error(
    "No token provided. Please set the TOKEN environment variable.",
  );
}

export default token;
