import app from "./app.js";

const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is listening on both IPv4 and IPv6 at port ${PORT}`);
});
