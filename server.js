import app from "./app.js";

const PORT =
  process.env.PORT || Math.floor(Math.random() * (9000 - 3000 + 1)) + 3000;

app.listen(PORT, () => {
  console.log(`Server is listening at port ${PORT}`);
});
