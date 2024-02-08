import app from "./app";
import RabbitListener from "./services/RabbitListener";
app.listen(3001, () => {
    console.log("tokens API started on port 3001!");
    new RabbitListener().listeners();
});
    