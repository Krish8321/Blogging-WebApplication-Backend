import app from "./src/app.js";
import { env } from "./src/config/env.js";
import prisma from "./src/config/database.js";
import redisClient from "./src/config/redis.js";
import transporter from "./src/config/mail.js";

const PORT = env.PORT || 5000;

const startServer = async () => {
    try{
        await prisma.$connect();
        console.log("Database Connected");
        
        await redisClient.connect();
        console.log("Redis Connected");

        // console.log(env.EMAIL_USER);
        // console.log(env.EMAIL_PASS);

        // await transporter.verify();
        // console.log("Gmail connected");
        transporter.verify()
            .then(() => {
                console.log("Gmail connected");
            })
            .catch((err) => {
                console.error("SMTP connection failed:");
                console.error(err);
            });

        app.listen(PORT, () => {
            console.log(`Server runnig on port ${PORT}`);
        });
        
    }catch (err){
        console.error("Failed to start Server");
        console.error(err);
        process.exit(1);
    }
};

startServer();

// app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
// });