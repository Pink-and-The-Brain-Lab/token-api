import app from "./app";
import amqplib from "amqplib";

app.listen(3001, () => console.log("tokens API started on port 3001!"));

(async () => {
    try {
        const queue = 'tasks';
        const conn = await amqplib.connect('amqp://localhost');
        console.log('vacaaaaa', conn)
      
        const ch1 = await conn.createChannel();
        await ch1.assertQueue(queue);
      
        // Listener
        ch1.consume(queue, (msg) => {
          if (msg !== null) {
            console.log('Recieved:', msg.content.toString());
            ch1.ack(msg);
          } else {
            console.log('Consumer cancelled by server');
          }
        });    
    } catch (error) {
        console.log(error)
    }
    
  
    // Sender
    // const ch2 = await conn.createChannel();
  
    // setInterval(() => {
    //   ch2.sendToQueue(queue, Buffer.from('something to do'));
    // }, 1000);
  })();