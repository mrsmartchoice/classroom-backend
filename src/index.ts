import express from 'express';
import subjectRouter from './routes/subjects';
import cors from "cors";

const app = express();
const PORT = 8000;

if (!process.env.FRONTEND_URL) throw new Error("FRONTEND_URL does not exit");

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: "GET, POST, PUT, PATCH, DELETE",
    credentials: true
}));

app.use(express.json());
app.use('/api/subjects', subjectRouter);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});