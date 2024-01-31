import app from "./app";
import RabbitMqListener from "./services/RabbitMqListener";
app.listen(3001, () => {
    console.log("tokens API started on port 3001!");
    new RabbitMqListener().listeners();
});
    