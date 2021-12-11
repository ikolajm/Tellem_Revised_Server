const http = require("./index")
const port = process.env.PORT || 5000;

http.listen(port, () => console.log(`App is listening on port ${port}`));